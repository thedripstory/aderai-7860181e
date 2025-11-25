import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, answers } = await req.json();

    if (!apiKey || !answers) {
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or answers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Call OpenAI to suggest segments
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

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
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI suggestions');
    }

    const aiData = await aiResponse.json();
    const suggestedSegments = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify(suggestedSegments),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in klaviyo-suggest-segments:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
