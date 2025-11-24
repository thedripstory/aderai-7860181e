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

    // Get current limits
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
          ai_suggestions_today: 1,
          ai_suggestions_total: 1,
          last_reset_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating limits:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, new_count: 1 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    let todayCount = limits.ai_suggestions_today;
    
    if (limits.last_reset_date !== today) {
      todayCount = 0;
    }

    // Increment both counters
    const { error: updateError } = await supabaseClient
      .from('usage_limits')
      .update({
        ai_suggestions_today: todayCount + 1,
        ai_suggestions_total: limits.ai_suggestions_total + 1,
        last_reset_date: today,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating limits:', updateError);
      throw updateError;
    }

    // Track in analytics
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'ai_suggestion_used',
      event_metadata: {
        daily_count: todayCount + 1,
        total_count: limits.ai_suggestions_total + 1,
      },
      page_url: '/ai-suggestions',
    });

    return new Response(
      JSON.stringify({ success: true, new_count: todayCount + 1 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in increment-ai-usage:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});