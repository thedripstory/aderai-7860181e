import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  userId: string;
  email: string;
  alertType: "new_device_login" | "password_changed" | "api_key_removed" | "2fa_disabled";
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    location?: string;
    timestamp?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[send-security-alert] Processing security alert...");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { userId, email, alertType, metadata }: SecurityAlertRequest = await req.json();

    if (!userId || !email || !alertType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's first name
    const { data: user } = await supabase
      .from("users")
      .select("first_name")
      .eq("id", userId)
      .maybeSingle();

    const firstName = user?.first_name || "there";
    const siteUrl = Deno.env.get("SITE_URL") || "https://aderai.io";
    const timestamp = metadata?.timestamp || new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Get alert-specific content
    let subject: string;
    let alertTitle: string;
    let alertMessage: string;
    let actionText: string;

    switch (alertType) {
      case "new_device_login":
        subject = "New sign-in to your Aderai account";
        alertTitle = "New Device Sign-In Detected";
        alertMessage = `We noticed a new sign-in to your account${metadata?.location ? ` from ${metadata.location}` : ""}.`;
        actionText = "If this wasn't you, secure your account immediately by changing your password.";
        break;
      case "password_changed":
        subject = "Your Aderai password was changed";
        alertTitle = "Password Changed Successfully";
        alertMessage = "Your account password was recently changed.";
        actionText = "If you didn't make this change, please contact support immediately.";
        break;
      case "api_key_removed":
        subject = "Klaviyo API key removed from your account";
        alertTitle = "API Key Removed";
        alertMessage = "A Klaviyo API key was removed from your Aderai account.";
        actionText = "If you didn't do this, please review your account settings.";
        break;
      case "2fa_disabled":
        subject = "Two-factor authentication disabled";
        alertTitle = "2FA Disabled";
        alertMessage = "Two-factor authentication was disabled on your account.";
        actionText = "If you didn't make this change, please secure your account immediately.";
        break;
      default:
        subject = "Security alert for your Aderai account";
        alertTitle = "Security Alert";
        alertMessage = "There was a security-related change to your account.";
        actionText = "Please review your account settings.";
    }

    const emailResponse = await resend.emails.send({
      from: "Aderai Security <hello@updates.aderai.io>",
      to: [email],
      subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFF8F3; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF8F3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header with warning color -->
          <tr>
            <td style="background: linear-gradient(135deg, #EA580C 0%, #FF6B35 100%); padding: 32px; text-align: center;">
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png" alt="Aderai" style="height: 40px; filter: brightness(0) invert(1);">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="background-color: #FEF2F2; border-left: 4px solid #EA580C; border-radius: 4px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #991B1B; font-size: 14px; font-weight: 600; margin: 0;">🔐 Security Alert</p>
              </div>
              
              <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hi ${firstName},</h1>
              
              <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0;">${alertTitle}</h2>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${alertMessage}
              </p>
              
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;"><strong>Time:</strong> ${timestamp}</p>
                ${metadata?.deviceInfo ? `<p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;"><strong>Device:</strong> ${metadata.deviceInfo}</p>` : ""}
                ${metadata?.ipAddress ? `<p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;"><strong>IP Address:</strong> ${metadata.ipAddress}</p>` : ""}
                ${metadata?.location ? `<p style="color: #666666; font-size: 14px; margin: 0;"><strong>Location:</strong> ${metadata.location}</p>` : ""}
              </div>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${actionText}
              </p>
              
              <a href="${siteUrl}/settings" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review Account Settings →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 32px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                This is an automated security notification from Aderai.<br>
                If you have questions, contact us at <a href="mailto:hello@aderai.io" style="color: #FF6B35; text-decoration: none;">hello@aderai.io</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    // Log the email
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: `security_${alertType}`,
      recipient_email: email,
      subject,
      status: "sent",
      email_log_id: emailResponse.data?.id,
      metadata: { alertType, ...metadata },
    });

    console.log(`[send-security-alert] Sent ${alertType} alert to ${email}`);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-security-alert] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});