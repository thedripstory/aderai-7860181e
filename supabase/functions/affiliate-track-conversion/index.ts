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
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscriptionAmount, commissionType = 'subscription' } = await req.json();

    // Use authenticated user's ID
    const referredUserId = user.id;

    // Validate subscription amount
    if (!subscriptionAmount || subscriptionAmount <= 0 || subscriptionAmount > 1000) {
      console.log('Invalid subscription amount:', subscriptionAmount);
      return new Response(
        JSON.stringify({ error: 'Invalid subscription amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate conversion
    const { data: existingConversion } = await supabase
      .from('affiliate_stats')
      .select('id')
      .eq('referred_user_id', referredUserId)
      .single();

    if (existingConversion) {
      console.log('Conversion already exists for user:', referredUserId);
      return new Response(
        JSON.stringify({ error: 'Conversion already recorded' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get referred user and their referral info
    const { data: referredUser, error: userError } = await supabase
      .from('users')
      .select('id, email, referred_by')
      .eq('id', referredUserId)
      .single();

    if (userError || !referredUser || !referredUser.referred_by) {
      console.log('Invalid referral data');
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get affiliate user
    const { data: affiliateUser, error: affiliateError } = await supabase
      .from('users')
      .select('id, email, affiliate_code')
      .eq('affiliate_code', referredUser.referred_by)
      .single();

    if (affiliateError || !affiliateUser) {
      console.log('Invalid affiliate reference');
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate commission (30% of subscription amount)
    const commissionAmount = subscriptionAmount ? (subscriptionAmount * 0.30) : 0;

    // Create affiliate stats entry
    const { data: statsData, error: statsError } = await supabase
      .from('affiliate_stats')
      .insert({
        affiliate_user_id: affiliateUser.id,
        referred_user_id: referredUser.id,
        commission_amount: commissionAmount,
        commission_type: commissionType,
        commission_paid: false,
      })
      .select()
      .single();

    if (statsError) {
      console.error('Database error:', { type: 'stats_insert', timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark affiliate click as converted
    const { error: clickUpdateError } = await supabase
      .from('affiliate_clicks')
      .update({ converted: true })
      .eq('affiliate_code', referredUser.referred_by)
      .eq('converted', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (clickUpdateError) {
      console.error('Database error:', { type: 'click_update', timestamp: new Date().toISOString() });
    }

    console.log(`Conversion tracked: ${affiliateUser.email} earned $${commissionAmount} from ${referredUser.email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        statsId: statsData.id,
        affiliateEmail: affiliateUser.email,
        commissionAmount,
        message: 'Conversion tracked successfully'
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
