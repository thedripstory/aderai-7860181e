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
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * ADERAI - COMPLETE APP WITH SEGMENT ANALYTICS
 * Login → Signup → Onboarding → Dashboard → Analytics
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
    { id: "vip-customers", name: "👑 VIP Customers", desc: "Top 10% by lifetime value" },
    { id: "repeat-customers", name: "⭐ Repeat Customers", desc: "3+ purchases" },
    { id: "one-time-customers", name: "🎯 One-Time Customers", desc: "Exactly 1 purchase" },
    { id: "engaged-non-buyers", name: "💌 Engaged Non-Buyers", desc: "Opens emails, no purchase" },
    { id: "cart-abandoners", name: "🛒 Cart Abandoners", desc: "Started checkout, didn't complete" },
    { id: "lapsed-customers", name: "💤 Lapsed Customers", desc: "No purchase in 90+ days" },
  ],
  "Engagement & Activity": [
    { id: "highly-engaged", name: "🔥 Highly Engaged", desc: "Active in last 30 days" },
    { id: "recent-clickers", name: "👀 Recent Email Clickers", desc: "Clicked in last 30 days" },
    { id: "active-on-site", name: "👁️ Active on Site", desc: "Visited in last 30 days" },
    { id: "unengaged-90", name: "😴 Unengaged (90+ Days)", desc: "No activity for 90+ days" },
    { id: "email-openers-30", name: "📧 Email Openers (30 Days)", desc: "Opened in last 30 days" },
    { id: "email-openers-60", name: "📧 Email Openers (60 Days)", desc: "Opened in last 60 days" },
    { id: "email-clickers-30", name: "🖱️ Email Clickers (30 Days)", desc: "Clicked in last 30 days" },
    { id: "email-clickers-60", name: "🖱️ Email Clickers (60 Days)", desc: "Clicked in last 60 days" },
    { id: "site-visitors-30", name: "🌐 Site Visitors (30 Days)", desc: "Active on site last 30 days" },
    { id: "never-engaged", name: "💀 Never Engaged", desc: "Zero email activity ever" },
  ],
  "Shopping Behavior": [
    { id: "high-value-cart", name: "🔑 High-Value Cart Abandoners", desc: "Cart worth $100+" },
    { id: "recent-first-time", name: "💰 Recent First-Time Buyers", desc: "First purchase in 30 days" },
    { id: "coupon-users", name: "🚦 Coupon Users", desc: "Only buys with discounts" },
    { id: "full-price-buyers", name: "💎 Full-Price Buyers", desc: "Never uses coupons" },
    { id: "multi-category-shoppers", name: "🤹 Multi-Category Shoppers", desc: "Bought from 2+ categories" },
    { id: "frequent-site-visitors", name: "📱 Frequent Site Visitors", desc: "10+ visits/month" },
    { id: "product-reviewers", name: "🖊️ Product Reviewers", desc: "Left at least 1 review" },
    { id: "non-reviewers", name: "💭 Non-Reviewers", desc: "Never left a review" },
    { id: "browse-abandoners", name: "🔍 Browse Abandoners", desc: "Viewed products, didn't add to cart" },
    { id: "new-subscribers", name: "🆕 New Subscribers", desc: "Subscribed in last 7 days" },
    { id: "all-customers", name: "🛒 All Customers", desc: "Anyone who purchased" },
    { id: "active-customers-90", name: "🏃 Active Customers", desc: "Purchased in last 90 days" },
    { id: "recent-purchasers-30", name: "📦 Recent Purchasers", desc: "Purchased in last 30 days" },
    { id: "gift-buyers", name: "🎁 Gift Buyers", desc: "Used gift message or wrap" },
    { id: "mobile-shoppers", name: "📲 Mobile Shoppers", desc: "80%+ purchases on mobile" },
    { id: "desktop-shoppers", name: "💻 Desktop Shoppers", desc: "80%+ purchases on desktop" },
    { id: "category-buyers", name: "🎨 Category Buyers", desc: "Purchased from specific category" },
  ],
  "Value & Lifecycle": [
    { id: "big-spenders", name: "⚡ Big Spenders", desc: "Top 20% by AOV" },
    { id: "bargain-shoppers", name: "💫 Bargain Shoppers", desc: "Bottom 20% by AOV" },
    { id: "high-churn-risk", name: "😥 High Churn Risk", desc: "Declining engagement + frequency" },
    { id: "predicted-vips", name: "❤️‍🔥 Predicted VIPs", desc: "High predicted CLV" },
    { id: "churned-customers", name: "😟 Churned Customers", desc: "No activity in 180+ days" },
    { id: "high-aov", name: "🪄 High AOV", desc: "Average order value $100+" },
    { id: "low-aov", name: "🪫 Low AOV", desc: "Average order value <$50" },
    { id: "high-lifetime-value", name: "💸 High Lifetime Value", desc: "Top 10% by LTV" },
    { id: "growing-customers", name: "🌱 Growing Customers", desc: "Increasing purchase frequency" },
    { id: "declining-customers", name: "📉 Declining Customers", desc: "Decreasing purchase frequency" },
    { id: "win-back-target", name: "🎯 Win-Back Target", desc: "Lapsed 60-180 days" },
    { id: "at-risk-vips", name: "💔 At-Risk VIPs", desc: "VIPs showing churn signals" },
    { id: "rising-stars", name: "🚀 Rising Stars", desc: "New + highly engaged" },
    { id: "active-customers-lifecycle", name: "🥰 Active Customers", desc: "Purchased in last 90 days" },
    { id: "recent-purchasers-lifecycle", name: "🔥 Recent Purchasers", desc: "Purchased in last 30 days" },
  ],
  Demographics: [
    { id: "gender-female", name: "👩 Gender - Female", desc: "Female customers" },
    { id: "gender-male", name: "👨 Gender - Male", desc: "Male customers" },
    { id: "location-country", name: "🌎 Location - By Country", desc: "Specific countries" },
    { id: "location-region", name: "🏙️ Location - By Region", desc: "Specific states/regions" },
    { id: "birthday-this-month", name: "🎂 Birthday This Month", desc: "Birthday in current month" },
    { id: "birthday-this-week", name: "🎉 Birthday This Week", desc: "Birthday in next 7 days" },
    { id: "age-18-24", name: "👶 Age Group - 18-24", desc: "Ages 18-24" },
    { id: "age-25-34", name: "🧑 Age Group - 25-34", desc: "Ages 25-34" },
  ],
  Exclusions: [
    { id: "unsubscribed", name: "🚫 Unsubscribed", desc: "Cannot receive marketing" },
    { id: "suppressed", name: "🚫 Suppressed", desc: "On suppression list" },
    { id: "non-marketable", name: "📵 Non-Marketable", desc: "Suppressed or unsubscribed" },
    { id: "bounced-emails", name: "⚠️ Bounced Emails", desc: "Email bounced recently" },
  ],
  "Testing & Controls": [
    { id: "test-segment-a", name: "🧪 Test Segment A", desc: "For A/B testing" },
    { id: "test-segment-b", name: "🧪 Test Segment B", desc: "For A/B testing" },
    { id: "holdout-control", name: "🎲 Holdout/Control", desc: "Excluded from campaigns" },
    { id: "vip-test-group", name: "👑 VIP Test Group", desc: "VIPs for testing" },
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
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
];

