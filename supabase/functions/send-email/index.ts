import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { WeeklyDigest } from "./_templates/weekly-digest.tsx";
import { MilestoneEmail } from "./_templates/milestone.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  template_name: 'weekly_digest' | 'milestone';
  template_data: any;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template_name, template_data, userId }: SendEmailRequest = await req.json();

    if (!to || !template_name || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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
    const dashboardUrl = supabaseUrl.replace('.supabase.co', '.lovable.app') || 'https://aderai.lovable.app';

    let html: string;
    let subject: string;

    // Render appropriate template
    if (template_name === 'weekly_digest') {
      subject = 'Your Weekly Aderai Activity Summary';
      html = await renderAsync(
        React.createElement(WeeklyDigest, {
          accountName: template_data.accountName,
          segmentsCreated: template_data.weeklyActivity?.segmentsCreated || 0,
          aiUsed: template_data.weeklyActivity?.aiUsed || 0,
          analyticsViewed: template_data.weeklyActivity?.analyticsViewed || false,
          dashboardUrl,
          trackingPixelUrl,
        })
      );
    } else if (template_name === 'milestone') {
      subject = `🎉 You've Reached ${template_data.milestone} Segments!`;
      html = await renderAsync(
        React.createElement(MilestoneEmail, {
          accountName: template_data.accountName,
          milestone: template_data.milestone,
          segmentCount: template_data.segmentCount,
          aiSuggestionsUsed: template_data.aiSuggestionsUsed || 0,
          dashboardUrl,
          trackingPixelUrl,
        })
      );
    } else {
      return new Response(JSON.stringify({ error: 'Invalid template name' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Aderai <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    // Log to audit trail
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: template_name,
      recipient_email: to,
      subject,
      status: "sent",
      email_log_id: emailLogId,
    });

    console.log(`Email sent: ${template_name} to ${to}`);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: "Email sending failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
