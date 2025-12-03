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

    // Check if specific keyId was provided (for single-user fetch)
    let specificKeyId: string | null = null;
    try {
      const body = await req.json();
      specificKeyId = body?.keyId || null;
    } catch {
      // No body or invalid JSON - process all keys (for cron job)
    }

    console.log('Starting segment snapshot recording...', specificKeyId ? `for key ${specificKeyId}` : 'for all keys');

    // Get Klaviyo keys - either specific one or all active
    let keysQuery = supabaseClient
      .from('klaviyo_keys')
      .select('id, user_id, klaviyo_api_key_hash')
      .eq('is_active', true);
    
    if (specificKeyId) {
      keysQuery = keysQuery.eq('id', specificKeyId);
    }

    const { data: klaviyoKeys, error: keysError } = await keysQuery;

    if (keysError) {
      console.error('Error fetching Klaviyo keys:', keysError);
      throw keysError;
    }

    console.log(`Processing ${klaviyoKeys?.length || 0} Klaviyo accounts`);

    let totalSegmentsRecorded = 0;
    let totalAccountsProcessed = 0;

    for (const key of klaviyoKeys || []) {
      try {
        let apiKey = key.klaviyo_api_key_hash;
        
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
            console.error(`Klaviyo API error for key ${key.id}: ${segmentsResponse.status}`);
            break;
          }

          const segmentsData: { data?: Array<{ id: string; attributes?: { name?: string } }>; links?: { next?: string } } = await segmentsResponse.json();
          allSegments = [...allSegments, ...(segmentsData.data || [])];
          nextPageUrl = segmentsData.links?.next || null;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`Fetched ${allSegments.length} segments for key ${key.id}`);

        // Fetch profile counts for each segment (with rate limiting)
        const historicalData: any[] = [];
        
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
              
              // Record all segments including those with 0 profiles
              historicalData.push({
                segment_klaviyo_id: segment.id,
                segment_name: segment.attributes?.name || 'Unnamed',
                profile_count: profileCount,
                klaviyo_key_id: key.id,
                user_id: key.user_id,
              });
            }
            
            // Rate limiting: 250ms between requests
            await new Promise(resolve => setTimeout(resolve, 250));
          } catch (segErr) {
            console.error(`Error fetching segment ${segment.id}:`, segErr);
          }
        }

        // Insert historical data
        if (historicalData.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('segment_historical_data')
            .insert(historicalData);

          if (insertError) {
            console.error(`Error inserting historical data for key ${key.id}:`, insertError);
          } else {
            totalSegmentsRecorded += historicalData.length;
            console.log(`Recorded ${historicalData.length} segments for key ${key.id}`);
          }
        }

        totalAccountsProcessed++;
      } catch (accountError) {
        console.error(`Error processing account ${key.id}:`, accountError);
      }
    }

    console.log(`Daily snapshot complete: ${totalSegmentsRecorded} segments across ${totalAccountsProcessed} accounts`);

    return new Response(
      JSON.stringify({
        success: true,
        accountsProcessed: totalAccountsProcessed,
        segmentsRecorded: totalSegmentsRecorded,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Segment snapshot error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
