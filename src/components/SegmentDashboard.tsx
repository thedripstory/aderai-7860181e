import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, HelpCircle, Search, CheckCircle2, Package, Sparkles, Star, Eye, Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SegmentPreviewModal } from './SegmentPreviewModal';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentListSkeleton } from '@/components/LoadingStates';
import { toast } from 'sonner';

export const SEGMENTS = [
  // ENGAGEMENT & ACTIVITY (14 segments)
  {
    id: "engaged-30-days",
    name: "📧 Engaged (Last 30 Days)",
    description: "Opened or clicked email in last 30 days",
    category: "Engagement & Activity",
    icon: "📧",
    definition: "Opened or clicked email within 30 days",
  },
  {
    id: "engaged-60-days",
    name: "📬 Engaged (Last 60 Days)",
    description: "Opened or clicked email in last 60 days",
    category: "Engagement & Activity",
    icon: "📬",
    definition: "Opened or clicked email within 60 days",
  },
  {
    id: "engaged-90-days",
    name: "📮 Engaged (Last 90 Days)",
    description: "Opened or clicked email in last 90 days",
    category: "Engagement & Activity",
    icon: "📮",
    definition: "Opened or clicked email within 90 days",
  },
  {
    id: "highly-engaged",
    name: "🔥 Highly Engaged",
    description: "Opened email 5+ times in last 30 days",
    category: "Engagement & Activity",
    icon: "🔥",
    definition: "5+ email opens in 30 days",
  },
  {
    id: "recent-clickers-90",
    name: "👆 Recent Email Clickers (Last 90 Days)",
    description: "Clicked email in last 90 days",
    category: "Engagement & Activity",
    icon: "👆",
    definition: "Clicked email within 90 days",
  },
  {
    id: "engaged-non-buyers",
    name: "💡 Engaged Non-Buyers",
    description: "Opens/clicks emails but never purchased",
    category: "Engagement & Activity",
    icon: "💡",
    definition: "Engaged but 0 purchases all time",
  },
  {
    id: "active-site-30",
    name: "🌐 Active on Site (Last 30 Days)",
    description: "Active on site in last 30 days",
    category: "Engagement & Activity",
    icon: "🌐",
    definition: "Site activity within 30 days",
  },
  {
    id: "unengaged-90",
    name: "😴 Unengaged (90+ Days)",
    description: "No opens in last 90 days",
    category: "Engagement & Activity",
    icon: "😴",
    definition: "No email opens in 90+ days",
  },
  {
    id: "unengaged-180",
    name: "💤 Unengaged (180+ Days)",
    description: "No opens in last 180 days",
    category: "Engagement & Activity",
    icon: "💤",
    definition: "No email opens in 180+ days",
  },
  {
    id: "email-openers-30",
    name: "👀 Email Openers (30 Days)",
    description: "Opened in last 30 days",
    category: "Engagement & Activity",
    icon: "👀",
    definition: "Email opens within 30 days",
  },
  {
    id: "email-openers-60",
    name: "👁️ Email Openers (60 Days)",
    description: "Opened in last 60 days",
    category: "Engagement & Activity",
    icon: "👁️",
    definition: "Email opens within 60 days",
  },
  {
    id: "email-clickers-30",
    name: "🖱️ Email Clickers (30 Days)",
    description: "Clicked in last 30 days",
    category: "Engagement & Activity",
    icon: "🖱️",
    definition: "Email clicks within 30 days",
  },
  {
    id: "email-clickers-60",
    name: "🖲️ Email Clickers (60 Days)",
    description: "Clicked in last 60 days",
    category: "Engagement & Activity",
    icon: "🖲️",
    definition: "Email clicks within 60 days",
  },
  {
    id: "site-visitors-30",
    name: "🏠 Site Visitors (30 Days)",
    description: "Visited site in last 30 days",
    category: "Engagement & Activity",
    icon: "🏠",
    definition: "Site visits within 30 days",
  },

  // DEMOGRAPHICS (8 segments)
  {
    id: "gender-male",
    name: "👨 Gender - Male",
    description: "Predicted gender likely male",
    category: "Demographics",
    icon: "👨",
    definition: "Predicted gender = male",
  },
  {
    id: "gender-female",
    name: "👩 Gender - Female",
    description: "Predicted gender likely female",
    category: "Demographics",
    icon: "👩",
    definition: "Predicted gender = female",
  },
  {
    id: "gender-uncertain",
    name: "❓ Gender - Uncertain",
    description: "Gender unknown",
    category: "Demographics",
    icon: "❓",
    definition: "Predicted gender = unknown",
  },
  {
    id: "location-country",
    name: "🌍 Location - By Country",
    description: "Filter by specific country",
    category: "Demographics",
    icon: "🌍",
    definition: "Country = [specified]",
  },
  {
    id: "location-proximity",
    name: "📍 Location - Proximity Radius",
    description: "Within X miles of location",
    category: "Demographics",
    icon: "📍",
    definition: "Within radius of coordinates",
  },
  {
    id: "birthday-month",
    name: "🎂 Birthday This Month",
    description: "Birthday in current month",
    category: "Demographics",
    icon: "🎂",
    definition: "Birthday month = current month",
  },
  {
    id: "age-18-24",
    name: "🧒 Age Group 18-24",
    description: "Born between specific dates for age range",
    category: "Demographics",
    icon: "🧒",
    definition: "Age between 18-24",
  },
  {
    id: "age-25-40",
    name: "🧑 Age Group 25-40",
    description: "Born between specific dates for age range",
    category: "Demographics",
    icon: "🧑",
    definition: "Age between 25-40",
  },

  // CUSTOMER LIFECYCLE & VALUE (15 segments)
  {
    id: "new-subscribers",
    name: "🌱 New Subscribers",
    description: "Joined list recently, never purchased",
    category: "Customer Lifecycle & Value",
    icon: "🌱",
    definition: "Subscribed recently, 0 purchases",
  },
  {
    id: "recent-first-time",
    name: "🎉 Recent First-Time Customers",
    description: "Made first purchase in last 30 days",
    category: "Customer Lifecycle & Value",
    icon: "🎉",
    definition: "First purchase within 30 days",
  },
  {
    id: "repeat-customers",
    name: "🔄 Repeat Customers",
    description: "2+ purchases all time",
    category: "Customer Lifecycle & Value",
    icon: "🔄",
    definition: "Order count ≥ 2",
  },
  {
    id: "one-time-buyers",
    name: "1️⃣ One-Time Customers",
    description: "Exactly 1 purchase all time",
    category: "Customer Lifecycle & Value",
    icon: "1️⃣",
    definition: "Order count = 1",
  },
  {
    id: "active-customers",
    name: "⚡ Active Customers",
    description: "Purchased in last 90 days",
    category: "Customer Lifecycle & Value",
    icon: "⚡",
    definition: "Purchase within 90 days",
  },
  {
    id: "lapsed-customers",
    name: "😴 Lapsed Customers",
    description: "Purchased before but not in last 180 days",
    category: "Customer Lifecycle & Value",
    icon: "😴",
    definition: "Last purchase 90-180 days ago",
  },
  {
    id: "churned-customers",
    name: "💔 Churned Customers",
    description: "No purchase in 365+ days",
    category: "Customer Lifecycle & Value",
    icon: "💔",
    definition: "No purchase in 365+ days",
  },
  {
    id: "vip-customers",
    name: "👑 VIP Customers",
    description: "5+ orders all time",
    category: "Customer Lifecycle & Value",
    icon: "👑",
    definition: "Order count ≥ 5",
  },
  {
    id: "big-spenders",
    name: "💰 Big Spenders",
    description: "Historic CLV greater than threshold",
    category: "Customer Lifecycle & Value",
    icon: "💰",
    definition: "CLV > threshold",
  },
  {
    id: "bargain-shoppers",
    name: "🏷️ Bargain Shoppers",
    description: "Historic CLV less than threshold",
    category: "Customer Lifecycle & Value",
    icon: "🏷️",
    definition: "CLV < threshold",
  },
  {
    id: "high-churn-risk",
    name: "⚠️ High Churn Risk",
    description: "Predictive analytics: high churn risk",
    category: "Customer Lifecycle & Value",
    icon: "⚠️",
    definition: "Predicted high churn probability",
  },
  {
    id: "likely-purchase-soon",
    name: "🎯 Likely to Purchase Soon",
    description: "Expected next order within 14 days",
    category: "Customer Lifecycle & Value",
    icon: "🎯",
    definition: "Predicted next order < 14 days",
  },
  {
    id: "predicted-vips",
    name: "⭐ Predicted VIPs",
    description: "High predicted CLV (next 365 days)",
    category: "Customer Lifecycle & Value",
    icon: "⭐",
    definition: "Predicted CLV high (365d)",
  },
  {
    id: "high-aov",
    name: "📈 High AOV",
    description: "Average order value greater than threshold",
    category: "Customer Lifecycle & Value",
    icon: "📈",
    definition: "AOV > threshold",
  },
  {
    id: "low-aov",
    name: "📉 Low AOV",
    description: "Average order value less than threshold",
    category: "Customer Lifecycle & Value",
    icon: "📉",
    definition: "AOV < threshold",
  },

  // SHOPPING BEHAVIOR & PURCHASE HISTORY (18 segments)
  {
    id: "all-customers",
    name: "🛍️ All Customers (PUR ≥ 1)",
    description: "Made at least 1 purchase",
    category: "Shopping Behavior & Purchase History",
    icon: "🛍️",
    definition: "Purchase count ≥ 1",
  },
  {
    id: "never-purchased",
    name: "👤 Never Purchased (Prospects)",
    description: "Zero purchases all time",
    category: "Shopping Behavior & Purchase History",
    icon: "👤",
    definition: "Purchase count = 0",
  },
  {
    id: "recent-purchasers-30",
    name: "🆕 Recent Purchasers (Last 30 Days)",
    description: "Purchased in last 30 days",
    category: "Shopping Behavior & Purchase History",
    icon: "🆕",
    definition: "Purchase within 30 days",
  },
  {
    id: "abandoned-cart",
    name: "🛒 Abandoned Cart",
    description: "Added to cart but didn't purchase (last 30 days)",
    category: "Shopping Behavior & Purchase History",
    icon: "🛒",
    definition: "Added to cart, no purchase 30d",
  },
  {
    id: "abandoned-cart-high-value",
    name: "💎 Abandoned Cart - High Value",
    description: "Cart value $400+ but no purchase",
    category: "Shopping Behavior & Purchase History",
    icon: "💎",
    definition: "Cart value $400+, no purchase",
  },
  {
    id: "abandoned-checkout",
    name: "🏁 Abandoned Checkout",
    description: "Started checkout but didn't complete",
    category: "Shopping Behavior & Purchase History",
    icon: "🏁",
    definition: "Started checkout, no order",
  },
  {
    id: "abandoned-checkout-high-value",
    name: "💵 Abandoned Checkout - High Value",
    description: "Checkout value $400+ but no complete",
    category: "Shopping Behavior & Purchase History",
    icon: "💵",
    definition: "Checkout $400+, no complete",
  },
  {
    id: "browse-abandonment",
    name: "👁️ Browse Abandonment",
    description: "Viewed product but didn't add to cart or purchase",
    category: "Shopping Behavior & Purchase History",
    icon: "👁️",
    definition: "Viewed product, no cart/purchase",
  },
  {
    id: "category-interest",
    name: "🔍 Category Interest",
    description: "Viewed specific category 2+ times but never purchased from it",
    category: "Shopping Behavior & Purchase History",
    icon: "🔍",
    definition: "2+ category views, 0 purchases",
  },
  {
    id: "product-interest",
    name: "🎁 Product-Specific Interest",
    description: "Viewed specific product 2+ times but never purchased it",
    category: "Shopping Behavior & Purchase History",
    icon: "🎁",
    definition: "2+ product views, not purchased",
  },
  {
    id: "cross-sell",
    name: "🔀 Cross-Sell Opportunity",
    description: "Purchased category X but not category Y",
    category: "Shopping Behavior & Purchase History",
    icon: "🔀",
    definition: "Purchased A, not B",
  },
  {
    id: "category-buyers",
    name: "📦 Category Buyers",
    description: "Purchased from specific category at least once",
    category: "Shopping Behavior & Purchase History",
    icon: "📦",
    definition: "Category purchase ≥ 1",
  },
  {
    id: "multi-category",
    name: "🎯 Multi-Category Shoppers",
    description: "Purchased from 2+ different categories",
    category: "Shopping Behavior & Purchase History",
    icon: "🎯",
    definition: "Purchased 2+ categories",
  },
  {
    id: "frequent-visitors",
    name: "🚀 Frequent Site Visitors",
    description: "Active on site 10+ times in last 30 days",
    category: "Shopping Behavior & Purchase History",
    icon: "🚀",
    definition: "10+ site visits in 30d",
  },
  {
    id: "coupon-users",
    name: "🎟️ Coupon Users",
    description: "Used discount code at least once",
    category: "Shopping Behavior & Purchase History",
    icon: "🎟️",
    definition: "Discount code used ≥ 1",
  },
  {
    id: "full-price-buyers",
    name: "💳 Full-Price Buyers",
    description: "Never used discount code",
    category: "Shopping Behavior & Purchase History",
    icon: "💳",
    definition: "Discount code used = 0",
  },
  {
    id: "product-reviewers",
    name: "⭐ Product Reviewers",
    description: "Left at least one review",
    category: "Shopping Behavior & Purchase History",
    icon: "⭐",
    definition: "Reviews ≥ 1",
  },
  {
    id: "non-reviewers",
    name: "📝 Non-Reviewers",
    description: "Purchased but never left review",
    category: "Shopping Behavior & Purchase History",
    icon: "📝",
    definition: "Purchases ≥ 1, reviews = 0",
  },

  // EXCLUSION SEGMENTS (12 segments)
  {
    id: "unsubscribed",
    name: "🚫 Unsubscribed Contacts",
    description: "Not subscribed to marketing",
    category: "Exclusion Segments",
    icon: "🚫",
    definition: "Marketing consent = false",
  },
  {
    id: "bounced-emails",
    name: "⚠️ Bounced Email Addresses",
    description: "Suppressed due to bounces",
    category: "Exclusion Segments",
    icon: "⚠️",
    definition: "Email bounced/suppressed",
  },
  {
    id: "not-opted-in",
    name: "❌ Not Opted-In Profiles",
    description: "Cannot receive marketing",
    category: "Exclusion Segments",
    icon: "❌",
    definition: "Not opted in to emails",
  },
  {
    id: "recent-purchasers-exclude",
    name: "🛑 Recent Purchasers (Exclusion)",
    description: "Purchased in last 14 days (exclude from promos)",
    category: "Exclusion Segments",
    icon: "🛑",
    definition: "Purchase within 14 days",
  },
  {
    id: "refunded-customers",
    name: "↩️ Refunded Customers",
    description: "Refunded order in last 30 days",
    category: "Exclusion Segments",
    icon: "↩️",
    definition: "Refund within 30 days",
  },
  {
    id: "negative-feedback",
    name: "😞 Negative Feedback",
    description: "Left review with 2 stars or less",
    category: "Exclusion Segments",
    icon: "😞",
    definition: "Review rating ≤ 2 stars",
  },
  {
    id: "unengaged-exclusion",
    name: "🔇 Unengaged Subscribers (Exclusion)",
    description: "No opens/clicks in 180+ days",
    category: "Exclusion Segments",
    icon: "🔇",
    definition: "No engagement 180+ days",
  },
  {
    id: "sunset-segment",
    name: "🌅 Sunset Segment",
    description: "Opened 1-3 times in last 180 days (low engagement)",
    category: "Exclusion Segments",
    icon: "🌅",
    definition: "1-3 opens in 180d",
  },
  {
    id: "high-churn-risk-exclude",
    name: "🚨 High Churn Risk (Exclusion)",
    description: "Predictive high churn risk",
    category: "Exclusion Segments",
    icon: "🚨",
    definition: "Predicted churn > threshold",
  },
  {
    id: "received-5-opened-0",
    name: "📪 Received 5, Opened 0",
    description: "Received 5+ emails but never opened any",
    category: "Exclusion Segments",
    icon: "📪",
    definition: "Received ≥ 5, opens = 0",
  },
  {
    id: "received-3-in-3-days",
    name: "📬 Received 3 in Last 3 Days",
    description: "Got 3+ emails in 72 hours (prevent fatigue)",
    category: "Exclusion Segments",
    icon: "📬",
    definition: "3+ emails in 72 hours",
  },
  {
    id: "marked-spam",
    name: "🗑️ Marked Spam",
    description: "Marked email as spam at least once",
    category: "Exclusion Segments",
    icon: "🗑️",
    definition: "Marked spam ≥ 1",
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
    segments: ["new-subscribers", "recent-first-time", "repeat-customers", "one-time-buyers", "active-customers", "lapsed-customers", "churned-customers", "vip-customers", "big-spenders", "bargain-shoppers", "high-churn-risk", "likely-purchase-soon", "predicted-vips", "high-aov", "low-aov"],
    icon: "🔄",
  },
  {
    id: "shopping-behavior",
    name: "Shopping Behavior",
    description: "Track shopping patterns and opportunities",
    segments: ["browse-abandonment", "category-interest", "product-interest", "cross-sell", "category-buyers", "multi-category", "frequent-visitors", "coupon-users", "full-price-buyers"],
    icon: "🛍️",
  },
  {
    id: "smart-exclusions",
    name: "Smart Exclusions",
    description: "Suppression list for deliverability",
    segments: ["unsubscribed", "bounced-emails", "not-opted-in", "recent-purchasers-exclude", "refunded-customers", "negative-feedback", "unengaged-exclusion", "sunset-segment", "high-churn-risk-exclude", "received-5-opened-0", "received-3-in-3-days", "marked-spam"],
    icon: "🚫",
  },
];

