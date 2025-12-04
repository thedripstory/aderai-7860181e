export interface UserSegmentSettings {
  currencySymbol: string;
  highValueThreshold: number;
  vipThreshold: number;
  aov: number;
  lapsedDays: number;
  churnedDays: number;
  newCustomerDays: number;
}

export const DEFAULT_SEGMENT_SETTINGS: UserSegmentSettings = {
  currencySymbol: '$',
  highValueThreshold: 500,
  vipThreshold: 1000,
  aov: 100,
  lapsedDays: 90,
  churnedDays: 180,
  newCustomerDays: 60,
};

// Transform a segment's text fields with user settings
export function applySegmentSettings(segment: Segment, settings: UserSegmentSettings): Segment {
  const replacements: Record<string, string> = {
    '{currencySymbol}': settings.currencySymbol,
    '{highValueThreshold}': settings.highValueThreshold.toString(),
    '{vipThreshold}': settings.vipThreshold.toString(),
    '{aov}': settings.aov.toString(),
    '{lapsedDays}': settings.lapsedDays.toString(),
    '{churnedDays}': settings.churnedDays.toString(),
    '{newCustomerDays}': settings.newCustomerDays.toString(),
  };

  let description = segment.description;
  let definition = segment.definition;

  Object.entries(replacements).forEach(([placeholder, value]) => {
    description = description.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    definition = definition.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });

  return {
    ...segment,
    description,
    definition,
  };
}

// Transform all segments with user settings
export function applySettingsToSegments(segments: Segment[], settings: UserSegmentSettings): Segment[] {
  return segments.map(segment => applySegmentSettings(segment, settings));
}

