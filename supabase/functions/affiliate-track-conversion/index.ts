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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referredUserId, subscriptionAmount, commissionType = 'subscription' } = await req.json();

    if (!referredUserId) {
      console.log('Missing referred user ID');
      return new Response(
        JSON.stringify({ error: 'Referred user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get referred user and their referral info
    const { data: referredUser, error: userError } = await supabase
      .from('users')
      .select('id, email, referred_by')
      .eq('id', referredUserId)
      .single();

    if (userError || !referredUser || !referredUser.referred_by) {
      console.log('User not found or no referral code:', referredUserId);
      return new Response(
        JSON.stringify({ error: 'User not found or not referred' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get affiliate user
    const { data: affiliateUser, error: affiliateError } = await supabase
      .from('users')
      .select('id, email, affiliate_code')
      .eq('affiliate_code', referredUser.referred_by)
      .single();

    if (affiliateError || !affiliateUser) {
      console.log('Affiliate not found for code:', referredUser.referred_by);
      return new Response(
        JSON.stringify({ error: 'Affiliate not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error('Error creating affiliate stats:', statsError);
      return new Response(
        JSON.stringify({ error: 'Failed to track conversion' }),
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
      console.error('Error updating click conversion:', clickUpdateError);
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
