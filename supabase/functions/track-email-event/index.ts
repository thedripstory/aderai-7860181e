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

    // Handle click tracking (POST request)
    if (req.method === "POST") {
      const { emailLogId, userId, eventType, eventData }: TrackingRequest = await req.json();

      if (!emailLogId || !userId || !eventType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Record email click
      await supabase.from("email_tracking").insert({
        email_log_id: emailLogId,
        user_id: userId,
        event_type: eventType,
        event_data: {
          ...eventData,
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Email ${eventType}: ${emailLogId} by user: ${userId}`);

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
