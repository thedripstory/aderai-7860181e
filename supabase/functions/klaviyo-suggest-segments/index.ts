import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
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

const DAILY_LIMIT = 10;

// Decode JWT to get user ID (without full validation - gateway already validates)
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
    // Get user ID from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('[klaviyo-suggest-segments] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = getUserIdFromJWT(authHeader);
    if (!userId) {
      console.error('[klaviyo-suggest-segments] Could not extract user ID from JWT');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[klaviyo-suggest-segments] User ID:', userId);

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit directly from database
    const today = new Date().toISOString().split('T')[0];
    let { data: limits, error: fetchError } = await supabaseAdmin
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[klaviyo-suggest-segments] Error fetching limits:', fetchError);
      throw fetchError;
    }

    // Create limits record if doesn't exist
    if (!limits) {
      const { data: newLimits, error: insertError } = await supabaseAdmin
        .from('usage_limits')
        .insert({
          user_id: userId,
          ai_suggestions_today: 0,
          ai_suggestions_total: 0,
          last_reset_date: today,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[klaviyo-suggest-segments] Error creating limits:', insertError);
        throw insertError;
      }
      limits = newLimits;
    }

    // Reset daily counter if needed
    if (limits.last_reset_date !== today) {
      const { data: updatedLimits, error: updateError } = await supabaseAdmin
        .from('usage_limits')
        .update({
          ai_suggestions_today: 0,
          last_reset_date: today,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('[klaviyo-suggest-segments] Error resetting limits:', updateError);
        throw updateError;
      }
      limits = updatedLimits;
    }

    // Check if user has remaining suggestions
    if (limits.ai_suggestions_today >= DAILY_LIMIT) {
      console.log('[klaviyo-suggest-segments] Rate limit exceeded for user:', userId);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'You have reached your daily limit for AI suggestions. Please try again tomorrow.',
          limit: DAILY_LIMIT,
          remaining: 0,
          resetTime: 'midnight UTC'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Use Lovable AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[klaviyo-suggest-segments] LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }
    console.log('[klaviyo-suggest-segments] Using Lovable AI Gateway...');

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

    const userPrompt = `User's goal: ${answers?.businessGoal || 'Create useful customer segments'}

Brand Information:
${answers ? Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n') : 'No additional information provided'}

Based on this information and the available Klaviyo metrics, suggest segments that will help this brand achieve their goals.`;

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

    console.log('[klaviyo-suggest-segments] AI response received successfully');
    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let suggestedSegments;
    try {
      suggestedSegments = JSON.parse(content);
    } catch (parseError) {
      console.error('[klaviyo-suggest-segments] Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }
    
    console.log('[klaviyo-suggest-segments] Parsed', suggestedSegments.segments?.length || 0, 'suggested segments');

    // Increment AI usage counter after successful operation
    const { error: incrementError } = await supabaseAdmin
      .from('usage_limits')
      .update({
        ai_suggestions_today: limits.ai_suggestions_today + 1,
        ai_suggestions_total: limits.ai_suggestions_total + 1,
      })
      .eq('user_id', userId);

    if (incrementError) {
      console.error('[klaviyo-suggest-segments] Failed to increment usage:', incrementError);
    }

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