export const SEGMENTS: Segment[] = [
  // ENGAGEMENT & ACTIVITY (14 segments)
  {
    id: "engaged-30-days",
    name: "Engaged (Last 30 Days)",
    description: "Opened or clicked email in last 30 days",
    category: "Engagement & Activity",
    icon: "📧",
    definition: "Opened or clicked email within 30 days",
  },
  {
    id: "engaged-60-days",
    name: "Engaged (Last 60 Days)",
    description: "Opened or clicked email in last 60 days",
    category: "Engagement & Activity",
    icon: "📬",
    definition: "Opened or clicked email within 60 days",
  },
  {
    id: "engaged-90-days",
    name: "Engaged (Last 90 Days)",
    description: "Opened or clicked email in last 90 days",
    category: "Engagement & Activity",
    icon: "📮",
    definition: "Opened or clicked email within 90 days",
  },
  {
    id: "highly-engaged",
    name: "Highly Engaged",
    description: "Opened email 5+ times in last 30 days",
    category: "Engagement & Activity",
    icon: "🔥",
    definition: "5+ email opens in 30 days",
  },
  {
    id: "recent-clickers-90",
    name: "Recent Email Clickers (Last 90 Days)",
    description: "Clicked email in last 90 days",
    category: "Engagement & Activity",
    icon: "👆",
    definition: "Clicked email within 90 days",
  },
  {
    id: "engaged-non-buyers",
    name: "Engaged Non-Buyers",
    description: "Opens/clicks emails but never purchased",
    category: "Engagement & Activity",
    icon: "💡",
    definition: "Engaged but 0 purchases all time",
  },
  {
    id: "active-site-30",
    name: "Active on Site (Last 30 Days)",
    description: "Active on site in last 30 days",
    category: "Engagement & Activity",
    icon: "🌐",
    definition: "Site activity within 30 days",
  },
  {
    id: "unengaged-90",
    name: "Unengaged (90+ Days)",
    description: "No opens in last 90 days",
    category: "Engagement & Activity",
    icon: "😴",
    definition: "No email opens in 90+ days",
  },
  {
    id: "unengaged-180",
    name: "Unengaged (180+ Days)",
    description: "No opens in last 180 days",
    category: "Engagement & Activity",
    icon: "💤",
    definition: "No email opens in 180+ days",
  },
  {
    id: "email-openers-30",
    name: "Email Openers (30 Days)",
    description: "Opened in last 30 days",
    category: "Engagement & Activity",
    icon: "👀",
    definition: "Email opens within 30 days",
  },
  {
    id: "email-openers-60",
    name: "Email Openers (60 Days)",
    description: "Opened in last 60 days",
    category: "Engagement & Activity",
    icon: "👁️",
    definition: "Email opens within 60 days",
  },
  {
    id: "email-clickers-30",
    name: "Email Clickers (30 Days)",
    description: "Clicked in last 30 days",
    category: "Engagement & Activity",
    icon: "🖱️",
    definition: "Email clicks within 30 days",
  },
  {
    id: "email-clickers-60",
    name: "Email Clickers (60 Days)",
    description: "Clicked in last 60 days",
    category: "Engagement & Activity",
    icon: "🖲️",
    definition: "Email clicks within 60 days",
  },
  {
    id: "site-visitors-30",
    name: "Site Visitors (30 Days)",
    description: "Visited site in last 30 days",
    category: "Engagement & Activity",
    icon: "🏠",
    definition: "Site visits within 30 days",
  },

  // DEMOGRAPHICS (8 segments)
  {
    id: "gender-male",
    name: "Gender - Male",
    description: "Predicted gender likely male",
    category: "Demographics",
    icon: "👨",
    definition: "Predicted gender = male",
  },
  {
    id: "gender-female",
    name: "Gender - Female",
    description: "Predicted gender likely female",
    category: "Demographics",
    icon: "👩",
    definition: "Predicted gender = female",
  },
  {
    id: "gender-uncertain",
    name: "Gender - Uncertain",
    description: "Gender unknown",
    category: "Demographics",
    icon: "❓",
    definition: "Predicted gender = unknown",
  },
  {
    id: "location-country",
    name: "Location - By Country",
    description: "Filter by specific country",
    category: "Demographics",
    icon: "🌍",
    definition: "Country = [your selection]",
    requiresInput: {
      type: 'text',
      label: 'Country Name',
      placeholder: 'e.g., United States, United Kingdom, Canada',
      defaultValue: 'United States'
    }
  },
  {
    id: "location-proximity",
    name: "Location - Proximity Radius (Manual Only)",
    description: "Within X miles of location - Requires coordinates setup in Klaviyo",
    category: "Demographics",
    icon: "📍",
    definition: "Not supported via API - create in Klaviyo UI",
    unavailable: true,
  },
  {
    id: "birthday-month",
    name: "Birthday This Month (Manual Only)",
    description: "Birthday in current month - Must be created manually in Klaviyo",
    category: "Demographics",
    icon: "🎂",
    definition: "Not supported via API - create in Klaviyo UI",
    unavailable: true,
  },
  {
    id: "age-18-24",
    name: "Age Group 18-24",
    description: "Born between specific dates for age range",
    category: "Demographics",
    icon: "🧒",
    definition: "Age between 18-24",
  },
  {
    id: "age-25-40",
    name: "Age Group 25-40",
    description: "Born between specific dates for age range",
    category: "Demographics",
    icon: "🧑",
    definition: "Age between 25-40",
  },

  // CUSTOMER LIFECYCLE & VALUE (15 segments)
  {
    id: "new-subscribers",
    name: "New Subscribers",
    description: "Joined list in last {newCustomerDays} days, never purchased",
    category: "Customer Lifecycle & Value",
    icon: "🌱",
    definition: "Subscribed within {newCustomerDays}d, 0 purchases",
  },
  {
    id: "recent-first-time",
    name: "Recent First-Time Customers",
    description: "Made first purchase in last {newCustomerDays} days",
    category: "Customer Lifecycle & Value",
    icon: "🎉",
    definition: "First purchase within {newCustomerDays} days",
  },
  {
    id: "repeat-customers",
    name: "Repeat Customers",
    description: "2+ purchases all time",
    category: "Customer Lifecycle & Value",
    icon: "🔄",
    definition: "Order count ≥ 2",
  },
  {
    id: "one-time-buyers",
    name: "One-Time Customers",
    description: "Exactly 1 purchase all time",
    category: "Customer Lifecycle & Value",
    icon: "1️⃣",
    definition: "Order count = 1",
  },
  {
    id: "active-customers",
    name: "Active Customers",
    description: "Purchased in last {lapsedDays} days",
    category: "Customer Lifecycle & Value",
    icon: "⚡",
    definition: "Purchase within {lapsedDays} days",
  },
  {
    id: "lapsed-customers",
    name: "Lapsed Customers",
    description: "Last purchase {lapsedDays}-{churnedDays} days ago",
    category: "Customer Lifecycle & Value",
    icon: "😴",
    definition: "Last purchase {lapsedDays}-{churnedDays} days ago",
  },
  {
    id: "churned-customers",
    name: "Churned Customers",
    description: "No purchase in {churnedDays}+ days",
    category: "Customer Lifecycle & Value",
    icon: "💔",
    definition: "No purchase in {churnedDays}+ days",
  },
  {
    id: "vip-customers",
    name: "VIP Customers",
    description: "Total spending greater than {currencySymbol}{vipThreshold}",
    category: "Customer Lifecycle & Value",
    icon: "👑",
    definition: "CLV > {currencySymbol}{vipThreshold}",
  },
  {
    id: "big-spenders",
    name: "Big Spenders",
    description: "Historic CLV greater than {currencySymbol}{vipThreshold}",
    category: "Customer Lifecycle & Value",
    icon: "💰",
    definition: "CLV > {currencySymbol}{vipThreshold}",
  },
  {
    id: "bargain-shoppers",
    name: "Bargain Shoppers",
    description: "Historic CLV less than {currencySymbol}{aov}",
    category: "Customer Lifecycle & Value",
    icon: "🏷️",
    definition: "CLV < {currencySymbol}{aov}",
  },
  {
    id: "high-churn-risk",
    name: "High Churn Risk",
    description: "Predictive analytics: high churn risk",
    category: "Customer Lifecycle & Value",
    icon: "⚠️",
    definition: "Predicted high churn probability",
    unavailable: true,
  },
  {
    id: "likely-purchase-soon",
    name: "Likely to Purchase Soon",
    description: "Expected next order within 14 days",
    category: "Customer Lifecycle & Value",
    icon: "🎯",
    definition: "Predicted next order < 14 days",
    unavailable: true,
  },
  {
    id: "predicted-vips",
    name: "Predicted VIPs",
    description: "High predicted CLV (next 365 days)",
    category: "Customer Lifecycle & Value",
    icon: "⭐",
    definition: "Predicted CLV high (365d)",
    unavailable: true,
  },
  {
    id: "high-aov",
    name: "High AOV",
    description: "Average order value greater than {currencySymbol}{highValueThreshold}",
    category: "Customer Lifecycle & Value",
    icon: "📈",
    definition: "AOV > {currencySymbol}{highValueThreshold}",
  },
  {
    id: "low-aov",
    name: "Low AOV",
    description: "Average order value less than {currencySymbol}{aov}",
    category: "Customer Lifecycle & Value",
    icon: "📉",
    definition: "AOV < {currencySymbol}{aov}",
  },

  // SHOPPING BEHAVIOR & PURCHASE HISTORY (18 segments)
  {
    id: "all-customers",
    name: "All Customers (PUR ≥ 1)",
    description: "Made at least 1 purchase",
    category: "Shopping Behavior & Purchase History",
    icon: "🛍️",
    definition: "Purchase count ≥ 1",
  },
  {
    id: "never-purchased",
    name: "Never Purchased (Prospects)",
    description: "Zero purchases all time",
    category: "Shopping Behavior & Purchase History",
    icon: "👤",
    definition: "Purchase count = 0",
  },
  {
    id: "recent-purchasers-30",
    name: "Recent Purchasers (Last 30 Days)",
    description: "Purchased in last 30 days",
    category: "Shopping Behavior & Purchase History",
    icon: "🆕",
    definition: "Purchase within 30 days",
  },
  {
    id: "abandoned-cart",
    name: "Abandoned Cart",
    description: "Added to cart but didn't purchase (last 30 days)",
    category: "Shopping Behavior & Purchase History",
    icon: "🛒",
    definition: "Added to cart, no purchase 30d",
  },
  {
    id: "abandoned-cart-high-value",
    name: "Abandoned Cart - High Value",
    description: "Cart value {currencySymbol}{highValueThreshold}+ but no purchase (last 30 days)",
    category: "Shopping Behavior & Purchase History",
    icon: "💎",
    definition: "Cart value {currencySymbol}{highValueThreshold}+, no purchase 30d",
  },
  {
    id: "abandoned-checkout",
    name: "Abandoned Checkout",
    description: "Started checkout but didn't complete (last 30 days)",
    category: "Shopping Behavior & Purchase History",
    icon: "🏁",
    definition: "Started checkout, no order 30d",
  },
  {
    id: "abandoned-checkout-high-value",
    name: "Abandoned Checkout - High Value",
    description: "Checkout value {currencySymbol}{highValueThreshold}+ but no complete (last 30 days)",
    category: "Shopping Behavior & Purchase History",
    icon: "💵",
    definition: "Checkout {currencySymbol}{highValueThreshold}+, no complete 30d",
  },
  {
    id: "browse-abandonment",
    name: "Browse Abandonment",
    description: "Viewed product in last 14 days but didn't add to cart",
    category: "Shopping Behavior & Purchase History",
    icon: "👁️",
    definition: "Viewed product, no cart add in 14d",
  },
  {
    id: "category-interest",
    name: "Product Browsers",
    description: "Viewed products 2+ times in last 30 days",
    category: "Shopping Behavior & Purchase History",
    icon: "🔍",
    definition: "2+ product views in 30d",
  },
  {
    id: "product-interest",
    name: "Repeat Product Viewers",
    description: "Viewed products 3+ times in last 30 days (high intent)",
    category: "Shopping Behavior & Purchase History",
    icon: "🎁",
    definition: "3+ product views in 30d",
  },
  {
    id: "cross-sell",
    name: "Cross-Sell Opportunity (Manual Only)",
    description: "Purchased category X but not category Y - Requires manual category setup",
    category: "Shopping Behavior & Purchase History",
    icon: "🔀",
    definition: "Not supported via API - create in Klaviyo UI",
    unavailable: true,
  },
  {
    id: "category-buyers",
    name: "Category Buyers (Manual Only)",
    description: "Purchased from specific category - Requires manual category setup",
    category: "Shopping Behavior & Purchase History",
    icon: "📦",
    definition: "Not supported via API - create in Klaviyo UI",
    unavailable: true,
  },
  {
    id: "multi-category",
    name: "Multi-Category Shoppers (Manual Only)",
    description: "Purchased from 2+ categories - Requires manual category setup",
    category: "Shopping Behavior & Purchase History",
    icon: "🎯",
    definition: "Not supported via API - create in Klaviyo UI",
    unavailable: true,
  },
  {
    id: "frequent-visitors",
    name: "Frequent Site Visitors",
    description: "Active on site 10+ times in last 30 days",
    category: "Shopping Behavior & Purchase History",
    icon: "🚀",
    definition: "10+ site activities in 30d",
  },
  {
    id: "coupon-users",
    name: "Coupon Users",
    description: "Used discount code at least once",
    category: "Shopping Behavior & Purchase History",
    icon: "🎟️",
    definition: "Discount code used ≥ 1",
  },
  {
    id: "full-price-buyers",
    name: "Full-Price Buyers",
    description: "Never used discount code",
    category: "Shopping Behavior & Purchase History",
    icon: "💳",
    definition: "Discount code used = 0",
  },
  {
    id: "product-reviewers",
    name: "Product Reviewers",
    description: "Left at least one review",
    category: "Shopping Behavior & Purchase History",
    icon: "⭐",
    definition: "Reviews ≥ 1",
  },
  {
    id: "non-reviewers",
    name: "Non-Reviewers",
    description: "Purchased but never left review",
    category: "Shopping Behavior & Purchase History",
    icon: "📝",
    definition: "Purchases ≥ 1, reviews = 0",
  },

  // EXCLUSION SEGMENTS (12 segments)
  {
    id: "unsubscribed",
    name: "Not Receiving Marketing (Exclusion)",
    description: "Cannot receive marketing emails",
    category: "Exclusion Segments",
    icon: "🚫",
    definition: "Can receive marketing = false",
  },
  {
    id: "bounced-emails",
    name: "Never Opened Any Email (Exclusion)",
    description: "0 email opens all time (likely bounced/invalid)",
    category: "Exclusion Segments",
    icon: "⚠️",
    definition: "0 email opens all time",
  },
  {
    id: "not-opted-in",
    name: "Not Opted-In Profiles (Exclusion)",
    description: "Cannot receive marketing",
    category: "Exclusion Segments",
    icon: "❌",
    definition: "Not opted in to emails",
  },
  {
    id: "recent-purchasers-exclude",
    name: "Recent Purchasers (Exclusion)",
    description: "Purchased in last 14 days (exclude from promos)",
    category: "Exclusion Segments",
    icon: "🛑",
    definition: "Purchase within 14 days",
  },
  {
    id: "refunded-customers",
    name: "Refunded Customers (Exclusion)",
    description: "Refunded/cancelled order in last 90 days",
    category: "Exclusion Segments",
    icon: "↩️",
    definition: "Refund within 90 days",
  },
  {
    id: "negative-feedback",
    name: "Negative Feedback (Exclusion)",
    description: "Submitted negative feedback (if tracked)",
    category: "Exclusion Segments",
    icon: "😞",
    definition: "Feedback rating < 3 stars",
  },
  {
    id: "unengaged-exclusion",
    name: "Unengaged Subscribers (Exclusion)",
    description: "No opens/clicks in 180+ days",
    category: "Exclusion Segments",
    icon: "🔇",
    definition: "No engagement 180+ days",
  },
  {
    id: "sunset-segment",
    name: "Sunset Segment (Exclusion)",
    description: "No opens or clicks in last 120+ days",
    category: "Exclusion Segments",
    icon: "🌅",
    definition: "0 engagement in 120+ days",
  },
  {
    id: "high-churn-risk-exclude",
    name: "High Churn Risk (Exclusion)",
    description: "Predictive high churn risk",
    category: "Exclusion Segments",
    icon: "🚨",
    definition: "Predicted churn > threshold",
    unavailable: true,
  },
  {
    id: "received-5-opened-0",
    name: "Never Opened (30 Days) (Exclusion)",
    description: "No email opens in last 30 days",
    category: "Exclusion Segments",
    icon: "📪",
    definition: "0 opens in 30 days",
  },
  {
    id: "received-3-in-3-days",
    name: "3+ Opens in 3 Days (Exclusion)",
    description: "Highly active - 3+ opens in last 3 days (prevent fatigue)",
    category: "Exclusion Segments",
    icon: "📬",
    definition: "3+ opens in 3 days",
  },
  {
    id: "marked-spam",
    name: "Unengaged 90+ Days (Exclusion)",
    description: "No email engagement in 90+ days (spam risk)",
    category: "Exclusion Segments",
    icon: "🗑️",
    definition: "0 opens in 90+ days",
  },
];

