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
  'Refunded Order': 'refunded_order',
  'Left Review': 'left_review',
};

// Aderai branding suffix and tag
const ADERAI_SUFFIX = ' | Aderai';
const ADERAI_TAG = 'Aderai';

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
  const refundedOrderId = findMetricId('Refunded Order', metricMap);
  const leftReviewId = findMetricId('Left Review', metricMap);

  const definitions: Record<string, any> = {
    // ENGAGEMENT & ACTIVITY SEGMENTS (14)
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
    'engaged-60-days': {
      name: 'Engaged (Last 60 Days)',
      definition: {
        type: 'any',
        groups: [{
          type: 'any',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 60, time_unit: 'days' },
            { type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 60, time_unit: 'days' },
          ],
        }],
      },
    },
    'engaged-90-days': {
      name: 'Engaged (Last 90 Days)',
      definition: {
        type: 'any',
        groups: [{
          type: 'any',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' },
            { type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' },
          ],
        }],
      },
    },
    'highly-engaged': {
      name: 'Highly Engaged',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: openedEmailId, operator: 'greater-or-equal', count: 5, time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'recent-clickers-90': {
      name: 'Recent Email Clickers (Last 90 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' }] }],
      },
    },
    'engaged-non-buyers': {
      name: 'Engaged Non-Buyers',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'all_time' },
          ],
        }],
      },
    },
    'active-site-30': {
      name: 'Active on Site (Last 30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: activeOnSiteId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'unengaged-90': {
      name: 'Unengaged (90+ Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: openedEmailId, operator: 'has-not-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' }] }],
      },
    },
    'unengaged-180': {
      name: 'Unengaged (180+ Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: openedEmailId, operator: 'has-not-performed', time_period: 'within_last', time_value: 180, time_unit: 'days' }] }],
      },
    },
    'email-openers-30': {
      name: 'Email Openers (30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'email-openers-60': {
      name: 'Email Openers (60 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: openedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 60, time_unit: 'days' }] }],
      },
    },
    'email-clickers-30': {
      name: 'Email Clickers (30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'email-clickers-60': {
      name: 'Email Clickers (60 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: clickedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 60, time_unit: 'days' }] }],
      },
    },
    'site-visitors-30': {
      name: 'Site Visitors (30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: activeOnSiteId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },

    // DEMOGRAPHICS (8)
    'gender-male': {
      name: 'Gender - Male',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_gender', operator: 'equals', value: 'male' }] }],
      },
    },
    'gender-female': {
      name: 'Gender - Female',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_gender', operator: 'equals', value: 'female' }] }],
      },
    },
    'gender-uncertain': {
      name: 'Gender - Uncertain',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_gender', operator: 'is-not-set' }] }],
      },
    },
    'location-country': {
      name: 'Location - By Country (Customizable)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: '$country', operator: 'equals', value: 'US' }] }],
      },
    },
    'location-proximity': {
      name: 'Location - Proximity Radius (Customizable)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: '$city', operator: 'is-set' }] }],
      },
    },
    'birthday-month': {
      name: 'Birthday This Month',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: '$birthday_month', operator: 'equals', value: new Date().getMonth() + 1 }] }],
      },
    },
    'age-18-24': {
      name: 'Age Group 18-24',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: '$age', operator: 'between', value_min: 18, value_max: 24 }] }],
      },
    },
    'age-25-40': {
      name: 'Age Group 25-40',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: '$age', operator: 'between', value_min: 25, value_max: 40 }] }],
      },
    },

    // CUSTOMER LIFECYCLE & VALUE (15)
    'new-subscribers': {
      name: 'New Subscribers',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'property', property: '$created', operator: 'within_last', time_value: 30, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'all_time' },
          ],
        }],
      },
    },
    'recent-first-time': {
      name: 'Recent First-Time Customers',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: placedOrderId, operator: 'equals', count: 1, time_period: 'all_time' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
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
    'active-customers': {
      name: 'Active Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' }] }],
      },
    },
    'lapsed-customers': {
      name: 'Lapsed Customers',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'all_time' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 180, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 365, time_unit: 'days' },
          ],
        }],
      },
    },
    'churned-customers': {
      name: 'Churned Customers',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'all_time' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 365, time_unit: 'days' },
          ],
        }],
      },
    },
    'vip-customers': {
      name: 'VIP Customers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 5, time_period: 'all_time' }] }],
      },
    },
    'big-spenders': {
      name: `Big Spenders (${currencySymbol}${settings.vipThreshold || 1000}+)`,
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric_property', metric_id: placedOrderId, operator: 'greater-than', property: 'value', value: settings.vipThreshold || 1000, time_period: 'all_time' }] }],
      },
    },
    'bargain-shoppers': {
      name: `Bargain Shoppers (<${currencySymbol}${settings.highValueThreshold || 500})`,
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric_property', metric_id: placedOrderId, operator: 'less-than', property: 'value', value: settings.highValueThreshold || 500, time_period: 'all_time' }] }],
      },
    },
    'high-churn-risk': {
      name: 'High Churn Risk',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_churn_risk', operator: 'equals', value: 'high' }] }],
      },
    },
    'likely-purchase-soon': {
      name: 'Likely to Purchase Soon',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_next_order_days', operator: 'less-than', value: 14 }] }],
      },
    },
    'predicted-vips': {
      name: 'Predicted VIPs',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_clv_365d', operator: 'greater-than', value: settings.vipThreshold || 1000 }] }],
      },
    },
    'high-aov': {
      name: `High AOV (>${currencySymbol}${settings.aov || 100})`,
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric_property', metric_id: placedOrderId, operator: 'greater-than', property: 'average_value', value: settings.aov || 100, time_period: 'all_time' }] }],
      },
    },
    'low-aov': {
      name: `Low AOV (<${currencySymbol}${settings.aov || 100})`,
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric_property', metric_id: placedOrderId, operator: 'less-than', property: 'average_value', value: settings.aov || 100, time_period: 'all_time' }] }],
      },
    },

    // SHOPPING BEHAVIOR & PURCHASE HISTORY (18)
    'all-customers': {
      name: 'All Customers (PUR ≥ 1)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'all_time' }] }],
      },
    },
    'never-purchased': {
      name: 'Never Purchased (Prospects)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'all_time' }] }],
      },
    },
    'recent-purchasers-30': {
      name: 'Recent Purchasers (Last 30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'abandoned-cart': {
      name: 'Abandoned Cart',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: addedToCartId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
          ],
        }],
      },
    },
    'abandoned-cart-high-value': {
      name: 'Abandoned Cart - High Value ($400+)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric_property', metric_id: addedToCartId, operator: 'greater-or-equal', property: 'value', value: 400, time_period: 'within_last', time_value: 30, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' },
          ],
        }],
      },
    },
    'abandoned-checkout': {
      name: 'Abandoned Checkout',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: startedCheckoutId, operator: 'has-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' },
          ],
        }],
      },
    },
    'abandoned-checkout-high-value': {
      name: 'Abandoned Checkout - High Value ($400+)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric_property', metric_id: startedCheckoutId, operator: 'greater-or-equal', property: 'value', value: 400, time_period: 'within_last', time_value: 7, time_unit: 'days' },
            { type: 'metric', metric_id: placedOrderId, operator: 'has-not-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' },
          ],
        }],
      },
    },
    'browse-abandonment': {
      name: 'Browse Abandonment',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: viewedProductId, operator: 'has-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' },
            { type: 'metric', metric_id: addedToCartId, operator: 'has-not-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' },
          ],
        }],
      },
    },
    'multi-purchasers-90': {
      name: 'Multi-Purchasers (90 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 2, time_period: 'within_last', time_value: 90, time_unit: 'days' }] }],
      },
    },
    'high-frequency-buyers': {
      name: 'High Frequency Buyers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 3, time_period: 'within_last', time_value: 180, time_unit: 'days' }] }],
      },
    },
    'first-purchase-high-value': {
      name: 'First Purchase - High Value ($200+)',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: placedOrderId, operator: 'equals', count: 1, time_period: 'all_time' },
            { type: 'metric_property', metric_id: placedOrderId, operator: 'greater-or-equal', property: 'value', value: 200, time_period: 'all_time' },
          ],
        }],
      },
    },
    'product-viewers-30': {
      name: 'Product Viewers (Last 30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: viewedProductId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'cart-adders-30': {
      name: 'Cart Adders (Last 30 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: addedToCartId, operator: 'has-performed', time_period: 'within_last', time_value: 30, time_unit: 'days' }] }],
      },
    },
    'checkout-starters-7': {
      name: 'Checkout Starters (Last 7 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: startedCheckoutId, operator: 'has-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' }] }],
      },
    },
    'refund-requesters': {
      name: 'Refund Requesters',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: refundedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 90, time_unit: 'days' }] }],
      },
    },
    'review-leavers': {
      name: 'Review Leavers',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: leftReviewId, operator: 'has-performed', time_period: 'all_time' }] }],
      },
    },
    'repeat-refunders': {
      name: 'Repeat Refunders',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: refundedOrderId, operator: 'greater-or-equal', count: 2, time_period: 'all_time' }] }],
      },
    },
    'seasonal-buyers': {
      name: 'Seasonal Buyers (Q4)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 365, time_unit: 'days' }] }],
      },
    },

    // EXCLUSION SEGMENTS (12)
    'do-not-email': {
      name: 'Do Not Email',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'consent', operator: 'equals', value: 'never_subscribed' }] }],
      },
    },
    'bounced-emails': {
      name: 'Bounced Emails',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'bounced', operator: 'equals', value: true }] }],
      },
    },
    'unsubscribed': {
      name: 'Unsubscribed',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'consent', operator: 'equals', value: 'unsubscribed' }] }],
      },
    },
    'recent-purchasers-exclude': {
      name: 'Recent Purchasers (Exclude)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'has-performed', time_period: 'within_last', time_value: 7, time_unit: 'days' }] }],
      },
    },
    'recent-email-recipients': {
      name: 'Recent Email Recipients (3 Days)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: receivedEmailId, operator: 'has-performed', time_period: 'within_last', time_value: 3, time_unit: 'days' }] }],
      },
    },
    'vip-exclude': {
      name: 'VIP Customers (Exclude)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: placedOrderId, operator: 'greater-or-equal', count: 5, time_period: 'all_time' }] }],
      },
    },
    'inactive-180': {
      name: 'Inactive 180+ Days',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'has-not-performed', time_period: 'within_last', time_value: 180, time_unit: 'days' },
            { type: 'metric', metric_id: clickedEmailId, operator: 'has-not-performed', time_period: 'within_last', time_value: 180, time_unit: 'days' },
          ],
        }],
      },
    },
    'sunset-segment': {
      name: 'Sunset Segment',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: openedEmailId, operator: 'between', count_min: 1, count_max: 3, time_period: 'within_last', time_value: 180, time_unit: 'days' },
          ],
        }],
      },
    },
    'high-churn-risk-exclude': {
      name: 'High Churn Risk (Exclusion)',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'predicted_churn_risk', operator: 'equals', value: 'high' }] }],
      },
    },
    'received-5-opened-0': {
      name: 'Received 5, Opened 0',
      definition: {
        type: 'all',
        groups: [{
          type: 'all',
          conditions: [
            { type: 'metric', metric_id: receivedEmailId, operator: 'greater-or-equal', count: 5, time_period: 'all_time' },
            { type: 'metric', metric_id: openedEmailId, operator: 'has-not-performed', time_period: 'all_time' },
          ],
        }],
      },
    },
    'received-3-in-3-days': {
      name: 'Received 3 in Last 3 Days',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'metric', metric_id: receivedEmailId, operator: 'greater-or-equal', count: 3, time_period: 'within_last', time_value: 3, time_unit: 'days' }] }],
      },
    },
    'marked-spam': {
      name: 'Marked Spam',
      definition: {
        type: 'all',
        groups: [{ type: 'all', conditions: [{ type: 'property', property: 'marked_spam', operator: 'equals', value: true }] }],
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
    return { error: 'Segment definition not found', status: 'error', segmentId };
  }

  const hasAllMetrics = definition.definition.groups.every((group: any) =>
    group.conditions.every((cond: any) => !cond.metric_id || cond.metric_id)
  );

  if (!hasAllMetrics) {
    return { error: 'Required metrics not available in your Klaviyo account', status: 'missing_metrics', segmentId };
  }

  // Add Aderai suffix and tag to the segment name
  const segmentNameWithBranding = definition.name + ADERAI_SUFFIX;

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
          attributes: {
            ...definition,
            name: segmentNameWithBranding,
            tags: [ADERAI_TAG],
          } 
        } 
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        return { status: 'exists', name: segmentNameWithBranding, segmentId };
      }
      const errorText = await response.text();
      console.error(`Klaviyo API error for ${segmentId}:`, errorText);
      return { error: `Failed to create segment: ${errorText}`, status: 'error', segmentId };
    }

    const data = await response.json();
    console.log(`Successfully created segment: ${segmentNameWithBranding}`);
    return { status: 'created', name: segmentNameWithBranding, data, segmentId, klaviyoId: data.data?.id };
  } catch (error) {
    console.error(`Error creating segment ${segmentId}:`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error', status: 'error', segmentId };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { apiKey, segmentIds, currencySymbol, settings, userId, klaviyoKeyId } = await req.json();

    if (apiKey && isEncrypted(apiKey)) {
      console.log('Decrypting API key...');
      apiKey = await decryptApiKey(apiKey);
    }

    if (!apiKey || !segmentIds || !Array.isArray(segmentIds)) {
      return new Response(
        JSON.stringify({ error: 'Missing apiKey or segmentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating ${segmentIds.length} segments in Klaviyo with Aderai branding...`);

    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics/', {
      headers: { 'Authorization': `Klaviyo-API-Key ${apiKey}`, 'revision': '2024-10-15' },
    });

    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch metrics from Klaviyo');
    }

    const metricsData = await metricsResponse.json();
    const metricMap = new Map<string, string>();
    metricsData.data.forEach((metric: any) => {
      metricMap.set(metric.id, metric.attributes.name);
    });

    console.log(`Found ${metricMap.size} Klaviyo metrics`);

    const results = await Promise.all(
      segmentIds.map((id: string) =>
        createKlaviyoSegment(apiKey, id, metricMap, currencySymbol || '$', settings || {})
      )
    );

    const successCount = results.filter(r => r.status === 'created').length;
    const existsCount = results.filter(r => r.status === 'exists').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`Segment creation complete: ${successCount} created, ${existsCount} already exist, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ results, summary: { created: successCount, exists: existsCount, errors: errorCount } }),
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