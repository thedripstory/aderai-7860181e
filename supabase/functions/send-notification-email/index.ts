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
  notificationType: "segment_created" | "client_added" | "api_key_added" | "settings_updated" | "klaviyo_connected" | "segment_completion";
  data: {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    accountName?: string;
    // For segment_completion
    firstName?: string;
    successCount?: number;
    totalCount?: number;
    segmentNames?: string[];
    hasMore?: boolean;
    failedCount?: number;
    failedNames?: string[];
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
      case "segment_completion":
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
      case "klaviyo_connected":
        shouldSend = prefs?.email_on_api_key_added ?? true;
        break;
    }

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ success: true, message: "Notification disabled by user preferences" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const iconMap: Record<string, string> = {
      segment_created: "✨",
      segment_completion: "🎉",
      client_added: "👥",
      api_key_added: "🔑",
      settings_updated: "⚙️",
      klaviyo_connected: "✅",
    };

    const dashboardUrl = Deno.env.get('SITE_URL') || 'https://aderai.io';

    // Handle different templates
    let subject = data.title || "Notification from Aderai";
    let htmlContent = "";
    
    if (notificationType === "segment_completion") {
      const { firstName, successCount, totalCount, segmentNames, hasMore, failedCount, failedNames } = data;
      const allSuccess = !failedCount || failedCount === 0;
      
      subject = allSuccess 
        ? `🎉 All ${successCount} Klaviyo Segments Created Successfully!`
        : `✅ ${successCount} Klaviyo Segments Created (${failedCount} couldn't be created)`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px; }
            .content { background: #ffffff; padding: 40px; }
            .success-box { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
            .success-box h2 { margin: 0 0 10px; font-size: 48px; }
            .success-box p { margin: 0; font-size: 18px; opacity: 0.9; }
            .segment-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .segment-list h3 { margin: 0 0 15px; color: #333; font-size: 16px; }
            .segment-item { padding: 8px 12px; background: white; margin: 6px 0; border-radius: 6px; border-left: 3px solid #FF6B35; font-size: 14px; }
            .failed-section { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .failed-section h4 { color: #dc2626; margin: 0 0 10px; }
            .failed-item { color: #7f1d1d; font-size: 13px; padding: 4px 0; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f8f9fa; }
            .more-text { color: #666; font-style: italic; font-size: 13px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${allSuccess ? '🎉 All Done!' : '✅ Segments Created'}</h1>
              <p>Your Klaviyo segments are ready to use</p>
            </div>
            <div class="content">
              <p>Hey ${firstName || 'there'},</p>
              
              <div class="success-box">
                <h2>${successCount}</h2>
                <p>segments created in Klaviyo</p>
              </div>
              
              ${segmentNames && segmentNames.length > 0 ? `
                <div class="segment-list">
                  <h3>✨ Created Segments:</h3>
                  ${segmentNames.map((name: string) => `<div class="segment-item">${name} | Aderai</div>`).join('')}
                  ${hasMore ? `<p class="more-text">...and ${(totalCount || 0) - 20} more segments</p>` : ''}
                </div>
              ` : ''}
              
              ${failedCount && failedCount > 0 ? `
                <div class="failed-section">
                  <h4>⚠️ ${failedCount} segments couldn't be created</h4>
                  <p style="font-size: 13px; color: #7f1d1d; margin: 10px 0;">These segments hit Klaviyo's rate limits after multiple retries. You can try creating them again later.</p>
                  ${failedNames?.map((name: string) => `<div class="failed-item">• ${name}</div>`).join('') || ''}
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}/dashboard" class="button">View in Klaviyo</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Your segments are now live in your Klaviyo account and ready to use in campaigns and flows.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
              <p><a href="${dashboardUrl}/settings" style="color: #FF6B35;">Manage Email Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else
    
    if (notificationType === "klaviyo_connected") {
      subject = "✅ Klaviyo Connected Successfully!";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Klaviyo Account is Connected!</h1>
            </div>
            <div class="content">
              <p>Hey ${data.accountName || 'there'},</p>
              <p>Great news! Your Klaviyo account has been successfully connected to Aderai.</p>
              <p><strong>You're now ready to:</strong></p>
              <ul>
                <li>Create sophisticated customer segments in seconds</li>
                <li>Use AI-powered segment suggestions</li>
                <li>Track segment performance</li>
              </ul>
              <div style="text-align: center;">
                <a href="${dashboardUrl}/dashboard" class="button">Go to Dashboard</a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">Welcome to Aderai!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      htmlContent = `
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
              <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
              <p>
                <a href="${dashboardUrl}/settings" class="preferences-link">Manage Email Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Akshat from Aderai <akshat@updates.aderai.io>",
      to: [email],
      subject: subject,
      html: htmlContent,
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
