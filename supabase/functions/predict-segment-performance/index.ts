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
    const { segmentData, historicalData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a data analyst specializing in email marketing performance prediction. 
Analyze segment data and predict future performance based on historical trends, engagement patterns, and industry benchmarks.
Return actionable insights with confidence scores.`;

    const userPrompt = `Analyze this segment and predict its performance:

Segment: ${segmentData.name}
Current Size: ${segmentData.size}
Engagement Rate: ${segmentData.engagement}%
Historical Data: ${JSON.stringify(historicalData)}

Provide:
1. Performance prediction (next 30 days)
2. Revenue projection
3. Engagement forecast
4. Risk factors
5. Optimization opportunities`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_performance",
            description: "Return segment performance predictions",
            parameters: {
              type: "object",
              properties: {
                sizeProjection: { type: "number" },
                engagementProjection: { type: "number" },
                revenueProjection: { type: "number" },
                confidenceScore: { type: "number" },
                riskFactors: {
                  type: "array",
                  items: { type: "string" }
                },
                opportunities: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["sizeProjection", "engagementProjection", "revenueProjection", "confidenceScore"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_performance" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const predictions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(predictions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
