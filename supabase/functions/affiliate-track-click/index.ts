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

    const { affiliateCode, referrer } = await req.json();

    if (!affiliateCode) {
      console.log('Missing affiliate code');
      return new Response(
        JSON.stringify({ error: 'Affiliate code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify affiliate code exists
    const { data: affiliateUser, error: affiliateError } = await supabase
      .from('users')
      .select('id, email')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (affiliateError || !affiliateUser) {
      console.log('Invalid affiliate code attempt');
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request metadata
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Track the click
    const { data: clickData, error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_code: affiliateCode,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer || null,
        converted: false,
      })
      .select()
      .single();

    if (clickError) {
      console.error('Database error:', { code: clickError.code, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Click tracked for affiliate ${affiliateCode} (${affiliateUser.email})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        clickId: clickData.id,
        message: 'Click tracked successfully' 
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
