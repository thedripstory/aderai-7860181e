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

// Helper to find user by email if metadata is missing
async function findUserByEmail(email: string): Promise<string | null> {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  
  if (error || !user) {
    logStep("Could not find user by email", { email, error: error?.message });
    return null;
  }
  
  return user.id;
}

// Helper to get user details for email
async function getUserDetails(userId: string): Promise<{ email: string; firstName: string } | null> {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("email, first_name")
    .eq("id", userId)
    .maybeSingle();
  
  if (error || !user) {
    logStep("Could not get user details", { userId, error: error?.message });
    return null;
  }
  
  return { email: user.email, firstName: user.first_name || "there" };
}

// Helper to send billing email
async function sendBillingEmail(
  userId: string,
  emailType: string,
  details?: { amount?: number; currency?: string; nextBillingDate?: string }
) {
  try {
    const userDetails = await getUserDetails(userId);
    if (!userDetails) {
      logStep("Cannot send billing email - user details not found", { userId });
      return;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      logStep("Cannot send billing email - missing Supabase config");
      return;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-billing-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        email: userDetails.email,
        firstName: userDetails.firstName,
        emailType,
        ...details,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Failed to send billing email", { emailType, error: errorText });
    } else {
      logStep("Billing email sent successfully", { emailType, email: userDetails.email });
    }
  } catch (error) {
    logStep("Error sending billing email", { emailType, error: (error as Error).message });
  }
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    
    // CRITICAL FIX: Use constructEventAsync instead of constructEvent
    // constructEvent uses synchronous crypto which fails in Deno/Edge runtime
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    logStep(`Processing webhook event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Try to get userId from metadata first, then fallback to email lookup
        let userId = session.metadata?.supabase_user_id;
        
        if (!userId && session.customer_email) {
          logStep("No userId in metadata, trying email lookup", { email: session.customer_email });
          userId = await findUserByEmail(session.customer_email);
        }
        
        // If still no userId, try to get email from customer object
        if (!userId && session.customer) {
          try {
            const customer = await stripe.customers.retrieve(session.customer as string);
            if (customer && !customer.deleted && 'email' in customer && customer.email) {
              logStep("Trying customer email lookup", { email: customer.email });
              userId = await findUserByEmail(customer.email);
            }
          } catch (e) {
            logStep("Error fetching customer", { error: (e as Error).message });
          }
        }
        
        logStep("Checkout session completed", { userId, sessionId: session.id, customerEmail: session.customer_email });
        
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: "active",
              subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", userId);

          if (updateError) {
            logStep("ERROR updating user subscription", { userId, error: updateError.message });
          } else {
            logStep("Updated user subscription status to active", { userId, subscriptionId: subscription.id });
            
            // Send subscription confirmation email
            await sendBillingEmail(userId, "subscription_confirmed", {
              amount: session.amount_total ? session.amount_total / 100 : 9,
              currency: session.currency?.toUpperCase() || "USD",
              nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            });
          }

          await supabaseAdmin.from("subscription_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: { session_id: session.id, subscription_id: subscription.id },
          });
        } else {
          logStep("WARNING: Could not link payment to user", { 
            hasUserId: !!userId, 
            hasSubscription: !!session.subscription,
            customerEmail: session.customer_email 
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.supabase_user_id;

        // Fallback: try to find user by customer email
        if (!userId && subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !customer.deleted && 'email' in customer && customer.email) {
              userId = await findUserByEmail(customer.email);
            }
          } catch (e) {
            logStep("Error fetching customer for subscription update", { error: (e as Error).message });
          }
        }

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

          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              subscription_status: status,
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_canceled_at: subscription.canceled_at 
                ? new Date(subscription.canceled_at * 1000).toISOString() 
                : null,
            })
            .eq("id", userId);

          if (updateError) {
            logStep("ERROR updating subscription status", { userId, error: updateError.message });
          }

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
        let userId = subscription.metadata?.supabase_user_id;

        // Fallback: try to find user by customer email
        if (!userId && subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !customer.deleted && 'email' in customer && customer.email) {
              userId = await findUserByEmail(customer.email);
            }
          } catch (e) {
            logStep("Error fetching customer for subscription delete", { error: (e as Error).message });
          }
        }

        logStep("Subscription deleted", { userId, subscriptionId: subscription.id });

        if (userId) {
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              subscription_status: "canceled",
              subscription_canceled_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (updateError) {
            logStep("ERROR marking subscription as canceled", { userId, error: updateError.message });
          }

          await supabaseAdmin.from("subscription_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: { subscription_id: subscription.id },
          });

          // Send subscription canceled email
          await sendBillingEmail(userId, "subscription_canceled");

          logStep("Marked subscription as canceled", { userId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        // Only send renewal email for recurring payments (not first payment)
        if (subscriptionId && invoice.billing_reason === "subscription_cycle") {
          logStep("Invoice payment succeeded (renewal)", { invoiceId: invoice.id, subscriptionId });

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          let userId = subscription.metadata?.supabase_user_id;

          if (!userId && subscription.customer) {
            try {
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              if (customer && !customer.deleted && 'email' in customer && customer.email) {
                userId = await findUserByEmail(customer.email);
              }
            } catch (e) {
              logStep("Error fetching customer for payment success", { error: (e as Error).message });
            }
          }

          if (userId) {
            // Send renewal confirmation email
            await sendBillingEmail(userId, "subscription_renewed", {
              amount: invoice.amount_paid ? invoice.amount_paid / 100 : 9,
              currency: invoice.currency?.toUpperCase() || "USD",
              nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            });

            await supabaseAdmin.from("subscription_events").insert({
              user_id: userId,
              stripe_event_id: event.id,
              event_type: event.type,
              event_data: { invoice_id: invoice.id, subscription_id: subscriptionId, amount: invoice.amount_paid },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        logStep("Invoice payment failed", { invoiceId: invoice.id, subscriptionId });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          let userId = subscription.metadata?.supabase_user_id;

          // Fallback: try to find user by customer email
          if (!userId && subscription.customer) {
            try {
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              if (customer && !customer.deleted && 'email' in customer && customer.email) {
                userId = await findUserByEmail(customer.email);
              }
            } catch (e) {
              logStep("Error fetching customer for payment failed", { error: (e as Error).message });
            }
          }

          if (userId) {
            const { error: updateError } = await supabaseAdmin
              .from("users")
              .update({ subscription_status: "past_due" })
              .eq("id", userId);

            if (updateError) {
              logStep("ERROR marking subscription as past_due", { userId, error: updateError.message });
            }

            await supabaseAdmin.from("subscription_events").insert({
              user_id: userId,
              stripe_event_id: event.id,
              event_type: event.type,
              event_data: { invoice_id: invoice.id, subscription_id: subscriptionId },
            });

            // Send payment failed email
            await sendBillingEmail(userId, "payment_failed", {
              amount: invoice.amount_due ? invoice.amount_due / 100 : 9,
              currency: invoice.currency?.toUpperCase() || "USD",
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
