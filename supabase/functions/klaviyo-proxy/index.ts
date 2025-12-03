import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { keyId, endpoint, method = 'GET', body } = await req.json();

    if (!keyId || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the actual API key from database (only for authenticated user)
    const { data: keyData, error: keyError } = await supabaseClient
      .from('klaviyo_keys')
      .select('klaviyo_api_key_hash')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single();

    if (keyError || !keyData) {
      console.error('API key not found:', keyError);
      return new Response(
        JSON.stringify({ error: 'API key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiKey = keyData.klaviyo_api_key_hash;
    
    // Decrypt API key if it's encrypted
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    console.log(`Making ${method} request to Klaviyo for user ${user.id}`);

    // Make request to Klaviyo with the API key (never exposed to client)
    const klaviyoResponse = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await klaviyoResponse.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: klaviyoResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Klaviyo proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
