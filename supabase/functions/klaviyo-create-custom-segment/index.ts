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
    const { apiKey, segmentName, segmentDescription } = await req.json();

    if (!apiKey || !segmentName) {
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or segmentName' }),
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

    // Call OpenAI to create segment definition
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are a Klaviyo segmentation expert. Create a detailed segment definition for Klaviyo based on the segment name and description provided.

Available Klaviyo metrics:
${availableMetrics.map((m: any) => `- ${m.name} (ID: ${m.id})`).join('\n')}

Create a segment definition using the Klaviyo API format with proper conditions and operators. Use only metric IDs from the list above.

Format your response as JSON:
{
  "name": "Segment Name",
  "definition": {
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
}`;

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
