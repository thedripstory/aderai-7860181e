import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
            }
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
7. Return ONLY valid JSON, no markdown or explanations`;

    const userPrompt = `Create a segment with:
Name: ${segmentName}
Description: ${segmentDescription || 'No description provided'}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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
