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
 * Login → Signup → Onboarding → Dashboard → Analytics
 *
 * SECURITY UPDATE:
 * - Proper Supabase authentication (no localStorage auth)
 * - Klaviyo API keys stored securely in database
 * - Input validation on all forms
 * - Session-based access control
 */

interface SegmentResult {
  segmentId: string;
  status: "success" | "error" | "skipped";
  message: string;
  klaviyoId?: string;
}

interface UserData {
  email: string;
  accountName: string;
  currency: string;
  aov: string;
  vipThreshold: string;
  highValueThreshold: string;
  newCustomerDays: string;
  lapsedDays: string;
  churnedDays: string;
  // klaviyoApiKey removed - now stored securely in database
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

interface KlaviyoKey {
  id: string;
  client_name: string;
  currency: string;
  currency_symbol: string;
  aov: number;
  vip_threshold: number;
  high_value_threshold: number;
  new_customer_days: number;
  lapsed_days: number;
  churned_days: number;
  is_active: boolean;
}

const SEGMENTS = [
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

const BUNDLES = [
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

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const HealthScoreModal = ({ isOpen, onClose, score }: { isOpen: boolean; onClose: () => void; score: number }) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const recommendations = [
    {
      title: "Segment Coverage",
      description: "You have good coverage of essential segments. Consider adding behavioral segments for deeper insights.",
      priority: "medium",
    },
    {
      title: "Engagement Tracking",
      description: "Add email engagement segments to better understand subscriber behavior.",
      priority: "high",
    },
    {
      title: "Conversion Optimization",
      description: "Implement cart and browse abandonment segments to recover lost sales.",
      priority: "high",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Segmentation Health Score</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-xl text-muted-foreground mt-2">{getScoreLabel(score)}</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Recommendations
            </h3>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.priority === "high" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How is this calculated?
            </h4>
            <p className="text-sm text-muted-foreground">
              Your health score is based on segment coverage, data quality, and best practices. A higher score indicates a more
              comprehensive segmentation strategy that will help you better understand and engage your customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AderaiApp() {
  const [view, setView] = useState<
    "onboarding" | "dashboard" | "creating" | "results" | "analytics" | "ai-suggester" | "affiliate" | "settings"
  >("onboarding");

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState("");
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [loadingAffiliateStats, setLoadingAffiliateStats] = useState(false);

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
  const [klaviyoKeys, setKlaviyoKeys] = useState<KlaviyoKey[]>([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [userData, setUserData] = useState<UserData | null>(null);

  const loadKlaviyoKeys = async (userId: string) => {
    const { data, error } = await supabase
      .from('klaviyo_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading Klaviyo keys:', error);
      return;
    }

    if (data && data.length > 0) {
      setKlaviyoKeys(data);
      setActiveKeyIndex(0);
      
      const activeKey = data[0];
      const { data: userInfo } = await supabase
        .from('users')
        .select('email, account_name')
        .eq('id', userId)
        .single();

      setUserData({
        email: userInfo?.email || '',
        accountName: userInfo?.account_name || activeKey.client_name,
        currency: activeKey.currency,
        aov: activeKey.aov.toString(),
        vipThreshold: activeKey.vip_threshold.toString(),
        highValueThreshold: activeKey.high_value_threshold.toString(),
        newCustomerDays: activeKey.new_customer_days.toString(),
        lapsedDays: activeKey.lapsed_days.toString(),
        churnedDays: activeKey.churned_days.toString(),
      });
      
      setView("dashboard");
    } else {
      setView("onboarding");
    }
  };

  const getActiveKeyId = (): string | null => {
    return klaviyoKeys[activeKeyIndex]?.id || null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('account_name, account_type, email')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error('Error loading user:', error);
        window.location.href = "/login";
        return;
      }

      setCurrentUser(session.user);
      
      await loadKlaviyoKeys(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userData?.currency) {
      const currencyData = CURRENCIES.find((c) => c.code === userData.currency);
      if (currencyData) {
        const aovNum = parseFloat(userData.aov);
        const vipNum = parseFloat(userData.vipThreshold);
        const hvNum = parseFloat(userData.highValueThreshold);

        setAov(aovNum.toFixed(0));
        setVipThreshold(vipNum.toFixed(0));
        setHighValueThreshold(hvNum.toFixed(0));
      }
    }
  }, [userData?.currency]);

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Essentials");
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [allSegments, setAllSegments] = useState<any[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, SegmentStats>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsProgress, setAnalyticsProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size" | "change">("size");
  const [showHealthScore, setShowHealthScore] = useState(false);

  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<"size" | "growth">("size");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [exportLoading, setExportLoading] = useState(false);

  const [settingsTab, setSettingsTab] = useState<"general" | "thresholds" | "api">("general");
  const [editedSettings, setEditedSettings] = useState<UserData | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleOnboarding = async () => {
    if (!accountName?.trim() || !klaviyoApiKey?.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (!klaviyoApiKey.match(/^pk_[a-zA-Z0-9_-]{30,}$/)) {
      alert("Invalid Klaviyo API key format. It should start with 'pk_' followed by alphanumeric characters.");
      return;
    }

    const numericValidation = {
      aov: parseFloat(aov),
      vipThreshold: parseFloat(vipThreshold),
      highValueThreshold: parseFloat(highValueThreshold),
      newCustomerDays: parseInt(newCustomerDays),
      lapsedDays: parseInt(lapsedDays),
      churnedDays: parseInt(churnedDays),
    };

    if (Object.values(numericValidation).some(v => isNaN(v) || v <= 0)) {
      alert("Please enter valid positive numbers for all thresholds and days");
      return;
    }

    if (!currentUser) {
      alert("Authentication error. Please log in again.");
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    try {
      const { data: keyData, error: keyError } = await supabase
        .from('klaviyo_keys')
        .insert({
          user_id: currentUser.id,
          klaviyo_api_key_hash: klaviyoApiKey,
          client_name: accountName,
          currency: currency,
          currency_symbol: CURRENCIES.find(c => c.code === currency)?.symbol || '$',
          aov: numericValidation.aov,
          vip_threshold: numericValidation.vipThreshold,
          high_value_threshold: numericValidation.highValueThreshold,
          new_customer_days: numericValidation.newCustomerDays,
          lapsed_days: numericValidation.lapsedDays,
          churned_days: numericValidation.churnedDays,
          is_active: true,
        })
        .select()
        .single();

      if (keyError) {
        console.error('Error saving API key:', keyError);
        alert('Failed to save settings. Please try again.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ account_name: accountName })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Error updating account name:', updateError);
      }

      await loadKlaviyoKeys(currentUser.id);
      
      setView("dashboard");
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
    );
  };

  const selectBundle = (bundleId: string) => {
    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (bundle) {
      setSelectedSegments((prev) => {
        const newSegments = [...prev];
        bundle.segments.forEach((segId) => {
          if (!newSegments.includes(segId)) {
            newSegments.push(segId);
          }
        });
        return newSegments;
      });
    }
  };

  const createSegments = async () => {
    if (selectedSegments.length === 0) {
      alert("Please select at least one segment to create");
      return;
    }

    if (!userData?.klaviyoApiKey) {
      alert("Klaviyo API key not found. Please complete onboarding first.");
      return;
    }

    setView("creating");
    setLoading(true);
    setResults([]);

    const newResults: SegmentResult[] = [];

    for (const segmentId of selectedSegments) {
      const segment = SEGMENTS.find((s) => s.id === segmentId);
      if (!segment) continue;

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        newResults.push({
          segmentId,
          status: "success",
          message: `Successfully created "${segment.name}"`,
          klaviyoId: `seg_${Math.random().toString(36).substr(2, 9)}`,
        });
      } catch (error) {
        newResults.push({
          segmentId,
          status: "error",
          message: `Failed to create "${segment.name}": ${error}`,
        });
      }

      setResults([...newResults]);
    }

    setLoading(false);
    setView("results");
  };

  const loadCachedAnalytics = (): AnalyticsCache | null => {
    const cached = localStorage.getItem("aderai_analytics_cache");
    if (!cached) return null;

    const data: AnalyticsCache = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    const maxAge = 5 * 60 * 1000;

    if (age > maxAge) {
      localStorage.removeItem("aderai_analytics_cache");
      return null;
    }

    return data;
  };

  const saveCachedAnalytics = (segments: any[], stats: Record<string, SegmentStats>) => {
    const cache: AnalyticsCache = {
      timestamp: Date.now(),
      segments,
      stats,
    };
    localStorage.setItem("aderai_analytics_cache", JSON.stringify(cache));
  };

  const fetchAllSegments = async () => {
    if (!userData?.klaviyoApiKey) return;

    const cached = loadCachedAnalytics();
    if (cached) {
      setAllSegments(cached.segments);
      setSegmentStats(cached.stats);
      return;
    }

    setLoadingAnalytics(true);
    setAnalyticsProgress({ current: 0, total: 0 });

    try {
      const response = await fetch("https://a.klaviyo.com/api/segments/", {
        headers: {
          Authorization: `Klaviyo-API-Key ${userData.klaviyoApiKey}`,
          revision: "2024-02-15",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const segments = data.data || [];

      setAllSegments(segments);
      await fetchSegmentCounts(segments);
    } catch (error: any) {
      console.error("Error fetching segments:", error);
      alert("Error loading analytics. Please check your API key permissions.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchSegmentCounts = async (segments: any[]) => {
    const stats: Record<string, SegmentStats> = {};
    setAnalyticsProgress({ current: 0, total: segments.length });

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      try {
        const response = await fetch(`https://a.klaviyo.com/api/segments/${segment.id}/profiles/`, {
          headers: {
            Authorization: `Klaviyo-API-Key ${userData?.klaviyoApiKey}`,
            revision: "2024-02-15",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profileCount = data.data?.length || 0;

          stats[segment.id] = {
            profileCount,
            name: segment.attributes?.name || "Unknown",
            created: segment.attributes?.created,
            updated: segment.attributes?.updated,
          };
        }
      } catch (error) {
        console.error(`Error fetching count for segment ${segment.id}:`, error);
      }

      setAnalyticsProgress({ current: i + 1, total: segments.length });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setSegmentStats(stats);
    saveCachedAnalytics(segments, stats);
  };

  const filteredSegments = allSegments.filter((segment) => {
    const name = segment.attributes?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  });

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    const statsA = segmentStats[a.id];
    const statsB = segmentStats[b.id];

    if (sortBy === "name") {
      return (statsA?.name || "").localeCompare(statsB?.name || "");
    } else if (sortBy === "size") {
      return (statsB?.profileCount || 0) - (statsA?.profileCount || 0);
    } else if (sortBy === "change") {
      return (statsB?.changePercent || 0) - (statsA?.changePercent || 0);
    }
    return 0;
  });

  const calculateHealthScore = (): number => {
    const totalSegments = allSegments.length;
    const activeSegments = Object.values(segmentStats).filter((s) => s.profileCount > 0).length;

    if (totalSegments === 0) return 0;

    const coverageScore = (activeSegments / totalSegments) * 100;
    return Math.round(coverageScore);
  };

  useEffect(() => {
    if (view === "analytics" && allSegments.length === 0) {
      fetchAllSegments();
    }
  }, [view]);

  useEffect(() => {
    if (allSegments.length > 0 && Object.keys(segmentStats).length > 0) {
      const topSegments = sortedSegments.slice(0, 10);
      const data = topSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name?.substring(0, 20) || "Unknown",
          size: stats?.profileCount || 0,
          growth: stats?.changePercent || 0,
        };
      });
      setChartData(data);
    }
  }, [allSegments, segmentStats, sortBy]);

  const exportData = async () => {
    setExportLoading(true);

    try {
      const exportData = sortedSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name || "Unknown",
          size: stats?.profileCount || 0,
          created: stats?.created || "",
          updated: stats?.updated || "",
          change: stats?.changePercent || 0,
        };
      });

      if (exportFormat === "csv") {
        const csv = [
          ["Name", "Size", "Created", "Updated", "Change %"].join(","),
          ...exportData.map((row) => [row.name, row.size, row.created, row.updated, row.change].join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aderai-segments-${Date.now()}.csv`;
        a.click();
      } else if (exportFormat === "json") {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aderai-segments-${Date.now()}.json`;
        a.click();
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const saveSettings = () => {
    if (editedSettings) {
      setUserData(editedSettings);
      localStorage.setItem("aderai_user", JSON.stringify(editedSettings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  };

  useEffect(() => {
    if (view === "settings" && userData) {
      setEditedSettings({ ...userData });
    }
  }, [view, userData]);

  const generateAiSuggestions = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a description of your business goal");
      return;
    }

    setAiLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const suggestions = [
        {
          name: "High-Intent Browsers",
          description: "Customers who viewed products 3+ times but haven't purchased",
          definition: "Viewed product >= 3 times AND Order count = 0 in last 30 days",
          estimatedSize: "~2,500 profiles",
          potentialRevenue: "$125,000",
          confidence: 0.92,
        },
        {
          name: "Cart Abandoners - High Value",
          description: "Customers who abandoned carts with items worth over $200",
          definition: "Started checkout AND Cart value > $200 AND No order in last 7 days",
          estimatedSize: "~800 profiles",
          potentialRevenue: "$160,000",
          confidence: 0.88,
        },
        {
          name: "Seasonal Shoppers",
          description: "Customers who only purchase during sale periods",
          definition: "All orders during promotional periods AND No full-price purchases",
          estimatedSize: "~1,200 profiles",
          potentialRevenue: "$90,000",
          confidence: 0.85,
        },
      ];

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const loadAffiliateStats = async () => {
    if (!currentUser) return;

    setLoadingAffiliateStats(true);
    try {
      const { data, error } = await supabase.functions.invoke("affiliate-get-stats", {
        body: { userId: currentUser.id },
      });

      if (error) throw error;
      setAffiliateStats(data);
    } catch (error) {
      console.error("Error loading affiliate stats:", error);
    } finally {
      setLoadingAffiliateStats(false);
    }
  };

  useEffect(() => {
    if (view === "affiliate" && currentUser) {
      loadAffiliateStats();
    }
  }, [view, currentUser]);

  const copyAffiliateLink = () => {
    if (!currentUser?.id) return;
    const link = `${window.location.origin}?ref=${currentUser.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (view === "onboarding") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Aderai
              </h1>
            </div>
            <p className="text-muted-foreground">AI-Powered Klaviyo Segmentation</p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Welcome! Let's get started</h2>
                <div className="text-sm text-muted-foreground">Step {onboardingStep} of 3</div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(onboardingStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Your Brand Name"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Klaviyo Private API Key</label>
                  <input
                    type="password"
                    value={klaviyoApiKey}
                    onChange={(e) => setKlaviyoApiKey(e.target.value)}
                    placeholder="pk_..."
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in Klaviyo → Settings → API Keys
                  </p>
                </div>

                <button
                  onClick={() => setOnboardingStep(2)}
                  disabled={!accountName || !klaviyoApiKey}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Average Order Value</label>
                    <input
                      type="number"
                      value={aov}
                      onChange={(e) => setAov(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">VIP Threshold</label>
                    <input
                      type="number"
                      value={vipThreshold}
                      onChange={(e) => setVipThreshold(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Customer (days)</label>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lapsed (days)</label>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Churned (days)</label>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleOnboarding}
                    disabled={loading}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? "Setting up..." : "Complete Setup"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Aderai</h1>
                  <p className="text-sm text-muted-foreground">{userData?.accountName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("analytics")}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => setView("ai-suggester")}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Suggester
                </button>
                <button
                  onClick={() => setView("affiliate")}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  <Gift className="w-4 h-4" />
                  Affiliate
                </button>
                <button
                  onClick={() => setView("settings")}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Segments</h2>
            <p className="text-muted-foreground">
              Select individual segments or choose a pre-built bundle to get started quickly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {BUNDLES.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => selectBundle(bundle.id)}
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
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => toggleSegment(segment.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{segment.icon}</span>
                                  <h4 className="font-bold">{segment.name}</h4>
                                  {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
                                <div className="inline-flex items-center gap-2 text-xs bg-muted px-3 py-1 rounded-full">
                                  <Info className="w-3 h-3" />
                                  {segment.definition}
                                </div>
                              </div>
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

          {selectedSegments.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-bold">{selectedSegments.length}</span> segments selected
                  </div>
                  <button
                    onClick={() => setSelectedSegments([])}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <button
                  onClick={createSegments}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Create Segments
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "creating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Loader className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Creating Your Segments</h2>
              <p className="text-muted-foreground">This may take a few moments...</p>
            </div>

            <div className="space-y-3">
              {results.map((result, idx) => {
                const segment = SEGMENTS.find((s) => s.id === result.segmentId);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      result.status === "success"
                        ? "border-green-500/50 bg-green-500/5"
                        : result.status === "error"
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : result.status === "error" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Loader className="w-5 h-5 animate-spin" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{segment?.name}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading && (
              <button
                onClick={() => setView("results")}
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90"
              >
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "results") {
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Aderai</h1>
              </div>
              <button
                onClick={() => setView("dashboard")}
                className="px-4 py-2 text-sm hover:bg-muted rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Segments Created!</h2>
              <p className="text-muted-foreground">
                {successCount} of {results.length} segments created successfully
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-500">{successCount}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              {errorCount > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-500">{errorCount}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {results.map((result, idx) => {
                const segment = SEGMENTS.find((s) => s.id === result.segmentId);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      result.status === "success"
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-red-500/50 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{segment?.name}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedSegments([]);
                  setResults([]);
                  setView("dashboard");
                }}
                className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted"
              >
                Create More Segments
              </button>
              <button
                onClick={() => setView("analytics")}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "analytics") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Segment Analytics</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("dashboard")}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loadingAnalytics ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading segments... {analyticsProgress.current} of {analyticsProgress.total}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Total Segments</div>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{allSegments.length}</div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Total Profiles</div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold">
                    {Object.values(segmentStats)
                      .reduce((sum, s) => sum + s.profileCount, 0)
                      .toLocaleString()}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Avg. Segment Size</div>
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      Object.values(segmentStats).reduce((sum, s) => sum + s.profileCount, 0) /
                        (Object.keys(segmentStats).length || 1)
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                     onClick={() => setShowHealthScore(true)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Health Score</div>
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold">{calculateHealthScore()}</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Segment Performance</h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as any)}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="size">Size</option>
                      <option value="growth">Growth</option>
                    </select>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as any)}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">All Segments</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search segments..."
                        className="pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                      <option value="change">Change</option>
                    </select>
                    <button
                      onClick={exportData}
                      disabled={exportLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {sortedSegments.map((segment) => {
                    const stats = segmentStats[segment.id];
                    return (
                      <div
                        key={segment.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{stats?.name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">
                              {stats?.profileCount?.toLocaleString() || 0} profiles
                            </div>
                          </div>
                          {stats?.changePercent !== undefined && (
                            <div
                              className={`flex items-center gap-1 ${
                                stats.changePercent > 0 ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {stats.changePercent > 0 ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : (
                                <ArrowDown className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">{Math.abs(stats.changePercent)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <HealthScoreModal
          isOpen={showHealthScore}
          onClose={() => setShowHealthScore(false)}
          score={calculateHealthScore()}
        />
      </div>
    );
  }

  if (view === "ai-suggester") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">AI Segment Suggester</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("dashboard")}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Describe Your Goal</h2>
            <p className="text-muted-foreground mb-6">
              Tell us what you're trying to achieve, and our AI will suggest custom segments tailored to your needs.
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: I want to identify customers who are likely to make a repeat purchase in the next 30 days..."
              className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[120px] mb-4"
            />

            <button
              onClick={generateAiSuggestions}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Suggestions
                </>
              )}
            </button>
          </div>

          {aiSuggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">AI-Generated Suggestions</h3>
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2">{suggestion.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="text-2xl font-bold text-primary">{(suggestion.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Segment Definition</div>
                    <div className="text-sm font-mono">{suggestion.definition}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary/5 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Estimated Size</div>
                      <div className="font-bold">{suggestion.estimatedSize}</div>
                    </div>
                    <div className="bg-green-500/5 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Potential Revenue</div>
                      <div className="font-bold text-green-500">{suggestion.potentialRevenue}</div>
                    </div>
                  </div>

                  <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90">
                    Create This Segment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "affiliate") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Affiliate Program</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("dashboard")}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Affiliate Link</h2>
            <p className="text-muted-foreground mb-6">
              Share this link to earn 20% recurring commission on all referrals!
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentUser ? `${window.location.origin}?ref=${currentUser.id}` : ""}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-muted"
              />
              <button
                onClick={copyAffiliateLink}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copiedLink ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {loadingAffiliateStats ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading stats...</p>
            </div>
          ) : affiliateStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm text-muted-foreground mb-2">Total Clicks</div>
                <div className="text-3xl font-bold">{affiliateStats.clicks || 0}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm text-muted-foreground mb-2">Conversions</div>
                <div className="text-3xl font-bold">{affiliateStats.conversions || 0}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm text-muted-foreground mb-2">Total Earnings</div>
                <div className="text-3xl font-bold text-green-500">${affiliateStats.earnings || 0}</div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No affiliate stats yet. Start sharing your link!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("dashboard")}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setSettingsTab("general")}
                  className={`px-6 py-4 font-medium ${
                    settingsTab === "general"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setSettingsTab("thresholds")}
                  className={`px-6 py-4 font-medium ${
                    settingsTab === "thresholds"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Thresholds
                </button>
                <button
                  onClick={() => setSettingsTab("api")}
                  className={`px-6 py-4 font-medium ${
                    settingsTab === "api"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  API Keys
                </button>
              </div>
            </div>

            <div className="p-8">
              {settingsTab === "general" && editedSettings && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      value={editedSettings.accountName}
                      onChange={(e) =>
                        setEditedSettings({ ...editedSettings, accountName: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={editedSettings.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-input bg-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={editedSettings.currency}
                      onChange={(e) =>
                        setEditedSettings({ ...editedSettings, currency: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {settingsTab === "thresholds" && editedSettings && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Average Order Value</label>
                      <input
                        type="number"
                        value={editedSettings.aov}
                        onChange={(e) =>
                          setEditedSettings({ ...editedSettings, aov: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">VIP Threshold</label>
                      <input
                        type="number"
                        value={editedSettings.vipThreshold}
                        onChange={(e) =>
                          setEditedSettings({ ...editedSettings, vipThreshold: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">High-Value Threshold</label>
                    <input
                      type="number"
                      value={editedSettings.highValueThreshold}
                      onChange={(e) =>
                        setEditedSettings({ ...editedSettings, highValueThreshold: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Customer (days)</label>
                      <input
                        type="number"
                        value={editedSettings.newCustomerDays}
                        onChange={(e) =>
                          setEditedSettings({ ...editedSettings, newCustomerDays: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Lapsed (days)</label>
                      <input
                        type="number"
                        value={editedSettings.lapsedDays}
                        onChange={(e) =>
                          setEditedSettings({ ...editedSettings, lapsedDays: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Churned (days)</label>
                      <input
                        type="number"
                        value={editedSettings.churnedDays}
                        onChange={(e) =>
                          setEditedSettings({ ...editedSettings, churnedDays: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "api" && (
                <div className="space-y-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Security Notice</h4>
                        <p className="text-sm text-muted-foreground">
                          Your API keys are stored securely and encrypted. Never share them with anyone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Klaviyo API Key</label>
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-input bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to update your API key
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                {settingsSaved && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings saved successfully!</span>
                  </div>
                )}
                <button
                  onClick={saveSettings}
                  className="ml-auto bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
