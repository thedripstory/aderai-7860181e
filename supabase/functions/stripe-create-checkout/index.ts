import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use environment variable with fallback to hardcoded price
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID") || "price_1SacRA0lE1soQQfxnQig4ytO";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "Payment system not configured. Please contact support.",
          code: "STRIPE_NOT_CONFIGURED",
          setupRequired: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        }
      );
    }

    if (!STRIPE_PRICE_ID) {
      logStep("ERROR: STRIPE_PRICE_ID not configured");
      return new Response(
        JSON.stringify({ 
          error: "Subscription pricing not configured. Please contact support.",
          code: "PRICE_NOT_CONFIGURED",
          setupRequired: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Verify price exists in Stripe
    try {
      await stripe.prices.retrieve(STRIPE_PRICE_ID);
      logStep("Price verified", { priceId: STRIPE_PRICE_ID });
    } catch (priceError) {
      logStep("ERROR: Price not found in Stripe", { priceId: STRIPE_PRICE_ID, error: priceError });
      return new Response(
        JSON.stringify({ 
          error: "Subscription plan not found. Please contact support.",
          code: "PRICE_NOT_FOUND",
          setupRequired: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        }
      );
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string;

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Update user with stripe_customer_id
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    logStep("Updated user with Stripe customer ID");

    const reqData = await req.json().catch(() => ({}));
    const origin = reqData?.origin || Deno.env.get("SITE_URL") || "https://aderai.io";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/auth?payment=canceled`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating checkout session:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
