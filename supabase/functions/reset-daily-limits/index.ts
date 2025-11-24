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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const today = new Date().toISOString().split('T')[0];

    // Reset all daily counters where last_reset_date is not today
    const { data, error } = await supabaseClient
      .from('usage_limits')
      .update({
        ai_suggestions_today: 0,
        last_reset_date: today,
      })
      .neq('last_reset_date', today)
      .select();

    if (error) {
      console.error('Error resetting limits:', error);
      throw error;
    }

    console.log(`Reset daily limits for ${data?.length || 0} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reset_count: data?.length || 0,
        message: `Reset daily limits for ${data?.length || 0} users`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in reset-daily-limits:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});