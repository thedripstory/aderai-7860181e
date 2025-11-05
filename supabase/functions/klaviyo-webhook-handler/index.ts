import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    
    // Log webhook event
    const { error: logError } = await supabaseClient
      .from("klaviyo_webhook_events")
      .insert({
        event_type: payload.type || "unknown",
        payload: payload,
        processed: false,
      });

    if (logError) {
      console.error("Error logging webhook:", logError);
    }

    // Process based on event type
    if (payload.type === "segment.created" || payload.type === "segment.updated") {
      // Invalidate cache for this Klaviyo account
      const { error: cacheError } = await supabaseClient
        .from("segment_analytics_cache")
        .delete()
        .eq("klaviyo_key_id", payload.klaviyo_key_id);

      if (cacheError) {
        console.error("Error invalidating cache:", cacheError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in klaviyo-webhook-handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});