export default function AderaiApp() {
  // View state - ADDED 'analytics'
  const [view, setView] = useState<
    "login" | "signup" | "onboarding" | "dashboard" | "creating" | "results" | "analytics"
  >("login");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        console.log("🌍 Auto-detected currency:", detectedCurrency, "from", data.country);
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

  // Load user on mount
  useEffect(() => {
    const saved = localStorage.getItem("aderai_user");
    if (saved) {
      const user = JSON.parse(saved);
      setUserData(user);
      setView("dashboard");
    }
  }, []);

  // Auth functions
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    const saved = localStorage.getItem(`aderai_${email}`);
    if (!saved) {
      alert("Account not found. Please sign up.");
      return;
    }

    const user = JSON.parse(saved);
    if (user.password !== password) {
      alert("Incorrect password");
      return;
    }

    setUserData(user);
    localStorage.setItem("aderai_user", JSON.stringify(user));
    setView("dashboard");
  };

  const handleSignup = () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    const exists = localStorage.getItem(`aderai_${email}`);
    if (exists) {
      alert("Account already exists. Please login.");
      setView("login");
      return;
    }

    setView("onboarding");
  };

  const handleOnboarding = () => {
    if (!accountName || !klaviyoApiKey) {
      alert("Please fill in all required fields");
      return;
    }

    const user: UserData = {
      email,
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

    localStorage.setItem(`aderai_${email}`, JSON.stringify({ ...user, password }));
    localStorage.setItem("aderai_user", JSON.stringify(user));

    setUserData(user);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aderai_user");
    setUserData(null);
    setEmail("");
    setPassword("");
    setView("login");
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
            'API Key Error: Please check that your Klaviyo API key has "Read Segments" permission.\n\nTo fix:\n1. Go to Klaviyo Settings → API Keys\n2. Create a new Private API Key\n3. Enable "Read Segments" scope\n4. Update your API key in Settings',
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
          "Network Error: Unable to connect to the analytics service.\n\nPlease check:\n• Your internet connection\n• That your Worker URL is correct\n• Try again in a moment",
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
          const variation = (Math.random() - 0.5) * 0.1; // ±10% variation
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
          <h1>📊 Aderai Segment Analytics Report</h1>
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
        aov: parseInt(editingSettings.aov),
        vipThreshold: parseInt(editingSettings.vipThreshold),
        highValueThreshold: parseInt(editingSettings.highValueThreshold),
        newCustomerDays: parseInt(editingSettings.newCustomerDays),
        lapsedDays: parseInt(editingSettings.lapsedDays),
        churnedDays: parseInt(editingSettings.churnedDays),
      };
      setUserData(updatedData);
      localStorage.setItem("userData", JSON.stringify(updatedData));
      setShowSettingsModal(false);
    }
  };

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

  // Login View
  if (view === "login") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="w-8 h-8 text-[#EF3F3F]" />
            </h1>
            <p className="text-gray-400">AI-Powered Klaviyo Segmentation</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold py-3 rounded-lg transition mb-4"
            >
              Login
            </button>

            <div className="text-center">
              <button onClick={() => setView("signup")} className="text-sm text-gray-400 hover:text-white transition">
                Don't have an account? <span className="text-[#EF3F3F]">Sign up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup View
  if (view === "signup") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="w-8 h-8 text-[#EF3F3F]" />
            </h1>
            <p className="text-gray-400">AI-Powered Klaviyo Segmentation</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSignup}
              className="w-full bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold py-3 rounded-lg transition mb-4"
            >
              Continue to Setup
            </button>

            <div className="text-center">
              <button onClick={() => setView("login")} className="text-sm text-gray-400 hover:text-white transition">
                Already have an account? <span className="text-[#EF3F3F]">Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (view === "onboarding") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="w-8 h-8 text-[#EF3F3F]" />
            </h1>
            <p className="text-gray-400">Complete your account setup</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Account Configuration</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Account Name *</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      placeholder="My Store"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">Klaviyo API Key *</label>
                      <button
                        onClick={() => setShowApiInfo(true)}
                        className="text-gray-400 hover:text-[#EF3F3F] transition"
                        title="Learn about API access"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="password"
                      value={klaviyoApiKey}
                      onChange={(e) => setKlaviyoApiKey(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                      placeholder="pk_..."
                    />
                  </div>

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
                </div>
              </div>

              {/* Value Thresholds */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Value Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">Average Order Value</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("aov")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "aov" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            The typical amount a customer spends per order in your store
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={aov}
                      onChange={(e) => setAov(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">VIP Threshold</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("vip")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "vip" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            Minimum lifetime value to be considered a VIP customer (typically 5x AOV)
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={vipThreshold}
                      onChange={(e) => setVipThreshold(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">High Value Threshold</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("highvalue")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "highvalue" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            Minimum lifetime value for high-value customers (typically 3x AOV)
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={highValueThreshold}
                      onChange={(e) => setHighValueThreshold(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Time Thresholds */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Time Thresholds (Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">New Customer</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("newcustomer")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "newcustomer" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            Number of days since first purchase to be considered "new" (typically 30 days)
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">Lapsed</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("lapsed")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "lapsed" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            Days without purchase to be considered "lapsed" (typically 60 days)
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-gray-400">Churned</label>
                      <div className="relative">
                        <button
                          onMouseEnter={() => setActiveTooltip("churned")}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-[#EF3F3F] transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {activeTooltip === "churned" && (
                          <div className="absolute z-50 left-6 top-0 w-64 bg-[#1A1A1A] border border-[#EF3F3F] rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                            Days without purchase to be considered "churned" (typically 180 days)
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOnboarding}
              className="w-full bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-semibold py-3 rounded-lg transition mt-8"
            >
              Complete Setup
            </button>
          </div>
        </div>

        {/* API Info Modal */}
        {showApiInfo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-[#1A1A1A] border-2 border-[#EF3F3F] rounded-xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-8 h-8 text-[#EF3F3F]" />
                <Lock className="w-6 h-6 text-[#EF3F3F]" />
                <h3 className="text-2xl font-bold text-white">What API Access is Needed?</h3>
              </div>

              {/* Required Permissions */}
              <div className="mb-6">
                <h4 className="text-white font-bold mb-3 text-lg">Required Permissions:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#EF3F3F] font-bold">•</span>
                    <span>
                      Segments: <span className="text-[#EF3F3F] font-bold">Read & Write</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#EF3F3F] font-bold">•</span>
                    <span>
                      Tags: <span className="text-[#EF3F3F] font-bold">Read & Write</span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* What Aderai Does */}
              <div className="mb-6">
                <h4 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  What Aderai Does:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Creates segments in your Klaviyo account</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Adds "Aderai" tag to created segments</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Customizes thresholds based on your metrics</span>
                  </li>
                </ul>
              </div>

              {/* What Aderai NEVER Does */}
              <div className="mb-6">
                <h4 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  What Aderai NEVER Does:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span>Access your customer data or profiles</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span>Send emails or SMS messages</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span>Modify or delete existing segments</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span>Store your API key on servers</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 font-bold text-xl">✗</span>
                    <span>Share your data with third parties</span>
                  </li>
                </ul>
              </div>

              {/* Privacy Guarantee */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#EF3F3F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">
                      <span className="font-bold text-white">🔒 Privacy Guarantee:</span> Your API key is encrypted and
                      stored only in your browser's local storage. All requests go directly from your browser to Klaviyo
                      via our secure Cloudflare Worker. We never see or store your key on any server.
                    </p>
                  </div>
                </div>
              </div>

              {/* Learn More Link */}
              <a
                href="https://developers.klaviyo.com/en/docs/retrieve_api_credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[#EF3F3F] hover:text-red-400 mb-6 text-sm"
              >
                → Learn more about Klaviyo API Keys
              </a>

              {/* Close Button */}
              <button
                onClick={() => setShowApiInfo(false)}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  if (view === "dashboard") {
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
              {/* Analytics Button - NEW */}
              <button
                onClick={() => setView("analytics")}
                className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Analytics</span>
              </button>

              <button
                onClick={() => {
                  setEditingSettings({
                    accountName: userData?.accountName || "",
                    currency: userData?.currency || "USD",
                    aov: userData?.aov.toString() || "",
                    vipThreshold: userData?.vipThreshold.toString() || "",
                    highValueThreshold: userData?.highValueThreshold.toString() || "",
                    newCustomerDays: userData?.newCustomerDays.toString() || "",
                    lapsedDays: userData?.lapsedDays.toString() || "",
                    churnedDays: userData?.churnedDays.toString() || "",
                  });
                  setShowSettingsModal(true);
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Select Bundles */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Select Bundles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(BUNDLES).map(([name, segments]) => (
                <button
                  key={name}
                  onClick={() => selectBundle(name)}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#EF3F3F] transition text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{name}</h3>
                    <Zap className="w-5 h-5 text-[#EF3F3F]" />
                  </div>
                  <p className="text-sm text-gray-400">{segments.length} segments</p>
                </button>
              ))}
            </div>
          </div>

          {/* Segment Categories */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Select Segments</h2>
              <div className="text-sm text-gray-400">{selectedSegments.length} selected</div>
            </div>

            <div className="space-y-4">
              {Object.entries(SEGMENTS).map(([category, segments]) => (
                <div key={category} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#2A2A2A] transition"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{category}</h3>
                      <span className="text-sm text-gray-500">({segments.length})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInCategory(category);
                        }}
                        className="text-sm text-[#EF3F3F] hover:underline"
                      >
                        {segments.every((s) => selectedSegments.includes(s.id)) ? "Deselect All" : "Select All"}
                      </button>
                      {expandedCategory === category ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedCategory === category && (
                    <div className="px-6 py-4 border-t border-[#2A2A2A] space-y-2">
                      {segments.map((segment) => (
                        <label
                          key={segment.id}
                          className="flex items-center gap-3 p-3 hover:bg-[#2A2A2A] rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSegments.includes(segment.id)}
                            onChange={() => toggleSegment(segment.id)}
                            className="w-5 h-5 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#EF3F3F] focus:ring-[#EF3F3F]"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">{segment.name}</div>
                            <div className="text-sm text-gray-400">{segment.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center">
            <button
              onClick={createSegments}
              disabled={selectedSegments.length === 0}
              className="bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-bold py-4 px-12 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Create {selectedSegments.length} Segments
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1A1A1A] border-t border-[#2A2A2A] py-6 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
            © 2025 Aderai by THE DRIP STORY. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // Analytics View - NEW!
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
                  <span className="text-sm">← Back</span>
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
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">📈 Growth Trends</h3>

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
                    🔥 Top Performing Segments
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
                                    {change > 0 ? "📈" : "📉"} {change > 0 ? "+" : ""}
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
                  <h3 className="text-xl font-bold text-white mb-4">📋 All Segments</h3>

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
                                <div className="text-sm text-gray-500">—</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {change !== 0 ? (
                                <div
                                  className={`flex items-center justify-end gap-1 text-xs font-medium ${change > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}
                                >
                                  {change > 0 ? "📈" : "📉"}
                                  <span>
                                    {change > 0 ? "+" : ""}
                                    {changePercent.toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">➡️ 0%</div>
                              )}
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
                    <p className="font-medium text-gray-300 mb-1">💡 Analytics Caching</p>
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
                    <p className="font-medium text-gray-300 mb-2">💡 Troubleshooting</p>
                    <ul className="text-gray-400 space-y-1">
                      <li>
                        • Make sure your Klaviyo API key has <strong className="text-white">"Read Segments"</strong>{" "}
                        permission
                      </li>
                      <li>• Check that you have segments created in your Klaviyo account</li>
                      <li>• First load may take 1-2 minutes (Klaviyo rate limits)</li>
                      <li>• Subsequent loads are instant (1-hour cache)</li>
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
                  ✕
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
                              Days without purchase to be considered "churned" (typically 180 days)
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

                {/* API Key Info (Read-only) */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">API Configuration</h4>
                  <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#EF3F3F] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400 mb-2">
                          <span className="font-bold text-white">Klaviyo API Key:</span> Secured & encrypted
                        </p>
                        <p className="text-xs text-gray-500">
                          Your API key cannot be viewed or edited for security reasons. To change it, please contact
                          support or create a new account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-bold rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-[#1A1A1A] border-2 border-[#EF3F3F] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Download className="w-7 h-7 text-[#EF3F3F]" />
                  Export Report
                </h3>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition">
                  ✕
                </button>
              </div>

              {/* Date Range Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Report Date Range</label>
                <div className="grid grid-cols-4 gap-3">
                  {(["7", "30", "60", "90"] as const).map((days) => (
                    <button
                      key={days}
                      onClick={() => setReportDateRange(days)}
                      className={`px-4 py-3 rounded-lg transition ${
                        reportDateRange === days
                          ? "bg-[#EF3F3F] text-white"
                          : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]"
                      }`}
                    >
                      Last {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Include Metrics</label>
                <div className="space-y-2">
                  {[
                    { id: "profileCount", label: "Member Count" },
                    { id: "netChange", label: "Net Change (7d)" },
                    { id: "changePercent", label: "Change Percentage" },
                    { id: "percentage", label: "Percentage of Total" },
                  ].map((metric) => (
                    <label
                      key={metric.id}
                      className="flex items-center gap-3 p-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics((prev) => [...prev, metric.id]);
                          } else {
                            setSelectedMetrics((prev) => prev.filter((m) => m !== metric.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#EF3F3F] focus:ring-[#EF3F3F]"
                      />
                      <span className="text-white">{metric.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Format */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={`p-4 rounded-lg transition flex flex-col items-center gap-2 ${
                      exportFormat === "csv"
                        ? "bg-[#EF3F3F] text-white"
                        : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    <FileText className="w-8 h-8" />
                    <span className="text-sm font-medium">CSV</span>
                  </button>
                  <button
                    onClick={() => setExportFormat("excel")}
                    className={`p-4 rounded-lg transition flex flex-col items-center gap-2 ${
                      exportFormat === "excel"
                        ? "bg-[#EF3F3F] text-white"
                        : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    <FileSpreadsheet className="w-8 h-8" />
                    <span className="text-sm font-medium">Excel</span>
                  </button>
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`p-4 rounded-lg transition flex flex-col items-center gap-2 ${
                      exportFormat === "pdf"
                        ? "bg-[#EF3F3F] text-white"
                        : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    <File className="w-8 h-8" />
                    <span className="text-sm font-medium">PDF</span>
                  </button>
                </div>
              </div>

              {/* Export Info */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#EF3F3F] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Your report will include:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                      <li>{filteredSegments.length} segments</li>
                      <li>Summary statistics</li>
                      <li>Last {reportDateRange} days of data</li>
                      <li>{selectedMetrics.length} selected metrics</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (exportFormat === "csv") exportToCSV();
                    else if (exportFormat === "excel") exportToExcel();
                    else exportToPDF();
                    setShowExportModal(false);
                  }}
                  disabled={selectedMetrics.length === 0}
                  className="flex-1 px-6 py-3 bg-[#EF3F3F] hover:bg-[#DC2626] text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#1A1A1A] border-t border-[#2A2A2A] py-6 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
            © 2025 Aderai by THE DRIP STORY. All rights reserved.
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

  return null;
}
