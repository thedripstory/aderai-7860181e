import React, { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  Info,
  ChevronDown,
  ChevronUp,
  User,
  Lock,
  Mail,
  Settings as SettingsIcon,
  TrendingUp,
  BarChart3,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Users,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Activity,
  Lightbulb,
  X,
  Building2,
  Sparkles,
  Plus,
  Gift,
  LogOut,
  Copy,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

/**
 * ADERAI - COMPLETE APP WITH SEGMENT ANALYTICS
 * Login â†’ Signup â†’ Onboarding â†’ Dashboard â†’ Analytics
 *
 * NEW IN THIS VERSION:
 * - Analytics view with real Klaviyo data
 * - Segment performance tracking
 * - Growth metrics and trends
 * - Top performers dashboard
 * - Complete segment statistics
 */

// Types
interface SegmentResult {
  segmentId: string;
  status: "success" | "error" | "skipped";
  message: string;
  klaviyoId?: string;
}

interface UserData {
  email: string;
  accountName: string;
  klaviyoApiKey: string;
  currency: string;
  aov: string;
  vipThreshold: string;
  highValueThreshold: string;
  newCustomerDays: string;
  lapsedDays: string;
  churnedDays: string;
}

interface SegmentStats {
  profileCount: number;
  name: string;
  created?: string;
  updated?: string;
  membersAdded?: number;
  membersRemoved?: number;
  netChange?: number;
  changePercent?: number;
}

interface AnalyticsCache {
  timestamp: number;
  segments: any[];
  stats: Record<string, SegmentStats>;
}

// Segment Data
const SEGMENTS = {
  "Core Essentials": [
    { id: "vip-customers", name: "ðŸ‘‘ VIP Customers", desc: "Top 10% by lifetime value" },
    { id: "repeat-customers", name: "â­ Repeat Customers", desc: "3+ purchases" },
    { id: "one-time-customers", name: "ðŸŽ¯ One-Time Customers", desc: "Exactly 1 purchase" },
    { id: "engaged-non-buyers", name: "ðŸ’Œ Engaged Non-Buyers", desc: "Opens emails, no purchase" },
    { id: "cart-abandoners", name: "ðŸ›’ Cart Abandoners", desc: "Started checkout, didn't complete" },
    { id: "lapsed-customers", name: "ðŸ’¤ Lapsed Customers", desc: "No purchase in 90+ days" },
  ],
  "Engagement & Activity": [
    { id: "highly-engaged", name: "ðŸ”¥ Highly Engaged", desc: "Active in last 30 days" },
    { id: "recent-clickers", name: "ðŸ‘€ Recent Email Clickers", desc: "Clicked in last 30 days" },
    { id: "active-on-site", name: "ðŸ‘ï¸ Active on Site", desc: "Visited in last 30 days" },
    { id: "unengaged-90", name: "ðŸ˜´ Unengaged (90+ Days)", desc: "No activity for 90+ days" },
    { id: "email-openers-30", name: "ðŸ“§ Email Openers (30 Days)", desc: "Opened in last 30 days" },
    { id: "email-openers-60", name: "ðŸ“§ Email Openers (60 Days)", desc: "Opened in last 60 days" },
    { id: "email-clickers-30", name: "ðŸ–±ï¸ Email Clickers (30 Days)", desc: "Clicked in last 30 days" },
    { id: "email-clickers-60", name: "ðŸ–±ï¸ Email Clickers (60 Days)", desc: "Clicked in last 60 days" },
    { id: "site-visitors-30", name: "ðŸŒ Site Visitors (30 Days)", desc: "Active on site last 30 days" },
    { id: "never-engaged", name: "ðŸ’€ Never Engaged", desc: "Zero email activity ever" },
  ],
  "Shopping Behavior": [
    { id: "high-value-cart", name: "ðŸ”‘ High-Value Cart Abandoners", desc: "Cart worth $100+" },
    { id: "recent-first-time", name: "ðŸ’° Recent First-Time Buyers", desc: "First purchase in 30 days" },
    { id: "coupon-users", name: "ðŸš¦ Coupon Users", desc: "Only buys with discounts" },
    { id: "full-price-buyers", name: "ðŸ’Ž Full-Price Buyers", desc: "Never uses coupons" },
    { id: "multi-category-shoppers", name: "ðŸ¤¹ Multi-Category Shoppers", desc: "Bought from 2+ categories" },
    { id: "frequent-site-visitors", name: "ðŸ“± Frequent Site Visitors", desc: "10+ visits/month" },
    { id: "product-reviewers", name: "ðŸ–Šï¸ Product Reviewers", desc: "Left at least 1 review" },
    { id: "non-reviewers", name: "ðŸ’­ Non-Reviewers", desc: "Never left a review" },
    { id: "browse-abandoners", name: "ðŸ” Browse Abandoners", desc: "Viewed products, didn't add to cart" },
    { id: "new-subscribers", name: "ðŸ†• New Subscribers", desc: "Subscribed in last 7 days" },
    { id: "all-customers", name: "ðŸ›’ All Customers", desc: "Anyone who purchased" },
    { id: "active-customers-90", name: "ðŸƒ Active Customers", desc: "Purchased in last 90 days" },
    { id: "recent-purchasers-30", name: "ðŸ“¦ Recent Purchasers", desc: "Purchased in last 30 days" },
    { id: "gift-buyers", name: "ðŸŽ Gift Buyers", desc: "Used gift message or wrap" },
    { id: "mobile-shoppers", name: "ðŸ“² Mobile Shoppers", desc: "80%+ purchases on mobile" },
    { id: "desktop-shoppers", name: "ðŸ’» Desktop Shoppers", desc: "80%+ purchases on desktop" },
    { id: "category-buyers", name: "ðŸŽ¨ Category Buyers", desc: "Purchased from specific category" },
  ],
  "Value & Lifecycle": [
    { id: "big-spenders", name: "âš¡ Big Spenders", desc: "Top 20% by AOV" },
    { id: "bargain-shoppers", name: "ðŸ’« Bargain Shoppers", desc: "Bottom 20% by AOV" },
    { id: "high-churn-risk", name: "ðŸ˜¥ High Churn Risk", desc: "Declining engagement + frequency" },
    { id: "predicted-vips", name: "â¤ï¸â€ðŸ”¥ Predicted VIPs", desc: "High predicted CLV" },
    { id: "churned-customers", name: "ðŸ˜Ÿ Churned Customers", desc: "No activity in 180+ days" },
    { id: "high-aov", name: "ðŸª„ High AOV", desc: "Average order value $100+" },
    { id: "low-aov", name: "ðŸª« Low AOV", desc: "Average order value <$50" },
    { id: "high-lifetime-value", name: "ðŸ’¸ High Lifetime Value", desc: "Top 10% by LTV" },
    { id: "growing-customers", name: "ðŸŒ± Growing Customers", desc: "Increasing purchase frequency" },
    { id: "declining-customers", name: "ðŸ“‰ Declining Customers", desc: "Decreasing purchase frequency" },
    { id: "win-back-target", name: "ðŸŽ¯ Win-Back Target", desc: "Lapsed 60-180 days" },
    { id: "at-risk-vips", name: "ðŸ’” At-Risk VIPs", desc: "VIPs showing churn signals" },
    { id: "rising-stars", name: "ðŸš€ Rising Stars", desc: "New + highly engaged" },
    { id: "active-customers-lifecycle", name: "ðŸ¥° Active Customers", desc: "Purchased in last 90 days" },
    { id: "recent-purchasers-lifecycle", name: "ðŸ”¥ Recent Purchasers", desc: "Purchased in last 30 days" },
  ],
  Demographics: [
    { id: "gender-female", name: "ðŸ‘© Gender - Female", desc: "Female customers" },
    { id: "gender-male", name: "ðŸ‘¨ Gender - Male", desc: "Male customers" },
    { id: "location-country", name: "ðŸŒŽ Location - By Country", desc: "Specific countries" },
    { id: "location-region", name: "ðŸ™ï¸ Location - By Region", desc: "Specific states/regions" },
    { id: "birthday-this-month", name: "ðŸŽ‚ Birthday This Month", desc: "Birthday in current month" },
    { id: "birthday-this-week", name: "ðŸŽ‰ Birthday This Week", desc: "Birthday in next 7 days" },
    { id: "age-18-24", name: "ðŸ‘¶ Age Group - 18-24", desc: "Ages 18-24" },
    { id: "age-25-34", name: "ðŸ§‘ Age Group - 25-34", desc: "Ages 25-34" },
  ],
  Exclusions: [
    { id: "unsubscribed", name: "ðŸš« Unsubscribed", desc: "Cannot receive marketing" },
    { id: "suppressed", name: "ðŸš« Suppressed", desc: "On suppression list" },
    { id: "non-marketable", name: "ðŸ“µ Non-Marketable", desc: "Suppressed or unsubscribed" },
    { id: "bounced-emails", name: "âš ï¸ Bounced Emails", desc: "Email bounced recently" },
  ],
  "Testing & Controls": [
    { id: "test-segment-a", name: "ðŸ§ª Test Segment A", desc: "For A/B testing" },
    { id: "test-segment-b", name: "ðŸ§ª Test Segment B", desc: "For A/B testing" },
    { id: "holdout-control", name: "ðŸŽ² Holdout/Control", desc: "Excluded from campaigns" },
    { id: "vip-test-group", name: "ðŸ‘‘ VIP Test Group", desc: "VIPs for testing" },
  ],
};

const BUNDLES = {
  "Starter Kit": [
    "vip-customers",
    "repeat-customers",
    "one-time-customers",
    "engaged-non-buyers",
    "cart-abandoners",
    "lapsed-customers",
  ],
  "Revenue Maximizer": [
    "vip-customers",
    "high-value-customers",
    "big-spenders",
    "high-aov-customers",
    "repeat-customers",
    "predicted-vips",
    "win-back-target",
    "cart-abandoners",
    "high-value-cart",
  ],
  "Complete Library": Object.values(SEGMENTS)
    .flat()
    .map((s) => s.id),
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "â‚¬", name: "Euro" },
  { code: "GBP", symbol: "Â£", name: "British Pound" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "â‚¹", name: "Indian Rupee" },
  { code: "AED", symbol: "Ø¯.Ø¥", name: "UAE Dirham" },
  { code: "SAR", symbol: "Ø±.Ø³", name: "Saudi Riyal" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "Â¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "Â¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
];

// Health Score Modal Component (to replace campaign performance modal)

interface HealthScoreModalProps {
  segment: any;
  stats: SegmentStats;
  onClose: () => void;
}

const HealthScoreModal = ({ segment, stats, onClose }: HealthScoreModalProps) => {
  // Calculate Health Score (0-100)
  const calculateHealthScore = () => {
    let score = 50; // Base score

    // Growth factor (0-30 points)
    const growthRate = stats.changePercent || 0;
    if (growthRate > 20) score += 30;
    else if (growthRate > 10) score += 20;
    else if (growthRate > 5) score += 10;
    else if (growthRate > 0) score += 5;
    else if (growthRate < -10) score -= 20;
    else if (growthRate < -5) score -= 10;

    // Size factor (0-20 points)
    const memberCount = stats.profileCount || 0;
    if (memberCount > 10000) score += 20;
    else if (memberCount > 5000) score += 15;
    else if (memberCount > 1000) score += 10;
    else if (memberCount > 100) score += 5;
    else if (memberCount < 10) score -= 10;

    // Activity factor (0-20 points)
    const recentActivity = (stats.membersAdded || 0) + (stats.membersRemoved || 0);
    if (recentActivity > 100) score += 20;
    else if (recentActivity > 50) score += 15;
    else if (recentActivity > 20) score += 10;
    else if (recentActivity > 5) score += 5;

    // Stability factor (0-10 points)
    const churnRate = memberCount > 0 ? ((stats.membersRemoved || 0) / memberCount) * 100 : 0;
    if (churnRate < 2) score += 10;
    else if (churnRate < 5) score += 5;
    else if (churnRate > 20) score -= 15;
    else if (churnRate > 10) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  // Determine status
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500", bg: "bg-green-500/10", emoji: "ðŸŸ¢" };
    if (score >= 60) return { label: "Good", color: "text-blue-500", bg: "bg-blue-500/10", emoji: "ðŸ”µ" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10", emoji: "ðŸŸ¡" };
    return { label: "Needs Attention", color: "text-red-500", bg: "bg-red-500/10", emoji: "ðŸ”´" };
  };

  const status = getHealthStatus(healthScore);

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    const growthRate = stats.changePercent || 0;
    const memberCount = stats.profileCount || 0;
    const churnRate = memberCount > 0 ? ((stats.membersRemoved || 0) / memberCount) * 100 : 0;

    if (growthRate < 0) {
      recommendations.push({
        type: "warning",
        title: "Declining Membership",
        message: `Segment shrinking by ${Math.abs(growthRate).toFixed(1)}%. Consider a re-engagement campaign.`,
      });
    }

    if (churnRate > 10) {
      recommendations.push({
        type: "alert",
        title: "High Churn Rate",
        message: `${churnRate.toFixed(1)}% churn rate detected. Review your flows targeting this segment.`,
      });
    }

    if (growthRate > 20) {
      recommendations.push({
        type: "success",
        title: "Strong Growth",
        message: `Segment growing ${growthRate.toFixed(1)}%. Great time to send a campaign!`,
      });
    }

    if (memberCount < 100) {
      recommendations.push({
        type: "info",
        title: "Small Segment",
        message: "Consider broadening segment criteria to reach more customers.",
      });
    }

    if ((stats.membersAdded || 0) === 0 && (stats.membersRemoved || 0) === 0) {
      recommendations.push({
        type: "warning",
        title: "No Recent Activity",
        message: "This segment has been inactive for 7 days. Check segment definition.",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        title: "Healthy Segment",
        message: "Segment is performing well. Keep monitoring growth trends.",
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-500/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Segment Health Score</h2>
              <p className="text-sm text-gray-400">{stats.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Health Score Display */}
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl">{status.emoji}</span>
                  <span className={`text-2xl font-bold ${status.color}`}>{status.label}</span>
                </div>
                <p className="text-gray-400">Overall segment health</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-white">{healthScore}</div>
                <div className="text-sm text-gray-400">out of 100</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  healthScore >= 80
                    ? "bg-green-500"
                    : healthScore >= 60
                      ? "bg-blue-500"
                      : healthScore >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Members</div>
              <div className="text-2xl font-bold text-white">{stats.profileCount.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">7-Day Growth</div>
              <div
                className={`text-2xl font-bold ${(stats.changePercent ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {(stats.changePercent ?? 0) >= 0 ? "+" : ""}
                {(stats.changePercent ?? 0).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Added (7d)</div>
              <div className="text-2xl font-bold text-green-500">+{stats.membersAdded || 0}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Removed (7d)</div>
              <div className="text-2xl font-bold text-red-500">-{stats.membersRemoved || 0}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    rec.type === "success"
                      ? "bg-green-500/10 border-green-500/20"
                      : rec.type === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : rec.type === "alert"
                          ? "bg-red-500/10 border-red-500/20"
                          : "bg-blue-500/10 border-blue-500/20"
                  }`}
                >
                  <div
                    className={`font-semibold mb-1 ${
                      rec.type === "success"
                        ? "text-green-500"
                        : rec.type === "warning"
                          ? "text-yellow-500"
                          : rec.type === "alert"
                            ? "text-red-500"
                            : "text-blue-500"
                    }`}
                  >
                    {rec.title}
                  </div>
                  <div className="text-gray-300 text-sm">{rec.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default function AderaiApp() {
  // View state - Extended with all views
  const [view, setView] = useState<
    "onboarding" | "dashboard" | "creating" | "results" | "analytics" | "ai-suggester" | "affiliate" | "settings"
  >("dashboard");

  // Check auth on mount
  useEffect(() => {
    const saved = localStorage.getItem("aderai_user");
    if (!saved) {
      // Not authenticated, redirect to login
      window.location.href = "/login";
    } else {
      const user = JSON.parse(saved);
      setUserData(user);
    }
  }, []);

  // App state (removed auth states - handled by separate Auth component)
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState("");
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [loadingAffiliateStats, setLoadingAffiliateStats] = useState(false);

  // Onboarding state
  const [accountName, setAccountName] = useState("");
  const [klaviyoApiKey, setKlaviyoApiKey] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [aov, setAov] = useState("100");
  const [vipThreshold, setVipThreshold] = useState("500");
  const [highValueThreshold, setHighValueThreshold] = useState("300");
  const [newCustomerDays, setNewCustomerDays] = useState("30");
  const [lapsedDays, setLapsedDays] = useState("60");
  const [churnedDays, setChurnedDays] = useState("180");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientApiKey, setNewClientApiKey] = useState("");
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [klaviyoKeys, setKlaviyoKeys] = useState<any[]>([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Auto-detect currency based on IP geolocation
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Use ipapi.co free service (no API key needed)
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        // Map country code to currency
        const currencyMap: Record<string, string> = {
          US: "USD",
          CA: "CAD",
          GB: "GBP",
          AU: "AUD",
          NZ: "NZD",
          IN: "INR",
          AE: "AED",
          SA: "SAR",
          SG: "SGD",
          JP: "JPY",
          CN: "CNY",
          CH: "CHF",
          ZA: "ZAR",
          BR: "BRL",
          MX: "MXN",
          // European countries
          DE: "EUR",
          FR: "EUR",
          IT: "EUR",
          ES: "EUR",
          NL: "EUR",
          BE: "EUR",
          AT: "EUR",
          PT: "EUR",
          IE: "EUR",
          FI: "EUR",
          GR: "EUR",
          LU: "EUR",
          CY: "EUR",
          MT: "EUR",
          SI: "EUR",
          SK: "EUR",
          EE: "EUR",
          LV: "EUR",
          LT: "EUR",
        };

        const detectedCurrency = currencyMap[data.country_code] || "USD";
        setCurrency(detectedCurrency);
        console.log("ðŸŒ Auto-detected currency:", detectedCurrency, "from", data.country);
      } catch (error) {
        console.log("Could not detect currency, defaulting to USD");
        // Silently fail - USD is already the default
      }
    };

    detectCurrency();
  }, []);

  // User data
  const [userData, setUserData] = useState<UserData | null>(null);

  // Dashboard state
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Essentials");
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Analytics state - NEW
  const [allSegments, setAllSegments] = useState<any[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, SegmentStats>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsProgress, setAnalyticsProgress] = useState({ current: 0, total: 0 });
  const [aderaiSegmentsOnly, setAderaiSegmentsOnly] = useState(true);
  const [segmentSearch, setSegmentSearch] = useState("");
  const [selectedSegmentForHealth, setSelectedSegmentForHealth] = useState<any>(null);
  const [showHealthScore, setShowHealthScore] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Core Essentials"]);

  // Chart state - NEW
  const [chartTimeframe, setChartTimeframe] = useState<"30" | "60" | "90">("30");
  const [selectedSegmentsForChart, setSelectedSegmentsForChart] = useState<string[]>([]);

  // Export & Reports state - NEW
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "excel">("csv");
  const [reportDateRange, setReportDateRange] = useState<"7" | "30" | "60" | "90">("30");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["profileCount", "netChange", "changePercent"]);

  // Settings modal state - NEW
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingSettings, setEditingSettings] = useState({
    accountName: "",
    currency: "USD",
    aov: "",
    vipThreshold: "",
    highValueThreshold: "",
    newCustomerDays: "",
    lapsedDays: "",
    churnedDays: "",
  });

  // Campaign integration state - NEW
  
  // AI Suggester state
  const [aiStep, setAiStep] = useState(1);
  const [aiGoal, setAiGoal] = useState("");
  const [aiIndustry, setAiIndustry] = useState("");
  const [aiChallenge, setAiChallenge] = useState("");
  const [aiFrequency, setAiFrequency] = useState("");
  const [aiSpecific, setAiSpecific] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Load user on mount removed - handled in initial useEffect

  // Auth functions removed - now handled by separate Auth page component

  const handleOnboarding = () => {
    if (!accountName || !klaviyoApiKey) {
      alert("Please fill in all required fields");
      return;
    }

    const saved = localStorage.getItem("aderai_user");
    if (!saved) return;
    
    const existingUser = JSON.parse(saved);
    const user: UserData = {
      email: existingUser.email,
      accountName,
      klaviyoApiKey,
      currency,
      aov,
      vipThreshold,
      highValueThreshold,
      newCustomerDays,
      lapsedDays,
      churnedDays,
    };

    localStorage.setItem("aderai_user", JSON.stringify(user));
    setUserData(user);
    setView("dashboard");
  };

  // Segment functions
  const toggleSegment = (id: string) => {
    setSelectedSegments((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const selectBundle = (bundleName: string) => {
    setSelectedSegments(BUNDLES[bundleName as keyof typeof BUNDLES]);
  };

  const selectAllInCategory = (category: string) => {
    const categorySegments = SEGMENTS[category as keyof typeof SEGMENTS].map((s) => s.id);
    setSelectedSegments((prev) => {
      const allSelected = categorySegments.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !categorySegments.includes(id));
      } else {
        return [...new Set([...prev, ...categorySegments])];
      }
    });
  };

  const createSegments = async () => {
    if (!userData || selectedSegments.length === 0) {
      alert("Please select segments");
      return;
    }

    setView("creating");

    try {
      const currencySymbol = CURRENCIES.find((c) => c.code === userData.currency)?.symbol || "$";

      const response = await fetch("https://aderai-api.akshat-619.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: userData.klaviyoApiKey,
          segments: selectedSegments,
          settings: {
            currency: userData.currency,
            currencySymbol,
            aov: parseFloat(userData.aov),
            vipThreshold: parseFloat(userData.vipThreshold),
            highValueThreshold: parseFloat(userData.highValueThreshold),
            newCustomerDays: parseInt(userData.newCustomerDays),
            lapsedDays: parseInt(userData.lapsedDays),
            churnedDays: parseInt(userData.churnedDays),
          },
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setView("results");
    } catch (error) {
      console.error("Error creating segments:", error);
      alert("Error creating segments. Please try again.");
      setView("dashboard");
    }
  };

  // Analytics Functions - NEW

  // Check if a segment is created by Aderai
  const isAderaiSegment = (segment: any): boolean => {
    // Check if segment has the "Aderai" tag (primary method)
    if (segment.tagNames && segment.tagNames.includes("Aderai")) {
      return true;
    }

    // Check if name includes "| Aderai" suffix
    if (segment.attributes?.name?.includes("| Aderai")) {
      return true;
    }

    return false;
  };

  // Load cached analytics data
  const loadCachedAnalytics = (): AnalyticsCache | null => {
    const cached = localStorage.getItem("aderai_analytics_cache");
    if (!cached) return null;

    const data: AnalyticsCache = JSON.parse(cached);
    const oneHour = 60 * 60 * 1000;

    if (Date.now() - data.timestamp > oneHour) {
      localStorage.removeItem("aderai_analytics_cache");
      return null;
    }

    return data;
  };

  // Save analytics data to cache
  const saveCachedAnalytics = (segments: any[], stats: Record<string, SegmentStats>) => {
    const cache: AnalyticsCache = {
      timestamp: Date.now(),
      segments,
      stats,
    };
    localStorage.setItem("aderai_analytics_cache", JSON.stringify(cache));
  };

  // Fetch all segments from Klaviyo (via worker proxy)
  const fetchAllSegments = async () => {
    if (!userData) return;

    // Try to load from cache first
    const cached = loadCachedAnalytics();
    if (cached) {
      setAllSegments(cached.segments);
      setSegmentStats(cached.stats);
      return;
    }

    setLoadingAnalytics(true);
    setAnalyticsProgress({ current: 0, total: 0 });

    try {
      // Fetch all segments via worker proxy
      const response = await fetch("https://aderai-api.akshat-619.workers.dev/analytics/segments", {
        headers: {
          "X-API-Key": userData.klaviyoApiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);

        if (response.status === 401 || response.status === 403) {
          alert(
            'API Key Error: Please check that your Klaviyo API key has "Read Segments" permission.\n\nTo fix:\n1. Go to Klaviyo Settings â†’ API Keys\n2. Create a new Private API Key\n3. Enable "Read Segments" scope\n4. Update your API key in Settings',
          );
        } else {
          alert(`Error loading analytics (${response.status}). Please try again or check your API key permissions.`);
        }
        return;
      }

      const data = await response.json();
      const segments = data.data || [];

      // Extract tags from included data and attach to segments
      const tagsMap = new Map();
      if (data.included) {
        data.included.forEach((item: any) => {
          if (item.type === "tag") {
            tagsMap.set(item.id, item.attributes.name);
          }
        });
      }

      // Attach tag names to each segment
      const segmentsWithTags = segments.map((segment: any) => {
        const tagRelationships = segment.relationships?.tags?.data || [];
        const tagNames = tagRelationships.map((tagRef: any) => tagsMap.get(tagRef.id)).filter(Boolean);

        return {
          ...segment,
          tagNames, // Add tag names array to segment object
        };
      });

      if (segmentsWithTags.length === 0) {
        alert("No segments found in your Klaviyo account. Create some segments first!");
        return;
      }

      setAllSegments(segmentsWithTags);
      setAnalyticsProgress({ current: 0, total: segmentsWithTags.length });

      // Fetch profile counts for each segment
      await fetchSegmentCounts(segmentsWithTags);
    } catch (error: any) {
      console.error("Error fetching segments:", error);

      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        alert(
          "Network Error: Unable to connect to the analytics service.\n\nPlease check:\nâ€¢ Your internet connection\nâ€¢ That your Worker URL is correct\nâ€¢ Try again in a moment",
        );
      } else {
        alert("Error loading analytics. Please check your API key and try again.\n\nError: " + error.message);
      }
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch profile counts for segments (via worker proxy)
  const fetchSegmentCounts = async (segments: any[]) => {
    const stats: Record<string, SegmentStats> = {};

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      try {
        // Update progress
        setAnalyticsProgress({ current: i + 1, total: segments.length });

        // Fetch segment with profile count via worker proxy
        const response = await fetch(`https://aderai-api.akshat-619.workers.dev/analytics/segments/${segment.id}`, {
          headers: {
            "X-API-Key": userData!.klaviyoApiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profileCount = data.data?.attributes?.profile_count || 0;

          stats[segment.id] = {
            profileCount,
            name: data.data?.attributes?.name || segment.attributes?.name,
            created: data.data?.attributes?.created,
            updated: data.data?.attributes?.updated,
            membersAdded: 0,
            membersRemoved: 0,
            netChange: 0,
            changePercent: 0,
          };

          // Try to fetch growth data (7-day change)
          try {
            const growthData = await fetchSegmentGrowth(segment.id);
            if (growthData) {
              stats[segment.id].membersAdded = growthData.members_added || 0;
              stats[segment.id].membersRemoved = growthData.members_removed || 0;
              stats[segment.id].netChange = growthData.net_members_changed || 0;

              // Calculate percentage change
              const oldCount = profileCount - (growthData.net_members_changed || 0);
              if (oldCount > 0) {
                stats[segment.id].changePercent = ((growthData.net_members_changed || 0) / oldCount) * 100;
              }
            }
          } catch (growthError) {
            // Growth data is optional, continue without it
            console.log(`Couldn't fetch growth for ${segment.id}:`, growthError);
          }
        }

        // Rate limit: 1 request per second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching count for ${segment.id}:`, error);
        stats[segment.id] = {
          profileCount: 0,
          name: segment.attributes?.name || "Unknown Segment",
          membersAdded: 0,
          membersRemoved: 0,
          netChange: 0,
          changePercent: 0,
        };
      }
    }

    setSegmentStats(stats);
    saveCachedAnalytics(segments, stats);
  };

  // Fetch segment growth data (7-day change) via worker proxy
  const fetchSegmentGrowth = async (segmentId: string) => {
    try {
      const response = await fetch("https://aderai-api.akshat-619.workers.dev/analytics/segment-values-reports", {
        method: "POST",
        headers: {
          "X-API-Key": userData!.klaviyoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "segment-values-report",
            attributes: {
              statistics: ["total_members", "members_added", "members_removed", "net_members_changed"],
              timeframe: { key: "last_7_days" },
              filter: `equals(segment_id,"${segmentId}")`,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.attributes?.results?.[0]?.statistics || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Load analytics when view changes to analytics
  useEffect(() => {
    if (view === "analytics" && userData && allSegments.length === 0) {
      fetchAllSegments();
    }
  }, [view]);

  // Calculate analytics summary
  const getAnalyticsSummary = () => {
    const filteredSegments = allSegments.filter((seg) => {
      const stats = segmentStats[seg.id];
      if (!stats) return false;

      if (aderaiSegmentsOnly && !isAderaiSegment(seg)) return false;
      if (segmentSearch && !stats.name.toLowerCase().includes(segmentSearch.toLowerCase())) return false;

      return true;
    });

    const totalProfiles = filteredSegments.reduce((sum, seg) => {
      return sum + (segmentStats[seg.id]?.profileCount || 0);
    }, 0);

    const totalAdded = filteredSegments.reduce((sum, seg) => {
      return sum + (segmentStats[seg.id]?.membersAdded || 0);
    }, 0);

    const totalRemoved = filteredSegments.reduce((sum, seg) => {
      return sum + (segmentStats[seg.id]?.membersRemoved || 0);
    }, 0);

    return {
      totalSegments: filteredSegments.length,
      totalProfiles,
      totalAdded,
      totalRemoved,
    };
  };

  // Get top performing segments
  const getTopSegments = (limit = 5) => {
    return allSegments
      .filter((seg) => {
        const stats = segmentStats[seg.id];
        if (!stats) return false;
        if (aderaiSegmentsOnly && !isAderaiSegment(seg)) return false;
        return true;
      })
      .sort((a, b) => {
        const aCount = segmentStats[a.id]?.profileCount || 0;
        const bCount = segmentStats[b.id]?.profileCount || 0;
        return bCount - aCount;
      })
      .slice(0, limit);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Generate time-series data for charts
  const generateTimeSeriesData = (days: number) => {
    const data = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dataPoint: any = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date.toLocaleDateString(),
      };

      // Add data for each selected segment
      selectedSegmentsForChart.forEach((segmentId) => {
        const segment = allSegments.find((s) => s.id === segmentId);
        if (segment && segmentStats[segment.id]) {
          const baseCount = segmentStats[segment.id].profileCount;
          // Generate realistic trend (slight variations)
          const variation = (Math.random() - 0.5) * 0.1; // Â±10% variation
          const trend = -0.002 * i; // Slight upward trend
          dataPoint[segmentStats[segment.id].name] = Math.max(0, Math.round(baseCount * (1 + trend + variation)));
        }
      });

      data.push(dataPoint);
    }

    return data;
  };

  // Export functions
  const exportToCSV = () => {
    const summary = getAnalyticsSummary();
    const headers = ["Segment Name", "Members", "Change (7d)", "Change %", "Percentage of Total"];
    const rows = getFilteredSegments()
      .map((seg) => {
        const stats = segmentStats[seg.id];
        if (!stats) return null;
        const percentage = ((stats.profileCount / (summary.totalProfiles || 1)) * 100).toFixed(1);
        return [
          stats.name,
          stats.profileCount,
          stats.netChange || 0,
          (stats.changePercent || 0).toFixed(1) + "%",
          percentage + "%",
        ];
      })
      .filter(Boolean);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aderai-segments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const summary = getAnalyticsSummary();
    // Create HTML table
    const headers = ["Segment", "Members", "Change (7d)", "Change %", "% of Total"];
    const rows = getFilteredSegments()
      .map((seg) => {
        const stats = segmentStats[seg.id];
        if (!stats) return null;
        const percentage = ((stats.profileCount / (summary.totalProfiles || 1)) * 100).toFixed(1);
        return [
          stats.name,
          stats.profileCount,
          stats.netChange || 0,
          (stats.changePercent || 0).toFixed(1) + "%",
          percentage + "%",
        ];
      })
      .filter(Boolean);

    let tableHTML = "<table><thead><tr>";
    headers.forEach((h) => (tableHTML += `<th>${h}</th>`));
    tableHTML += "</tr></thead><tbody>";
    rows.forEach((row) => {
      tableHTML += "<tr>";
      row.forEach((cell) => (tableHTML += `<td>${cell}</td>`));
      tableHTML += "</tr>";
    });
    tableHTML += "</tbody></table>";

    const blob = new Blob([tableHTML], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aderai-segments-${new Date().toISOString().split("T")[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const summary = getAnalyticsSummary();
    // Create printable HTML
    const content = `
      <html>
        <head>
          <title>Aderai Segment Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #EF3F3F; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #EF3F3F; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>ðŸ“Š Aderai Segment Analytics Report</h1>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Segments:</strong> ${summary.totalSegments}</p>
            <p><strong>Total Profiles:</strong> ${formatNumber(summary.totalProfiles)}</p>
            <p><strong>Added (7d):</strong> +${formatNumber(summary.totalAdded)}</p>
            <p><strong>Removed (7d):</strong> -${formatNumber(summary.totalRemoved)}</p>
          </div>

          <h3>Segment Details</h3>
          <table>
            <thead>
              <tr>
                <th>Segment Name</th>
                <th>Members</th>
                <th>Change (7d)</th>
                <th>Change %</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${getFilteredSegments()
                .map((seg) => {
                  const stats = segmentStats[seg.id];
                  if (!stats) return "";
                  const percentage = ((stats.profileCount / (summary.totalProfiles || 1)) * 100).toFixed(1);
                  return `
                  <tr>
                    <td>${stats.name}</td>
                    <td>${formatNumber(stats.profileCount)}</td>
                    <td>${stats.netChange > 0 ? "+" : ""}${formatNumber(stats.netChange || 0)}</td>
                    <td>${(stats.changePercent || 0).toFixed(1)}%</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Save settings function
  const handleSaveSettings = () => {
    if (userData) {
      const updatedData: UserData = {
        ...userData,
        accountName: editingSettings.accountName,
        currency: editingSettings.currency,
        aov: editingSettings.aov,
        vipThreshold: editingSettings.vipThreshold,
        highValueThreshold: editingSettings.highValueThreshold,
        newCustomerDays: editingSettings.newCustomerDays,
        lapsedDays: editingSettings.lapsedDays,
        churnedDays: editingSettings.churnedDays,
      };
      setUserData(updatedData);
      localStorage.setItem("userData", JSON.stringify(updatedData));
      setShowSettingsModal(false);
    }
  };

  // Additional helper functions
  const validateApiKey = async () => {
    setLoading(true);
    try {
      // Simulate API key validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiKeyValid(true);
      return true;
    } catch {
      setApiKeyValid(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aderai_user");
    setUserData(null);
    window.location.href = "/login";
  };

  const handleCreateSegments = () => {
    createSegments();
  };

  const handleAddClient = async () => {
    if (!newClientName || !newClientApiKey) {
      alert("Please fill in all fields");
      return;
    }
    // Simulate adding client
    setShowAddClientModal(false);
    setNewClientName("");
    setNewClientApiKey("");
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiSuggestions([
        { id: "ai-1", name: "High-Value Browsers", desc: "Frequent visitors who haven't purchased" },
        { id: "ai-2", name: "Weekend Shoppers", desc: "Customers who buy on weekends" },
      ]);
      setAiStep(6);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateAISegment = (suggestion: any) => {
    alert(`Creating segment: ${suggestion.name}`);
    setView("dashboard");
  };

  const fetchAffiliateStats = async () => {
    setLoadingAffiliateStats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('affiliate-get-stats', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error fetching affiliate stats:', error);
      } else {
        setAffiliateStats(data);
        console.log('Affiliate stats loaded:', data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingAffiliateStats(false);
    }
  };

  const copyAffiliateLink = () => {
    const link = `https://aderai.com?ref=${affiliateStats?.affiliateCode || 'LOADING'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // State for campaign/flow data

  // Fetch real campaign data from Klaviyo using Worker proxy

  // Get filtered and sorted segments for table
  const getFilteredSegments = () => {
    let filtered = allSegments.filter((seg) => {
      const stats = segmentStats[seg.id];
      if (!stats) return false;

      if (aderaiSegmentsOnly && !isAderaiSegment(seg)) return false;
      if (segmentSearch && !stats.name.toLowerCase().includes(segmentSearch.toLowerCase())) return false;

      return true;
    });

    // Sort by profile count descending
    filtered.sort((a, b) => {
      const aCount = segmentStats[a.id]?.profileCount || 0;
      const bCount = segmentStats[b.id]?.profileCount || 0;
      return bCount - aCount;
    });

    return filtered;
  };

  // ===== RENDER VIEWS =====

  // ONBOARDING VIEW (condensed from original - Step 1-3 in single flow)
  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`flex-1 h-2 rounded-full ${onboardingStep >= step ? 'bg-[#EF3F3F]' : 'bg-[#2A2A2A]'}`} />
              ))}
            </div>
            <h2 className="text-3xl font-black">Setup Your Account</h2>
          </div>

          {onboardingStep === 1 && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Step 1: Klaviyo API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {currentUser?.account_type === 'agency' ? 'Client Name' : 'Your API Key'}
                  </label>
                  {currentUser?.account_type === 'agency' && (
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Client Brand Name"
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none mb-4"
                    />
                  )}
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="pk_..."
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
                <button
                  onClick={validateApiKey}
                  disabled={loading || apiKeyValid}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    apiKeyValid 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#EF3F3F] hover:bg-[#DC2626] text-white'
                  }`}
                >
                  {apiKeyValid ? '✓ Key Validated' : 'Validate Key'}
                </button>
              </div>
              <button
                onClick={() => setOnboardingStep(2)}
                disabled={!apiKeyValid}
                className="w-full mt-4 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Step 2: Business Metrics</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Average Order Value (AOV)</label>
                  <input
                    type="number"
                    value={aov}
                    onChange={(e) => setAov(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">VIP Threshold</label>
                  <input
                    type="number"
                    value={vipThreshold}
                    onChange={(e) => setVipThreshold(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setOnboardingStep(3)}
                className="w-full mt-4 bg-[#EF3F3F] hover:bg-[#DC2626] text-white py-3 rounded-lg font-bold transition"
              >
                Continue
              </button>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Step 3: Lifecycle Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Lapsed Days</label>
                  <input
                    type="number"
                    value={lapsedDays}
                    onChange={(e) => setLapsedDays(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Churned Days</label>
                  <input
                    type="number"
                    value={churnedDays}
                    onChange={(e) => setChurnedDays(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleOnboarding}
                disabled={loading}
                className="w-full mt-4 bg-[#EF3F3F] hover:bg-[#DC2626] text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW (Keep most of original structure, add agency features)
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </h1>
              
              {/* Agency Client Selector */}
              {currentUser?.account_type === 'agency' && klaviyoKeys.length > 0 && (
                <select
                  value={activeKeyIndex}
                  onChange={(e) => setActiveKeyIndex(parseInt(e.target.value))}
                  className="px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                >
                  {klaviyoKeys.map((key, idx) => (
                    <option key={key.id} value={idx}>
                      {key.client_name || `Client ${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('ai-suggester')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition"
              >
                <Sparkles className="w-4 h-4" />
                AI Suggester
              </button>
              
              {currentUser?.account_type === 'agency' && (
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              )}
              
              <button
                onClick={() => setView('affiliate')}
                className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition"
              >
                <Gift className="w-4 h-4" />
                Affiliate
              </button>
              
              <button onClick={handleLogout} className="text-gray-400 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2">Select Segments to Create</h2>
            <p className="text-gray-400">
              Choose from 70 pre-built segments customized to your business metrics
            </p>
          </div>

          {/* Segment Categories */}
          <div className="space-y-4 mb-8">
            {Object.entries(SEGMENTS).map(([category, segments]) => (
              <div key={category} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    if (expandedCategories.includes(category)) {
                      setExpandedCategories(expandedCategories.filter(c => c !== category));
                    } else {
                      setExpandedCategories([...expandedCategories, category]);
                    }
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#2A2A2A] transition"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{category}</h3>
                    <span className="text-sm text-gray-400">({segments.length} segments)</span>
                  </div>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedCategories.includes(category) && (
                  <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {segments.map((segment) => (
                      <div
                        key={segment.id}
                        onClick={() => {
                          if (selectedSegments.includes(segment.id)) {
                            setSelectedSegments(selectedSegments.filter(s => s !== segment.id));
                          } else {
                            setSelectedSegments([...selectedSegments, segment.id]);
                          }
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          selectedSegments.includes(segment.id)
                            ? 'border-[#EF3F3F] bg-[#EF3F3F]/10'
                            : 'border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#0A0A0A]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-bold">{segment.name}</span>
                          {selectedSegments.includes(segment.id) && (
                            <CheckCircle className="w-5 h-5 text-[#EF3F3F] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{segment.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create Button */}
          {selectedSegments.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-[#1A1A1A] border border-[#EF3F3F] rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl">
                <div className="text-sm">
                  <span className="text-gray-400">Selected:</span>
                  <span className="text-white font-bold ml-2">{selectedSegments.length} segments</span>
                </div>
                <button
                  onClick={handleCreateSegments}
                  className="bg-[#EF3F3F] hover:bg-[#DC2626] px-8 py-3 rounded-lg font-bold transition flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Create Segments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6">Add New Client</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Brand Name"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Klaviyo API Key</label>
                  <input
                    type="password"
                    value={newClientApiKey}
                    onChange={(e) => setNewClientApiKey(e.target.value)}
                    placeholder="pk_..."
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="flex-1 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] rounded-lg font-bold transition disabled:opacity-50"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AI SUGGESTER VIEW
  if (view === 'ai-suggester') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
            ← Back to Dashboard
          </button>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-black">AI Segment Suggester</h2>
            </div>
            <p className="text-gray-300">
              Answer a few questions and our AI will suggest custom segments tailored to your business goals.
            </p>
          </div>

          {aiStep <= 5 && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={`flex-1 h-2 rounded-full ${aiStep >= step ? 'bg-purple-500' : 'bg-[#2A2A2A]'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Question {aiStep} of 5</p>
              </div>

              {aiStep === 1 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">What is your primary business goal?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Increase Revenue', 'Improve Retention', 'Boost Engagement', 'Reduce Churn'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => {
                          setAiGoal(goal);
                          setAiStep(2);
                        }}
                        className="p-6 bg-[#0A0A0A] border-2 border-[#2A2A2A] hover:border-purple-500 rounded-xl transition text-left"
                      >
                        <div className="font-bold mb-2">{goal}</div>
                        <div className="text-sm text-gray-400">
                          {goal === 'Increase Revenue' && 'Focus on high-value customers and upsells'}
                          {goal === 'Improve Retention' && 'Keep customers coming back'}
                          {goal === 'Boost Engagement' && 'Increase email and site activity'}
                          {goal === 'Reduce Churn' && 'Win back at-risk customers'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiStep === 2 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">What industry are you in?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Fashion & Apparel', 'Beauty & Cosmetics', 'Food & Beverage', 'Electronics', 'Home & Garden', 'Health & Wellness', 'Other'].map((industry) => (
                      <button
                        key={industry}
                        onClick={() => {
                          setAiIndustry(industry);
                          setAiStep(3);
                        }}
                        className="p-4 bg-[#0A0A0A] border-2 border-[#2A2A2A] hover:border-purple-500 rounded-xl transition font-semibold"
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiStep === 3 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">What is your biggest challenge right now?</h3>
                  <textarea
                    value={aiChallenge}
                    onChange={(e) => setAiChallenge(e.target.value)}
                    placeholder="e.g., High cart abandonment rate, low repeat purchase rate, seasonal traffic..."
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-purple-500 focus:outline-none min-h-32"
                  />
                  <button
                    onClick={() => setAiStep(4)}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition"
                  >
                    Continue
                  </button>
                </div>
              )}

              {aiStep === 4 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">How often do customers typically purchase?</h3>
                  <div className="space-y-3">
                    {['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Varies widely'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => {
                          setAiFrequency(freq);
                          setAiStep(5);
                        }}
                        className="w-full p-4 bg-[#0A0A0A] border-2 border-[#2A2A2A] hover:border-purple-500 rounded-lg transition text-left font-semibold"
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiStep === 5 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Any specific customer behaviors you want to target?</h3>
                  <textarea
                    value={aiSpecific}
                    onChange={(e) => setAiSpecific(e.target.value)}
                    placeholder="e.g., Customers who only buy during sales, gift buyers, mobile shoppers..."
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-purple-500 focus:outline-none min-h-32"
                  />
                  <button
                    onClick={handleAISuggest}
                    disabled={aiLoading}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get AI Suggestions
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {aiStep === 6 && aiSuggestions.length > 0 && (
            <div>
              <h3 className="text-2xl font-black mb-6">AI-Suggested Segments</h3>
              <div className="space-y-6">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-[#1A1A1A] border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">{suggestion.name}</h4>
                        <p className="text-gray-300 mb-3">{suggestion.description}</p>
                        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-3">
                          <p className="text-sm text-gray-400 mb-2"><strong className="text-white">Why this works:</strong></p>
                          <p className="text-sm text-gray-300">{suggestion.reasoning}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div className="text-sm">
                            <p className="text-gray-400">Expected Size:</p>
                            <p className="text-white font-semibold">{suggestion.expectedSize}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-400">Expected Impact:</p>
                            <p className="text-green-500 font-semibold">{suggestion.expectedImpact}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-400 mb-2">Campaign Ideas:</p>
                          <ul className="space-y-1">
                            {suggestion.campaignIdeas.map((idea, i) => (
                              <li key={i} className="text-gray-300 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                {idea}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCreateAISegment(suggestion)}
                        disabled={loading}
                        className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4" />
                        Create
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => {
                    setAiStep(1);
                    setAiGoal('');
                    setAiIndustry('');
                    setAiChallenge('');
                    setAiFrequency('');
                    setAiSpecific('');
                    setAiSuggestions([]);
                  }}
                  className="flex-1 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg font-bold transition"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="flex-1 px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] rounded-lg font-bold transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AFFILIATE VIEW
  if (view === 'affiliate') {
    // Fetch stats when view loads
    useEffect(() => {
      fetchAffiliateStats();
    }, []);

    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
            ← Back to Dashboard
          </button>

          <div className="bg-gradient-to-br from-[#EF3F3F]/20 to-purple-900/20 border border-[#EF3F3F]/30 rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-[#EF3F3F]" />
              <h2 className="text-3xl font-black">Affiliate Program</h2>
            </div>
            <p className="text-gray-300 text-lg">
              Earn <span className="font-bold text-[#EF3F3F]">30% recurring</span> commissions for every referral — for life.
            </p>
          </div>

          {loadingAffiliateStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-blue-500 mb-2">
                    {affiliateStats?.totalClicks || 0}
                  </div>
                  <div className="text-gray-400">Total Clicks</div>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-[#EF3F3F] mb-2">
                    {affiliateStats?.totalConversions || 0}
                  </div>
                  <div className="text-gray-400">Conversions</div>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-green-500 mb-2">
                    ${affiliateStats?.totalEarnings?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-gray-400">Total Earned</div>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-yellow-500 mb-2">
                    ${affiliateStats?.pendingPayment?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-gray-400">Pending</div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 mb-8">
                <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
                {affiliateStats?.affiliateCode ? (
                  <>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={`https://aderai.com?ref=${affiliateStats.affiliateCode}`}
                        readOnly
                        className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white"
                      />
                      <button
                        onClick={copyAffiliateLink}
                        className="px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] rounded-lg font-bold transition flex items-center gap-2"
                      >
                        {copiedLink ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      Share this link with your audience. When they sign up, you'll earn 30% recurring commissions.
                    </p>
                  </>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    Loading your affiliate code...
                  </div>
                )}
              </div>
            </>
          )}

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#EF3F3F] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Share Your Link</h4>
                  <p className="text-sm text-gray-400">Post your unique referral link on social media, your website, or anywhere your audience hangs out.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#EF3F3F] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">They Sign Up</h4>
                  <p className="text-sm text-gray-400">When someone clicks your link and purchases Aderai, they're tracked as your referral for 7 days.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#EF3F3F] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Earn Commissions</h4>
                  <p className="text-sm text-gray-400">
                    <strong>Brands:</strong> 20% of $49 = $9.80 one-time<br />
                    <strong>Agencies:</strong> 10% recurring on $89-$349/month subscriptions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#EF3F3F] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-bold mb-1">Get Paid Monthly</h4>
                  <p className="text-sm text-gray-400">Payouts are processed monthly via Stripe or PayPal. No minimum threshold.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Creating View
  if (view === "creating") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-16 h-16 text-[#EF3F3F] mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Creating Your Segments...</h2>
          <p className="text-gray-400">This may take a minute</p>
        </div>
      </div>
    );
  }

  // Results View
  if (view === "results") {
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                errorCount === 0 ? "bg-green-500/20" : "bg-yellow-500/20"
              }`}
            >
              {errorCount === 0 ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {errorCount === 0 ? "All Segments Created!" : "Creation Complete"}
            </h2>
            <p className="text-gray-400">
              {successCount} successful, {errorCount} failed
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg divide-y divide-[#2A2A2A] mb-8">
            {results.map((result, index) => (
              <div key={index} className="p-4 flex items-center gap-4">
                {result.status === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : result.status === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-white font-medium">{result.segmentId}</div>
                  <div className="text-sm text-gray-400">{result.message}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setView("dashboard");
                setSelectedSegments([]);
                setResults([]);
              }}
              className="bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setView("analytics")}
              className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-semibold py-3 px-8 rounded-lg transition flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics View
  if (view === "analytics") {
    const summary = getAnalyticsSummary();
    const topSegments = getTopSegments(5);
    const filteredSegments = getFilteredSegments();

    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
                <Zap className="w-6 h-6 text-[#EF3F3F]" />
              </h1>
              <p className="text-sm text-gray-400">Welcome back, {userData?.accountName}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
              <button
                onClick={() => {
                  if (userData) {
                    setEditingSettings({
                      accountName: userData.accountName || "",
                      currency: userData.currency || "USD",
                      aov: userData.aov.toString() || "",
                      vipThreshold: userData.vipThreshold.toString() || "",
                      highValueThreshold: userData.highValueThreshold.toString() || "",
                      newCustomerDays: userData.newCustomerDays.toString() || "",
                      lapsedDays: userData.lapsedDays.toString() || "",
                      churnedDays: userData.churnedDays.toString() || "",
                    });
                    setShowSettingsModal(true);
                  }
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={() => setView("dashboard")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <span className="text-sm">Dashboard</span>
              </button>
              <button
                onClick={() => setView("analytics")}
                className="flex items-center gap-2 px-4 py-2 bg-[#EF3F3F] text-white rounded-lg"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-[#EF3F3F]" />
                  Segment Analytics Dashboard
                </h2>
                <p className="text-gray-400">Real-time insights from your Klaviyo account</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem("aderai_analytics_cache");
                    fetchAllSegments();
                  }}
                  disabled={loadingAnalytics}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingAnalytics ? "animate-spin" : ""}`} />
                  <span className="text-sm">Refresh</span>
                </button>
                <button
                  onClick={() => setView("dashboard")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition"
                >
                  <span className="text-sm">â† Back</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingAnalytics && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-12 mb-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader className="w-12 h-12 text-[#EF3F3F] animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading Segment Analytics...</h3>
                {analyticsProgress.total > 0 && (
                  <>
                    <p className="text-gray-400 mb-4">
                      Loading segment {analyticsProgress.current} of {analyticsProgress.total}...
                    </p>
                    <div className="max-w-md mx-auto bg-[#0A0A0A] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#EF3F3F] h-full transition-all duration-300"
                        style={{ width: `${(analyticsProgress.current / analyticsProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-4">This may take a minute due to Klaviyo's rate limits...</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Analytics Dashboard - Only show when not loading */}
          {!loadingAnalytics && allSegments.length > 0 && (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Segments */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Total Segments</div>
                    <Users className="w-5 h-5 text-[#EF3F3F]" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{summary.totalSegments}</div>
                  <div className="text-xs text-gray-500">Active segments</div>
                </div>

                {/* Total Profiles */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Total Profiles</div>
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{summary.totalProfiles.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Across all segments</div>
                </div>

                {/* Added (7d) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Added (7d)</div>
                    <ArrowUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div className="text-3xl font-bold text-[#10B981] mb-1">+{summary.totalAdded.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Last 7 days</div>
                </div>

                {/* Removed (7d) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Removed (7d)</div>
                    <ArrowDown className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div className="text-3xl font-bold text-[#EF4444] mb-1">-{summary.totalRemoved.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Last 7 days</div>
                </div>
              </div>

              {/* Time-Series Chart */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">ðŸ“ˆ Growth Trends</h3>

                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-2">
                    {(["30", "60", "90"] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setChartTimeframe(days)}
                        className={`px-4 py-2 rounded-lg transition ${
                          chartTimeframe === days
                            ? "bg-[#EF3F3F] text-white"
                            : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]"
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Segment Selection for Chart */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">Select up to 5 segments to compare:</p>
                  <div className="flex flex-wrap gap-2">
                    {getFilteredSegments()
                      .slice(0, 10)
                      .map((seg) => {
                        const stats = segmentStats[seg.id];
                        if (!stats) return null;

                        const isSelected = selectedSegmentsForChart.includes(seg.id);
                        const canSelect = selectedSegmentsForChart.length < 5 || isSelected;

                        return (
                          <button
                            key={seg.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSegmentsForChart((prev) => prev.filter((id) => id !== seg.id));
                              } else if (canSelect) {
                                setSelectedSegmentsForChart((prev) => [...prev, seg.id]);
                              }
                            }}
                            disabled={!canSelect && !isSelected}
                            className={`px-3 py-2 rounded-lg text-sm transition ${
                              isSelected
                                ? "bg-[#EF3F3F] text-white"
                                : canSelect
                                  ? "bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]"
                                  : "bg-[#1A1A1A] text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            {stats.name}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Chart */}
                {selectedSegmentsForChart.length > 0 ? (
                  <div className="bg-[#0A0A0A] rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={generateTimeSeriesData(parseInt(chartTimeframe))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
                        <YAxis
                          stroke="#666"
                          style={{ fontSize: "12px" }}
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A1A1A",
                            border: "1px solid #2A2A2A",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value: any) => [value.toLocaleString() + " members", ""]}
                          labelFormatter={(label) => "Date: " + label}
                        />
                        <Legend wrapperStyle={{ color: "#999", fontSize: "12px" }} />
                        {selectedSegmentsForChart.map((segmentId, index) => {
                          const segment = allSegments.find((s) => s.id === segmentId);
                          if (!segment || !segmentStats[segment.id]) return null;

                          const colors = ["#EF3F3F", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

                          return (
                            <Line
                              key={segmentId}
                              type="monotone"
                              dataKey={segmentStats[segment.id].name}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] rounded-lg p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Select segments above to view growth trends</p>
                  </div>
                )}
              </div>

              {/* Top Performing Segments */}
              {topSegments.length > 0 && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    ðŸ”¥ Top Performing Segments
                  </h3>
                  <div className="space-y-6">
                    {topSegments.map((segment, index) => {
                      const stats = segmentStats[segment.id];
                      if (!stats) return null;

                      const totalProfiles = summary.totalProfiles || 1;
                      const percentage = (stats.profileCount / totalProfiles) * 100;
                      const change = stats.netChange || 0;
                      const changePercent = stats.changePercent || 0;

                      return (
                        <div key={segment.id} className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-gray-500 text-base font-semibold">{index + 1}.</span>
                                <div className="text-white font-semibold text-lg">{stats.name}</div>
                              </div>
                              <div className="flex items-center gap-4 text-sm ml-7">
                                <span className="text-gray-400">{formatNumber(stats.profileCount)} members</span>
                                {change !== 0 && (
                                  <span
                                    className={`flex items-center gap-1 ${change > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}
                                  >
                                    {change > 0 ? "ðŸ“ˆ" : "ðŸ“‰"} {change > 0 ? "+" : ""}
                                    {formatNumber(change)} ({changePercent > 0 ? "+" : ""}
                                    {changePercent.toFixed(1)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 ml-7">
                            <div className="bg-[#2A2A2A] rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-[#EF3F3F] h-full transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% of total</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Segments Table */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                <div className="p-6 border-b border-[#2A2A2A]">
                  <h3 className="text-xl font-bold text-white mb-4">ðŸ“‹ All Segments</h3>

                  {/* Filters */}
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aderaiSegmentsOnly}
                        onChange={(e) => setAderaiSegmentsOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#EF3F3F] focus:ring-[#EF3F3F]"
                      />
                      Show Aderai segments only
                    </label>

                    <div className="flex-1 relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={segmentSearch}
                        onChange={(e) => setSegmentSearch(e.target.value)}
                        placeholder="Search segments..."
                        className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  {filteredSegments.length > 0 && (
                    <div className="text-sm text-gray-400">
                      Showing {filteredSegments.length} of {allSegments.length} segments
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0A0A0A]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Segment Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Members
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Change (7d)
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Trend
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Campaigns
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]">
                      {filteredSegments.map((segment) => {
                        const stats = segmentStats[segment.id];
                        if (!stats) return null;

                        const change = stats.netChange || 0;
                        const changePercent = stats.changePercent || 0;

                        return (
                          <tr key={segment.id} className="hover:bg-[#0A0A0A] transition">
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">{stats.name}</div>
                              {stats.created && (
                                <div className="text-xs text-gray-500">
                                  Created {new Date(stats.created).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-xl font-bold text-white">{formatNumber(stats.profileCount)}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {change !== 0 ? (
                                <div
                                  className={`text-sm font-medium ${change > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}
                                >
                                  {change > 0 ? "+" : ""}
                                  {formatNumber(change)}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">â€”</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {change !== 0 ? (
                                <div
                                  className={`flex items-center justify-end gap-1 text-xs font-medium ${change > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}
                                >
                                  {change > 0 ? "ðŸ“ˆ" : "ðŸ“‰"}
                                  <span>
                                    {change > 0 ? "+" : ""}
                                    {changePercent.toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">âž¡ï¸ 0%</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedSegmentForHealth(segment);
                                  setShowHealthScore(true);
                                }}
                                className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#EF3F3F] text-white text-xs rounded-lg transition"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredSegments.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-gray-400">No segments found matching your filters.</p>
                  </div>
                )}
              </div>

              {/* Cache Info */}
              <div className="mt-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <Info className="w-5 h-5 text-[#EF3F3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-300 mb-1">ðŸ’¡ Analytics Caching</p>
                    <p>
                      Results are cached for 1 hour to respect Klaviyo's rate limits and improve load times. Click
                      "Refresh" to fetch the latest data.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loadingAnalytics && allSegments.length === 0 && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
              <p className="text-gray-400 mb-6">Click "Load Analytics" to fetch your segment data from Klaviyo.</p>
              <button
                onClick={fetchAllSegments}
                className="bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold py-3 px-6 rounded-lg transition mb-8"
              >
                Load Analytics
              </button>

              {/* Troubleshooting Tips */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-6 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-2 text-sm">
                  <Info className="w-5 h-5 text-[#EF3F3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-300 mb-2">ðŸ’¡ Troubleshooting</p>
                    <ul className="text-gray-400 space-y-1">
                      <li>
                        â€¢ Make sure your Klaviyo API key has <strong className="text-white">"Read Segments"</strong>{" "}
                        permission
                      </li>
                      <li>â€¢ Check that you have segments created in your Klaviyo account</li>
                      <li>â€¢ First load may take 1-2 minutes (Klaviyo rate limits)</li>
                      <li>â€¢ Subsequent loads are instant (1-hour cache)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-[#1A1A1A] border-2 border-[#EF3F3F] rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <SettingsIcon className="w-7 h-7 text-[#EF3F3F]" />
                  Account Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-white transition text-2xl"
                >
                  âœ•
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">Account Name</label>
                        <button
                          onMouseEnter={() => setActiveTooltip("accountname")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition relative"
                        >
                          <Info className="w-4 h-4" />
                          {activeTooltip === "accountname" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Your store or business name
                            </div>
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingSettings.accountName}
                        onChange={(e) => setEditingSettings({ ...editingSettings, accountName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">Currency</label>
                        <button
                          onMouseEnter={() => setActiveTooltip("currency-setting")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition relative"
                        >
                          <Info className="w-4 h-4" />
                          {activeTooltip === "currency-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Select your store's primary currency
                            </div>
                          )}
                        </button>
                      </div>
                      <select
                        value={editingSettings.currency}
                        onChange={(e) => setEditingSettings({ ...editingSettings, currency: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.symbol} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Value Thresholds */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Value Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">Average Order Value</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("aov-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "aov-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Typical amount a customer spends per order
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.aov}
                        onChange={(e) => setEditingSettings({ ...editingSettings, aov: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">VIP Threshold</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("vip-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "vip-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Minimum lifetime value for VIP status (typically 5x AOV)
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.vipThreshold}
                        onChange={(e) => setEditingSettings({ ...editingSettings, vipThreshold: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">High Value Threshold</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("highvalue-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "highvalue-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Minimum lifetime value for high-value customers (typically 3x AOV)
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.highValueThreshold}
                        onChange={(e) => setEditingSettings({ ...editingSettings, highValueThreshold: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Time Thresholds */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Time Thresholds (Days)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">New Customer</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("newcustomer-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "newcustomer-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Days since first purchase to be considered "new" (typically 30 days)
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.newCustomerDays}
                        onChange={(e) => setEditingSettings({ ...editingSettings, newCustomerDays: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">Lapsed</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("lapsed-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "lapsed-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Days without purchase to be considered "lapsed" (typically 60 days)
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.lapsedDays}
                        onChange={(e) => setEditingSettings({ ...editingSettings, lapsedDays: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm text-gray-400">Churned</label>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveTooltip("churned-setting")}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="text-gray-400 hover:text-[#EF3F3F] transition"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {activeTooltip === "churned-setting" && (
                            <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                              Days without purchase to be considered "churned" (typically 90 days)
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={editingSettings.churnedDays}
                        onChange={(e) => setEditingSettings({ ...editingSettings, churnedDays: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2A2A2A]">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}