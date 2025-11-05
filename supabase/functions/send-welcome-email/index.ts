import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Verify JWT token - only service role can send welcome emails
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceKey || '')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const isAgency = accountType === "agency";
    const accountTypeLabel = isAgency ? "Agency" : "Brand";
    const features = isAgency
      ? "• Manage multiple brand clients<br>• White-label segment creation<br>• Client performance tracking<br>• Bulk operations across clients"
      : "• AI-powered segment suggestions<br>• Pre-built segment templates<br>• Performance analytics<br>• Automated segment creation";

    const emailResponse = await resend.emails.send({
      from: "Klaviyo Segments <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to Klaviyo Segments - ${accountTypeLabel} Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; }
            .feature-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Klaviyo Segments!</h1>
              <div class="badge">${accountTypeLabel} Account</div>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome aboard! We're excited to have you join the Klaviyo Segments platform. Your ${accountTypeLabel.toLowerCase()} account is now active and ready to use.</p>
              
              <div class="feature-box">
                <h3 style="margin-top: 0; color: #FF6B35;">🚀 What you can do now:</h3>
                <p style="margin: 0; line-height: 2;">${features}</p>
              </div>

              ${isAgency ? `
                <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="margin-top: 0; color: #2E7D32;">👥 Agency Features Unlocked</h3>
                  <p style="margin: 0;">As an agency, you can now add and manage multiple brand clients. Each client gets their own dedicated workspace with separate Klaviyo integrations.</p>
                </div>
              ` : `
                <div style="background: #E3F2FD; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="margin-top: 0; color: #1565C0;">🤖 AI-Powered Segments</h3>
                  <p style="margin: 0;">Our AI assistant can suggest custom segments based on your business goals. Just describe what you're looking for, and we'll generate tailored segment definitions.</p>
                </div>
              `}

              <div style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://app.lovable.app'}" class="button">Get Started Now</a>
              </div>

              <p style="margin-top: 30px;">Need help getting started? Check out our <a href="#" style="color: #FF6B35;">documentation</a> or reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Klaviyo Segments. All rights reserved.</p>
              <p>You're receiving this email because you created an account with us.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log to audit trail
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: "welcome",
      recipient_email: email,
      subject: `Welcome to Klaviyo Segments - ${accountTypeLabel} Account`,
      status: "sent",
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
