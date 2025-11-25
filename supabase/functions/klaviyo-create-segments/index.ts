import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Metric mapping for common segment types
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

// Helper to find metric ID from Klaviyo metrics
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

// Segment definitions
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

  const definitions: Record<string, any> = {
    'vip-customers': {
      name: `VIP Customers (${currencySymbol}${settings.highValue}+)`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric_property',
            metric_id: placedOrderId,
            operator: 'greater-than',
            property: 'value',
            value: settings.highValue,
            time_period: 'all_time',
          }],
        }],
      },
    },
    'high-value-customers': {
      name: `High-Value Customers (${currencySymbol}${settings.mediumValue}-${currencySymbol}${settings.highValue})`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric_property',
              metric_id: placedOrderId,
              operator: 'greater-or-equal',
              property: 'value',
              value: settings.mediumValue,
              time_period: 'all_time',
            },
            {
              type: 'metric_property',
              metric_id: placedOrderId,
              operator: 'less-than',
              property: 'value',
              value: settings.highValue,
              time_period: 'all_time',
            },
          ],
        }],
      },
    },
    'medium-value-customers': {
      name: `Medium-Value Customers (${currencySymbol}${settings.lowValue}-${currencySymbol}${settings.mediumValue})`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric_property',
              metric_id: placedOrderId,
              operator: 'greater-or-equal',
              property: 'value',
              value: settings.lowValue,
              time_period: 'all_time',
            },
            {
              type: 'metric_property',
              metric_id: placedOrderId,
              operator: 'less-than',
              property: 'value',
              value: settings.mediumValue,
              time_period: 'all_time',
            },
          ],
        }],
      },
    },
    'at-risk-customers': {
      name: `At-Risk Customers (No Purchase in ${settings.atRiskDays} Days)`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-performed',
              time_period: 'all_time',
            },
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-not-performed',
              time_period: 'within_last',
              time_value: settings.atRiskDays,
              time_unit: 'days',
            },
          ],
        }],
      },
    },
    'lost-customers': {
      name: `Lost Customers (No Purchase in ${settings.lostDays} Days)`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-performed',
              time_period: 'all_time',
            },
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-not-performed',
              time_period: 'within_last',
              time_value: settings.lostDays,
              time_unit: 'days',
            },
          ],
        }],
      },
    },
    'recent-customers': {
      name: `Recent Customers (Purchased in Last ${settings.recentDays} Days)`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: placedOrderId,
            operator: 'has-performed',
            time_period: 'within_last',
            time_value: settings.recentDays,
            time_unit: 'days',
          }],
        }],
      },
    },
    'active-customers': {
      name: `Active Customers (Purchased in Last ${settings.activeDays} Days)`,
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: placedOrderId,
            operator: 'has-performed',
            time_period: 'within_last',
            time_value: settings.activeDays,
            time_unit: 'days',
          }],
        }],
      },
    },
    'repeat-customers': {
      name: 'Repeat Customers (2+ Orders)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: placedOrderId,
            operator: 'greater-or-equal',
            count: 2,
            time_period: 'all_time',
          }],
        }],
      },
    },
    'loyal-customers': {
      name: 'Loyal Customers (5+ Orders)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: placedOrderId,
            operator: 'greater-or-equal',
            count: 5,
            time_period: 'all_time',
          }],
        }],
      },
    },
    'engaged-subscribers': {
      name: 'Engaged Email Subscribers (Opened in 30 Days)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: openedEmailId,
            operator: 'has-performed',
            time_period: 'within_last',
            time_value: 30,
            time_unit: 'days',
          }],
        }],
      },
    },
    'highly-engaged': {
      name: 'Highly Engaged Subscribers (Clicked in 30 Days)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [{
            type: 'metric',
            metric_id: clickedEmailId,
            operator: 'has-performed',
            time_period: 'within_last',
            time_value: 30,
            time_unit: 'days',
          }],
        }],
      },
    },
    'cart-abandoners': {
      name: 'Cart Abandoners (Last 7 Days)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric',
              metric_id: addedToCartId,
              operator: 'has-performed',
              time_period: 'within_last',
              time_value: 7,
              time_unit: 'days',
            },
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-not-performed',
              time_period: 'within_last',
              time_value: 7,
              time_unit: 'days',
            },
          ],
        }],
      },
    },
    'checkout-abandoners': {
      name: 'Checkout Abandoners (Last 7 Days)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric',
              metric_id: startedCheckoutId,
              operator: 'has-performed',
              time_period: 'within_last',
              time_value: 7,
              time_unit: 'days',
            },
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-not-performed',
              time_period: 'within_last',
              time_value: 7,
              time_unit: 'days',
            },
          ],
        }],
      },
    },
    'browsers': {
      name: 'Active Browsers (No Purchase)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            {
              type: 'metric',
              metric_id: viewedProductId,
              operator: 'has-performed',
              time_period: 'within_last',
              time_value: 30,
              time_unit: 'days',
            },
            {
              type: 'metric',
              metric_id: placedOrderId,
              operator: 'has-not-performed',
              time_period: 'all_time',
            },
          ],
        }],
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

  // Check if all required metrics exist
  const hasAllMetrics = definition.definition.groups.every((group: any) =>
    group.conditions.every((cond: any) => cond.metric_id)
  );

  if (!hasAllMetrics) {
    return { 
      error: 'Required metrics not available in your Klaviyo account', 
      status: 'missing_metrics' 
    };
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/segments/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'segment',
          attributes: definition,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        return { status: 'exists', name: definition.name };
      }
      const errorText = await response.text();
      console.error('Klaviyo API error:', errorText);
      return { error: 'Failed to create segment', status: 'error' };
    }

    const data = await response.json();
    return { status: 'created', name: definition.name, data };
  } catch (error) {
    console.error('Error creating segment:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error', status: 'error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { apiKey, segmentIds, currencySymbol, settings } = await req.json();

    // Decrypt API key if it's encrypted
    if (apiKey && isEncrypted(apiKey)) {
      apiKey = await decryptApiKey(apiKey);
    }

    if (!apiKey || !segmentIds || !Array.isArray(segmentIds)) {
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or segmentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch available metrics
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
    const metricMap = new Map<string, string>();
    
    metricsData.data.forEach((metric: any) => {
      metricMap.set(metric.id, metric.attributes.name);
    });

    // Create segments
    const results = await Promise.all(
      segmentIds.map((id: string) =>
        createKlaviyoSegment(apiKey, id, metricMap, currencySymbol || '$', settings || {})
      )
    );

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in klaviyo-create-segments:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
