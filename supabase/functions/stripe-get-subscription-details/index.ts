import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Safe date conversion helper - handles null/undefined/invalid timestamps
const safeToISOString = (timestamp: number | null | undefined): string | null => {
  if (timestamp === null || timestamp === undefined || isNaN(timestamp)) {
    return null;
  }
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use anon key client for auth verification
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use service role client to bypass RLS for database query
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user's subscription info from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id, stripe_subscription_id, subscription_status, subscription_start_date, subscription_end_date, subscription_canceled_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw profileError;
    }

    // If no profile exists, return inactive status
    if (!profile) {
      console.log("No profile found for user:", user.id);
      return new Response(
        JSON.stringify({
          status: "inactive",
          hasSubscription: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If no Stripe customer or subscription, return basic info
    if (!profile?.stripe_customer_id || !profile?.stripe_subscription_id) {
      console.log("No Stripe subscription for user:", user.id, { 
        hasCustomer: !!profile?.stripe_customer_id, 
        hasSubscription: !!profile?.stripe_subscription_id 
      });
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
      console.log("Fetching subscription from Stripe:", profile.stripe_subscription_id);
      subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id, {
        expand: ["default_payment_method"],
      });

      console.log("Stripe subscription data:", {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        canceled_at: subscription.canceled_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
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

    // Use safe date conversion for all timestamps
    const responseData = {
      status: subscription.status,
      hasSubscription: true,
      currentPeriodStart: safeToISOString(subscription.current_period_start),
      currentPeriodEnd: safeToISOString(subscription.current_period_end),
      nextBillingDate: safeToISOString(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: safeToISOString(subscription.canceled_at),
      amount: amount,
      currency: subscription.currency?.toUpperCase() || 'USD',
      interval: subscription.items.data[0]?.price?.recurring?.interval || "month",
      paymentMethod,
    };

    console.log("Returning subscription details:", responseData);

    return new Response(
      JSON.stringify(responseData),
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
