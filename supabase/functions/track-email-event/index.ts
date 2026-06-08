import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackingRequest {
  emailLogId: string;
  userId: string;
  eventType: 'open' | 'click';
  eventData?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle tracking pixel (GET request for opens)
    if (req.method === "GET") {
      const emailLogId = url.searchParams.get('e');
      const userId = url.searchParams.get('u');

      if (!emailLogId || !userId) {
        // Return transparent pixel even on error to not break email display
        return new Response(
          atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
          {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              ...corsHeaders,
            },
          }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Record email open
      await supabase.from("email_tracking").insert({
        email_log_id: emailLogId,
        user_id: userId,
        event_type: 'open',
        event_data: {
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Email opened: ${emailLogId} by user: ${userId}`);

      // Return 1x1 transparent GIF
      return new Response(
        atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...corsHeaders,
          },
        }
      );
    }

    // Handle click tracking (POST request) — requires authentication and
    // userId must match the caller. This prevents unauthenticated injection
    // of fabricated tracking events.
    if (req.method === "POST") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(supabaseUrl, serviceKey);
      const { data: { user }, error: authError } = await authClient.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { emailLogId, eventType, eventData }: TrackingRequest = await req.json();
      if (!emailLogId || !eventType) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(supabaseUrl, serviceKey);

      // Record email click — user_id is taken from the verified JWT, never the body.
      await supabase.from("email_tracking").insert({
        email_log_id: emailLogId,
        user_id: user.id,
        event_type: eventType,
        event_data: {
          ...eventData,
          user_agent: req.headers.get("user-agent"),
          ip_address: req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for"),
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Email ${eventType}: ${emailLogId} by user: ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Tracking error:", error);
    
    // For GET requests (tracking pixel), always return a pixel even on error
    if (req.method === "GET") {
      return new Response(
        atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Tracking failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
