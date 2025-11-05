import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-klaviyo-signature",
};

// Input validation
interface WebhookPayload {
  type: string;
  klaviyo_key_id?: string;
  [key: string]: any;
}

const validatePayload = (payload: any): payload is WebhookPayload => {
  if (!payload || typeof payload !== 'object') return false;
  if (!payload.type || typeof payload.type !== 'string' || payload.type.length > 100) return false;
  if (payload.klaviyo_key_id && typeof payload.klaviyo_key_id !== 'string') return false;
  
  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 1048576) return false; // 1MB limit
  
  return true;
};

// Verify webhook signature
const verifyWebhookSignature = async (req: Request, body: string): Promise<boolean> => {
  const signature = req.headers.get('x-klaviyo-signature');
  if (!signature) return false;
  
  const webhookSecret = Deno.env.get('KLAVIYO_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, body);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const payload = JSON.parse(body);
    
    // Validate payload
    if (!validatePayload(payload)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log webhook event
    await supabaseClient
      .from("klaviyo_webhook_events")
      .insert({
        event_type: payload.type,
        payload: payload,
        processed: false,
      });

    // Process based on event type
    if (payload.type === "segment.created" || payload.type === "segment.updated") {
      if (payload.klaviyo_key_id) {
        await supabaseClient
          .from("segment_analytics_cache")
          .delete()
          .eq("klaviyo_key_id", payload.klaviyo_key_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});