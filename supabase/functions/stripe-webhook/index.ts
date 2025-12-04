import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep(`Processing webhook event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        
        logStep("Checkout session completed", { userId, sessionId: session.id });
        
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await supabaseAdmin
            .from("users")
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: "active",
              subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", userId);

          await supabaseAdmin.from("subscription_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: { session_id: session.id, subscription_id: subscription.id },
          });

          logStep("Updated user subscription status to active", { userId, subscriptionId: subscription.id });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        logStep("Subscription updated", { userId, subscriptionId: subscription.id, status: subscription.status });

        if (userId) {
          let status: string;
          switch (subscription.status) {
            case "active":
              status = "active";
              break;
            case "past_due":
              status = "past_due";
              break;
            case "canceled":
              status = "canceled";
              break;
            case "trialing":
              status = "trialing";
              break;
            default:
              status = "inactive";
          }

          await supabaseAdmin
            .from("users")
            .update({
              subscription_status: status,
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_canceled_at: subscription.canceled_at 
                ? new Date(subscription.canceled_at * 1000).toISOString() 
                : null,
            })
            .eq("id", userId);

          await supabaseAdmin.from("subscription_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: { subscription_id: subscription.id, status },
          });

          logStep("Updated subscription status", { userId, status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        logStep("Subscription deleted", { userId, subscriptionId: subscription.id });

        if (userId) {
          await supabaseAdmin
            .from("users")
            .update({
              subscription_status: "canceled",
              subscription_canceled_at: new Date().toISOString(),
            })
            .eq("id", userId);

          await supabaseAdmin.from("subscription_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: { subscription_id: subscription.id },
          });

          logStep("Marked subscription as canceled", { userId });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        logStep("Invoice payment failed", { invoiceId: invoice.id, subscriptionId });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.supabase_user_id;

          if (userId) {
            await supabaseAdmin
              .from("users")
              .update({ subscription_status: "past_due" })
              .eq("id", userId);

            await supabaseAdmin.from("subscription_events").insert({
              user_id: userId,
              stripe_event_id: event.id,
              event_type: event.type,
              event_data: { invoice_id: invoice.id, subscription_id: subscriptionId },
            });

            logStep("Marked subscription as past_due", { userId });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
