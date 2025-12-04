import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Record segment snapshots for a single user on-demand
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { keyId } = await req.json();

    if (!keyId) {
      return new Response(JSON.stringify({ error: 'Missing keyId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the user's Klaviyo key
    const { data: klaviyoKey, error: keyError } = await supabaseClient
      .from('klaviyo_keys')
      .select('id, user_id, klaviyo_api_key_hash')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single();

    if (keyError || !klaviyoKey) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let apiKey = klaviyoKey.klaviyo_api_key_hash;
    
    // Decrypt API key if encrypted
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    // Fetch all segments for this account
    let allSegments: Array<{ id: string; attributes?: { name?: string } }> = [];
    let nextPageUrl: string | null = 'https://a.klaviyo.com/api/segments/?page[size]=100';

    while (nextPageUrl) {
      const segmentsResponse: Response = await fetch(nextPageUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'revision': '2024-10-15',
          'Content-Type': 'application/json',
        },
      });

      if (!segmentsResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch segments from Klaviyo' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const segmentsData: { data?: Array<{ id: string; attributes?: { name?: string } }>; links?: { next?: string } } = await segmentsResponse.json();
      allSegments = [...allSegments, ...(segmentsData.data || [])];
      nextPageUrl = segmentsData.links?.next || null;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Use service role client for inserting data
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch profile counts for each segment (with rate limiting)
    const historicalData: any[] = [];
    let processedCount = 0;
    
    for (const segment of allSegments) {
      try {
        const segmentResponse = await fetch(
          `https://a.klaviyo.com/api/segments/${segment.id}/?additional-fields[segment]=profile_count`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Klaviyo-API-Key ${apiKey}`,
              'revision': '2024-10-15',
              'Content-Type': 'application/json',
            },
          }
        );

        if (segmentResponse.ok) {
          const segmentData = await segmentResponse.json();
          const profileCount = segmentData.data?.attributes?.profile_count ?? 0;
          
          historicalData.push({
            segment_klaviyo_id: segment.id,
            segment_name: segment.attributes?.name || 'Unnamed',
            profile_count: profileCount,
            klaviyo_key_id: klaviyoKey.id,
            user_id: user.id,
          });
          processedCount++;
        } else if (segmentResponse.status === 429) {
          // Rate limited - wait longer
          const retryAfter = segmentResponse.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          // Retry this segment
          continue;
        }
        
        // Rate limiting: 300ms between requests to avoid 429
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (segErr) {
        // Continue on individual segment errors
      }
    }

    // Insert historical data
    if (historicalData.length > 0) {
      const { error: insertError } = await serviceClient
        .from('segment_historical_data')
        .insert(historicalData);

      if (insertError) {
        return new Response(JSON.stringify({ error: 'Failed to save historical data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        segmentsRecorded: historicalData.length,
        totalSegments: allSegments.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
