/**
 * Segment Validation Utility
 * 
 * This file serves as the single source of truth for segment availability.
 * When adding/modifying segments, update this file FIRST, then update:
 * 1. src/lib/segmentData.ts (UI descriptions)
 * 2. supabase/functions/klaviyo-create-segments/index.ts (Klaviyo definitions)
 */

// Segments that CAN be created via Klaviyo API (57 total - matches segmentData.ts)
export const CREATABLE_SEGMENTS = new Set([
  // Engagement & Activity (14 segments)
  'engaged-30-days',
  'engaged-60-days',
  'engaged-90-days',
  'highly-engaged',
  'recent-clickers-90',
  'engaged-non-buyers',
  'active-site-30',
  'unengaged-90',
  'unengaged-180',
  'email-openers-30',
  'email-openers-60',
  'email-clickers-30',
  'email-clickers-60',
  'site-visitors-30',
  
  // Demographics (6 creatable, 2 unavailable)
  'gender-male',
  'gender-female',
  'gender-uncertain',
  'location-country',
  'age-18-24',
  'age-25-40',
  
  // Customer Lifecycle & Value (12 creatable, 3 unavailable)
  'new-subscribers',
  'recent-first-time',
  'repeat-customers',
  'one-time-buyers',
  'active-customers',
  'lapsed-customers',
  'churned-customers',
  'vip-customers',
  'big-spenders',
  'bargain-shoppers',
  'high-aov',
  'low-aov',
  
  // Shopping Behavior & Purchase History (15 creatable, 3 unavailable)
  'all-customers',
  'never-purchased',
  'recent-purchasers-30',
  'abandoned-cart',
  'abandoned-cart-high-value',
  'abandoned-checkout',
  'abandoned-checkout-high-value',
  'browse-abandonment',
  'category-interest',
  'product-interest',
  'frequent-visitors',
  'coupon-users',
  'full-price-buyers',
  'product-reviewers',
  'non-reviewers',
  
  // Exclusion Segments (10 creatable, 2 unavailable)
  'unsubscribed',
  'bounced-emails',
  'not-opted-in',
  'recent-purchasers-exclude',
  'refunded-customers',
  'unengaged-exclusion',
  'sunset-segment',
  'received-5-opened-0',
  'received-3-in-3-days',
  'marked-spam',
]);

// Segments that CANNOT be created (require manual Klaviyo setup or predictive analytics)
export const UNAVAILABLE_SEGMENTS = new Set([
  // Demographics - require manual Klaviyo setup
  'location-proximity',    // Requires coordinate setup in Klaviyo UI
  'birthday-month',        // Must be created manually in Klaviyo
  
  // Customer Lifecycle - require Klaviyo Predictive Analytics (premium)
  'high-churn-risk',       // Requires predictive analytics
  'likely-purchase-soon',  // Requires predictive analytics
  'predicted-vips',        // Requires predictive analytics
  
  // Shopping Behavior - require manual category setup
  'cross-sell',            // Requires manual category mapping
  'category-buyers',       // Requires manual category setup
  'multi-category',        // Requires manual category tracking
  
  // Exclusion - require manual setup or predictive analytics
  'high-churn-risk-exclude', // Requires predictive analytics
  'negative-feedback',     // Requires manual feedback tracking in Klaviyo
]);

// Note: Fallback segments removed - per spec, segments return null if metric unavailable
export const FALLBACK_SEGMENTS = new Set<string>([
  // No fallbacks - segments simply won't be created if metrics don't exist
]);

/**
 * Validates segment data consistency between UI and edge function
 * Run this during development to catch mismatches
 */
export function validateSegmentData(
  uiSegments: { id: string; unavailable?: boolean }[],
  edgeFunctionSegmentIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const segment of uiSegments) {
    const isCreatable = CREATABLE_SEGMENTS.has(segment.id);
    const isUnavailable = UNAVAILABLE_SEGMENTS.has(segment.id);
    const hasEdgeDefinition = edgeFunctionSegmentIds.includes(segment.id);
    const uiMarkedUnavailable = segment.unavailable === true;
    
    // Check: UI unavailable flag matches our registry
    if (uiMarkedUnavailable && isCreatable) {
      errors.push(`${segment.id}: UI marks as unavailable but registered as CREATABLE`);
    }
    
    if (!uiMarkedUnavailable && isUnavailable) {
      errors.push(`${segment.id}: UI marks as available but registered as UNAVAILABLE`);
    }
    
    // Check: Edge function has definition for creatable segments
    if (isCreatable && !hasEdgeDefinition) {
      errors.push(`${segment.id}: Registered as CREATABLE but missing edge function definition`);
    }
    
    // Check: Edge function should NOT have non-null definition for unavailable segments
    if (isUnavailable && hasEdgeDefinition && !FALLBACK_SEGMENTS.has(segment.id)) {
      errors.push(`${segment.id}: Registered as UNAVAILABLE but has edge function definition`);
    }
    
    // Check: Segment ID exists in one of the sets
    if (!isCreatable && !isUnavailable) {
      errors.push(`${segment.id}: Not registered in CREATABLE or UNAVAILABLE sets`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a segment can be created via Klaviyo API
 */
export function canCreateSegment(segmentId: string): boolean {
  return CREATABLE_SEGMENTS.has(segmentId);
}

/**
 * Check if a segment has fallback logic when primary metric unavailable
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

/**
 * Get all segment IDs that should exist in the system
 */
export function getAllSegmentIds(): string[] {
  return [...CREATABLE_SEGMENTS, ...UNAVAILABLE_SEGMENTS];
}

/**
 * Validate that a segment ID exists in the registry
 */
export function isKnownSegment(segmentId: string): boolean {
  return CREATABLE_SEGMENTS.has(segmentId) || UNAVAILABLE_SEGMENTS.has(segmentId);
}
