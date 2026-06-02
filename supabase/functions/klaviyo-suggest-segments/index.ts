import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RequestSchema = z.object({
  apiKey: z.string().min(1).max(500),
  answers: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getUserIdFromJWT(token: string): string | null {
  try {
    const parts = token.replace('Bearer ', '').split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[klaviyo-suggest-segments] Request received');

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = getUserIdFromJWT(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let { apiKey, answers } = validationResult.data;

    if (isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    // Fetch available metrics from Klaviyo (still useful context for the model)
    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics/', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
      },
    });

    if (!metricsResponse.ok) {
      const errorText = await metricsResponse.text();
      throw new Error(`Failed to fetch metrics from Klaviyo: ${metricsResponse.status} - ${errorText}`);
    }

    const metricsData = await metricsResponse.json();
    const availableMetrics = metricsData.data.map((m: any) => ({
      id: m.id,
      name: m.attributes.name,
    }));

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a Klaviyo segmentation expert helping a brand brainstorm customer segment IDEAS. You are NOT creating segments in Klaviyo — you are returning a rich, varied list of related segment concepts the user can read, understand, and recreate themselves.

Available Klaviyo metrics (for grounding only):
${availableMetrics.map((m: any) => `- ${m.name}`).join('\n')}

Given the user's goal, return 6-10 RELATED segment ideas that vary across these axes:
- Time window: last 7 days, last 30 days, last 90 days, all-time
- Frequency: bought once, bought twice, bought 3+ times
- Behavior type: browsed, added to cart, purchased, abandoned checkout
- Adjacency: if a specific product/category is mentioned, include variants for related products/categories, "bought X and Y", "bought X then churned", etc.

Each idea must be DISTINCT and useful — do not return the same idea twice with cosmetic changes.

Respond with EXACTLY this JSON shape:
{
  "segments": [
    {
      "name": "Short clear segment name (no '| Aderai' suffix, no emojis)",
      "description": "2-3 sentences explaining who this targets and why this segment is valuable for marketing.",
      "plain_english_criteria": [
        "Placed Order with Item Name equal to \\"<product name>\\" in the last 7 days",
        "At least 1 order"
      ],
      "definition": {
        "condition_groups": [
          {
            "conditions": [
              {
                "type": "profile-metric",
                "metric_name": "Placed Order",
                "measurement": "count",
                "measurement_filter": { "type": "numeric", "operator": "greater-than", "value": 0 },
                "timeframe_filter": { "type": "date", "operator": "in-the-last", "quantity": 7, "unit": "day" }
              }
            ]
          }
        ]
      }
    }
  ]
}

RULES:
1. Return 6-10 ideas (aim for 8).
2. plain_english_criteria: 1-4 short bullets, written for a non-technical marketer.
3. definition is illustrative reference only — do not invent metric IDs, you may use metric_name.
4. No markdown, no commentary, JSON only.`;

    const userPrompt = `User's goal: ${answers?.businessGoal || 'Create useful customer segments'}

Brand context:
${answers ? Object.entries(answers).filter(([k]) => k !== 'businessGoal').map(([k, v]) => `- ${k}: ${v}`).join('\n') : 'None'}

Return 6-10 related segment ideas as specified.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 8192,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[klaviyo-suggest-segments] AI Gateway error:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'AI returned an incomplete response. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let suggestedSegments;
    try {
      suggestedSegments = JSON.parse(content);
    } catch (parseError) {
      console.error('[klaviyo-suggest-segments] Parse error:', parseError, 'content:', content);
      return new Response(
        JSON.stringify({ error: 'AI returned an unparseable response. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[klaviyo-suggest-segments] Returning', suggestedSegments.segments?.length || 0, 'ideas');

    return new Response(
      JSON.stringify(suggestedSegments),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[klaviyo-suggest-segments] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
