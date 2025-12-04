/**
 * Segment Validation Utility
 * 
 * This file serves as the single source of truth for segment availability.
 * When adding/modifying segments, update this file FIRST, then update:
 * 1. src/lib/segmentData.ts (UI descriptions)
 * 2. supabase/functions/klaviyo-create-segments/index.ts (Klaviyo definitions)
 */

// Segments that CAN be created via Klaviyo API
export const CREATABLE_SEGMENTS = new Set([
  // Engagement & Activity
  'highly-engaged',
  'moderately-engaged',
  'low-engagement',
  'email-openers',
  'email-clickers',
  'sms-subscribers',
  'push-subscribers',
  'multi-channel',
  'email-only',
  'recent-website-visitors',
  'browse-abandoners',
  'cart-abandoners',
  'checkout-abandoners',
  'winback-candidates',
  
  // Demographics
  'mobile-users',
  'desktop-users',
  'gmail-users',
  'yahoo-users',
  'outlook-users',
  'corporate-email',
  'us-customers',
  'international-customers',
  
  // Customer Lifecycle & Value
  'new-subscribers',
  'first-time-buyers',
  'recent-first-time',
  'repeat-customers',
  'vip-customers',
  'high-value',
  'at-risk',
  'lapsed-customers',
  'churned-customers',
  'one-time-buyers',
  'loyal-customers',
  'engaged-non-buyers',
  'high-spenders',
  'low-spenders',
  'bargain-shoppers',
  
  // Shopping Behavior & Purchase History
  'frequent-buyers',
  'seasonal-shoppers',
  'holiday-shoppers',
  'sale-shoppers',
  'full-price-buyers',
  'discount-sensitive',
  'bulk-buyers',
  'small-order',
  'large-order',
  'recent-purchasers',
  'big-spenders',
  
  // Exclusion Segments
  'recent-purchasers-exclude',
  'unsubscribed-exclude',
  'bounced-exclude',
  'complained-exclude',
  'unengaged-exclusion',
  'new-subscriber-exclude',
  'vip-exclude',
  'sunset-segment',
]);

// Segments that CANNOT be created (missing metrics, predictive analytics, etc.)
export const UNAVAILABLE_SEGMENTS = new Set([
  // Require specific metrics not commonly available
  'product-reviewers',
  'non-reviewers',
  'refunded-customers',
  'negative-feedback',
  'cross-sell',
  'multi-category',
  'category-buyers',
  
  // Require Klaviyo Predictive Analytics (premium feature)
  'predicted-vips',
  'high-churn-risk',
  'likely-purchase-soon',
  'high-churn-risk-exclude',
  
  // Require manual location setup
  'location-proximity',
  'location-los-angeles',
  'location-chicago',
  'location-houston',
]);

// Segments with fallback definitions (will create alternative if primary metric unavailable)
export const FALLBACK_SEGMENTS = new Set([
  'product-reviewers',    // Falls back to Repeat Buyers
  'non-reviewers',        // Falls back to One-Time Buyers
  'refunded-customers',   // Falls back to Single Purchase
  'negative-feedback',    // Falls back to Unengaged 60d
]);

/**
 * Validates segment data consistency
 * Run this during development to catch mismatches
 */
export function validateSegmentData(
  uiSegments: { id: string; available?: boolean }[],
  edgeFunctionSegmentIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const segment of uiSegments) {
    const isCreatable = CREATABLE_SEGMENTS.has(segment.id);
    const isUnavailable = UNAVAILABLE_SEGMENTS.has(segment.id);
    const hasEdgeDefinition = edgeFunctionSegmentIds.includes(segment.id);
    const uiMarkedAvailable = segment.available !== false;
    
    // Check: UI availability matches our registry
    if (uiMarkedAvailable && isUnavailable) {
      errors.push(`${segment.id}: UI marks as available but registered as UNAVAILABLE`);
    }
    
    if (!uiMarkedAvailable && isCreatable) {
      errors.push(`${segment.id}: UI marks as unavailable but registered as CREATABLE`);
    }
    
    // Check: Edge function has definition for creatable segments
    if (isCreatable && !hasEdgeDefinition) {
      errors.push(`${segment.id}: Registered as CREATABLE but missing edge function definition`);
    }
    
    // Check: Edge function should NOT have definition for unavailable segments
    if (isUnavailable && hasEdgeDefinition && !FALLBACK_SEGMENTS.has(segment.id)) {
      errors.push(`${segment.id}: Registered as UNAVAILABLE but has edge function definition`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a segment can be created
 */
export function canCreateSegment(segmentId: string): boolean {
  return CREATABLE_SEGMENTS.has(segmentId);
}

/**
 * Check if a segment has fallback logic
 */
export function hasFallback(segmentId: string): boolean {
  return FALLBACK_SEGMENTS.has(segmentId);
}

/**
 * Get segment status for debugging
 */
export function getSegmentStatus(segmentId: string): 'creatable' | 'unavailable' | 'fallback' | 'unknown' {
  if (FALLBACK_SEGMENTS.has(segmentId)) return 'fallback';
  if (CREATABLE_SEGMENTS.has(segmentId)) return 'creatable';
  if (UNAVAILABLE_SEGMENTS.has(segmentId)) return 'unavailable';
  return 'unknown';
}
