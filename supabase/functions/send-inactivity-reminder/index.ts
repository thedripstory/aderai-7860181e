import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INACTIVITY_DAYS = 7;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[send-inactivity-reminder] Starting inactivity check...");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_DAYS);
    const cutoffIso = cutoffDate.toISOString();

    // Find users who haven't logged in recently and haven't received a reminder in the last 7 days
    const { data: inactiveUsers, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        first_name,
        updated_at
      `)
      .lt("updated_at", cutoffIso)
      .eq("subscription_status", "active");

    if (usersError) {
      console.error("[send-inactivity-reminder] Error fetching users:", usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!inactiveUsers?.length) {
      console.log("[send-inactivity-reminder] No inactive users found");
      return new Response(JSON.stringify({ sent: 0, message: "No inactive users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[send-inactivity-reminder] Found ${inactiveUsers.length} inactive users`);

    let sentCount = 0;

    for (const user of inactiveUsers) {
      // Check if we already sent a reminder recently (within 7 days)
      const { data: recentEmail } = await supabase
        .from("email_audit_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("email_type", "inactivity_reminder")
        .gte("sent_at", cutoffIso)
        .maybeSingle();

      if (recentEmail) {
        console.log(`[send-inactivity-reminder] Already sent reminder to ${user.email} recently, skipping`);
        continue;
      }

      // Check user's notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("email_product_updates")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefs && !prefs.email_product_updates) {
        console.log(`[send-inactivity-reminder] User ${user.email} has opted out of product updates, skipping`);
        continue;
      }

      const firstName = user.first_name || "there";
      const siteUrl = Deno.env.get("SITE_URL") || "https://aderai.io";

      try {
        const emailResponse = await resend.emails.send({
          from: "Aderai <hello@updates.aderai.io>",
          to: [user.email],
          subject: "We miss you! Your segments are waiting",
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
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%); padding: 32px; text-align: center;">
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png" alt="Aderai" style="height: 40px; filter: brightness(0) invert(1);">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hey ${firstName}! 👋</h1>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                It's been a while since we've seen you in Aderai. Your segments are patiently waiting to supercharge your Klaviyo campaigns!
              </p>
              
              <div style="background-color: #FFF8F3; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
                <p style="color: #1a1a1a; font-size: 14px; margin: 0; font-weight: 600;">Here's what you can do today:</p>
                <ul style="color: #4a4a4a; font-size: 14px; line-height: 1.8; margin: 12px 0 0 0; padding-left: 20px;">
                  <li>Create new segments to target your best customers</li>
                  <li>Use AI to suggest segments based on your brand</li>
                  <li>Review your segment performance</li>
                </ul>
              </div>
              
              <a href="${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Back to Aderai →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 32px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                You're receiving this because you have an active Aderai subscription.<br>
                <a href="${siteUrl}/settings" style="color: #FF6B35; text-decoration: none;">Manage email preferences</a>
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
          user_id: user.id,
          email_type: "inactivity_reminder",
          recipient_email: user.email,
          subject: "We miss you! Your segments are waiting",
          status: "sent",
          email_log_id: emailResponse.data?.id,
        });

        sentCount++;
        console.log(`[send-inactivity-reminder] Sent reminder to ${user.email}`);
      } catch (emailErr) {
        console.error(`[send-inactivity-reminder] Failed to send to ${user.email}:`, emailErr);
        
        await supabase.from("email_audit_log").insert({
          user_id: user.id,
          email_type: "inactivity_reminder",
          recipient_email: user.email,
          subject: "We miss you! Your segments are waiting",
          status: "failed",
          error_message: emailErr instanceof Error ? emailErr.message : "Unknown error",
        });
      }
    }

    console.log(`[send-inactivity-reminder] Completed. Sent ${sentCount} reminders`);

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-inactivity-reminder] Unexpected error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});