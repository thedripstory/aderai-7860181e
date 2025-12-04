import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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

    logStep("User authenticated", { userId: user.id });

    const { data: profile, error } = await supabaseClient
      .from("users")
      .select("subscription_status, subscription_end_date")
      .eq("id", user.id)
      .single();

    if (error) {
      logStep("Error fetching profile", { error: error.message });
      throw error;
    }

    const isActive = profile?.subscription_status === "active" || 
                     profile?.subscription_status === "trialing";

    logStep("Subscription check complete", { 
      isActive, 
      status: profile?.subscription_status,
      endDate: profile?.subscription_end_date 
    });

    return new Response(
      JSON.stringify({ 
        isActive,
        status: profile?.subscription_status || "inactive",
        endDate: profile?.subscription_end_date 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error checking subscription:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, isActive: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
