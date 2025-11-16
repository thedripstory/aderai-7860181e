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
    const { customerData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a predictive analytics expert specializing in customer retention and churn prevention.
Analyze customer behavioral data to identify churn risk and recommend proactive interventions.
Focus on actionable insights that can prevent customer loss.`;

    const userPrompt = `Analyze these customers for churn risk:

Data: ${JSON.stringify(customerData)}

For each customer, predict:
1. Churn probability (0-100%)
2. Key risk indicators
3. Recommended intervention
4. Potential revenue at risk
5. Optimal timing for outreach`;

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
            name: "predict_churn",
            description: "Return churn risk predictions for customers",
            parameters: {
              type: "object",
              properties: {
                predictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      customerId: { type: "string" },
                      churnProbability: { type: "number" },
                      riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      riskIndicators: {
                        type: "array",
                        items: { type: "string" }
                      },
                      recommendedAction: { type: "string" },
                      revenueAtRisk: { type: "number" },
                      optimalContactDay: { type: "number" }
                    },
                    required: ["customerId", "churnProbability", "riskLevel", "recommendedAction"]
                  }
                }
              },
              required: ["predictions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_churn" } }
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
