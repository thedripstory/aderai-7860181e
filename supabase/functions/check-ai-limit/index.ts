import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const DAILY_LIMIT = 10;

    // Get or create usage limits
    let { data: limits, error: fetchError } = await supabaseClient
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching limits:', fetchError);
      throw fetchError;
    }

    // If no record exists, create one
    if (!limits) {
      const { data: newLimits, error: insertError } = await supabaseClient
        .from('usage_limits')
        .insert({
          user_id: user.id,
          ai_suggestions_today: 0,
          ai_suggestions_total: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating limits:', insertError);
        throw insertError;
      }

      limits = newLimits;
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    if (limits.last_reset_date !== today) {
      const { data: updatedLimits, error: updateError } = await supabaseClient
        .from('usage_limits')
        .update({
          ai_suggestions_today: 0,
          last_reset_date: today,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error resetting limits:', updateError);
        throw updateError;
      }

      limits = updatedLimits;
    }

    const allowed = limits.ai_suggestions_today < DAILY_LIMIT;
    const remaining = Math.max(0, DAILY_LIMIT - limits.ai_suggestions_today);

    return new Response(
      JSON.stringify({
        allowed,
        remaining,
        total_used: limits.ai_suggestions_today,
        daily_limit: DAILY_LIMIT,
        total_lifetime: limits.ai_suggestions_total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-ai-limit:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});