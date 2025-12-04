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
    'reviewed-product': ['Reviewed Product', 'Product Review', 'Left Review', 'Submitted Review'],
    'refunded-order': ['Refunded Order', 'Order Refunded', 'Refund Issued', 'Cancelled Order', 'Order Cancelled'],
    'submitted-feedback': ['Submitted Feedback', 'Feedback Submitted', 'Survey Response', 'NPS Response'],
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

  // Klaviyo API REQUIRES timeframe_filter for profile-metric conditions
  if (timeframe.type === 'in-the-last') {
    condition.timeframe_filter = {
      type: 'date',
      operator: 'in-the-last',
      quantity: timeframe.quantity,
      unit: timeframe.unit || 'day'
    };
  } else if (timeframe.type === 'after' && timeframe.date) {
    condition.timeframe_filter = {
      type: 'date',
      operator: 'after',
      value: timeframe.date
    };
  } else if (timeframe.type === 'over-all-time') {
    // For "all time", use a 10-year lookback (3650 days) since Klaviyo requires timeframe_filter
    condition.timeframe_filter = {
      type: 'date',
      operator: 'in-the-last',
      quantity: 3650,
      unit: 'day'
    };
  }

  return condition;
}

// ==========================================
// HELPER: Build predictive analytics condition
// ==========================================

function buildPredictiveCondition(
  dimension: string,
  filterType: 'string' | 'numeric',
  operator: string,
  value: string | number
): any {
  return {
    type: 'profile-predictive-analytics',
    dimension: dimension,
    filter: {
      type: filterType,
      operator: operator,
      value: value
    }
  };
}

// ==========================================
// HELPER: Build profile property condition
// ==========================================

function buildProfilePropertyCondition(
  property: string,
  filterType: 'string' | 'numeric' | 'boolean' | 'date',
  operator: string,
  value: any
): any {
  return {
    type: 'profile-property',
    property: property,
    filter: {
      type: filterType,
      operator: operator,
      value: value
    }
  };
}

// ==========================================
// STEP 3: SEGMENT DEFINITIONS (Correct Klaviyo API Format)
// ==========================================

