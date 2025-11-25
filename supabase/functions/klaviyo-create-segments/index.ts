import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METRIC_MAPPING: Record<string, string> = {
  'Placed Order': 'placed_order',
  'Active on Site': 'active_on_site',
  'Viewed Product': 'viewed_product',
  'Added to Cart': 'added_to_cart',
  'Started Checkout': 'started_checkout',
  'Opened Email': 'opened_email',
  'Clicked Email': 'clicked_email',
  'Received Email': 'received_email',
};

function findMetricId(segmentId: string, metricMap: Map<string, string>): string | null {
  const metricName = METRIC_MAPPING[segmentId];
  if (!metricName) return null;
  
  for (const [id, name] of metricMap.entries()) {
    if (name.toLowerCase().includes(metricName.replace(/_/g, ' '))) {
      return id;
    }
  }
  return null;
}

function getSegmentDefinition(
  segmentId: string,
  metricMap: Map<string, string>,
  currencySymbol: string,
  settings: any
) {
  const placedOrderId = findMetricId('Placed Order', metricMap);
  const activeOnSiteId = findMetricId('Active on Site', metricMap);
  const viewedProductId = findMetricId('Viewed Product', metricMap);
  const addedToCartId = findMetricId('Added to Cart', metricMap);
  const startedCheckoutId = findMetricId('Started Checkout', metricMap);
  const openedEmailId = findMetricId('Opened Email', metricMap);
  const clickedEmailId = findMetricId('Clicked Email', metricMap);
  const receivedEmailId = findMetricId('Received Email', metricMap);

  const definitions: Record<string, any> = {
    // Core engagement segments with unique IDs
    'engaged-30-days': {
      name: 'Engaged (Last 30 Days)',
      definition: {
        type: 'any',
        groups: [{
          type: 'any',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
            { type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
          ],
        }],
      },
    },
    'repeat-customers': {
      name: 'Repeat Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 2, time_period: 'all_time' }] }],
      },
    },
    'one-time-buyers': {
      name: 'One-Time Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'equals', count: 1, time_period: 'all_time' }] }],
      },
    },
    'vip-customers': {
      name: 'VIP Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 5, time_period: 'all_time' }] }],
      },
    },
    'abandoned-cart': {
      name: 'Abandoned Cart',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [
          { type: 'metric', metric_id: addedToCartId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
          { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
        ]}],
      },
    },
    'lapsed-customers': {
      name: 'Lapsed Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [
          { type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'all_time' },
          { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 180, time_unit: 'days' },
        ]}],
      },
    },
  };

  return definitions[segmentId] || null;
}

async function createKlaviyoSegment(
  apiKey: string,
  segmentId: string,
  metricMap: Map<string, string>,
  currencySymbol: string,
  settings: any
) {
  const definition = getSegmentDefinition(segmentId, metricMap, currencySymbol, settings);
  
  if (!definition) {
    return { error: 'Segment definition not found', status: 'error' };
  }

  const hasAllMetrics = definition.definition.groups.every((group: any) =>
    group.conditions.every((cond: any) => cond.metric_id)
  );

  if (!hasAllMetrics) {
    return { error: 'Required metrics not available', status: 'missing_metrics' };
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/segments/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { type: 'segment', attributes: definition } }),
    });

    if (!response.ok) {
      if (response.status === 409) return { status: 'exists', name: definition.name };
      return { error: 'Failed to create segment', status: 'error' };
    }

    const data = await response.json();
    return { status: 'created', name: definition.name, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error', status: 'error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { apiKey, segmentIds, currencySymbol, settings } = await req.json();

    if (apiKey && isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    if (!apiKey || !segmentIds || !Array.isArray(segmentIds)) {
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or segmentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics/', {
      headers: { 'Authorization': `Klaviyo-API-Key ${apiKey}`, 'revision': '2024-10-15' },
    });

    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch metrics');
    }

    const metricsData = await metricsResponse.json();
    const metricMap = new Map<string, string>();
    metricsData.data.forEach((metric: any) => {
      metricMap.set(metric.id, metric.attributes.name);
    });

    const results = await Promise.all(
      segmentIds.map((id: string) =>
        createKlaviyoSegment(apiKey, id, metricMap, currencySymbol || '$', settings || {})
      )
    );

    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
