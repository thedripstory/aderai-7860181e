import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Delete API: Burst 3/s, Steady 60/min - much more generous than create
const DELETE_DELAY_MS = 1000; // 1 second between deletes to stay safe
const MAX_DELETES_PER_RUN = 50; // Process in batches

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { klaviyoKeyId, dryRun = false } = await req.json();
    
    console.log(`[klaviyo-delete-aderai-segments] Starting ${dryRun ? 'dry run' : 'deletion'} for key: ${klaviyoKeyId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get API key
    const { data: keyData, error: keyError } = await supabase
      .from('klaviyo_keys')
      .select('klaviyo_api_key_hash')
      .eq('id', klaviyoKeyId)
      .single();

    if (keyError || !keyData) {
      throw new Error('Klaviyo key not found');
    }

    let apiKey = keyData.klaviyo_api_key_hash;
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    // Fetch all Aderai segments
    const segments: { id: string; name: string }[] = [];
    let nextCursor: string | null = null;

    do {
      const url = new URL('https://a.klaviyo.com/api/segments/');
      url.searchParams.set('filter', 'contains(name,"| Aderai")');
      url.searchParams.set('fields[segment]', 'name');
      if (nextCursor) url.searchParams.set('page[cursor]', nextCursor);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Accept': 'application/json',
          'revision': '2024-10-15'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[klaviyo-delete-aderai-segments] Failed to fetch segments:', errorText);
        throw new Error('Failed to fetch segments from Klaviyo');
      }

      const data = await response.json();
      
      if (data.data) {
        segments.push(...data.data.map((s: any) => ({
          id: s.id,
          name: s.attributes?.name
        })));
      }

      nextCursor = data.links?.next 
        ? new URL(data.links.next).searchParams.get('page[cursor]')
        : null;
    } while (nextCursor);

    console.log(`[klaviyo-delete-aderai-segments] Found ${segments.length} Aderai segments`);

    // Dry run - just return what would be deleted
    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          segmentsToDelete: segments,
          count: segments.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Actual deletion - process in batches
    const results: { id: string; name: string; status: string; error?: string }[] = [];
    const toDelete = segments.slice(0, MAX_DELETES_PER_RUN);

    for (let i = 0; i < toDelete.length; i++) {
      const segment = toDelete[i];
      
      try {
        const deleteResponse = await fetch(
          `https://a.klaviyo.com/api/segments/${segment.id}/`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Klaviyo-API-Key ${apiKey}`,
              'revision': '2024-10-15'
            }
          }
        );

        if (deleteResponse.ok || deleteResponse.status === 204) {
          console.log(`[klaviyo-delete-aderai-segments] Deleted: ${segment.name}`);
          results.push({
            id: segment.id,
            name: segment.name,
            status: 'deleted'
          });
        } else {
          const errorText = await deleteResponse.text();
          console.error(`[klaviyo-delete-aderai-segments] Failed to delete ${segment.name}:`, errorText);
          results.push({
            id: segment.id,
            name: segment.name,
            status: 'error',
            error: errorText
          });
        }
      } catch (error) {
        console.error(`[klaviyo-delete-aderai-segments] Error deleting ${segment.name}:`, error);
        results.push({
          id: segment.id,
          name: segment.name,
          status: 'error',
          error: String(error)
        });
      }

      // Rate limit delay
      if (i < toDelete.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELETE_DELAY_MS));
      }
    }

    const deleted = results.filter(r => r.status === 'deleted').length;
    const errors = results.filter(r => r.status === 'error').length;
    const remaining = segments.length - toDelete.length;

    console.log(`[klaviyo-delete-aderai-segments] Completed batch: ${deleted} deleted, ${errors} errors, ${remaining} remaining`);

    return new Response(
      JSON.stringify({
        results,
        summary: {
          deleted,
          errors,
          remaining,
          totalFound: segments.length
        },
        hasMore: remaining > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[klaviyo-delete-aderai-segments] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
