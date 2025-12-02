import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { EmailVerification } from "./_templates/email-verification.tsx";
import { z } from "https://esm.sh/zod@3.22.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const VerificationEmailSchema = z.object({
      email: z.string().email('Invalid email').max(255),
    });

    const validationResult = VerificationEmailSchema.safeParse(await req.json());

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email } = validationResult.data;

    if (!email) {
      throw new Error("Email is required");
    }

    // Generate verification token (in production, store this in database)
    const verificationToken = crypto.randomUUID();
    const siteUrl = Deno.env.get('SITE_URL') || 'https://aderai.io';
    const verificationUrl = `${siteUrl}/verify-email?token=${verificationToken}`;

    // Render React Email template
    const html = await renderAsync(
      React.createElement(EmailVerification, {
        verificationUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Akshat from Aderai <akshat@updates.aderai.io>",
      to: [email],
      subject: "Verify Your Aderai Email Address",
      html,
    });

    console.log("Verification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