interface SegmentDashboardProps {
  selectedSegments: string[];
  onToggleSegment: (segmentId: string) => void;
  onSelectBundle: (bundleId: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  segmentLimit?: number;
  currentTier?: string;
}

export const SegmentDashboard: React.FC<SegmentDashboardProps> = ({
  selectedSegments,
  onToggleSegment,
  onSelectBundle,
  onSelectAll,
  onClearAll,
  segmentLimit = 999,
  currentTier = 'professional',
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Engagement & Activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('segment-favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [previewSegment, setPreviewSegment] = useState<typeof SEGMENTS[0] | null>(null);
  const [showShortcutsHint, setShowShortcutsHint] = useState(true);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('segment-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (onSelectAll) {
          onSelectAll();
          toast.success('All segments selected', { duration: 2000 });
        }
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        if (previewSegment) {
          setPreviewSegment(null);
        } else if (onClearAll && selectedSegments.length > 0) {
          onClearAll();
          toast.info('Selection cleared', { duration: 2000 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAll, onClearAll, selectedSegments.length, previewSegment]);

  const toggleFavorite = useCallback((segmentId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId];
      toast.success(
        prev.includes(segmentId) ? 'Removed from favorites' : 'Added to favorites',
        { duration: 2000 }
      );
      return newFavorites;
    });
  }, []);

  const categories = [
    "Engagement & Activity",
    "Demographics", 
    "Customer Lifecycle & Value",
    "Shopping Behavior & Purchase History",
    "Exclusion Segments"
  ];

  const categoryIcons: Record<string, string> = {
    "Engagement & Activity": "📊",
    "Demographics": "👥",
    "Customer Lifecycle & Value": "💎",
    "Shopping Behavior & Purchase History": "🛍️",
    "Exclusion Segments": "🚫"
  };

  const filteredSegments = SEGMENTS.filter(segment => 
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteSegments = SEGMENTS.filter(s => favorites.includes(s.id));

  const selectAllInCategory = (category: string) => {
    const categorySegmentIds = SEGMENTS
      .filter(s => s.category === category)
      .map(s => s.id);
    
    categorySegmentIds.forEach(id => {
      if (!selectedSegments.includes(id)) {
        onToggleSegment(id);
      }
    });
  };

  const selectedCount = selectedSegments.length;
  const totalSegments = SEGMENTS.length;

  return (
    <div className="animate-fade-in">
      {/* Preview Modal */}
      <SegmentPreviewModal
        segment={previewSegment}
        isOpen={!!previewSegment}
        onClose={() => setPreviewSegment(null)}
        onSelect={onToggleSegment}
        onToggleFavorite={toggleFavorite}
        isSelected={previewSegment ? selectedSegments.includes(previewSegment.id) : false}
        isFavorite={previewSegment ? favorites.includes(previewSegment.id) : false}
      />

      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Create Segments</h2>
            <p className="text-muted-foreground flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              {SEGMENTS.length} professional segments at your fingertips
            </p>
          </div>
          
          {/* Selection Counter */}
          <div className="flex flex-col items-end gap-3">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold text-primary">{selectedCount}</div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </div>
            
            {onSelectAll && onClearAll && (
              <div className="flex gap-2">
                <button
                  onClick={onSelectAll}
                  className="px-4 py-2 text-sm font-medium border-2 border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={onClearAll}
                  className="px-4 py-2 text-sm font-medium border-2 border-border rounded-lg hover:bg-muted transition-all"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {showShortcutsHint && (
          <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Keyboard className="w-4 h-4" />
              <span>
                <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono mr-1">Ctrl+A</kbd>
                Select all
                <span className="mx-2">•</span>
                <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono mr-1">Esc</kbd>
                Clear selection
              </span>
            </div>
            <button 
              onClick={() => setShowShortcutsHint(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              Select individual segments or choose a pre-built bundle to get started quickly
            </span>
            <a 
              href="/help?article=getting-started" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 ml-auto font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Learn more</span>
            </a>
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search segments by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <Badge variant="secondary" className="absolute right-4 top-1/2 -translate-y-1/2">
              {filteredSegments.length} results
            </Badge>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteSegments.length > 0 && !searchQuery && (
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h3 className="text-2xl font-bold">Favorites</h3>
            <Badge variant="secondary" className="ml-2">{favoriteSegments.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteSegments.map((segment, index) => {
              const isSelected = selectedSegments.includes(segment.id);
              return (
                <div
                  key={segment.id}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer animate-fade-in ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-500/5"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onToggleSegment(segment.id)}
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewSegment(segment);
                      }}
                      className="p-1.5 rounded-lg bg-background/80 border border-border hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(segment.id);
                      }}
                      className="p-1.5 rounded-lg bg-background/80 border border-border hover:bg-muted transition-all"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    </button>
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{segment.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{segment.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{segment.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Bundles Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-2xl font-bold">Quick Start Bundles</h3>
          <Badge variant="secondary" className="ml-2">Popular</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUNDLES.map((bundle, index) => {
            const selectedFromBundle = bundle.segments.filter(id => selectedSegments.includes(id)).length;
            const bundleSelected = selectedFromBundle === bundle.segments.length;
            const partiallySelected = selectedFromBundle > 0 && selectedFromBundle < bundle.segments.length;
            const progressPercent = (selectedFromBundle / bundle.segments.length) * 100;
            
            return (
              <div
                key={bundle.id}
                className={`group relative bg-gradient-to-br from-card to-card/50 border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in ${
                  bundleSelected 
                    ? 'border-primary bg-primary/5' 
                    : partiallySelected 
                      ? 'border-primary/50' 
                      : 'border-border hover:border-primary'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onSelectBundle(bundle.id)}
              >
                {/* Progress bar for partial selection */}
                {(partiallySelected || bundleSelected) && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {bundle.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={bundleSelected ? "default" : partiallySelected ? "outline" : "secondary"} className="text-xs">
                        {bundle.segments.length} segments
                      </Badge>
                      {(partiallySelected || bundleSelected) && (
                        <span className="text-xs text-primary font-medium">
                          {selectedFromBundle}/{bundle.segments.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {bundle.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                    {bundle.description}
                  </p>
                  
                  <button className={`w-full py-2.5 rounded-lg font-semibold transition-all group-hover:shadow-md flex items-center justify-center gap-2 ${
                    bundleSelected 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}>
                    {bundleSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Bundle Complete</span>
                      </>
                    ) : partiallySelected ? (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Add Remaining ({bundle.segments.length - selectedFromBundle})</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Add Bundle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Segments by Category */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Browse by Category</h3>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories • {filteredSegments.length} segments
          </p>
        </div>

        {categories.map((category, categoryIndex) => {
          const categorySegments = filteredSegments.filter((s) => s.category === category);
          const isExpanded = expandedCategory === category;
          const categorySelectedCount = categorySegments.filter(s => selectedSegments.includes(s.id)).length;

          if (categorySegments.length === 0 && searchQuery) return null;

          return (
            <div 
              key={category} 
              className="bg-card border-2 border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all animate-slide-in"
              style={{ animationDelay: `${categoryIndex * 50}ms` }}
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {categoryIcons[category]}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {category}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {categorySegments.length} segments
                      </p>
                      {categorySelectedCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {categorySelectedCount} selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllInCategory(category);
                    }}
                    className="px-4 py-2 text-sm font-medium border-2 border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-all"
                  >
                    Select All
                  </button>
                  <div className={`p-2 rounded-lg bg-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t-2 border-border bg-gradient-to-b from-background to-muted/20 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {categorySegments.map((segment, segmentIndex) => {
                      const isSelected = selectedSegments.includes(segment.id);
                      const isFavorite = favorites.includes(segment.id);
                      return (
                        <div
                          key={segment.id}
                          className={`group relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer animate-fade-in ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50 hover:shadow-sm bg-card"
                          }`}
                          style={{ animationDelay: `${segmentIndex * 30}ms` }}
                          onClick={() => onToggleSegment(segment.id)}
                        >
                          {/* Action buttons */}
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewSegment(segment);
                              }}
                              className="p-1.5 rounded-lg bg-background/80 border border-border hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                              title="Preview segment"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(segment.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isFavorite 
                                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                                  : 'bg-background/80 border-border opacity-0 group-hover:opacity-100 hover:bg-muted'
                              }`}
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                            </button>
                            {isSelected && (
                              <div className="p-1.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className="text-3xl mt-1 group-hover:scale-110 transition-transform">
                              {segment.icon}
                            </div>
                            <div className="flex-1 pr-20">
                              <h4 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                                {segment.name}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                {segment.description}
                              </p>
                              <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                                <span className="font-mono text-muted-foreground">
                                  {segment.definition}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State for Search */}
        {searchQuery && filteredSegments.length === 0 && (
          <EmptyState
            icon={Search}
            title="No segments match your search"
            description="Try adjusting your search term or browse segments by category above"
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
            secondaryActionLabel="View All Segments"
            onSecondaryAction={() => {
              setSearchQuery('');
              setExpandedCategory(null);
            }}
          />
        )}
      </div>
    </div>
  );
};