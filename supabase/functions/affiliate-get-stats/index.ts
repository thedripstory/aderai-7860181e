import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's affiliate code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('affiliate_code')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.affiliate_code) {
      console.log('No affiliate code for user:', user.id);
      return new Response(
        JSON.stringify({ 
          totalClicks: 0,
          totalConversions: 0,
          totalEarnings: 0,
          pendingPayment: 0,
          affiliateCode: null,
          conversions: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get click stats
    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('id, converted, created_at')
      .eq('affiliate_code', userData.affiliate_code);

    if (clicksError) {
      console.error('Database error:', { type: 'clicks', timestamp: new Date().toISOString() });
    }

    // Get conversion stats
    const { data: stats, error: statsError } = await supabase
      .from('affiliate_stats')
      .select('*')
      .eq('affiliate_user_id', user.id);

    if (statsError) {
      console.error('Database error:', { type: 'stats', timestamp: new Date().toISOString() });
    }

    const totalClicks = clicks?.length || 0;
    const totalConversions = clicks?.filter(c => c.converted).length || 0;
    const totalEarnings = stats?.reduce((sum, s) => sum + Number(s.commission_amount), 0) || 0;
    const pendingPayment = stats?.filter(s => !s.commission_paid).reduce((sum, s) => sum + Number(s.commission_amount), 0) || 0;

    console.log(`Stats fetched for user ${user.email}: ${totalClicks} clicks, ${totalConversions} conversions, $${totalEarnings} earned`);

    return new Response(
      JSON.stringify({
        totalClicks,
        totalConversions,
        totalEarnings,
        pendingPayment,
        affiliateCode: userData.affiliate_code,
        conversions: stats || [],
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
