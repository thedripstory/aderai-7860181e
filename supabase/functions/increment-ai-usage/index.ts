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
    // Auth client (user-scoped) to identify the caller
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service-role client for the write, so RLS can't silently no-op the counter
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const today = new Date().toISOString().split('T')[0];

    // Get current limits
    const { data: limits, error: fetchError } = await adminClient
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching limits:', fetchError);
      throw fetchError;
    }

    // If no record exists, create one with count = 1
    if (!limits) {
      const { data: inserted, error: insertError } = await adminClient
        .from('usage_limits')
        .insert({
          user_id: user.id,
          ai_suggestions_today: 1,
          ai_suggestions_total: 1,
          last_reset_date: today,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating limits:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, new_count: inserted.ai_suggestions_today }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset daily counter if last reset was a different day
    const todayCount = limits.last_reset_date !== today ? 0 : limits.ai_suggestions_today;

    const { data: updated, error: updateError } = await adminClient
      .from('usage_limits')
      .update({
        ai_suggestions_today: todayCount + 1,
        ai_suggestions_total: limits.ai_suggestions_total + 1,
        last_reset_date: today,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating limits:', updateError);
      throw updateError;
    }

    if (!updated) {
      throw new Error('Failed to increment usage — no row updated');
    }

    // Track in analytics (best-effort)
    try {
      await adminClient.from('analytics_events').insert({
        user_id: user.id,
        event_name: 'ai_suggestion_used',
        event_metadata: {
          daily_count: updated.ai_suggestions_today,
          total_count: updated.ai_suggestions_total,
        },
        page_url: '/ai-suggestions',
      });
    } catch (e) {
      console.error('analytics_events insert failed:', e);
    }

    return new Response(
      JSON.stringify({ success: true, new_count: updated.ai_suggestions_today, total: updated.ai_suggestions_total }),
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
