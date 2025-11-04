// TEMPORARY FILE - Paste your CloudFlare worker code here
// From: aderai-api.akshat-619.workers.dev
// 
// This file is just for reference - once pasted, I'll convert it to a Supabase Edge Function
// You can delete this file after we're done migrating

// PASTE YOUR CLOUDFLARE WORKER CODE BELOW THIS LINE:
/**
 * ADERAI V2 - CLOUDFLARE WORKER (FINAL)
 * Service Worker format - No ES6 modules
 * All 70 segments included
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

async function detectAvailableMetrics(apiKey) {
  const response = await fetch('https://a.klaviyo.com/api/v2/metrics', {
    method: 'GET',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Accept': 'application/json',
      'Revision': '2024-10-15'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch metrics from Klaviyo');
  }

  const data = await response.json();
  const metricMap = {};
  
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach(metric => {
      const name = metric.attributes?.name;
      const id = metric.id;
      if (name && id) {
        metricMap[name] = id;
      }
    });
  }

  return metricMap;
}

function findMetricId(segmentId, metricMap) {
  const metricMappings = {
    'placed-order': ['Placed Order', 'Ordered Product', 'Order Placed', 'Checkout', 'Purchase'],
    'started-checkout': ['Started Checkout', 'Checkout Started', 'Initiated Checkout', 'Begin Checkout'],
    'viewed-product': ['Viewed Product', 'Product Viewed', 'Product View'],
    'active-on-site': ['Active on Site', 'Site Activity', 'Page View'],
    'opened-email': ['Opened Email', 'Email Opened'],
    'clicked-email': ['Clicked Email', 'Email Clicked'],
    'subscribed': ['Subscribed to List', 'Subscribe', 'List Subscribe']
  };

  const possibleNames = metricMappings[segmentId] || [];
  
  for (const name of possibleNames) {
    if (metricMap[name]) {
      return metricMap[name];
    }
  }
  
  return null;
}

function getSegmentDefinition(segmentId, metricMap, currencySymbol = '$', settings = {}) {
  const {
    aov = 100,
    vipThreshold = 1000,
    highValueThreshold = 500,
    newCustomerDays = 60,
    lapsedDays = 90,
    churnedDays = 180
  } = settings;
  
  const definitions = {
    
    // =====================================
    // CORE BFCM SEGMENTS (6)
    // =====================================
    
    'vip-customers': {
      name: `VIP Customers (Top 10% LTV) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'predicted_lifetime_value',
            operator: 'greater-than',
            value: vipThreshold
          }]
        }],
        fallback: {
          condition_groups: [{
            conditions: [{
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'greater-than',
              quantity: 2,
              aggregation: 'sum',
              value: vipThreshold,
              timeframe: { key: 'since', value: null }
            }]
          }]
        }
      }
    },
    
    'repeat-customers': {
      name: `Repeat Customers (3+ Purchases) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 2,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'one-time-customers': {
      name: `One-Time Customers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'equals',
            quantity: 1,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'engaged-non-buyers': {
      name: `Engaged Non-Buyers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'cart-abandoners': {
      name: `Cart Abandoners | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('started-checkout', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'lapsed-customers': {
      name: `Lapsed Customers (90+ Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    // =====================================
    // ENGAGEMENT & ACTIVITY (10)
    // =====================================
    
    'highly-engaged': {
      name: `Highly Engaged (Last 30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'engagement_status',
            operator: 'equals',
            value: 'engaged'
          }]
        }]
      }
    },
    
    'recent-clickers': {
      name: `Recent Email Clickers (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('clicked-email', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'active-on-site': {
      name: `Active on Site (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('active-on-site', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'unengaged-90': {
      name: `Unengaged (90+ Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
            },
            {
              metric_id: findMetricId('clicked-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'email-openers-30': {
      name: `Email Openers (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('opened-email', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'email-openers-60': {
      name: `Email Openers (60 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('opened-email', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'email-clickers-30': {
      name: `Email Clickers (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('clicked-email', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'email-clickers-60': {
      name: `Email Clickers (60 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('clicked-email', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'site-visitors-30': {
      name: `Site Visitors (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('active-on-site', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'never-engaged': {
      name: `Never Engaged | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: findMetricId('clicked-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    // =====================================
    // SHOPPING BEHAVIOR (18)
    // =====================================
    
    'high-value-cart': {
      name: `High-Value Cart Abandoners (${currencySymbol}100+) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('started-checkout', metricMap),
            operator: 'greater-than',
            quantity: 0,
            value: 100,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'recent-first-time': {
      name: `Recent First-Time Buyers (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'equals',
            quantity: 1,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'coupon-users': {
      name: `Coupon Users | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.used_discount_code',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'full-price-buyers': {
      name: `Full-Price Buyers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
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
        }],
        fallback: 'skip'
      }
    },
    
    'multi-category-shoppers': {
      name: `Multi-Category Shoppers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.unique_categories_purchased',
            operator: 'greater-than',
            value: 1
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'frequent-site-visitors': {
      name: `Frequent Site Visitors (10+ Visits/Month) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('active-on-site', metricMap),
            operator: 'greater-than',
            quantity: 9,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'product-reviewers': {
      name: `Product Reviewers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.left_review',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'non-reviewers': {
      name: `Non-Reviewers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.left_review',
            operator: 'equals',
            value: false
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'browse-abandoners': {
      name: `Browse Abandoners | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('viewed-product', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 14, unit: 'days' }
            },
            {
              metric_id: findMetricId('started-checkout', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 14, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'new-subscribers': {
      name: `New Subscribers (7 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('subscribed', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'all-customers': {
      name: `All Customers (PUR â‰¥ 1) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'active-customers-90': {
      name: `Active Customers (90 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'recent-purchasers-30': {
      name: `Recent Purchasers (30 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'gift-buyers': {
      name: `Gift Buyers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.used_gift_message',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'mobile-shoppers': {
      name: `Mobile Shoppers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.primary_device',
            operator: 'equals',
            value: 'mobile'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'desktop-shoppers': {
      name: `Desktop Shoppers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.primary_device',
            operator: 'equals',
            value: 'desktop'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'category-buyers': {
      name: `Category Buyers | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.favorite_category',
            operator: 'is-set',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    // =====================================
    // VALUE & LIFECYCLE (15)
    // =====================================
    
    'big-spenders': {
      name: `Big Spenders (Top 20% AOV) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            aggregation: 'average',
            value: 150,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'bargain-shoppers': {
      name: `Bargain Shoppers (Bottom 20% AOV) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'less-than',
            quantity: 0,
            aggregation: 'average',
            value: 50,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'high-churn-risk': {
      name: `High Churn Risk | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            },
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'predicted-vips': {
      name: `Predicted VIPs | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'predicted_lifetime_value',
            operator: 'greater-than',
            value: 500
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'churned-customers': {
      name: `Churned Customers (180+ Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 180, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'high-aov': {
      name: `High AOV (${currencySymbol}100+) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            aggregation: 'average',
            value: 100,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'low-aov': {
      name: `Low AOV (<${currencySymbol}50) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'less-than',
            quantity: 0,
            aggregation: 'average',
            value: 50,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'high-lifetime-value': {
      name: `High Lifetime Value (Top 10%) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            aggregation: 'sum',
            value: 1000,
            timeframe: { key: 'since', value: null }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'growing-customers': {
      name: `Growing Customers (Increasing Frequency) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.purchase_frequency_trend',
            operator: 'equals',
            value: 'increasing'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'declining-customers': {
      name: `Declining Customers (Decreasing Frequency) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.purchase_frequency_trend',
            operator: 'equals',
            value: 'decreasing'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'win-back-target': {
      name: `Win-Back Target (60-180 Days) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'greater-than',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'at-risk-vips': {
      name: `At-Risk VIPs | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              field: 'predicted_lifetime_value',
              operator: 'greater-than',
              value: 500
            },
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'rising-stars': {
      name: `Rising Stars (New + Highly Engaged) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('placed-order', metricMap),
              operator: 'equals',
              quantity: 1,
              timeframe: { key: 'in_the_last', value: 60, unit: 'days' }
            },
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'greater-than',
              quantity: 3,
              timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'active-customers-lifecycle': {
      name: `Active Customers (Lifecycle) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 90, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'recent-purchasers-lifecycle': {
      name: `Recent Purchasers (Lifecycle) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 30, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    // =====================================
    // DEMOGRAPHICS & PROFILE (8)
    // =====================================
    
    'gender-female': {
      name: `Gender - Female | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.gender',
            operator: 'equals',
            value: 'female'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'gender-male': {
      name: `Gender - Male | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.gender',
            operator: 'equals',
            value: 'male'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'location-country': {
      name: `Location - By Country | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'location.country',
            operator: 'is-set',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'location-region': {
      name: `Location - By Region | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'location.region',
            operator: 'is-set',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'birthday-this-month': {
      name: `Birthday This Month | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.birth_month',
            operator: 'equals',
            value: new Date().getMonth() + 1
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'birthday-this-week': {
      name: `Birthday This Week | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.birth_date',
            operator: 'in-the-next',
            value: 7,
            unit: 'days'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'age-18-24': {
      name: `Age Group - 18-24 | Aderai`,
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
        }],
        fallback: 'skip'
      }
    },
    
    'age-25-34': {
      name: `Age Group - 25-34 | Aderai`,
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
              value: 34
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    // =====================================
    // EXCLUSION SEGMENTS (12)
    // =====================================
    
    'unsubscribed': {
      name: `ðŸš« Unsubscribed | Aderai`,
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
    
    'suppressed': {
      name: `ðŸš« Suppressed | Aderai`,
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
    
    'bounced': {
      name: `ðŸš« Email Bounced | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'subscriptions.email.marketing.suppression.reason',
            operator: 'contains',
            value: 'bounce'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'marked-spam': {
      name: `ðŸš« Marked as Spam | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'subscriptions.email.marketing.suppression.reason',
            operator: 'contains',
            value: 'spam'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'never-engaged-exclusion': {
      name: `ðŸš« Never Engaged (Exclusion) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [
            {
              metric_id: findMetricId('opened-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            },
            {
              metric_id: findMetricId('clicked-email', metricMap),
              operator: 'equals',
              quantity: 0,
              timeframe: { key: 'since', value: null }
            }
          ]
        }],
        fallback: 'skip'
      }
    },
    
    'do-not-email': {
      name: `ðŸš« Do Not Email | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.do_not_email',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'recent-purchasers-7-exclusion': {
      name: `ðŸš« Recent Purchasers (7 Days - Exclusion) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('placed-order', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 7, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'used-bfcm-code': {
      name: `ðŸš« Already Used BFCM Code | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.used_promo_code',
            operator: 'contains',
            value: 'BFCM'
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'checkout-abandoners-1-day': {
      name: `ðŸš« Checkout Abandoners (1 Day - Too Recent) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            metric_id: findMetricId('started-checkout', metricMap),
            operator: 'greater-than',
            quantity: 0,
            timeframe: { key: 'in_the_last', value: 1, unit: 'days' }
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'sms-only': {
      name: `ðŸš« SMS Only (No Email) | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.prefers_sms',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'outside-shipping-zone': {
      name: `ðŸš« Outside Shipping Zone | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.can_ship_to',
            operator: 'equals',
            value: false
          }]
        }],
        fallback: 'skip'
      }
    },
    
    'refund-requesters': {
      name: `ðŸš« Refund Requesters | Aderai`,
      definition: {
        condition_groups: [{
          conditions: [{
            field: 'properties.requested_refund',
            operator: 'equals',
            value: true
          }]
        }],
        fallback: 'skip'
      }
    }
  };

  return definitions[segmentId] || null;
}

async function createKlaviyoSegment(apiKey, segmentId, metricMap, currencySymbol, settings) {
  const segmentDef = getSegmentDefinition(segmentId, metricMap, currencySymbol, settings);
  
  if (!segmentDef) {
    return {
      segmentId,
      status: 'error',
      message: `Segment definition not found: ${segmentId}`
    };
  }

  let definition = segmentDef.definition;
  
  const hasRequiredMetrics = checkMetricsExist(definition, metricMap);
  
  if (!hasRequiredMetrics && segmentDef.definition.fallback) {
    if (segmentDef.definition.fallback === 'skip') {
      return {
        segmentId,
        status: 'skipped',
        message: `Required metrics not available for ${segmentDef.name}`
      };
    }
    definition = segmentDef.definition.fallback;
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/segment-definitions/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: {
          type: 'segment-definition',
          attributes: {
            name: segmentDef.name,
            definition
          }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        segmentId,
        status: 'success',
        message: `Created: ${segmentDef.name}`,
        klaviyoId: data.data.id
      };
    } else if (response.status === 409) {
      return {
        segmentId,
        status: 'success',
        message: `Already exists: ${segmentDef.name}`
      };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return {
      segmentId,
      status: 'error',
      message: `Failed to create ${segmentDef.name}: ${error.message}`
    };
  }
}

function checkMetricsExist(definition, metricMap) {
  if (!definition.condition_groups) return true;
  
  for (const group of definition.condition_groups) {
    for (const condition of group.conditions) {
      if (condition.metric_id && !Object.values(metricMap).includes(condition.metric_id)) {
        return false;
      }
    }
  }
  return true;
}

async function suggestSegmentsWithAI(env, apiKey, answers) {
  const metricMap = await detectAvailableMetrics(apiKey);
  
  const prompt = `You are an expert email marketing strategist.

TASK: Suggest 3-5 custom Klaviyo segments for this brand.

CONTEXT:
- Goal: ${answers.goal}
- Industry: ${answers.industry}
- Challenge: ${answers.challenge}
- Frequency: ${answers.frequency}
- Behaviors: ${answers.specific}

AVAILABLE METRICS:
${Object.keys(metricMap).join(', ')}

Respond with valid JSON only (no markdown).`;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!openaiResponse.ok) {
    throw new Error(`OpenAI error: ${openaiResponse.status}`);
  }

  const aiData = await openaiResponse.json();
  let responseText = aiData.choices[0].message.content;
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(responseText);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  
  // Get env vars - Cloudflare makes them available globally
  const env = { OPENAI_API_KEY: typeof OPENAI_API_KEY !== 'undefined' ? OPENAI_API_KEY : '' };

  if (url.pathname === '/validate-key' && request.method === 'POST') {
    try {
      const { apiKey } = await request.json();
      await detectAvailableMetrics(apiKey);
      return new Response(JSON.stringify({ valid: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ valid: false, error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  if (url.pathname === '/ai/suggest-segments' && request.method === 'POST') {
    try {
      const { apiKey, answers } = await request.json();
      const suggestions = await suggestSegmentsWithAI(env, apiKey, answers);
      return new Response(JSON.stringify(suggestions), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  if (url.pathname === '/ai/create-segment' && request.method === 'POST') {
    try {
      const { apiKey, segment } = await request.json();
      
      const response = await fetch('https://a.klaviyo.com/api/segment-definitions/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2024-10-15'
        },
        body: JSON.stringify({
          data: {
            type: 'segment-definition',
            attributes: {
              name: `${segment.name} | Aderai AI`,
              definition: segment.conditions
            }
          }
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { apiKey, segments, settings = {} } = await request.json();
      
      const currencySymbol = settings.currencySymbol || '$';
      const aov = settings.aov || 100;
      const vipThreshold = settings.vipThreshold || 1000;
      const highValueThreshold = settings.highValueThreshold || 500;
      const newCustomerDays = settings.newCustomerDays || 60;
      const lapsedDays = settings.lapsedDays || 90;
      const churnedDays = settings.churnedDays || 180;

      if (!apiKey || !segments || !Array.isArray(segments)) {
        return new Response(JSON.stringify({
          error: 'Invalid request'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const metricMap = await detectAvailableMetrics(apiKey);
      const results = [];
      let successCount = 0, skipCount = 0, errorCount = 0;

      for (const segmentId of segments) {
        const result = await createKlaviyoSegment(
          apiKey, segmentId, metricMap, currencySymbol,
          { aov, vipThreshold, highValueThreshold, newCustomerDays, lapsedDays, churnedDays }
        );
        
        results.push(result);
        if (result.status === 'success') successCount++;
        else if (result.status === 'skipped') skipCount++;
        else errorCount++;
        
        await new Promise(r => setTimeout(r, 250));
      }

      return new Response(JSON.stringify({
        success: true,
        summary: {
          total: segments.length,
          created: successCount,
          skipped: skipCount,
          failed: errorCount
        },
        results
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}