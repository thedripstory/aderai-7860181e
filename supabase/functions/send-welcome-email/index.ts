import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { WelcomeEmail } from "./_templates/welcome.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  userName: string;
  accountType: "brand" | "agency";
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, accountType, userId }: WelcomeEmailRequest = await req.json();
    
    // Validate inputs
    if (!email || typeof email !== 'string' || email.length > 255 || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid userId' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate email log ID for tracking
    const emailLogId = crypto.randomUUID();
    
    // Generate tracking pixel URL
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-event?e=${emailLogId}&u=${userId}`;
    
    // Dashboard URL
    const dashboardUrl = 'https://aderai.io';

    // Render React Email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        userName,
        dashboardUrl,
        trackingPixelUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Aderai <akshat@aderai.io>",
      to: [email],
      subject: "Welcome to Aderai - Start Creating Segments!",
      html,
    });

    // Log to audit trail with email_log_id for tracking
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: "welcome",
      recipient_email: email,
      subject: "Welcome to Aderai - Start Creating Segments!",
      status: "sent",
      email_log_id: emailLogId,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Welcome email error");
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
