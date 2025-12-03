import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Extract JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { klaviyoKeyId } = await req.json();

    if (!klaviyoKeyId) {
      return new Response(
        JSON.stringify({ error: "klaviyoKeyId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get Klaviyo API key
    const { data: keyData, error: keyError } = await supabaseClient
      .from("klaviyo_keys")
      .select("klaviyo_api_key_hash")
      .eq("id", klaviyoKeyId)
      .eq("user_id", user.id)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: "Klaviyo key not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Decrypt API key if encrypted
    let apiKey = keyData.klaviyo_api_key_hash;
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    // Fetch segments from Klaviyo
    const segmentsResponse = await fetch(
      "https://a.klaviyo.com/api/segments/",
      {
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          revision: "2024-10-15",
        },
      }
    );

    if (!segmentsResponse.ok) {
      const errorText = await segmentsResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to fetch segments from Klaviyo", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    const segmentsData = await segmentsResponse.json();
    const segments = segmentsData.data || [];
    
    // Record segment snapshots in historical data table
    const snapshots = segments.map((segment: any) => ({
      klaviyo_key_id: klaviyoKeyId,
      user_id: user.id,
      segment_klaviyo_id: segment.id,
      segment_name: segment.attributes?.name || "Unknown",
      profile_count: 0, // Profile count not available from list endpoint
      recorded_at: new Date().toISOString(),
    }));

    if (snapshots.length > 0) {
      // Upsert snapshots - update if same segment already recorded today
      const { error: insertError } = await supabaseClient
        .from("segment_historical_data")
        .upsert(snapshots, {
          onConflict: "segment_klaviyo_id,klaviyo_key_id",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error("Error saving snapshots:", insertError);
        // Continue even if insert fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        segmentsProcessed: segments.length,
        message: `Processed ${segments.length} segments`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error calculating segment performance:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
