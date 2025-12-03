import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.22.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const verificationToken = crypto.randomUUID();
    const siteUrl = Deno.env.get('SITE_URL') || 'https://aderai.io';
    const verificationUrl = `${siteUrl}/verify-email?token=${verificationToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 3px solid #FF6B35;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #1a1a1a;">aderai<span style="color: #FF6B35;">.</span></h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: bold; color: #1a1a1a; text-align: center;">Welcome to Aderai!</h2>
              
              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333333;">Hi there!</p>
              
              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333333;">
                Thank you for signing up! We are excited to help you create powerful Klaviyo segments in seconds.
              </p>

              <p style="margin: 16px 0; font-size: 16px; line-height: 26px; color: #333333;">
                Please verify your email address to unlock all features and get started:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #FF6B35; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 40px; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #FFF8F3; border: 2px solid #FFE8D9; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; font-size: 16px; font-weight: bold; color: #1a1a1a;">What you will get:</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #333333;">• 70+ pre-built Klaviyo segments</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #333333;">• Deploy segments in 30 seconds</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #333333;">• AI-powered segment suggestions</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #333333;">• Performance analytics and insights</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0; font-size: 14px; line-height: 22px; color: #666666;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 16px 0; font-size: 12px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #e5e5e5; color: #666666;">
                ${verificationUrl}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

              <p style="margin: 5px 0; font-size: 12px; line-height: 20px; color: #999999;">
                Need help getting started? Visit our Help Center at https://aderai.io/help
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 5px 0; font-size: 12px; color: #999999;">2025 Aderai. All rights reserved.</p>
              <p style="margin: 5px 0; font-size: 11px; color: #bbbbbb;">If you did not create an account, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

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