function getSegmentDefinition(
  segmentId: string, 
  metricMap: Record<string, string>, 
  currencySymbol: string = '$', 
  settings: any = {},
  customInputs: Record<string, string> = {}
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
  const reviewedProductId = findMetricId('reviewed-product', metricMap);
  const refundedOrderId = findMetricId('refunded-order', metricMap);
  const submittedFeedbackId = findMetricId('submitted-feedback', metricMap);

  const definitions: Record<string, any> = {
    // =====================================
    // ENGAGEMENT & ACTIVITY
    // =====================================
    
    'engaged-30-days': (openedEmailId || clickedEmailId) ? {
      name: `Engaged (Last 30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          ...(openedEmailId ? [{
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          }] : []),
          ...(clickedEmailId ? [{
            conditions: [
              buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
            ]
          }] : [])
        ]
      }
    } : null,
    
    'engaged-60-days': (openedEmailId || clickedEmailId) ? {
      name: `Engaged (Last 60 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          ...(openedEmailId ? [{
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
            ]
          }] : []),
          ...(clickedEmailId ? [{
            conditions: [
              buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
            ]
          }] : [])
        ]
      }
    } : null,
    
    'engaged-90-days': (openedEmailId || clickedEmailId) ? {
      name: `Engaged (Last 90 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          ...(openedEmailId ? [{
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
            ]
          }] : []),
          ...(clickedEmailId ? [{
            conditions: [
              buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
            ]
          }] : [])
        ]
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
    
    'engaged-non-buyers': ((openedEmailId || clickedEmailId) && placedOrderId) ? {
      name: `Engaged Non-Buyers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [
          // (Opened OR Clicked) AND Never Purchased
          // Using separate groups for OR, each with AND for never purchased
          ...(openedEmailId ? [{
            conditions: [
              buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' }),
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 3650, unit: 'day' })
            ]
          }] : []),
          ...(clickedEmailId ? [{
            conditions: [
              buildMetricCondition(clickedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' }),
              buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 3650, unit: 'day' })
            ]
          }] : [])
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
    // CUSTOMER LIFECYCLE & VALUE (per Notion guide)
    // =====================================
    
    // #18 New Subscribers - 0 purchases all time
    'new-subscribers': placedOrderId ? {
      name: `New Subscribers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    // #19 Recent First-Time Customers - Exactly 1 order AND ordered recently
    'recent-first-time': placedOrderId ? {
      name: `Recent First-Time Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 1, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #20 Repeat Customers - 2+ orders all time
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
    
    // #21 One-Time Customers - Exactly 1 order all time
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
    
    // #22 Active Customers - Purchased in last 90 days
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
    
    // #23 Lapsed Customers - Has ordered, 0 in last 180 days
    'lapsed-customers': placedOrderId ? {
      name: `Lapsed Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 180, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #24 Churned Customers - Has ordered, 0 in last 365 days
    'churned-customers': placedOrderId ? {
      name: `Churned Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 365, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #25 VIP Customers - 5+ ORDERS (NOT by spend!)
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
    
    // #26 Big Spenders - Historic CLV above threshold (DIFFERENT from VIP!)
    'big-spenders': {
      name: `Big Spenders (${currencySymbol}${vipThreshold}+)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: 'Historic Customer Lifetime Value',
            filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: vipThreshold
            }
          }]
        }]
      }
    },
    
    // #27 Bargain Shoppers - Historic CLV below threshold
    'bargain-shoppers': {
      name: `Bargain Shoppers (Under ${currencySymbol}${aov})${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: 'Historic Customer Lifetime Value',
            filter: {
              type: 'numeric',
              operator: 'less-than',
              value: aov
            }
          }]
        }]
      }
    },
    
    // #28 High Churn Risk - Predictive (may not work for all accounts)
    'high-churn-risk': {
      name: `High Churn Risk${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-predictive-analytics',
            dimension: 'churn_risk_prediction',
            filter: {
              type: 'string',
              operator: 'equals',
              value: 'HIGH'
            }
          }]
        }]
      }
    },
    
    // #29 Likely to Purchase Soon - Predictive
    'likely-purchase-soon': {
      name: `Likely to Purchase Soon${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-predictive-analytics',
            dimension: 'expected_date_of_next_order',
            filter: {
              type: 'date',
              operator: 'in-the-next',
              quantity: 14,
              unit: 'day'
            }
          }]
        }]
      }
    },
    
    // #30 Predicted VIPs - Predictive CLV
    'predicted-vips': {
      name: `Predicted VIPs${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-predictive-analytics',
            dimension: 'predicted_customer_lifetime_value',
            filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: vipThreshold
            }
          }]
        }]
      }
    },
    
    // #31 High AOV - Average Order Value above threshold
    'high-aov': {
      name: `High AOV Customers (${currencySymbol}${highValueThreshold}+)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: 'Average Order Value',
            filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: highValueThreshold
            }
          }]
        }]
      }
    },
    
    // #32 Low AOV - Average Order Value below threshold
    'low-aov': {
      name: `Low AOV Customers (Under ${currencySymbol}${aov})${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: 'Average Order Value',
            filter: {
              type: 'numeric',
              operator: 'less-than',
              value: aov
            }
          }]
        }]
      }
    },
    
    // =====================================
    // SHOPPING BEHAVIOR & PURCHASE HISTORY
    // =====================================
    
    // #33 All Customers
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
    
    // #34 Never Purchased
    'never-purchased': placedOrderId ? {
      name: `Never Purchased (Prospects)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    // #35 Recent Purchasers 30 days
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
    
    // #36 Abandoned Cart
    'abandoned-cart': (addedToCartId && placedOrderId) ? {
      name: `Abandoned Cart${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(addedToCartId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #38 Abandoned Checkout
    'abandoned-checkout': (startedCheckoutId && placedOrderId) ? {
      name: `Abandoned Checkout${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(startedCheckoutId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #40 Browse Abandonment
    'browse-abandonment': (viewedProductId && addedToCartId && placedOrderId) ? {
      name: `Browse Abandonment${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' }),
            buildMetricCondition(addedToCartId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #46 Frequent Site Visitors - 10+ activities in 30 days
    'frequent-visitors': activeOnSiteId ? {
      name: `Frequent Site Visitors${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(activeOnSiteId, 'count', 'greater-than', 9, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    // #47 Coupon Users - Used discount code
    'coupon-users': placedOrderId ? {
      name: `Coupon Users${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-metric',
            metric_id: placedOrderId,
            measurement: 'count',
            measurement_filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: 0
            },
            timeframe_filter: {
              type: 'date',
              operator: 'in-the-last',
              quantity: 3650,
              unit: 'day'
            },
            metric_filters: [{
              property: 'Discount Codes',
              filter: {
                type: 'string',
                operator: 'is-not-empty'
              }
            }]
          }]
        }]
      }
    } : null,
    
    // #48 Full-Price Buyers
    'full-price-buyers': placedOrderId ? {
      name: `Full-Price Buyers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-metric',
            metric_id: placedOrderId,
            measurement: 'count',
            measurement_filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: 0
            },
            timeframe_filter: {
              type: 'date',
              operator: 'in-the-last',
              quantity: 3650,
              unit: 'day'
            },
            metric_filters: [{
              property: 'Discount Codes',
              filter: {
                type: 'string',
                operator: 'is-empty'
              }
            }]
          }]
        }]
      }
    } : null,
    
    // #49 Product Reviewers
    'product-reviewers': reviewedProductId ? {
      name: `Product Reviewers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(reviewedProductId, 'count', 'greater-than', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,
    
    // #50 Non-Reviewers
    'non-reviewers': (reviewedProductId && placedOrderId) ? {
      name: `Non-Reviewers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(reviewedProductId, 'count', 'equals', 0, { type: 'over-all-time' })
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
        condition_groups: [{
          conditions: [
            buildMetricCondition(startedCheckoutId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
    
    'browse-abandoners': (viewedProductId && startedCheckoutId) ? {
      name: `Browse Abandoners${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 14, unit: 'day' }),
            buildMetricCondition(startedCheckoutId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
          ]
        }]
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
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,

    // Note: abandoned-cart, abandoned-checkout, browse-abandonment, new-subscribers, never-purchased
    // are now defined in the main SHOPPING BEHAVIOR section above

    'first-time-buyers': placedOrderId ? {
      name: `First-Time Buyers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'equals', 1, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,

    'high-frequency-buyers': placedOrderId ? {
      name: `High Frequency Buyers (5+ Orders)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 4, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,

    'recent-purchasers-7': placedOrderId ? {
      name: `Recent Purchasers (7 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 7, unit: 'day' })
          ]
        }]
      }
    } : null,

    'recent-purchasers-14': placedOrderId ? {
      name: `Recent Purchasers (14 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
          ]
        }]
      }
    } : null,

    'recent-purchasers-60': placedOrderId ? {
      name: `Recent Purchasers (60 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,

    'recent-purchasers-90': placedOrderId ? {
      name: `Recent Purchasers (90 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,

    'at-risk-customers': placedOrderId ? {
      name: `At-Risk Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null,

    'dormant-customers': placedOrderId ? {
      name: `Dormant Customers (120+ Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'over-all-time' }),
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 120, unit: 'day' })
          ]
        }]
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
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'over-all-time' }),
            buildMetricCondition(clickedEmailId, 'count', 'equals', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,

    'recent-purchasers-exclude': placedOrderId ? {
      name: `🚫 Recent Purchasers Exclusion (14 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(placedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 14, unit: 'day' })
          ]
        }]
      }
    } : null,

    'unsubscribed': {
      name: `🚫 Not Receiving Marketing${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-marketing-consent',
            consent: {
              channel: 'email',
              can_receive_marketing: false,
              consent_status: {
                subscription: 'any'
              }
            }
          }]
        }]
      }
    },

    'bounced-emails': openedEmailId ? {
      name: `🚫 Never Opened Any Email${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,

    // =====================================
    // DEMOGRAPHIC SEGMENTS (Predictive)
    // =====================================

    'gender-male': {
      name: `Likely Male${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildPredictiveCondition('predicted_gender', 'string', 'equals', 'likely_male')
          ]
        }]
      }
    },

    'gender-female': {
      name: `Likely Female${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildPredictiveCondition('predicted_gender', 'string', 'equals', 'likely_female')
          ]
        }]
      }
    },

    'gender-uncertain': {
      name: `Gender Uncertain${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildPredictiveCondition('predicted_gender', 'string', 'equals', 'uncertain')
          ]
        }]
      }
    },

    // =====================================
    // PREDICTIVE ANALYTICS SEGMENTS
    // These require Klaviyo Predictive Analytics to be enabled on the account
    // Marked as unavailable in UI since most accounts don't have this feature
    // =====================================

    // Note: predicted-vips, high-churn-risk, likely-purchase-soon, high-aov, low-aov, bargain-shoppers
    // are now defined in the main CUSTOMER LIFECYCLE section above
    
    'high-churn-risk-exclude': {
      name: `🚫 High Churn Risk${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-predictive-analytics',
            dimension: 'churn_risk_prediction',
            filter: {
              type: 'string',
              operator: 'equals',
              value: 'HIGH'
            }
          }]
        }]
      }
    },

    // =====================================
    // PROFILE PROPERTY SEGMENTS
    // =====================================

    // Birthday This Month - NOT SUPPORTED via Klaviyo API (no 'is-in-month' operator available)
    // This segment must be created manually in Klaviyo or via Klaviyo's UI
    'birthday-month': null,

    'location-country': {
      name: `${customInputs['location-country'] || 'United States'} Customers${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: "location['country']",
            filter: {
              type: 'string',
              operator: 'equals',
              value: customInputs['location-country'] || 'United States'
            }
          }]
        }]
      }
    },

    // =====================================
    // AGE-BASED SEGMENTS
    // =====================================

    'age-18-24': {
      name: `Age 18-24${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'greater-than-or-equal',
              value: 18
            }
          }, {
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'less-than-or-equal',
              value: 24
            }
          }]
        }]
      }
    },

    'age-25-40': {
      name: `Age 25-40${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'greater-than-or-equal',
              value: 25
            }
          }, {
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'less-than-or-equal',
              value: 40
            }
          }]
        }]
      }
    },

    // =====================================
    // LOCATION PROXIMITY SEGMENT
    // =====================================

    'age-41-55': {
      name: `Age 41-55${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'greater-than-or-equal',
              value: 41
            }
          }, {
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'less-than-or-equal',
              value: 55
            }
          }]
        }]
      }
    },

    'age-55-plus': {
      name: `Age 55+${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-property',
            property: "properties['age']",
            filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: 55
            }
          }]
        }]
      }
    },

    // =====================================
    // LOCATION PROXIMITY SEGMENTS
    // These require manual setup with specific coordinates
    // Marked as unavailable in UI
    // =====================================

    'location-proximity': null,
    'location-los-angeles': null,
    'location-chicago': null,
    'location-houston': null,

    // Note: coupon-users, full-price-buyers, product-reviewers, non-reviewers
    // are now defined in the main SHOPPING BEHAVIOR section above

    // =====================================
    // REFUND & FEEDBACK SEGMENTS
    // =====================================

    'refunded-customers': refundedOrderId ? {
      name: `🚫 Refunded Customers (30 Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(refundedOrderId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,

    'negative-feedback': submittedFeedbackId ? {
      name: `🚫 Negative Feedback${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-metric',
            metric_id: submittedFeedbackId,
            measurement: 'count',
            measurement_filter: {
              type: 'numeric',
              operator: 'greater-than',
              value: 0
            },
            timeframe_filter: null,
            metric_filters: [{
              property: 'rating',
              filter: {
                type: 'numeric',
                operator: 'less-than',
                value: 3
              }
            }]
          }]
        }]
      }
    } : (openedEmailId ? {
      name: `🚫 Unengaged (Potential Negative Experience)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 60, unit: 'day' })
          ]
        }]
      }
    } : null),

    'marked-spam': openedEmailId ? {
      name: `🚫 Unengaged 90+ Days (Spam Risk)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 90, unit: 'day' })
          ]
        }]
      }
    } : null,

    // =====================================
    // EMAIL ENGAGEMENT EXCLUSIONS
    // =====================================

    'not-opted-in': {
      name: `🚫 Not Opted In (Email)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [{
            type: 'profile-marketing-consent',
            consent: {
              channel: 'email',
              can_receive_marketing: false,
              consent_status: {
                subscription: 'any'
              }
            }
          }]
        }]
      }
    },

    'unengaged-exclusion': (openedEmailId && clickedEmailId) ? {
      name: `🚫 Unengaged Exclusion (180+ Days)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            // No opens AND no clicks in 180 days
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 180, unit: 'day' }),
            buildMetricCondition(clickedEmailId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 180, unit: 'day' })
          ]
        }]
      }
    } : null,

    // =====================================
    // OVER-MESSAGED SEGMENTS
    // =====================================

    'received-3-in-3-days': openedEmailId ? {
      name: `🚫 3+ Opens in 3 Days (Highly Active)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 2, { type: 'in-the-last', quantity: 3, unit: 'day' })
          ]
        }]
      }
    } : null,

    'received-5-opened-0': openedEmailId ? {
      name: `🚫 Never Opened (All Time)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'equals', 0, { type: 'over-all-time' })
          ]
        }]
      }
    } : null,

    // =====================================
    // SUNSET/WINBACK SEGMENT
    // =====================================

    'sunset-segment': openedEmailId ? {
      name: `🚫 Sunset Segment${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(openedEmailId, 'count', 'greater-than', 0, { type: 'in-the-last', quantity: 180, unit: 'day' }),
            buildMetricCondition(openedEmailId, 'count', 'less-than', 3, { type: 'in-the-last', quantity: 180, unit: 'day' })
          ]
        }]
      }
    } : null,

    // =====================================
    // ADVANCED SHOPPING SEGMENTS
    // =====================================

    'abandoned-cart-high-value': (addedToCartId && placedOrderId) ? {
      name: `Abandoned Cart - High Value (${currencySymbol}${highValueThreshold}+)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              type: 'profile-metric',
              metric_id: addedToCartId,
              measurement: 'sum',
              measurement_filter: {
                type: 'numeric',
                operator: 'greater-than-or-equal',
                value: highValueThreshold
              },
              timeframe_filter: {
                type: 'date',
                operator: 'in-the-last',
                quantity: 30,
                unit: 'day'
              }
            },
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,

    'abandoned-checkout-high-value': (startedCheckoutId && placedOrderId) ? {
      name: `Abandoned Checkout - High Value (${currencySymbol}${highValueThreshold}+)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              type: 'profile-metric',
              metric_id: startedCheckoutId,
              measurement: 'sum',
              measurement_filter: {
                type: 'numeric',
                operator: 'greater-than-or-equal',
                value: highValueThreshold
              },
              timeframe_filter: {
                type: 'date',
                operator: 'in-the-last',
                quantity: 30,
                unit: 'day'
              }
            },
            buildMetricCondition(placedOrderId, 'count', 'equals', 0, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,

    // Note: frequent-visitors is now defined in the main SHOPPING BEHAVIOR section above

    // These are marked as unavailable in UI - require manual category setup
    'multi-category': null,
    'cross-sell': null,
    'category-buyers': null,

    'product-interest': viewedProductId ? {
      name: `Repeat Product Viewers (3+ Views)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 2, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,

    'category-interest': viewedProductId ? {
      name: `Product Browsers (2+ Views)${ADERAI_SUFFIX}`,
      definition: {
        condition_groups: [{
          conditions: [
            buildMetricCondition(viewedProductId, 'count', 'greater-than', 1, { type: 'in-the-last', quantity: 30, unit: 'day' })
          ]
        }]
      }
    } : null,
  };

  return definitions[segmentId] || null;
}

// ==========================================
// HELPER: Get or Create "Aderai" Tag
// ==========================================

async function getOrCreateAderaiTag(apiKey: string): Promise<string | null> {
  try {
    // First, try to find existing "Aderai" tag
    const listTagsResponse = await fetch('https://a.klaviyo.com/api/tags/', {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Accept': 'application/json',
        'revision': '2024-10-15'
      }
    });

    if (listTagsResponse.ok) {
      const tagsData = await listTagsResponse.json();
      const existingTag = tagsData.data?.find((tag: any) => tag.attributes?.name === 'Aderai');
      if (existingTag) {
        console.log('[klaviyo-create-segments] Found existing Aderai tag:', existingTag.id);
        return existingTag.id;
      }
    }

    // Tag doesn't exist, create it
    console.log('[klaviyo-create-segments] Creating new Aderai tag...');
    const createTagResponse = await fetch('https://a.klaviyo.com/api/tags/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: {
          type: 'tag',
          attributes: {
            name: 'Aderai'
          }
        }
      })
    });

    if (createTagResponse.ok) {
      const newTagData = await createTagResponse.json();
      console.log('[klaviyo-create-segments] Created Aderai tag:', newTagData.data?.id);
      return newTagData.data?.id || null;
    } else {
      const errorText = await createTagResponse.text();
      console.error('[klaviyo-create-segments] Failed to create tag:', errorText);
      return null;
    }
  } catch (error) {
    console.error('[klaviyo-create-segments] Error getting/creating Aderai tag:', error);
    return null;
  }
}

// ==========================================
// HELPER: Find existing segment by name
// ==========================================

async function findSegmentByName(apiKey: string, segmentName: string): Promise<string | null> {
  try {
    // URL encode the segment name for the filter
    const encodedName = encodeURIComponent(segmentName);
    const response = await fetch(`https://a.klaviyo.com/api/segments/?filter=equals(name,"${encodedName}")`, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Accept': 'application/json',
        'revision': '2024-10-15'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0].id;
      }
    }
    return null;
  } catch (error) {
    console.error('[klaviyo-create-segments] Error finding segment by name:', error);
    return null;
  }
}

