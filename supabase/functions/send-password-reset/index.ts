import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify service role key - only backend can send password reset emails
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceKey || '')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, resetLink, userName }: PasswordResetRequest = await req.json();
    
    // Validate inputs
    if (!email || typeof email !== 'string' || email.length > 255 || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!resetLink || typeof resetLink !== 'string' || resetLink.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid reset link' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client for audit logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user_id for audit log
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    const emailResponse = await resend.emails.send({
      from: "Klaviyo Segments <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </div>
              <p>For security reasons, this link can only be used once.</p>
              <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Klaviyo Segments. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log email to audit trail
    if (userData) {
      await supabase.from("email_audit_log").insert({
        user_id: userData.id,
        email_type: "password_reset",
        recipient_email: email,
        subject: "Password Reset Request",
        status: "sent",
      });
    }

    console.log("Password reset email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Password reset error");
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
