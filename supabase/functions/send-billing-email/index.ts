import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { BillingEmail, BillingEmailType } from "./_templates/billing.tsx";
import { z } from "https://esm.sh/zod@3.22.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BillingEmailSchema = z.object({
  email: z.string().email('Invalid email').max(255),
  userId: z.string().uuid('Invalid user ID'),
  accountName: z.string().min(1).max(255),
  emailType: z.enum([
    'subscription_confirmed',
    'subscription_canceled',
    'subscription_renewed',
    'payment_failed',
    'payment_succeeded',
    'trial_ending'
  ]),
  planName: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  nextBillingDate: z.string().optional(),
  trialEndDate: z.string().optional(),
  failureReason: z.string().optional(),
  billingPortalUrl: z.string().url().optional(),
});

type BillingEmailRequest = z.infer<typeof BillingEmailSchema>;

const getSubjectLine = (emailType: BillingEmailType, planName?: string): string => {
  switch (emailType) {
    case 'subscription_confirmed':
      return `Welcome to Aderai ${planName || 'Pro'}! 🎉`;
    case 'subscription_canceled':
      return 'Your Aderai subscription has been canceled';
    case 'subscription_renewed':
      return 'Your Aderai subscription has been renewed ✅';
    case 'payment_failed':
      return '⚠️ Action required: Payment failed';
    case 'payment_succeeded':
      return 'Payment received - Thank you!';
    case 'trial_ending':
      return 'Your Aderai trial is ending soon ⏳';
    default:
      return 'Aderai Billing Update';
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[send-billing-email] Processing billing email request");

    const validationResult = BillingEmailSchema.safeParse(await req.json());

    if (!validationResult.success) {
      console.error("[send-billing-email] Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      email,
      userId,
      accountName,
      emailType,
      planName,
      amount,
      currency,
      nextBillingDate,
      trialEndDate,
      failureReason,
      billingPortalUrl,
    } = validationResult.data;

    console.log(`[send-billing-email] Sending ${emailType} email to ${email}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate email log ID for tracking
    const emailLogId = crypto.randomUUID();
    
    // Generate tracking pixel URL
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-event?e=${emailLogId}&u=${userId}`;
    
    // Dashboard URL
    const dashboardUrl = Deno.env.get('SITE_URL') || 'https://aderai.io';

    // Render React Email template
    const html = await renderAsync(
      React.createElement(BillingEmail, {
        accountName,
        emailType: emailType as BillingEmailType,
        dashboardUrl,
        billingPortalUrl,
        planName,
        amount,
        currency,
        nextBillingDate,
        trialEndDate,
        failureReason,
        trackingPixelUrl,
      })
    );

    const subject = getSubjectLine(emailType as BillingEmailType, planName);

    // Send email from billing@aderai.io for billing-related emails
    const emailResponse = await resend.emails.send({
      from: "Aderai Billing <billing@updates.aderai.io>",
      to: [email],
      subject,
      html,
    });

    // Log to audit trail
    await supabase.from("email_audit_log").insert({
      user_id: userId,
      email_type: `billing_${emailType}`,
      recipient_email: email,
      subject,
      status: "sent",
      email_log_id: emailLogId,
      metadata: {
        billing_type: emailType,
        plan_name: planName,
        amount,
      },
    });

    console.log(`[send-billing-email] Email sent successfully:`, emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-billing-email] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to send billing email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);