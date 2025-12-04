import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's subscription info from database
    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("stripe_customer_id, stripe_subscription_id, subscription_status, subscription_start_date, subscription_end_date, subscription_canceled_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // If no Stripe customer or subscription, return basic info
    if (!profile?.stripe_customer_id || !profile?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({
          status: profile?.subscription_status || "inactive",
          hasSubscription: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get subscription details from Stripe
    let subscription;
    let paymentMethod = null;

    try {
      subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id, {
        expand: ["default_payment_method"],
      });

      // Get payment method details
      if (subscription.default_payment_method && typeof subscription.default_payment_method === "object") {
        const pm = subscription.default_payment_method as Stripe.PaymentMethod;
        if (pm.card) {
          paymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          };
        }
      }
    } catch (stripeError) {
      console.error("Error fetching subscription from Stripe:", stripeError);
      // Return database info if Stripe call fails
      return new Response(
        JSON.stringify({
          status: profile.subscription_status,
          hasSubscription: true,
          nextBillingDate: profile.subscription_end_date,
          canceledAt: profile.subscription_canceled_at,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate amount
    let amount = 9; // Default $9
    if (subscription.items.data.length > 0) {
      const item = subscription.items.data[0];
      if (item.price.unit_amount) {
        amount = item.price.unit_amount / 100;
      }
    }

    return new Response(
      JSON.stringify({
        status: subscription.status,
        hasSubscription: true,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        amount: amount,
        currency: subscription.currency.toUpperCase(),
        interval: subscription.items.data[0]?.price?.recurring?.interval || "month",
        paymentMethod,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error getting subscription details:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
