import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Aderai branding suffix
const ADERAI_SUFFIX = ' | Aderai';

// ==========================================
// STEP 1: DETECT AVAILABLE KLAVIYO METRICS
// ==========================================

async function detectAvailableMetrics(apiKey: string): Promise<Record<string, string>> {
  const response = await fetch('https://a.klaviyo.com/api/metrics/', {
    method: 'GET',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Accept': 'application/json',
      'revision': '2024-10-15'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch metrics from Klaviyo');
  }

  const data = await response.json();
  const metricMap: Record<string, string> = {};
  
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((metric: any) => {
      const name = metric.attributes?.name;
      const id = metric.id;
      if (name && id) {
        metricMap[name] = id;
      }
    });
  }

  console.log(`[klaviyo-create-segments] Found ${Object.keys(metricMap).length} metrics:`, JSON.stringify(Object.keys(metricMap)));
  return metricMap;
}

// ==========================================
// STEP 2: UNIVERSAL METRIC MAPPINGS
// ==========================================

function findMetricId(metricType: string, metricMap: Record<string, string>): string | null {
  const metricMappings: Record<string, string[]> = {
    'placed-order': ['Placed Order', 'Ordered Product', 'Order Placed', 'Checkout', 'Purchase'],
    'started-checkout': ['Started Checkout', 'Checkout Started', 'Initiated Checkout', 'Begin Checkout'],
    'viewed-product': ['Viewed Product', 'Product Viewed', 'Product View'],
    'active-on-site': ['Active on Site', 'Site Activity', 'Page View'],
    'opened-email': ['Opened Email', 'Email Opened'],
    'clicked-email': ['Clicked Email', 'Email Clicked'],
    'subscribed': ['Subscribed to List', 'Subscribe', 'List Subscribe'],
    'added-to-cart': ['Added to Cart', 'Add to Cart'],
  };

  const possibleNames = metricMappings[metricType] || [];
  
  for (const name of possibleNames) {
    if (metricMap[name]) {
      return metricMap[name];
    }
  }
  
  return null;
}

// ==========================================
// HELPER: Build metric condition (Klaviyo format)
// ==========================================

function buildMetricCondition(
  metricId: string,
  measurement: 'count' | 'sum' = 'count',
  operator: string,
  value: number,
  timeframe: { type: 'in-the-last' | 'over-all-time' | 'after', quantity?: number, unit?: string, date?: string }
): any {
  const condition: any = {
    type: 'profile-metric',
    metric_id: metricId,
    measurement: measurement,
    measurement_filter: {
      type: 'numeric',
      operator: operator,
      value: value
    }
  };

  if (timeframe.type === 'over-all-time') {
    condition.timeframe_filter = {
      type: 'preset',
      preset: 'over-all-time'
    };
  } else if (timeframe.type === 'in-the-last') {
    condition.timeframe_filter = {
      type: 'preset',
      preset: 'in-the-last',
      quantity: timeframe.quantity,
      unit: timeframe.unit || 'day'
    };
  } else if (timeframe.type === 'after' && timeframe.date) {
    condition.timeframe_filter = {
      type: 'date',
      operator: 'after',
      date: timeframe.date
    };
  }

  return condition;
}

// ==========================================
// STEP 3: SEGMENT DEFINITIONS (Correct Klaviyo API Format)
// ==========================================

