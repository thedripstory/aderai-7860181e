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
    // Check if user is admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      
      if (userData.user) {
        // Check if admin using the has_role function
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .single();
        
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const checks: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: {},
      stripe: {},
      email: {},
      database: {},
      overall: { ready: false, issues: [] }
    };

    // Check environment variables
    const envVars = {
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SUPABASE_ANON_KEY: !!Deno.env.get("SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      STRIPE_SECRET_KEY: !!Deno.env.get("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: !!Deno.env.get("STRIPE_WEBHOOK_SECRET"),
      STRIPE_PRICE_ID: !!Deno.env.get("STRIPE_PRICE_ID"),
      RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
      ENCRYPTION_KEY: !!Deno.env.get("ENCRYPTION_KEY"),
      SITE_URL: !!Deno.env.get("SITE_URL"),
      OPENAI_API_KEY: !!Deno.env.get("OPENAI_API_KEY"),
    };

    checks.environment = {
      configured: envVars,
      missing: Object.entries(envVars).filter(([_, v]) => !v).map(([k]) => k)
    };

    // Check Stripe connection
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        
        // Check account
        const account = await stripe.accounts.retrieve();
        checks.stripe.connected = true;
        checks.stripe.accountId = account.id;
        checks.stripe.mode = stripeKey.startsWith("sk_live") ? "live" : "test";

        // Check price exists
        const priceId = Deno.env.get("STRIPE_PRICE_ID") || "price_1SacRA0lE1soQQfxnQig4ytO";
        try {
          const price = await stripe.prices.retrieve(priceId);
          checks.stripe.priceValid = true;
          checks.stripe.priceAmount = price.unit_amount ? price.unit_amount / 100 : null;
          checks.stripe.priceCurrency = price.currency?.toUpperCase();
          checks.stripe.priceInterval = price.recurring?.interval;
        } catch (e) {
          checks.stripe.priceValid = false;
          checks.stripe.priceError = "Price ID not found in Stripe";
          checks.overall.issues.push(`STRIPE_PRICE_ID "${priceId}" not found in Stripe. Create it in Stripe Dashboard → Products.`);
        }

        // Check webhook (can't fully verify, just check if secret exists)
        checks.stripe.webhookSecretSet = !!Deno.env.get("STRIPE_WEBHOOK_SECRET");
        if (!checks.stripe.webhookSecretSet) {
          checks.overall.issues.push("STRIPE_WEBHOOK_SECRET not set. Webhook events won't be verified.");
        }

      } catch (e: any) {
        checks.stripe.connected = false;
        checks.stripe.error = e.message;
        checks.overall.issues.push(`Stripe connection failed: ${e.message}`);
      }
    } else {
      checks.stripe.connected = false;
      checks.stripe.error = "STRIPE_SECRET_KEY not configured";
      checks.overall.issues.push("STRIPE_SECRET_KEY not configured. Payment system won't work.");
    }

    // Check email (Resend)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendKey}` }
        });
        checks.email.connected = response.ok;
        if (!response.ok) {
          checks.email.error = "Invalid API key";
          checks.overall.issues.push("RESEND_API_KEY is invalid. Emails won't be sent.");
        }
      } catch (e: any) {
        checks.email.connected = false;
        checks.email.error = e.message;
      }
    } else {
      checks.email.connected = false;
      checks.email.error = "RESEND_API_KEY not configured";
      checks.overall.issues.push("RESEND_API_KEY not configured. Transactional emails won't be sent.");
    }

    // Check database tables using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const tables = ['users', 'klaviyo_keys', 'segment_creation_jobs', 'subscription_events'];
    checks.database.tables = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        checks.database.tables[table] = { exists: !error, count: count || 0 };
        if (error) {
          checks.overall.issues.push(`Database table "${table}" not accessible: ${error.message}`);
        }
      } catch (e) {
        checks.database.tables[table] = { exists: false, error: 'Query failed' };
      }
    }

    // Overall status
    checks.overall.ready = checks.overall.issues.length === 0;
    checks.overall.issueCount = checks.overall.issues.length;

    return new Response(
      JSON.stringify(checks),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("[CHECK-SETUP-STATUS] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