// ==========================================
// HELPER: Add Tag to Segment
// ==========================================

async function addTagToSegment(apiKey: string, tagId: string, segmentId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://a.klaviyo.com/api/tags/${tagId}/relationships/segments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: [
          {
            type: 'segment',
            id: segmentId
          }
        ]
      })
    });

    if (response.ok || response.status === 204) {
      console.log(`[klaviyo-create-segments] Tagged segment ${segmentId} with Aderai`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`[klaviyo-create-segments] Failed to tag segment ${segmentId}:`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`[klaviyo-create-segments] Error tagging segment ${segmentId}:`, error);
    return false;
  }
}

// ==========================================
// STEP 4: CREATE SEGMENT
// ==========================================

async function createKlaviyoSegment(
  apiKey: string, 
  segmentId: string, 
  metricMap: Record<string, string>, 
  currencySymbol: string, 
  settings: any = {},
  tagId: string | null = null,
  customInputs: Record<string, string> = {}
) {
  try {
    const segmentDef = getSegmentDefinition(segmentId, metricMap, currencySymbol, settings, customInputs);
    
    if (!segmentDef) {
      // Determine the actual reason for skipping
      let errorReason = 'Segment definition not implemented yet';
      
      // Check if it's a metrics issue by looking at what metrics are available
      const hasPlacedOrder = !!findMetricId('placed-order', metricMap);
      const hasOpenedEmail = !!findMetricId('opened-email', metricMap);
      const hasViewedProduct = !!findMetricId('viewed-product', metricMap);
      const hasStartedCheckout = !!findMetricId('started-checkout', metricMap);
      
      // Segments that need specific metrics
      const metricsRequired: Record<string, string[]> = {
        'cart-abandoners': ['Started Checkout', 'Placed Order'],
        'browse-abandoners': ['Viewed Product', 'Started Checkout'],
        'product-viewers': ['Viewed Product'],
        'frequent-browsers': ['Viewed Product'],
        'browse-abandonment': ['Viewed Product', 'Added to Cart'],
        'engaged-non-buyers': ['Opened Email', 'Placed Order'],
        'vip-customers': ['Placed Order'],
        'repeat-customers': ['Placed Order'],
        'churned-customers': ['Placed Order'],
        'lapsed-customers': ['Placed Order'],
      };
      
      if (metricsRequired[segmentId]) {
        const missing = metricsRequired[segmentId].filter(m => !metricMap[m]);
        if (missing.length > 0) {
          errorReason = `Missing metrics: ${missing.join(', ')}. Make sure your Klaviyo account tracks these events.`;
        }
      }
      
      // All segments are now implemented - provide actionable feedback
      errorReason = 'This segment requires specific data that may not be in your Klaviyo account. Check that your ecommerce platform is properly syncing all events.';
      
      console.log(`[klaviyo-create-segments] Skipping ${segmentId} - ${errorReason}`);
      return {
        segmentId,
        status: 'skipped',
        error: errorReason
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
        
        // Try to find the existing segment and tag it
        if (tagId) {
          const existingSegmentId = await findSegmentByName(apiKey, segmentDef.name);
          if (existingSegmentId) {
            console.log(`[klaviyo-create-segments] Found existing segment ${existingSegmentId}, adding Aderai tag...`);
            await addTagToSegment(apiKey, tagId, existingSegmentId);
          }
        }
        
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
    
    // Tag the segment with Aderai
    if (tagId && responseData.data?.id) {
      await addTagToSegment(apiKey, tagId, responseData.data.id);
    }
    
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
// HELPER: Sleep function
// ==========================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// HELPER: Parse Klaviyo's wait time from error message
// ==========================================

function parseWaitTime(errorMessage: string): number | null {
  // "Expected available in 1 second" → 1500ms (with buffer)
  // "Expected available in 5 seconds" → 5500ms
  const match = errorMessage.match(/Expected available in (\d+) second/);
  if (match) {
    return parseInt(match[1], 10) * 1000 + 500; // Add 500ms buffer
  }
  return null;
}

// ==========================================
// HELPER: Check if error is retryable
// ==========================================

function isRetryableError(errorMessage: string): boolean {
  const retryablePatterns = [
    'throttled',
    'segment processing limit',
    'rate limit',
    'too many requests',
    '429',
    'Expected available in'
  ];
  const lowerError = errorMessage.toLowerCase();
  return retryablePatterns.some(pattern => lowerError.includes(pattern.toLowerCase()));
}

// ==========================================
// HELPER: Create segment with auto-retry
// ==========================================

async function createSegmentWithRetry(
  apiKey: string,
  segmentId: string,
  metricMap: Record<string, string>,
  currencySymbol: string,
  settings: any,
  tagId: string | null,
  customInputs: Record<string, string>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<any> {
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await createKlaviyoSegment(
      apiKey,
      segmentId,
      metricMap,
      currencySymbol,
      settings,
      tagId,
      customInputs
    );
    
    // Success or non-retryable result
    if (result.status !== 'error') {
      return result;
    }
    
    const errorMsg = result.error || '';
    lastError = errorMsg;
    
    // Check if this error is retryable
    if (!isRetryableError(errorMsg)) {
      console.log(`[klaviyo-create-segments] Non-retryable error for ${segmentId}: ${errorMsg}`);
      return result;
    }
    
    // Don't retry on last attempt
    if (attempt === maxRetries) {
      console.log(`[klaviyo-create-segments] Max retries (${maxRetries}) reached for ${segmentId}`);
      return result;
    }
    
    // Calculate wait time - use Klaviyo's suggestion or exponential backoff
    const klaviyoWaitTime = parseWaitTime(errorMsg);
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const waitTime = klaviyoWaitTime || exponentialDelay;
    
    console.log(`[klaviyo-create-segments] Retry ${attempt}/${maxRetries} for ${segmentId} - waiting ${waitTime}ms (${klaviyoWaitTime ? 'Klaviyo suggested' : 'exponential backoff'})`);
    await sleep(waitTime);
  }
  
  // Shouldn't reach here, but just in case
  return {
    segmentId,
    status: 'error',
    error: lastError || 'Max retries exceeded'
  };
}

// ==========================================
// HELPER: Split array into chunks
// ==========================================

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// ==========================================
// MAIN HANDLER
// ==========================================

const BATCH_SIZE = 4; // Stay under Klaviyo's 5 segment processing limit
const BATCH_DELAY = 3000; // 3 seconds between batches
const INTRA_BATCH_DELAY = 500; // 500ms between requests within a batch

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
    
    let { apiKey, segmentIds, currencySymbol, settings, customInputs } = body;
    
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

    console.log(`[klaviyo-create-segments] Creating ${segmentIds.length} segments with batching (batch size: ${BATCH_SIZE})...`);

    // Step 1: Detect available metrics
    const metricMap = await detectAvailableMetrics(apiKey);

    // Step 2: Get or create the Aderai tag (do this once)
    const aderaiTagId = await getOrCreateAderaiTag(apiKey);
    if (aderaiTagId) {
      console.log('[klaviyo-create-segments] Will tag segments with Aderai tag:', aderaiTagId);
    } else {
      console.log('[klaviyo-create-segments] Could not get Aderai tag, segments will not be tagged');
    }

    // Step 3: Split segments into batches
    const batches = chunkArray(segmentIds, BATCH_SIZE);
    console.log(`[klaviyo-create-segments] Split into ${batches.length} batches`);

    // Step 4: Process batches with delays
    const results: any[] = [];
    let successCount = 0;
    let existsCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[klaviyo-create-segments] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} segments)...`);

      // Process each segment in the batch with small delays between them
      for (let i = 0; i < batch.length; i++) {
        const segmentId = batch[i];
        
        const result = await createSegmentWithRetry(
          apiKey,
          segmentId,
          metricMap,
          currencySymbol || '$',
          settings || {},
          aderaiTagId,
          customInputs || {}
        );
        
        results.push(result);
        
        if (result.status === 'created') successCount++;
        else if (result.status === 'exists') existsCount++;
        else if (result.status === 'skipped') skippedCount++;
        else errorCount++;
        
        // Small delay between segments within a batch (except for last one in batch)
        if (i < batch.length - 1) {
          await sleep(INTRA_BATCH_DELAY);
        }
      }
      
      console.log(`[klaviyo-create-segments] Batch ${batchIndex + 1} complete: ${successCount} created, ${existsCount} exist, ${skippedCount} skipped, ${errorCount} errors so far`);
      
      // Longer delay between batches (except after last batch)
      if (batchIndex < batches.length - 1) {
        console.log(`[klaviyo-create-segments] Waiting ${BATCH_DELAY / 1000}s before next batch...`);
        await sleep(BATCH_DELAY);
      }
    }

    console.log(`[klaviyo-create-segments] Complete: ${successCount} created, ${existsCount} exist, ${skippedCount} skipped, ${errorCount} errors`);

    // Check which key metrics are available
    const metricsAvailability = {
      'Placed Order': !!findMetricId('placed-order', metricMap),
      'Started Checkout': !!findMetricId('started-checkout', metricMap),
      'Viewed Product': !!findMetricId('viewed-product', metricMap),
      'Active on Site': !!findMetricId('active-on-site', metricMap),
      'Opened Email': !!findMetricId('opened-email', metricMap),
      'Clicked Email': !!findMetricId('clicked-email', metricMap),
      'Added to Cart': !!findMetricId('added-to-cart', metricMap),
    };

    const missingMetrics = Object.entries(metricsAvailability)
      .filter(([_, available]) => !available)
      .map(([name]) => name);

    return new Response(
      JSON.stringify({ 
        results, 
        summary: { 
          created: successCount, 
          exists: existsCount, 
          skipped: skippedCount,
          errors: errorCount 
        },
        metricsAvailability,
        missingMetrics,
        metricsNote: missingMetrics.length > 0 
          ? `Some segments may be unavailable because your Klaviyo account is missing these metrics: ${missingMetrics.join(', ')}. Make sure your ecommerce platform is properly integrated with Klaviyo.`
          : 'All required metrics are available in your Klaviyo account.'
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
