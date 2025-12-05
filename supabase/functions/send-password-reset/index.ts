import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { PasswordResetEmail } from "./_templates/password-reset.tsx";

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

    // Render React Email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        userName,
        resetLink,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Aderai <hello@updates.aderai.io>",
      to: [email],
      subject: "Reset Your Aderai Password",
      html,
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
