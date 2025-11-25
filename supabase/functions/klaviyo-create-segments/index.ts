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

  console.log(`[klaviyo-create-segments] Found ${Object.keys(metricMap).length} metrics:`, Object.keys(metricMap));
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
// STEP 3: SEGMENT DEFINITIONS (Klaviyo API Format)
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
    // ENGAGEMENT & ACTIVITY (14)
    // =====================================
    
    'engaged-30-days': {
      name: `Engaged (Last 30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId, clickedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'engaged-60-days': {
      name: `Engaged (Last 60 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
          }]
        }]
      }
    },
    
    'engaged-90-days': {
      name: `Engaged (Last 90 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }]
      }
    },
    
    'highly-engaged': {
      name: `Highly Engaged${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 4,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'recent-clickers-90': {
      name: `Recent Email Clickers (Last 90 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [clickedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: clickedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }]
      }
    },
    
    'engaged-non-buyers': {
      name: `Engaged Non-Buyers${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId, placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: openedEmailId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }]
      }
    },
    
    'active-site-30': {
      name: `Active on Site (Last 30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [activeOnSiteId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: activeOnSiteId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'unengaged-90': {
      name: `Unengaged (90+ Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'equals',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }]
      }
    },
    
    'unengaged-180': {
      name: `Unengaged (180+ Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'equals',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 180, unit: 'days' }
          }]
        }]
      }
    },
    
    'email-openers-30': {
      name: `Email Openers (30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'email-openers-60': {
      name: `Email Openers (60 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: openedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
          }]
        }]
      }
    },
    
    'email-clickers-30': {
      name: `Email Clickers (30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [clickedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: clickedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'email-clickers-60': {
      name: `Email Clickers (60 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [clickedEmailId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: clickedEmailId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
          }]
        }]
      }
    },
    
    'site-visitors-30': {
      name: `Site Visitors (30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [activeOnSiteId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: activeOnSiteId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },

    // =====================================
    // CUSTOMER LIFECYCLE & VALUE (15)
    // =====================================
    
    'new-subscribers': {
      name: `New Subscribers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              field: '$created',
              operator: 'in_the_last',
              value: 30,
              unit: 'days'
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }]
      }
    },
    
    'recent-first-time': {
      name: `Recent First-Time Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'equals',
            quantity: 1,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'repeat-customers': {
      name: `Repeat Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 1,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'one-time-buyers': {
      name: `One-Time Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'equals',
            quantity: 1,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'active-customers': {
      name: `Active Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }]
      }
    },
    
    'lapsed-customers': {
      name: `Lapsed Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: lapsedDays, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'churned-customers': {
      name: `Churned Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: churnedDays, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'vip-customers': {
      name: `VIP Customers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 4,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'big-spenders': {
      name: `Big Spenders (${currencySymbol}${vipThreshold}+)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            aggregation: 'sum',
            value: vipThreshold,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'bargain-shoppers': {
      name: `Bargain Shoppers (<${currencySymbol}${highValueThreshold})${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'less-than',
            quantity: 0,
            aggregation: 'average',
            value: highValueThreshold,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'high-churn-risk': {
      name: `High Churn Risk${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId, openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            },
            {
              metric_id: openedEmailId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'likely-purchase-soon': {
      name: `Likely to Purchase Soon${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId, openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: openedEmailId,
              operator: 'greater-than',
              quantity: 2,
              timeframe: { key: 'in_the_last', value: 14, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'predicted-vips': {
      name: `Predicted VIPs${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'predicted_lifetime_value',
            operator: 'greater-than',
            value: vipThreshold
          }]
        }]
      }
    },
    
    'high-aov': {
      name: `High AOV (>${currencySymbol}${aov})${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            aggregation: 'average',
            value: aov,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'low-aov': {
      name: `Low AOV (<${currencySymbol}${aov})${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'less-than',
            quantity: 0,
            aggregation: 'average',
            value: aov,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },

    // =====================================
    // SHOPPING BEHAVIOR & PURCHASE HISTORY (18)
    // =====================================
    
    'all-customers': {
      name: `All Customers (PUR ≥ 1)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'never-purchased': {
      name: `Never Purchased (Prospects)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'equals',
            quantity: 0,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'recent-purchasers-30': {
      name: `Recent Purchasers (Last 30 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'abandoned-cart': {
      name: `Abandoned Cart${ADERAI_SUFFIX}`,
      requiresMetrics: [addedToCartId, placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: addedToCartId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'abandoned-cart-high-value': {
      name: `Abandoned Cart - High Value ($400+)${ADERAI_SUFFIX}`,
      requiresMetrics: [addedToCartId, placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: addedToCartId,
              operator: 'greater-than',
              quantity: 0,
              value: 400,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'abandoned-checkout': {
      name: `Abandoned Checkout${ADERAI_SUFFIX}`,
      requiresMetrics: [startedCheckoutId, placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: startedCheckoutId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'abandoned-checkout-high-value': {
      name: `Abandoned Checkout - High Value ($400+)${ADERAI_SUFFIX}`,
      requiresMetrics: [startedCheckoutId, placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: startedCheckoutId,
              operator: 'greater-than',
              quantity: 0,
              value: 400,
              timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'browse-abandonment': {
      name: `Browse Abandonment${ADERAI_SUFFIX}`,
      requiresMetrics: [viewedProductId, startedCheckoutId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: viewedProductId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 14, unit: 'days' }
            },
            {
              metric_id: startedCheckoutId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 14, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'product-viewers': {
      name: `Product Viewers${ADERAI_SUFFIX}`,
      requiresMetrics: [viewedProductId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: viewedProductId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'frequent-browsers': {
      name: `Frequent Browsers${ADERAI_SUFFIX}`,
      requiresMetrics: [viewedProductId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: viewedProductId,
            operator: 'greater-than',
            quantity: 9,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'high-intent': {
      name: `High Intent${ADERAI_SUFFIX}`,
      requiresMetrics: [viewedProductId, addedToCartId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: viewedProductId,
              operator: 'greater-than',
              quantity: 2,
              timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
            }
          ]
        }]
      }
    },
    
    'cart-adders': {
      name: `Cart Adders${ADERAI_SUFFIX}`,
      requiresMetrics: [addedToCartId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: addedToCartId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'checkout-starters': {
      name: `Checkout Starters${ADERAI_SUFFIX}`,
      requiresMetrics: [startedCheckoutId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: startedCheckoutId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }]
      }
    },
    
    'discount-users': {
      name: `Discount Users${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.used_discount_code',
            operator: 'equals',
            value: true
          }]
        }]
      }
    },
    
    'full-price-buyers': {
      name: `Full Price Buyers${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              field: 'properties.used_discount_code',
              operator: 'equals',
              value: false
            }
          ]
        }]
      }
    },
    
    'multi-purchasers': {
      name: `Multi-Purchasers (3+ Orders)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 2,
            timeframe: { key: 'since', value: null }
          }]
        }]
      }
    },
    
    'win-back-target': {
      name: `Win-Back Target (60-180 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: placedOrderId,
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: placedOrderId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            }
          ]
        }]
      }
    },

    // =====================================
    // DEMOGRAPHICS (8)
    // =====================================
    
    'gender-male': {
      name: `Gender - Male${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.gender',
            operator: 'equals',
            value: 'male'
          }]
        }]
      }
    },
    
    'gender-female': {
      name: `Gender - Female${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.gender',
            operator: 'equals',
            value: 'female'
          }]
        }]
      }
    },
    
    'gender-uncertain': {
      name: `Gender - Uncertain${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.gender',
            operator: 'is-not-set',
            value: true
          }]
        }]
      }
    },
    
    'location-country': {
      name: `Location - By Country${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'location.country',
            operator: 'is-set',
            value: true
          }]
        }]
      }
    },
    
    'location-proximity': {
      name: `Location - By Region${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'location.region',
            operator: 'is-set',
            value: true
          }]
        }]
      }
    },
    
    'birthday-month': {
      name: `Birthday This Month${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.birth_month',
            operator: 'equals',
            value: new Date().getMonth() + 1
          }]
        }]
      }
    },
    
    'age-18-24': {
      name: `Age Group 18-24${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [
            {
              field: 'properties.age',
              operator: 'greater-or-equal',
              value: 18
            },
            {
              field: 'properties.age',
              operator: 'less-or-equal',
              value: 24
            }
          ]
        }]
      }
    },
    
    'age-25-40': {
      name: `Age Group 25-40${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [
            {
              field: 'properties.age',
              operator: 'greater-or-equal',
              value: 25
            },
            {
              field: 'properties.age',
              operator: 'less-or-equal',
              value: 40
            }
          ]
        }]
      }
    },

    // =====================================
    // EXCLUSION SEGMENTS (12)
    // =====================================
    
    'unsubscribed': {
      name: `🚫 Unsubscribed${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'can_receive_email_marketing',
            operator: 'equals',
            value: false
          }]
        }]
      }
    },
    
    'bounced': {
      name: `🚫 Email Bounced${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'subscriptions.email.marketing.suppression.reason',
            operator: 'contains',
            value: 'bounce'
          }]
        }]
      }
    },
    
    'spam-complaints': {
      name: `🚫 Spam Complaints${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'subscriptions.email.marketing.suppression.reason',
            operator: 'contains',
            value: 'spam'
          }]
        }]
      }
    },
    
    'suppressed': {
      name: `🚫 Suppressed${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'subscriptions.email.marketing.suppression',
            operator: 'is-set',
            value: true
          }]
        }]
      }
    },
    
    'never-engaged-exclusion': {
      name: `🚫 Never Engaged${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId, clickedEmailId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: openedEmailId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: clickedEmailId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }]
      }
    },
    
    'recent-purchasers-exclusion': {
      name: `🚫 Recent Purchasers (7 Days)${ADERAI_SUFFIX}`,
      requiresMetrics: [placedOrderId],
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: placedOrderId,
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
          }]
        }]
      }
    },
    
    'invalid-email': {
      name: `🚫 Invalid Email${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'email',
            operator: 'is-not-set',
            value: true
          }]
        }]
      }
    },
    
    'high-refund': {
      name: `🚫 High Refund Rate${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.requested_refund',
            operator: 'equals',
            value: true
          }]
        }]
      }
    },
    
    'do-not-email': {
      name: `🚫 Do Not Email${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.do_not_email',
            operator: 'equals',
            value: true
          }]
        }]
      }
    },
    
    'sms-only': {
      name: `🚫 SMS Only${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.prefers_sms',
            operator: 'equals',
            value: true
          }]
        }]
      }
    },
    
    'outside-shipping': {
      name: `🚫 Outside Shipping Zone${ADERAI_SUFFIX}`,
      requiresMetrics: [],
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.can_ship_to',
            operator: 'equals',
            value: false
          }]
        }]
      }
    },
    
    'low-quality-lead': {
      name: `🚫 Low Quality Lead${ADERAI_SUFFIX}`,
      requiresMetrics: [openedEmailId],
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: openedEmailId,
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 180, unit: 'days' }
            }
          ]
        }]
      }
    },
  };

  return definitions[segmentId] || null;
}

// ==========================================
// STEP 4: CREATE SEGMENT WITH VALIDATION
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
      console.log(`[klaviyo-create-segments] Segment definition not found for: ${segmentId}`);
      return {
        segmentId,
        status: 'error',
        error: 'Segment definition not found'
      };
    }

    // Check if segment requires metrics that don't exist
    const requiredMetrics = segmentDef.requiresMetrics || [];
    const missingMetric = requiredMetrics.find((m: string | null) => m === null);
    
    if (missingMetric !== undefined) {
      console.log(`[klaviyo-create-segments] Skipping ${segmentId} - missing required metric`);
      return {
        segmentId,
        status: 'skipped',
        error: 'Required metric not found in your Klaviyo account'
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
      
      const errorMessage = responseData.errors?.[0]?.detail || 'Failed to create segment';
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
