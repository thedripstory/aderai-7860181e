import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  template_name: "welcome" | "klaviyo_connected" | "weekly_digest" | "milestone";
  template_data: {
    userName?: string;
    accountName?: string;
    milestone?: number;
    segmentCount?: number;
    aiSuggestionsUsed?: number;
    weeklyActivity?: {
      segmentsCreated: number;
      aiUsed: number;
      analyticsViewed: boolean;
    };
  };
  userId?: string;
}

const getEmailTemplate = (templateName: string, data: any) => {
  const logoUrl = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";
  const appUrl = Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://app.lovable.app';
  const settingsUrl = `${appUrl}/settings`;
  const unsubscribeUrl = `${appUrl}/settings?tab=notifications`;

  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 20px; text-align: center; }
    .logo { max-width: 180px; margin-bottom: 20px; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
    .content { background: #ffffff; padding: 40px 30px; }
    .message-box { background: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #FF6B35; }
    .button { display: inline-block; background: #FF6B35; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #FF8C42; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; flex: 1; margin: 0 10px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #FF6B35; margin-bottom: 8px; }
    .stat-label { font-size: 14px; color: #666; }
    .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 13px; background: #f8f9fa; }
    .footer a { color: #FF6B35; text-decoration: none; }
    .milestone-badge { background: linear-gradient(135deg, #FFD700, #FFA500); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 700; font-size: 18px; margin: 20px 0; }
  `;

  const templates = {
    welcome: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Aderai Logo" class="logo" />
            <h1>Welcome to Aderai! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName || data.accountName || 'there'}!</h2>
            <p style="font-size: 16px; line-height: 1.8;">
              We're thrilled to have you join Aderai! You're now part of a community that's revolutionizing 
              customer segmentation with AI-powered insights.
            </p>
            <div class="message-box">
              <h3 style="margin-top: 0; color: #FF6B35;">🚀 Get Started in 3 Easy Steps:</h3>
              <ol style="line-height: 2;">
                <li><strong>Connect Your Klaviyo Account</strong> - Link your Klaviyo API key to start creating segments</li>
                <li><strong>Explore AI Suggestions</strong> - Get intelligent segment recommendations tailored to your business</li>
                <li><strong>Track Performance</strong> - Monitor how your segments perform over time</li>
              </ol>
            </div>
            <div style="text-align: center;">
              <a href="${appUrl}/klaviyo-setup" class="button">Connect Klaviyo Now</a>
            </div>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Need help? Check out our <a href="${appUrl}" style="color: #FF6B35;">documentation</a> or reach out to our support team.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            <p>
              <a href="${settingsUrl}">Manage Preferences</a> | 
              <a href="${unsubscribeUrl}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,

    klaviyo_connected: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Aderai Logo" class="logo" />
            <h1>Klaviyo Connected! ✨</h1>
          </div>
          <div class="content">
            <h2>Great news, ${data.accountName}!</h2>
            <p style="font-size: 16px; line-height: 1.8;">
              Your Klaviyo account has been successfully connected to Aderai. You're now ready to 
              create powerful customer segments in seconds!
            </p>
            <div class="message-box">
              <h3 style="margin-top: 0; color: #FF6B35;">✅ What's Next?</h3>
              <ul style="line-height: 2;">
                <li><strong>Create Your First Segment</strong> - Use our AI to suggest high-performing segments</li>
                <li><strong>Browse Templates</strong> - Choose from pre-built segment templates</li>
                <li><strong>Customize Settings</strong> - Adjust thresholds and currency preferences</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="${appUrl}/ai-features" class="button">Start Creating Segments</a>
            </div>
            <p style="margin-top: 30px; padding: 20px; background: #FFF9E6; border-radius: 8px; border-left: 4px solid #FFD700;">
              💡 <strong>Pro Tip:</strong> Try our AI Segment Suggester to get personalized recommendations 
              based on your industry and goals!
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            <p>
              <a href="${settingsUrl}">Manage Preferences</a> | 
              <a href="${unsubscribeUrl}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,

    milestone: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Aderai Logo" class="logo" />
            <h1>Milestone Achievement! 🏆</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="milestone-badge">
                ${data.milestone} Segments Created!
              </div>
            </div>
            <h2>Congratulations, ${data.accountName}!</h2>
            <p style="font-size: 16px; line-height: 1.8;">
              You've just reached an incredible milestone - <strong>${data.milestone} segments created</strong>! 
              You're mastering the art of customer segmentation and driving real results.
            </p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${data.segmentCount || data.milestone}</div>
                <div class="stat-label">Total Segments</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.aiSuggestionsUsed || 0}</div>
                <div class="stat-label">AI Suggestions Used</div>
              </div>
            </div>
            <div class="message-box">
              <h3 style="margin-top: 0; color: #FF6B35;">🎯 Keep the Momentum Going:</h3>
              <ul style="line-height: 2;">
                <li>Review your segment performance in Analytics</li>
                <li>Try creating segments for different customer behaviors</li>
                <li>Experiment with our advanced AI suggestions</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="${appUrl}/analytics" class="button">View Your Analytics</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            <p>
              <a href="${settingsUrl}">Manage Preferences</a> | 
              <a href="${unsubscribeUrl}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,

    weekly_digest: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Aderai Logo" class="logo" />
            <h1>Your Weekly Aderai Digest 📊</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.accountName}!</h2>
            <p style="font-size: 16px; line-height: 1.8;">
              Here's a summary of your activity this week:
            </p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${data.weeklyActivity?.segmentsCreated || 0}</div>
                <div class="stat-label">Segments Created</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.weeklyActivity?.aiUsed || 0}</div>
                <div class="stat-label">AI Suggestions Used</div>
              </div>
            </div>
            <div class="message-box">
              <h3 style="margin-top: 0; color: #FF6B35;">📈 This Week's Highlights:</h3>
              <ul style="line-height: 2;">
                <li>You created <strong>${data.weeklyActivity?.segmentsCreated || 0}</strong> new segments</li>
                <li>You used AI suggestions <strong>${data.weeklyActivity?.aiUsed || 0}</strong> times</li>
                <li>${data.weeklyActivity?.analyticsViewed ? '✅ You checked your analytics' : '💡 Don\'t forget to check your analytics!'}</li>
              </ul>
            </div>
            ${data.weeklyActivity?.segmentsCreated === 0 ? `
              <p style="margin-top: 30px; padding: 20px; background: #FFF9E6; border-radius: 8px; border-left: 4px solid #FFD700;">
                💡 <strong>Tip:</strong> Try creating a few segments this week to see how they perform!
              </p>
            ` : ''}
            <div style="text-align: center;">
              <a href="${appUrl}/unified-dashboard" class="button">View Full Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            <p>
              <a href="${settingsUrl}">Manage Preferences</a> | 
              <a href="${unsubscribeUrl}">Unsubscribe</a>
            </p>
            <p style="margin-top: 10px; font-size: 12px;">
              You're receiving this because you opted in to weekly digests. 
              You can change this anytime in your notification preferences.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return templates[templateName as keyof typeof templates] || "";
};

const getEmailSubject = (templateName: string, data: any) => {
  const subjects = {
    welcome: "Welcome to Aderai - Let's Get Started! 🎉",
    klaviyo_connected: "Your Klaviyo Account is Connected! ✨",
    milestone: `🏆 Milestone Unlocked: ${data.milestone} Segments Created!`,
    weekly_digest: "Your Weekly Aderai Digest 📊",
  };
  return subjects[templateName as keyof typeof subjects] || "Notification from Aderai";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template_name, template_data, userId }: SendEmailRequest = await req.json();

    console.log("Sending email:", { to, template_name, userId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user preferences if userId provided
    if (userId) {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Check if user wants this type of email
      let shouldSend = true;
      if (template_name === "weekly_digest" && prefs?.email_weekly_summary === false) {
        shouldSend = false;
      }
      if (template_name === "welcome" && prefs?.email_marketing === false) {
        shouldSend = false;
      }
      if (template_name === "klaviyo_connected" && prefs?.email_product_updates === false) {
        shouldSend = false;
      }

      if (!shouldSend) {
        console.log("Email blocked by user preferences");
        return new Response(
          JSON.stringify({ success: true, message: "Email blocked by user preferences" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Generate email content
    const htmlContent = getEmailTemplate(template_name, template_data);
    const subject = getEmailSubject(template_name, template_data);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Aderai <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    console.log("Resend response:", emailResponse);

    // Log email to audit log
    if (userId) {
      await supabase.from("email_audit_log").insert({
        user_id: userId,
        email_type: template_name,
        recipient_email: to,
        subject: subject,
        status: "sent",
        metadata: {
          template_data,
          resend_id: emailResponse.data?.id,
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: emailResponse,
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    // Log failed email
    const { userId } = await req.json().catch(() => ({}));
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from("email_audit_log").insert({
        user_id: userId,
        email_type: "error",
        recipient_email: "",
        subject: "Failed email",
        status: "failed",
        error_message: error.message,
      });
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
