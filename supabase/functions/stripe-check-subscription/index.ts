import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

function getPeriodEnd(sub: any): number | null {
  const v = sub?.items?.data?.[0]?.current_period_end ?? sub?.current_period_end;
  return typeof v === 'number' ? v : null;
}
function getPeriodStart(sub: any): number | null {
  const v = sub?.items?.data?.[0]?.current_period_start ?? sub?.current_period_start;
  return typeof v === 'number' ? v : null;
}
function toIso(unixSeconds: number | null | undefined): string | null {
  if (typeof unixSeconds !== 'number' || !isFinite(unixSeconds)) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    if (!user.email) throw new Error("User email not available");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: profile } = await admin
      .from("users")
      .select("stripe_subscription_id, stripe_customer_id, subscription_status, subscription_end_date")
      .eq("id", user.id)
      .maybeSingle();

    let status: string = profile?.subscription_status || "inactive";
    let endDate: string | null = profile?.subscription_end_date ?? null;
    let resolvedActive = false;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // 1. If we have a subscription id, try retrieving it
    if (profile?.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        const liveStatus = sub.status;
        logStep("Live Stripe status from stored sub id", { liveStatus });

        if (liveStatus === "active" || liveStatus === "trialing") {
          status = liveStatus;
          const iso = toIso(getPeriodEnd(sub));
          if (iso) endDate = iso;
          resolvedActive = true;

          const update: Record<string, unknown> = { subscription_status: liveStatus };
          if (iso) update.subscription_end_date = iso;
          await admin.from("users").update(update).eq("id", user.id);
        } else {
          status = liveStatus;
        }
      } catch (e) {
        logStep("Stripe retrieve failed", { error: (e as Error).message });
      }
    }

    // 2. Fallback: webhook may not have written sub id yet (e.g. 100% OFF coupon, async webhook).
    // Look up by email -> customer -> subscriptions.
    if (!resolvedActive) {
      try {
        logStep("Fallback: looking up customer by email", { email: user.email });
        const customers = await stripe.customers.list({ email: user.email, limit: 5 });

        let foundSub: Stripe.Subscription | null = null;
        let foundCustomerId: string | null = null;

        for (const customer of customers.data) {
          const subs = await stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 10,
          });
          // Pick most recent active/trialing
          const candidate = subs.data
            .filter((s) => s.status === "active" || s.status === "trialing")
            .sort((a, b) => b.created - a.created)[0];
          if (candidate) {
            foundSub = candidate;
            foundCustomerId = customer.id;
            break;
          }
        }

        if (foundSub && foundCustomerId) {
          logStep("Fallback found active subscription", {
            subId: foundSub.id,
            customerId: foundCustomerId,
            status: foundSub.status,
          });
          status = foundSub.status;
          const isoEnd = toIso(getPeriodEnd(foundSub));
          const isoStart = toIso(getPeriodStart(foundSub));
          if (isoEnd) endDate = isoEnd;
          resolvedActive = true;

          const update: Record<string, unknown> = {
            subscription_status: foundSub.status,
            stripe_subscription_id: foundSub.id,
            stripe_customer_id: foundCustomerId,
          };
          if (isoEnd) update.subscription_end_date = isoEnd;
          if (isoStart) update.subscription_start_date = isoStart;
          await admin.from("users").update(update).eq("id", user.id);
        } else {
          logStep("Fallback found no active subscription");
        }
      } catch (e) {
        logStep("Fallback lookup failed", { error: (e as Error).message });
      }
    }

    const isActive = status === "active" || status === "trialing";

    return new Response(
      JSON.stringify({
        subscribed: isActive,
        isActive,
        status,
        endDate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error checking subscription:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, subscribed: false, isActive: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
