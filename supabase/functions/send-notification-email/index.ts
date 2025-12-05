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
  notificationType: 
    | "segment_created" 
    | "client_added" 
    | "api_key_added" 
    | "settings_updated" 
    | "klaviyo_connected"
    | "segment_progress"
    | "segment_complete"
    | "segment_daily_limit"
    | "segment_rate_limit";
  data: {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    accountName?: string;
    // For segment progress/completion
    completed?: number;
    remaining?: number;
    total?: number;
    segmentCount?: number;
    completedToday?: number;
    estimatedTimeRemaining?: string;
    jobId?: string;
  };
}

// Email deduplication - prevent spam by checking recent emails
async function shouldSendEmail(
  supabase: any, 
  userId: string, 
  emailType: string, 
  dedupeWindowMinutes: number = 30
): Promise<boolean> {
  const windowStart = new Date(Date.now() - dedupeWindowMinutes * 60 * 1000).toISOString();
  
  const { data: recentEmails } = await supabase
    .from('email_audit_log')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .gte('sent_at', windowStart)
    .limit(1);
  
  // If we found a recent email of this type, don't send another
  return !recentEmails || recentEmails.length === 0;
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
    let dedupeWindow = 0; // minutes - 0 means no deduplication
    
    switch (notificationType) {
      case "segment_created":
      case "segment_progress":
      case "segment_complete":
        shouldSend = prefs?.email_on_segment_creation ?? true;
        break;
      case "segment_daily_limit":
        shouldSend = prefs?.email_on_segment_creation ?? true;
        dedupeWindow = 60 * 12; // Only one daily limit email per 12 hours
        break;
      case "segment_rate_limit":
        shouldSend = prefs?.email_on_segment_creation ?? true;
        dedupeWindow = 30; // Only one rate limit email per 30 minutes
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

    // Check for email deduplication (prevent spam)
    if (dedupeWindow > 0) {
      const canSend = await shouldSendEmail(supabase, userId, notificationType, dedupeWindow);
      if (!canSend) {
        console.log(`[send-notification-email] Skipping ${notificationType} - already sent within ${dedupeWindow} minutes`);
        return new Response(
          JSON.stringify({ success: true, message: "Email deduplicated - recent email already sent" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const iconMap: Record<string, string> = {
      segment_created: "✨",
      segment_progress: "⏳",
      segment_complete: "✅",
      segment_daily_limit: "⏸️",
      segment_rate_limit: "⏱️",
      client_added: "👥",
      api_key_added: "🔑",
      settings_updated: "⚙️",
      klaviyo_connected: "✅",
    };

    const dashboardUrl = Deno.env.get('SITE_URL') || 'https://aderai.io';

    // Handle different templates
    let subject = data.title;
    let htmlContent = "";

    // Segment progress email template
    if (notificationType === "segment_progress") {
      subject = `Aderai: Segment creation in progress (${data.completed} of ${data.total} done)`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .progress-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #FF6B35; }
            .stat { display: inline-block; margin-right: 30px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #FF6B35; }
            .stat-label { font-size: 14px; color: #666; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .klaviyo-note { background: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 20px; border: 1px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏳ Segment Creation in Progress</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Your segment creation is progressing smoothly! Here's your status update:</p>
              
              <div class="progress-box">
                <div class="stat">
                  <div class="stat-value">${data.completed}</div>
                  <div class="stat-label">Segments created</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${data.remaining}</div>
                  <div class="stat-label">Remaining</div>
                </div>
                <div class="stat">
                  <div class="stat-value">~${data.estimatedTimeRemaining}</div>
                  <div class="stat-label">Est. time left</div>
                </div>
              </div>
              
              <div class="klaviyo-note">
                <strong>Why does this take time?</strong><br>
                This is being paced to stay within Klaviyo's API limits (15 segments/minute). 
                We're handling everything automatically — no action needed from you.
              </div>
              
              <p style="margin-top: 20px;">We'll email you again when everything is complete!</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">— The Aderai Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    // Segment completion email template
    else if (notificationType === "segment_complete") {
      subject = `✅ Aderai: All ${data.segmentCount} segments are ready!`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .success-box { background: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 6px; border: 1px solid #22c55e; text-align: center; }
            .success-number { font-size: 48px; font-weight: bold; color: #16a34a; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .klaviyo-note { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ All Segments Are Ready!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Great news! All your segments have been created in Klaviyo.</p>
              
              <div class="success-box">
                <div class="success-number">${data.segmentCount}</div>
                <div>segments created</div>
              </div>
              
              <p>Your segments are now ready to use in your campaigns and flows!</p>
              
              <div style="text-align: center;">
                <a href="${data.actionUrl || 'https://www.klaviyo.com/lists-segments'}" class="button">View in Klaviyo</a>
              </div>
              
              <div class="klaviyo-note">
                <strong>Why did this take some time?</strong> Klaviyo's API limits segment creation to 15/minute 
                and 100/day. Aderai automatically paced your request to work within these limits.
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">— The Aderai Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aderai. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    // Daily limit reached email template
    else if (notificationType === "segment_daily_limit") {
      subject = `⏸️ Aderai: Segment creation paused until tomorrow`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .status-box { background: #fef3c7; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #f59e0b; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .info-section { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6; }
            .info-section h3 { margin: 0 0 12px 0; color: #1e40af; font-size: 15px; }
            .info-section p { margin: 0; font-size: 14px; color: #374151; }
            .checkmark-item { display: flex; align-items: flex-start; margin: 12px 0; }
            .checkmark { color: #22c55e; font-size: 18px; margin-right: 10px; flex-shrink: 0; }
            .timeline { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .timeline h3 { margin: 0 0 16px 0; font-size: 15px; color: #374151; }
            .timeline-item { display: flex; align-items: center; margin: 10px 0; }
            .timeline-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
            .dot-complete { background: #22c55e; }
            .dot-pending { background: #f59e0b; }
            .timeline-text { font-size: 14px; color: #4b5563; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
            .preferences-link { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏸️ Segment Creation Paused</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We've reached Klaviyo's daily segment creation limit. <strong>Don't worry — your remaining segments will be created automatically tomorrow.</strong></p>
              
              <div class="status-box">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%" align="center" style="padding: 10px;">
                      <div style="font-size: 32px; font-weight: bold; color: #22c55e;">\${data.completedToday || 0}</div>
                      <div style="font-size: 13px; color: #666; margin-top: 4px;">✅ Created today</div>
                    </td>
                    <td width="50%" align="center" style="padding: 10px;">
                      <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">\${data.remaining || 0}</div>
                      <div style="font-size: 13px; color: #666; margin-top: 4px;">⏳ Queued for tomorrow</div>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="info-section">
                <h3>📚 Why does this happen?</h3>
                <p>Klaviyo enforces a <strong>100 segments per day</strong> limit on their API to:</p>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #374151;">
                  <li style="margin: 6px 0;">Maintain platform stability for all users</li>
                  <li style="margin: 6px 0;">Prevent accidental mass-creation of segments</li>
                  <li style="margin: 6px 0;">Ensure segment processing completes reliably</li>
                </ul>
                <p style="margin-top: 12px; font-size: 13px; color: #6b7280;">This is standard practice — Mailchimp, HubSpot, and other platforms have similar limits.</p>
              </div>

              <div class="timeline">
                <h3>📋 What happens next</h3>
                <div class="timeline-item">
                  <div class="timeline-dot dot-complete"></div>
                  <div class="timeline-text"><strong>Today:</strong> \${data.completedToday || 0} segments created successfully</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot dot-pending"></div>
                  <div class="timeline-text"><strong>Tomorrow:</strong> \${data.remaining || 0} remaining segment\${(data.remaining || 0) !== 1 ? 's' : ''} will be created automatically</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot dot-complete"></div>
                  <div class="timeline-text"><strong>When complete:</strong> We'll email you with confirmation</div>
                </div>
              </div>

              <div class="checkmark-item">
                <span class="checkmark">✓</span>
                <span><strong>No action needed from you.</strong> Aderai handles everything automatically.</span>
              </div>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="\${dashboardUrl}/jobs" class="button">View Job Progress →</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">— The Aderai Team</p>
            </div>
            <div class="footer">
              <p>You can manage your email notification preferences in your account settings.</p>
              <p>© \${new Date().getFullYear()} Aderai. All rights reserved.</p>
              <p>
                <a href="\${dashboardUrl}/settings" class="preferences-link">Manage Email Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    // Per-minute rate limit email template  
    else if (notificationType === "segment_rate_limit") {
      subject = `⏱️ Aderai: Segments queued - processing in background`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .status-box { background: #dbeafe; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #3b82f6; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .info-section { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6; }
            .info-section h3 { margin: 0 0 12px 0; color: #1e40af; font-size: 15px; }
            .info-section p { margin: 0; font-size: 14px; color: #374151; }
            .checkmark-item { display: flex; align-items: flex-start; margin: 12px 0; }
            .checkmark { color: #22c55e; font-size: 18px; margin-right: 10px; flex-shrink: 0; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
            .preferences-link { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏱️ Segments Queued for Processing</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Your segment creation request has been queued. <strong>We're processing them in the background to stay within Klaviyo's rate limits.</strong></p>
              
              <div class="status-box">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%" align="center" style="padding: 10px;">
                      <div style="font-size: 32px; font-weight: bold; color: #22c55e;">\${data.completed || 0}</div>
                      <div style="font-size: 13px; color: #666; margin-top: 4px;">✅ Created so far</div>
                    </td>
                    <td width="50%" align="center" style="padding: 10px;">
                      <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">\${data.remaining || 0}</div>
                      <div style="font-size: 13px; color: #666; margin-top: 4px;">⏳ In queue</div>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="info-section">
                <h3>📚 Why are segments queued?</h3>
                <p>Klaviyo limits segment creation to <strong>~15 segments per minute</strong> to ensure:</p>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #374151;">
                  <li style="margin: 6px 0;">Each segment is properly processed and populated</li>
                  <li style="margin: 6px 0;">Your Klaviyo account remains in good standing</li>
                  <li style="margin: 6px 0;">Platform performance stays stable for everyone</li>
                </ul>
                <p style="margin-top: 12px; font-size: 13px; color: #6b7280;">Aderai automatically manages this pacing for you.</p>
              </div>

              <p><strong>Estimated time to complete:</strong> ~\${data.estimatedTimeRemaining || 'a few minutes'}</p>

              <div class="checkmark-item">
                <span class="checkmark">✓</span>
                <span><strong>No action needed.</strong> You can close Aderai — we'll continue processing in the background and email you when complete.</span>
              </div>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="\${dashboardUrl}/jobs" class="button">View Job Progress →</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">— The Aderai Team</p>
            </div>
            <div class="footer">
              <p>You can manage your email notification preferences in your account settings.</p>
              <p>© \${new Date().getFullYear()} Aderai. All rights reserved.</p>
              <p>
                <a href="\${dashboardUrl}/settings" class="preferences-link">Manage Email Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    // Handle klaviyo_connected template
    
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
      from: "Aderai <hello@updates.aderai.io>",
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
