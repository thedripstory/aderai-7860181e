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

    const systemPrompt = `You are a Klaviyo segmentation expert. Based on the user's brand information and available Klaviyo metrics, suggest 3-5 highly relevant customer segments that will help them achieve their goals.

Available Klaviyo metrics:
${availableMetrics.map((m: any) => `- ${m.name} (ID: ${m.id})`).join('\n')}

For each segment, provide:
1. A clear, descriptive name
2. Brief explanation of why this segment is valuable
3. The specific Klaviyo conditions to create it (using metric IDs from the list above)

Format your response as a JSON array of segment objects with this structure:
{
  "segments": [
    {
      "name": "Segment Name",
      "description": "Why this segment matters",
      "conditions": {
        "type": "all|any",
        "groups": [
          {
            "type": "all|any",
            "conditions": [
              {
                "metric_id": "metric_id_here",
                "operator": "greater-than|less-than|equals|etc",
                "value": "value_here"
              }
            ]
          }
        ]
      }
    }
  ]
}`;

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
