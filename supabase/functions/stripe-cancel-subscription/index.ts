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

    // Get user's subscription ID
    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const reqData = await req.json();
    const cancelImmediately = reqData?.cancelImmediately || false;

    let subscription;

    if (cancelImmediately) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } else {
      // Cancel at end of billing period
      subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    // Update database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: subscription.status === "canceled" ? "canceled" : "active",
        subscription_canceled_at: cancelImmediately ? new Date().toISOString() : null,
      })
      .eq("id", user.id);

    // Log the event
    await supabaseAdmin.from("subscription_events").insert({
      user_id: user.id,
      stripe_event_id: `manual_cancel_${Date.now()}`,
      event_type: cancelImmediately ? "subscription_canceled_immediately" : "subscription_cancel_scheduled",
      event_data: { 
        subscription_id: profile.stripe_subscription_id,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
