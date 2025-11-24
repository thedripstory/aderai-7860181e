import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const SEGMENTS = [
  {
    id: "vip",
    name: "VIP Customers",
    description: "High-value customers who have spent above your VIP threshold",
    category: "Core Essentials",
    icon: "👑",
    definition: "Total spend > VIP threshold",
  },
  {
    id: "high-value",
    name: "High-Value Customers",
    description: "Customers with significant purchase history",
    category: "Core Essentials",
    icon: "💎",
    definition: "Total spend > High-value threshold",
  },
  {
    id: "new-customers",
    name: "New Customers",
    description: "Recently acquired customers",
    category: "Core Essentials",
    icon: "🌟",
    definition: "First purchase within new customer days",
  },
  {
    id: "repeat-customers",
    name: "Repeat Customers",
    description: "Customers who have made multiple purchases",
    category: "Core Essentials",
    icon: "🔄",
    definition: "Order count > 1",
  },
  {
    id: "one-time-buyers",
    name: "One-Time Buyers",
    description: "Customers who have only purchased once",
    category: "Core Essentials",
    icon: "1️⃣",
    definition: "Order count = 1",
  },
  {
    id: "active-customers",
    name: "Active Customers",
    description: "Recently engaged customers",
    category: "Engagement",
    icon: "⚡",
    definition: "Last purchase within lapsed days",
  },
  {
    id: "lapsed-customers",
    name: "Lapsed Customers",
    description: "Customers who haven't purchased recently",
    category: "Engagement",
    icon: "😴",
    definition: "Last purchase between lapsed and churned days",
  },
  {
    id: "churned-customers",
    name: "Churned Customers",
    description: "Customers who haven't purchased in a long time",
    category: "Engagement",
    icon: "💔",
    definition: "Last purchase > churned days ago",
  },
  {
    id: "high-frequency",
    name: "High-Frequency Buyers",
    description: "Customers who purchase frequently",
    category: "Behavioral",
    icon: "🔥",
    definition: "Order count > 5",
  },
  {
    id: "above-aov",
    name: "Above AOV Spenders",
    description: "Customers whose average order exceeds your AOV",
    category: "Behavioral",
    icon: "📈",
    definition: "Average order value > AOV",
  },
  {
    id: "below-aov",
    name: "Below AOV Spenders",
    description: "Customers whose average order is below your AOV",
    category: "Behavioral",
    icon: "📉",
    definition: "Average order value < AOV",
  },
  {
    id: "engaged-subscribers",
    name: "Engaged Email Subscribers",
    description: "Subscribers who actively engage with emails",
    category: "Email Engagement",
    icon: "📧",
    definition: "Opened or clicked email in last 30 days",
  },
  {
    id: "unengaged-subscribers",
    name: "Unengaged Subscribers",
    description: "Subscribers who haven't engaged recently",
    category: "Email Engagement",
    icon: "📭",
    definition: "No opens/clicks in last 90 days",
  },
  {
    id: "cart-abandoners",
    name: "Cart Abandoners",
    description: "Customers who added items but didn't complete purchase",
    category: "Conversion",
    icon: "🛒",
    definition: "Started checkout but no order in last 7 days",
  },
  {
    id: "browse-abandoners",
    name: "Browse Abandoners",
    description: "Visitors who viewed products but didn't add to cart",
    category: "Conversion",
    icon: "👀",
    definition: "Viewed product but no cart activity in last 7 days",
  },
];

export const BUNDLES = [
  {
    id: "essentials",
    name: "Core Essentials",
    description: "Must-have segments for any e-commerce brand",
    segments: ["vip", "high-value", "new-customers", "repeat-customers", "one-time-buyers"],
    icon: "🎯",
  },
  {
    id: "engagement",
    name: "Engagement Suite",
    description: "Track customer activity and re-engage dormant customers",
    segments: ["active-customers", "lapsed-customers", "churned-customers"],
    icon: "📊",
  },
  {
    id: "behavioral",
    name: "Behavioral Insights",
    description: "Understand purchase patterns and spending habits",
    segments: ["high-frequency", "above-aov", "below-aov"],
    icon: "🧠",
  },
  {
    id: "email",
    name: "Email Performance",
    description: "Optimize your email marketing strategy",
    segments: ["engaged-subscribers", "unengaged-subscribers"],
    icon: "✉️",
  },
  {
    id: "conversion",
    name: "Conversion Optimization",
    description: "Recover lost sales and improve conversion rates",
    segments: ["cart-abandoners", "browse-abandoners"],
    icon: "💰",
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Essentials");

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Create Segments</h2>
            {segmentLimit < 999 && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentTier === 'starter' ? 'Starter' : 'Professional'} tier: Up to {segmentLimit} segments
              </p>
            )}
          </div>
          {onSelectAll && onClearAll && (
            <div className="flex gap-2">
              <button
                onClick={onSelectAll}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Select All
              </button>
              <button
                onClick={onClearAll}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          Select individual segments or choose a pre-built bundle to get started quickly
          <a 
            href="/help?article=getting-started" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Learn more</span>
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {BUNDLES.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onSelectBundle(bundle.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{bundle.icon}</div>
              <div className="text-sm text-muted-foreground">{bundle.segments.length} segments</div>
            </div>
            <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{bundle.description}</p>
            <button className="w-full bg-primary/10 text-primary py-2 rounded-lg font-medium hover:bg-primary/20">
              Add Bundle
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {["Core Essentials", "Engagement", "Behavioral", "Email Engagement", "Conversion"].map((category) => {
          const categorySegments = SEGMENTS.filter((s) => s.category === category);
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {category === "Core Essentials" && "🎯"}
                    {category === "Engagement" && "📊"}
                    {category === "Behavioral" && "🧠"}
                    {category === "Email Engagement" && "✉️"}
                    {category === "Conversion" && "💰"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">{category}</h3>
                    <p className="text-sm text-muted-foreground">{categorySegments.length} segments</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border p-6 space-y-4">
                  {categorySegments.map((segment) => {
                    const isSelected = selectedSegments.includes(segment.id);
                    return (
                      <div
                        key={segment.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => onToggleSegment(segment.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl mt-1">{segment.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold mb-1">{segment.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                              {segment.definition}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSegment(segment.id)}
                            className="w-5 h-5 mt-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
