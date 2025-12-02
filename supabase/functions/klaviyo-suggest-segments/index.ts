import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RequestSchema = z.object({
  apiKey: z.string().min(1).max(500),
  answers: z.record(z.string()).optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[klaviyo-suggest-segments] Request received');

  try {
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('[klaviyo-suggest-segments] Validation failed:', validationResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let { apiKey, answers } = validationResult.data;
    console.log('[klaviyo-suggest-segments] Parsed request body, has apiKey:', !!apiKey, ', has answers:', !!answers);

    // Decrypt API key if encrypted
    if (isEncrypted(apiKey)) {
      console.log('[klaviyo-suggest-segments] API key is encrypted, decrypting...');
      try {
        apiKey = await decryptApiKey(apiKey);
        console.log('[klaviyo-suggest-segments] API key decrypted successfully');
      } catch (decryptError) {
        console.error('[klaviyo-suggest-segments] Decryption failed:', decryptError);
        throw new Error(`Failed to decrypt API key: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`);
      }
    } else {
      console.log('[klaviyo-suggest-segments] API key is plaintext');
    }

    // Fetch available metrics from Klaviyo
    console.log('[klaviyo-suggest-segments] Fetching metrics from Klaviyo...');
    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics/', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
      },
    });

    if (!metricsResponse.ok) {
      const errorText = await metricsResponse.text();
      console.error('[klaviyo-suggest-segments] Klaviyo metrics API error:', metricsResponse.status, errorText);
      throw new Error(`Failed to fetch metrics from Klaviyo: ${metricsResponse.status} - ${errorText}`);
    }

    const metricsData = await metricsResponse.json();
    const availableMetrics = metricsData.data.map((m: any) => ({
      id: m.id,
      name: m.attributes.name,
    }));
    console.log('[klaviyo-suggest-segments] Found', availableMetrics.length, 'metrics');

    // Call OpenAI to suggest segments
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('[klaviyo-suggest-segments] OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY not configured. Please add this secret in your Supabase Edge Functions settings.');
    }
    console.log('[klaviyo-suggest-segments] OpenAI API key found, calling OpenAI...');

    const systemPrompt = `You are a Klaviyo segmentation expert. Based on the user's brand information and available Klaviyo metrics, suggest 3-5 highly relevant customer segments.

Available Klaviyo metrics:
${availableMetrics.map((m: any) => `- ${m.name} (ID: ${m.id})`).join('\n')}

CRITICAL: You must use the EXACT Klaviyo API format below. Any deviation will cause errors.

For each segment, respond with this EXACT JSON structure:
{
  "segments": [
    {
      "name": "Segment Name | Aderai",
      "description": "Why this segment matters",
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
  ]
}

RULES:
1. metric_id must be an EXACT ID from the available metrics list above
2. measurement can be: "count" or "sum"
3. operator can be: "greater-than", "less-than", "equals", "greater-or-equal", "less-or-equal"
4. For time-based conditions, use timeframe_filter with type: "date" and operator: "in-the-last" (requires quantity and unit)
5. For "over all time" conditions, set timeframe_filter to null
6. unit can be: "day", "week", "month"
7. For multiple conditions that must ALL be true, put them in the same conditions array
8. For conditions where ANY can be true (OR logic), use separate condition_groups
9. Always append " | Aderai" to segment names`;

    const userPrompt = `Brand Information:
${answers ? Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n') : 'No additional information provided'}

Based on this information and the available Klaviyo metrics, suggest segments that will help this brand achieve their goals.`;

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
      console.error('[klaviyo-suggest-segments] OpenAI API error:', aiResponse.status, errorText);
      
      // Parse error for more specific message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.code === 'insufficient_quota') {
          throw new Error('OpenAI API quota exceeded. Please check your OpenAI billing and add credits.');
        }
        throw new Error(`OpenAI API error: ${errorJson.error?.message || errorText}`);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message.includes('OpenAI')) {
          throw parseError;
        }
        throw new Error(`OpenAI API error: ${aiResponse.status} - ${errorText}`);
      }
    }

    console.log('[klaviyo-suggest-segments] OpenAI response received successfully');
    const aiData = await aiResponse.json();
    const suggestedSegments = JSON.parse(aiData.choices[0].message.content);
    console.log('[klaviyo-suggest-segments] Parsed', suggestedSegments.segments?.length || 0, 'suggested segments');

    return new Response(
      JSON.stringify(suggestedSegments),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[klaviyo-suggest-segments] Error:', error);
    console.error('[klaviyo-suggest-segments] Stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
