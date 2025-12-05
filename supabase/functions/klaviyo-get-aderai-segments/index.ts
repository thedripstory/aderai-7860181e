import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { klaviyoKeyId } = await req.json();
    
    if (!klaviyoKeyId) {
      throw new Error('klaviyoKeyId is required');
    }

    console.log('[klaviyo-get-aderai-segments] Fetching segments for key:', klaviyoKeyId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the Klaviyo API key
    const { data: keyData, error: keyError } = await supabase
      .from('klaviyo_keys')
      .select('klaviyo_api_key_hash')
      .eq('id', klaviyoKeyId)
      .single();

    if (keyError || !keyData) {
      console.error('[klaviyo-get-aderai-segments] Key not found:', keyError);
      throw new Error('Klaviyo key not found');
    }

    // Decrypt the API key if encrypted
    let apiKey = keyData.klaviyo_api_key_hash;
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    const segments: any[] = [];
    let nextCursor: string | null = null;

    // Fetch all Aderai segments (those with "| Aderai" in the name)
    do {
      const url = new URL('https://a.klaviyo.com/api/segments/');
      url.searchParams.set('filter', 'contains(name,"| Aderai")');
      url.searchParams.set('fields[segment]', 'name,created,updated');
      if (nextCursor) url.searchParams.set('page[cursor]', nextCursor);

      console.log('[klaviyo-get-aderai-segments] Fetching from:', url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Accept': 'application/json',
          'revision': '2024-10-15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[klaviyo-get-aderai-segments] API error:', response.status, errorText);
        throw new Error(`Failed to fetch segments: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data) {
        segments.push(...data.data.map((seg: any) => ({
          id: seg.id,
          name: seg.attributes?.name,
          created: seg.attributes?.created,
          updated: seg.attributes?.updated
        })));
      }

      // Handle pagination
      nextCursor = data.links?.next 
        ? new URL(data.links.next).searchParams.get('page[cursor]')
        : null;
    } while (nextCursor);

    console.log('[klaviyo-get-aderai-segments] Found', segments.length, 'Aderai segments');

    return new Response(
      JSON.stringify({ 
        segments, 
        count: segments.length,
        fetchedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[klaviyo-get-aderai-segments] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