export const BUNDLES = [
  {
    id: "core-essentials",
    name: "Core Essentials",
    description: "Essential segments every brand needs",
    segments: ["vip-customers", "repeat-customers", "one-time-buyers", "engaged-non-buyers", "abandoned-cart", "lapsed-customers"],
    icon: "🎯",
  },
  {
    id: "engagement-maximizer",
    name: "Engagement Maximizer",
    description: "All engagement and activity tracking segments",
    segments: ["engaged-30-days", "engaged-60-days", "engaged-90-days", "highly-engaged", "recent-clickers-90", "engaged-non-buyers", "active-site-30", "unengaged-90", "unengaged-180", "email-openers-30", "email-openers-60", "email-clickers-30", "email-clickers-60", "site-visitors-30"],
    icon: "📊",
  },
  {
    id: "lifecycle-manager",
    name: "Lifecycle Manager",
    description: "Complete customer lifecycle tracking",
    segments: ["new-subscribers", "recent-first-time", "repeat-customers", "one-time-buyers", "active-customers", "lapsed-customers", "churned-customers", "vip-customers", "big-spenders", "bargain-shoppers", "high-aov", "low-aov"],
    icon: "🔄",
  },
  {
    id: "shopping-behavior",
    name: "Shopping Behavior",
    description: "Track shopping patterns and opportunities",
    segments: ["browse-abandonment", "category-interest", "product-interest", "frequent-visitors", "coupon-users", "full-price-buyers"],
    icon: "🛍️",
  },
  {
    id: "smart-exclusions",
    name: "Smart Exclusions",
    description: "Suppression list for deliverability",
    segments: ["unsubscribed", "bounced-emails", "not-opted-in", "recent-purchasers-exclude", "refunded-customers", "unengaged-exclusion", "sunset-segment", "received-5-opened-0", "received-3-in-3-days", "marked-spam"],
    icon: "🚫",
  },
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Engagement & Activity": "📊",
  "Demographics": "👥",
  "Customer Lifecycle & Value": "💎",
  "Shopping Behavior & Purchase History": "🛍️",
  "Exclusion Segments": "🚫"
};

export const CATEGORIES = [
  "Engagement & Activity",
  "Demographics", 
  "Customer Lifecycle & Value",
  "Shopping Behavior & Purchase History",
  "Exclusion Segments"
];

export interface SegmentInputConfig {
  type: 'text' | 'select';
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  definition: string;
  unavailable?: boolean;
  requiresInput?: SegmentInputConfig;
}

export type Bundle = typeof BUNDLES[0];