function getSegmentDefinition(
  segmentId: string, 
  metricMap: Record<string, string>, 
  currencySymbol: string = '$', 
  settings: any = {}
) {
  const {
    aov = 100,
    vipThreshold = 1000,
    highValueThreshold = 500,
    newCustomerDays = 60,
    lapsedDays = 90,
    churnedDays = 180
  } = settings;

  // Get metric IDs
  const placedOrderId = findMetricId('placed-order', metricMap);
  const startedCheckoutId = findMetricId('started-checkout', metricMap);
  const viewedProductId = findMetricId('viewed-product', metricMap);
  const activeOnSiteId = findMetricId('active-on-site', metricMap);
  const openedEmailId = findMetricId('opened-email', metricMap);
  const clickedEmailId = findMetricId('clicked-email', metricMap);
  const addedToCartId = findMetricId('added-to-cart', metricMap);

  const definitions: Record<string, any> = {
    // =====================================
    // ENGAGEMENT & ACTIVITY
    // =====================================
    
    'engaged-30-days': openedEmailId ? {
      name: `Engaged (Last 30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'engaged-60-days': openedEmailId ? {
      name: `Engaged (Last 60 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'engaged-90-days': openedEmailId ? {
      name: `Engaged (Last 90 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'highly-engaged': openedEmailId ? {
      name: `Highly Engaged${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 4, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'recent-clickers-90': clickedEmailId ? {
      name: `Recent Email Clickers (Last 90 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'engaged-non-buyers': (openedEmailId && placedOrderId) ? {
      name: `Engaged Non-Buyers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'over-all-time' })
            ]
          }
        ]
      }
    } : null,
    
    'active-site-30': activeOnSiteId ? {
      name: `Active on Site (Last 30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(activeOnSiteId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'unengaged-90': openedEmailId ? {
      name: `Unengaged (90+ Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'unengaged-180': openedEmailId ? {
      name: `Unengaged (180+ Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 180, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'email-openers-30': openedEmailId ? {
      name: `Email Openers (30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'email-openers-60': openedEmailId ? {
      name: `Email Openers (60 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'email-clickers-30': clickedEmailId ? {
      name: `Email Clickers (30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'email-clickers-60': clickedEmailId ? {
      name: `Email Clickers (60 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'site-visitors-30': activeOnSiteId ? {
      name: `Site Visitors (30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(activeOnSiteId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,

    // =====================================
    // CUSTOMER LIFECYCLE & VALUE
    // =====================================
    
    'recent-first-time': placedOrderId ? {
      name: `Recent First-Time Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 1, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'repeat-customers': placedOrderId ? {
      name: `Repeat Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 1, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    'one-time-buyers': placedOrderId ? {
      name: `One-Time Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 1, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    'active-customers': placedOrderId ? {
      name: `Active Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'lapsed-customers': placedOrderId ? {
      name: `Lapsed Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: lapsedDays, unit: 'day' })
            ]
          }
        ]
      }
    } : null,
    
    'churned-customers': placedOrderId ? {
      name: `Churned Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: churnedDays, unit: 'day' })
            ]
          }
        ]
      }
    } : null,
    
    'vip-customers': placedOrderId ? {
      name: `VIP Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 4, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    'big-spenders': placedOrderId ? {
      name: `Big Spenders (${currencySymbol}${vipThreshold}+)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'sum', 'greater-than', vipThreshold, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    'recent-purchasers-30': placedOrderId ? {
      name: `Recent Purchasers (30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'all-customers': placedOrderId ? {
      name: `All Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    // =====================================
    // SHOPPING BEHAVIOR
    // =====================================
    
    'cart-abandoners': (startedCheckoutId && placedOrderId) ? {
      name: `Cart Abandoners${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(startedCheckoutId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          }
        ]
      }
    } : null,
    
    'browse-abandoners': (viewedProductId && startedCheckoutId) ? {
      name: `Browse Abandoners${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(viewedProductId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(startedCheckoutId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
            ]
          }
        ]
      }
    } : null,
    
    'product-viewers': viewedProductId ? {
      name: `Product Viewers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'frequent-browsers': viewedProductId ? {
      name: `Frequent Browsers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 2, { type: 'in-the-last', quantity: 7, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'cart-adders': addedToCartId ? {
      name: `Cart Adders${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(addedToCartId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'checkout-starters': startedCheckoutId ? {
      name: `Checkout Starters${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(startedCheckoutId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'multi-purchasers': placedOrderId ? {
      name: `Multi-Purchasers (3+ Orders)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 2, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    'win-back-target': placedOrderId ? {
      name: `Win-Back Target (60-180 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
            ]
          }
        ]
      }
    } : null,

    'abandoned-cart': (addedToCartId && placedOrderId) ? {
      name: `Abandoned Cart${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(addedToCartId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          }
        ]
      }
    } : null,

    'abandoned-checkout': (startedCheckoutId && placedOrderId) ? {
      name: `Abandoned Checkout${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(startedCheckoutId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          }
        ]
      }
    } : null,

    'browse-abandonment': (viewedProductId && addedToCartId) ? {
      name: `Browse Abandonment${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(viewedProductId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(addedToCartId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
            ]
          }
        ]
      }
    } : null,

    // =====================================
    // EXCLUSION SEGMENTS
    // =====================================
    
    'recent-purchasers-exclusion': placedOrderId ? {
      name: `🚫 Recent Purchasers (7 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 7, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'never-engaged-exclusion': (openedEmailId && clickedEmailId) ? {
      name: `🚫 Never Engaged${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          {
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'over-all-time' })
            ]
          },
          {
            conditions: [
              buildMetricCondition(clickedEmailId, 'count', 'equals', 0, { type: 'over-all-time' })
            ]
          }
        ]
      }
    } : null,
  };

  return definitions[segmentId] || null;
}

// ==========================================
// STEP 4: CREATE SEGMENT
// ==========================================

async function createKlaviyoSegment(
  apiKey: string, 
  segmentId: string, 
  metricMap: Record<string, string>, 
  currencySymbol: string, 
  settings: any = {}
) {
  try {
    const segmentDef = getSegmentDefinition(segmentId, metricMap, currencySymbol, settings);
    
    if (!segmentDef) {
      console.log(`[klaviyo-create-segments] Skipping ${segmentId} - missing required metrics or definition not found`);
      return {
        segmentId,
        status: 'skipped',
        error: 'Required metrics not found in your Klaviyo account'
      };
    }

    const payload = {
      data: {
        type: 'segment',
        attributes: {
          name: segmentDef.name,
          definition: segmentDef.definition
        }
      }
    };

    console.log(`[klaviyo-create-segments] Creating segment: ${segmentDef.name}`);
    console.log(`[klaviyo-create-segments] Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch('https://a.klaviyo.com/api/segments/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Check for duplicate/already exists error
      if (response.status === 409) {
        console.log(`[klaviyo-create-segments] Segment already exists: ${segmentDef.name}`);
        return {
          segmentId,
          status: 'exists',
          name: segmentDef.name
        };
      }
      
      const errorMessage = responseData.errors?.[0]?.detail || JSON.stringify(responseData);
      console.error(`[klaviyo-create-segments] Error creating ${segmentId}:`, errorMessage);
      return {
        segmentId,
        status: 'error',
        error: errorMessage
      };
    }

    console.log(`[klaviyo-create-segments] Successfully created: ${segmentDef.name}`);
    return {
      segmentId,
      status: 'created',
      name: segmentDef.name,
      klaviyoId: responseData.data?.id
    };

  } catch (error) {
    console.error(`[klaviyo-create-segments] Exception for ${segmentId}:`, error);
    return {
      segmentId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==========================================
// MAIN HANDLER
// ==========================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    console.log('[klaviyo-create-segments] Received request body length:', bodyText.length);
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('[klaviyo-create-segments] Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let { apiKey, segmentIds, currencySymbol, settings } = body;
    
    console.log('[klaviyo-create-segments] Request params:', {
      hasApiKey: !!apiKey,
      segmentIds: segmentIds,
      segmentIdsCount: Array.isArray(segmentIds) ? segmentIds.length : 0,
      currencySymbol,
    });

    if (apiKey && isEncrypted(apiKey)) {
      console.log('[klaviyo-create-segments] Decrypting API key...');
      apiKey = await decryptApiKey(apiKey);
    }

    if (!apiKey || !segmentIds || !Array.isArray(segmentIds)) {
      console.error('[klaviyo-create-segments] Validation failed');
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or segmentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (segmentIds.length === 0) {
      console.log('[klaviyo-create-segments] No segments to create');
      return new Response(
        JSON.stringify({ results: [], summary: { created: 0, exists: 0, errors: 0 } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[klaviyo-create-segments] Creating ${segmentIds.length} segments...`);

    // Step 1: Detect available metrics
    const metricMap = await detectAvailableMetrics(apiKey);

    // Step 2: Create segments with rate limiting
    const results = [];
    let successCount = 0;
    let existsCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const segmentId of segmentIds) {
      const result = await createKlaviyoSegment(
        apiKey,
        segmentId,
        metricMap,
        currencySymbol || '$',
        settings || {}
      );
      
      results.push(result);
      
      if (result.status === 'created') successCount++;
      else if (result.status === 'exists') existsCount++;
      else if (result.status === 'skipped') skippedCount++;
      else errorCount++;
      
      // Rate limiting: 250ms between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log(`[klaviyo-create-segments] Complete: ${successCount} created, ${existsCount} exist, ${skippedCount} skipped, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        results, 
        summary: { 
          created: successCount, 
          exists: existsCount, 
          skipped: skippedCount,
          errors: errorCount 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[klaviyo-create-segments] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
