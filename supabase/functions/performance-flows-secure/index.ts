import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Extract JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { keyId } = await req.json();

    if (!keyId) {
      return new Response(JSON.stringify({ error: "Missing keyId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns this API key
    const { data: apiKeyData, error: keyError } = await supabaseClient
      .from('klaviyo_keys')
      .select('klaviyo_api_key_hash')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let apiKey = apiKeyData.klaviyo_api_key_hash;
    
    // Decrypt API key if it's encrypted
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    const headers = {
      "Authorization": `Klaviyo-API-Key ${apiKey}`,
      "revision": "2024-10-15",
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    // Fetch flows
    const flowsResponse = await fetch("https://a.klaviyo.com/api/flows/", {
      method: "GET",
      headers,
    });
    const flowsData = await flowsResponse.json();

    if (flowsData.errors) {
      return new Response(JSON.stringify(flowsData), {
        status: flowsResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch flow values (metrics) for live flows
    const flowsWithMetrics = await Promise.all(
      (flowsData.data || []).map(async (flow: any) => {
        const status = flow.attributes?.status?.toLowerCase();
        
        // Only fetch metrics for live flows (they have activity)
        if (status === 'live' || status === 'manual') {
          try {
            // Fetch flow values using the reporting endpoint
            const valuesResponse = await fetch(
              `https://a.klaviyo.com/api/flow-values-reports/`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  data: {
                    type: "flow-values-report",
                    attributes: {
                      statistics: [
                        "recipients",
                        "opens",
                        "open_rate",
                        "clicks",
                        "click_rate",
                        "bounces",
                        "bounce_rate",
                        "unsubscribes",
                        "unsubscribe_rate",
                        "revenue",
                        "unique_opens",
                        "unique_clicks"
                      ],
                      timeframe: {
                        key: "last_365_days"
                      },
                      conversion_metric_id: "Placed Order"
                    },
                    relationships: {
                      flows: {
                        data: [{ type: "flow", id: flow.id }]
                      }
                    }
                  }
                })
              }
            );

            if (valuesResponse.ok) {
              const valuesData = await valuesResponse.json();
              const results = valuesData.data?.attributes?.results?.[0];
              
              return {
                ...flow,
                metrics: {
                  recipients: results?.statistics?.recipients || 0,
                  opens: results?.statistics?.opens || 0,
                  unique_opens: results?.statistics?.unique_opens || 0,
                  open_rate: results?.statistics?.open_rate || 0,
                  clicks: results?.statistics?.clicks || 0,
                  unique_clicks: results?.statistics?.unique_clicks || 0,
                  click_rate: results?.statistics?.click_rate || 0,
                  bounces: results?.statistics?.bounces || 0,
                  bounce_rate: results?.statistics?.bounce_rate || 0,
                  unsubscribes: results?.statistics?.unsubscribes || 0,
                  unsubscribe_rate: results?.statistics?.unsubscribe_rate || 0,
                  revenue: results?.statistics?.revenue || 0,
                }
              };
            }
          } catch (err) {
            console.error(`Failed to fetch metrics for flow ${flow.id}:`, err);
          }
        }
        
        return { ...flow, metrics: null };
      })
    );

    return new Response(JSON.stringify({ data: flowsWithMetrics }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Flows error:", err);
    return new Response(
      JSON.stringify({ error: "Operation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
