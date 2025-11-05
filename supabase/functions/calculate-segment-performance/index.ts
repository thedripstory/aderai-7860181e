import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { klaviyoKeyId } = await req.json();

    // Get Klaviyo API key
    const { data: keyData, error: keyError } = await supabaseClient
      .from("klaviyo_keys")
      .select("klaviyo_api_key_hash")
      .eq("id", klaviyoKeyId)
      .single();

    if (keyError || !keyData) {
      throw new Error("Klaviyo key not found");
    }

    // Fetch segments and their metrics from Klaviyo
    const segmentsResponse = await fetch(
      "https://a.klaviyo.com/api/segments/",
      {
        headers: {
          Authorization: `Klaviyo-API-Key ${keyData.klaviyo_api_key_hash}`,
          revision: "2024-10-15",
        },
      }
    );

    if (!segmentsResponse.ok) {
      throw new Error("Failed to fetch segments from Klaviyo");
    }

    const segmentsData = await segmentsResponse.json();

    // Calculate performance for each segment
    for (const segment of segmentsData.data || []) {
      // Fetch metrics for this segment
      const metricsResponse = await fetch(
        `https://a.klaviyo.com/api/segments/${segment.id}/metrics/`,
        {
          headers: {
            Authorization: `Klaviyo-API-Key ${keyData.klaviyo_api_key_hash}`,
            revision: "2024-10-15",
          },
        }
      );

      let revenueGenerated = 0;
      let conversionRate = 0;
      let engagementScore = 0;

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        
        // Calculate metrics (simplified)
        const totalRevenue = metricsData.data?.reduce((sum: number, metric: any) => {
          return sum + (metric.attributes?.total_value || 0);
        }, 0) || 0;

        revenueGenerated = totalRevenue;
        conversionRate = (metricsData.data?.length || 0) > 0 ? 0.05 : 0; // Placeholder
        engagementScore = segment.attributes?.profile_count || 0;
      }

      // Upsert performance data
      await supabaseClient
        .from("segment_performance")
        .upsert({
          klaviyo_key_id: klaviyoKeyId,
          segment_id: segment.id,
          segment_name: segment.attributes?.name || "Unknown",
          revenue_generated: revenueGenerated,
          conversion_rate: conversionRate,
          engagement_score: engagementScore,
          last_calculated: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error calculating segment performance:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});