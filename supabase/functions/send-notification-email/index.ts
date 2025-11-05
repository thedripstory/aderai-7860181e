import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  userId: string;
  email: string;
  notificationType: "segment_created" | "client_added" | "api_key_added" | "settings_updated";
  data: {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, notificationType, data }: NotificationEmailRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has this notification enabled
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    let shouldSend = false;
    switch (notificationType) {
      case "segment_created":
        shouldSend = prefs?.email_on_segment_creation ?? true;
        break;
      case "client_added":
        shouldSend = prefs?.email_on_client_added ?? true;
        break;
      case "api_key_added":
        shouldSend = prefs?.email_on_api_key_added ?? true;
        break;
      case "settings_updated":
        shouldSend = prefs?.email_on_settings_updated ?? true;
        break;
    }

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ success: true, message: "Notification disabled by user preferences" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const iconMap = {
      segment_created: "✨",
      client_added: "👥",
      api_key_added: "🔑",
      settings_updated: "⚙️",
    };

    const emailResponse = await resend.emails.send({
      from: "Klaviyo Segments <onboarding@resend.dev>",
      to: [email],
      subject: data.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .icon { font-size: 48px; margin-bottom: 10px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .message-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #FF6B35; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .preferences-link { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">${iconMap[notificationType]}</div>
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <div class="message-box">
                <p style="margin: 0; font-size: 16px;">${data.message}</p>
              </div>
              ${data.actionUrl ? `
                <div style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">${data.actionLabel || "View Details"}</a>
                </div>
              ` : ""}
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                You can manage your email notification preferences in your account settings.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Klaviyo Segments. All rights reserved.</p>
              <p>
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://app.lovable.app'}/settings" class="preferences-link">Manage Email Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log to audit trail
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: notificationType,
      recipient_email: email,
      subject: data.title,
      status: "sent",
    });

    console.log("Notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
