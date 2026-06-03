import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
import { requireActiveSubscription } from "../_shared/checkSubscription.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RequestSchema = z.object({
  apiKey: z.string().min(1).max(500),
  segmentName: z.string().min(1).max(200),
  segmentDescription: z.string().max(1000).optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common English words and segment-vocab tokens to ignore when looking for product qualifiers
const STOPWORDS = new Set([
  'the','and','for','with','who','have','has','had','our','your','their','this','that','these','those',
  'aderai','klaviyo','segment','customers','customer','people','users','user','buyers','purchasers',
  'recent','recently','active','engaged','new','old','top','vip','high','low','past','last','days','day',
  'within','from','of','in','to','at','on','by','an','a','is','are','was','were','be','been','being',
  'product','products','order','orders','ordered','placed','bought','purchase','purchased','purchasing',
  'subscribers','subscriber','email','sms','list','lists','spent','spending','value','lifetime','aov',
  'over','under','more','less','than','greater','equal','equals','months','month','weeks','week','years','year',
  'all','any','one','two','three','first','second','third','identifies','identify','crucial','follow','up',
  'communications','upsells','crosssells','cross','sells','sell','gathering','early','feedback','specific',
  'goal','goals','goal-','tailored','needs','custom','segments','create','created','creating','generate',
]);

function extractProductQualifier(name: string, description: string): string | null {
  // Look for capitalized standalone tokens in the name that also appear in the description
  const nameTokens = name.replace(/\|.*/, '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const descLower = description.toLowerCase();
  for (const tok of nameTokens) {
    if (tok.length < 3) continue;
    if (STOPWORDS.has(tok.toLowerCase())) continue;
    // Must be capitalized (proper noun) and appear in description
    if (tok[0] === tok[0].toUpperCase() && descLower.includes(tok.toLowerCase())) {
      return tok;
    }
  }
  return null;
}

function definitionHasMetricFilters(def: any): boolean {
  try {
    for (const g of def?.condition_groups || []) {
      for (const c of g?.conditions || []) {
        if (Array.isArray(c?.metric_filters) && c.metric_filters.length > 0) return true;
      }
    }
  } catch (_) {}
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const gate = await requireActiveSubscription(req);
  if (!gate.ok) return gate.response;


  try {
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.issues
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let { apiKey, segmentName, segmentDescription } = validationResult.data;

    // Decrypt API key if encrypted
    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    // Fetch available metrics from Klaviyo
    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics/', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
      },
    });

    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch metrics from Klaviyo');
    }

    const metricsData = await metricsResponse.json();
    const availableMetrics = metricsData.data.map((m: any) => ({
      id: m.id,
      name: m.attributes.name,
    }));

    // Detect a product/qualifier hint up front so we can both prompt and validate against it
    const productHint = extractProductQualifier(segmentName, segmentDescription || '');

    // Call OpenAI to create segment definition
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are a Klaviyo segmentation expert. Create a segment definition based on the name and description provided.

Available Klaviyo metrics:
${availableMetrics.map((m: any) => `- ${m.name} (ID: ${m.id})`).join('\n')}

CRITICAL: Use this EXACT Klaviyo API format:

{
  "name": "Segment Name | Aderai",
  "definition": {
    "condition_groups": [
      {
        "conditions": [
          {
            "type": "profile-metric",
            "metric_id": "USE_EXACT_METRIC_ID_FROM_LIST",
            "measurement": "count",
            "measurement_filter": {
              "type": "numeric",
              "operator": "greater-than",
              "value": 0
            },
            "timeframe_filter": {
              "type": "date",
              "operator": "in-the-last",
              "quantity": 30,
              "unit": "day"
            },
            "metric_filters": [
              {
                "property": "Item Name",
                "filter": { "type": "string", "operator": "equals", "value": "PRODUCT_NAME" }
              }
            ]
          }
        ]
      }
    ]
  }
}

RULES:
1. metric_id must be an EXACT ID from the metrics list
2. measurement: "count" or "sum"
3. operator: "greater-than", "less-than", "equals", "greater-or-equal", "less-or-equal"
4. For time-based conditions, use timeframe_filter with type: "date" and operator: "in-the-last" (requires quantity/unit)
5. For "over all time" conditions, set timeframe_filter to null
6. Always append " | Aderai" to the segment name
7. metric_filters: use this to qualify an event by a property value. Always include metric_filters when the segment is scoped to a specific product, collection, category, SKU, coupon code, discount, or any named entity. NEVER drop that qualifier silently. Common properties on Placed Order / Ordered Product: "Item Name" (product name), "Item SKU", "Item Categories", "Item Brand", "Discount Codes". Filter shapes:
   - String equals: { "property": "Item Name", "filter": { "type": "string", "operator": "equals", "value": "<NAME>" } }
   - String set: { "property": "Discount Codes", "filter": { "type": "string", "operator": "is-set" } }
   - String not set: { "property": "Discount Codes", "filter": { "type": "string", "operator": "is-not-set" } }
8. If the segment references a specific product (e.g. "Recent Purchasers of <product name>"), you MUST add a metric_filters entry with property "Item Name" and value equal to the exact product name from the segment name/description.
9. Return ONLY valid JSON, no markdown or explanations`;

    const userPrompt = `Create a segment with:
Name: ${segmentName}
Description: ${segmentDescription || 'No description provided'}${productHint ? `\n\nDETECTED PRODUCT/QUALIFIER: "${productHint}" — you MUST include a metric_filters entry filtering the relevant event by "Item Name" equals "${productHint}".` : ''}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI segment definition');
    }

    const aiData = await aiResponse.json();
    const segmentDef = JSON.parse(aiData.choices[0].message.content);

    // Sanity check: if we detected a product qualifier but the AI didn't include any metric_filters,
    // refuse to create a too-broad segment.
    if (productHint && !definitionHasMetricFilters(segmentDef.definition)) {
      console.error('Segment missing product qualifier filter', { productHint, segmentDef });
      return new Response(
        JSON.stringify({
          error: `Could not qualify segment by "${productHint}". Please try regenerating, or create manually in Klaviyo.`,
          status: 'qualifier_missing',
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the segment in Klaviyo
    const createResponse = await fetch('https://a.klaviyo.com/api/segments/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'segment',
          attributes: {
            name: segmentDef.name,
            definition: segmentDef.definition,
          },
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Klaviyo create segment error:', errorText);

      if (createResponse.status === 409) {
        return new Response(
          JSON.stringify({ error: 'Segment already exists', status: 'exists' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('Failed to create segment in Klaviyo');
    }

    const createdSegment = await createResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        segment: createdSegment,
        status: 'created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in klaviyo-create-custom-segment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
