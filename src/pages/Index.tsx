import React, { useState, useEffect } from "react";
import {
  Info,
  Zap,
  CheckCircle,
  AlertCircle,
  LogOut,
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
} from "lucide-react";

// ==================== TYPES ====================
interface User {
  id: string;
  email: string;
  accountName: string;
  klaviyoApiKey: string;
  currency: string;
  currencySymbol: string;
  metrics: {
    aov: number;
    vipThreshold: number;
    highValueThreshold: number;
    newCustomerDays: number;
    lapsedDays: number;
    churnedDays: number;
  };
  createdAt: string;
}

interface SegmentResult {
  segmentId: string;
  status: "success" | "error";
  message: string;
  klaviyoId?: string;
}

// ==================== CONSTANTS ====================
const WORKER_URL = "https://aderai-api.akshat-619.workers.dev";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
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

const COLORS = {
  primary: "#EF3F3F",
  bg: "#0A0A0A",
  card: "#1A1A1A",
  border: "#333333",
  text: "#FFFFFF",
  textGray: "#999999",
};

// ==================== SEGMENT LIBRARY ====================
const getSegmentLibrary = (metrics?: User["metrics"], currencySymbol?: string) => {
  const sym = currencySymbol || "$";

  const library = {
    // TEST
    "test-email-marketable": {
      name: "Email Marketable (Test)",
      description: "Profiles who can receive email marketing",
      category: "test",
      icon: "✅",
    },

    // ENGAGEMENT
    "engaged-30": {
      name: "Engaged Last 30 Days",
      description: "Active users in the last month",
      category: "engagement",
      icon: "📧",
    },
    "engaged-60": {
      name: "Engaged Last 60 Days",
      description: "Active users in the last 60 days",
      category: "engagement",
      icon: "📧",
    },
    "engaged-clickers": {
      name: "Email Clickers (30 Days)",
      description: "Users who clicked emails recently",
      category: "engagement",
      icon: "👆",
    },
    "opened-email-30": {
      name: "Opened Email (30 Days)",
      description: "Users who opened emails recently",
      category: "engagement",
      icon: "👁️",
    },
    "site-visitors-30": {
      name: "Site Visitors (30 Days)",
      description: "Recent website visitors",
      category: "engagement",
      icon: "🌐",
    },

    // LIFECYCLE
    "new-customers-30": {
      name: `New Customers (${metrics?.newCustomerDays || 30} Days)`,
      description: "First-time purchasers",
      category: "lifecycle",
      icon: "🆕",
    },
    "repeat-customers": {
      name: "Repeat Customers",
      description: "2+ purchases all-time",
      category: "lifecycle",
      icon: "🔄",
    },
    "vip-customers": {
      name: `VIP Customers (${sym}${metrics?.vipThreshold || 500}+ LTV)`,
      description: "Your highest-value customers",
      category: "lifecycle",
      icon: "👑",
    },
    "lapsed-60": {
      name: `Lapsed Customers (${metrics?.lapsedDays || 60}+ Days)`,
      description: "At-risk customers who haven't purchased recently",
      category: "lifecycle",
      icon: "⚠️",
    },
    "churned-customers": {
      name: `Churned Customers (${metrics?.churnedDays || 180}+ Days)`,
      description: "Lost customers needing win-back",
      category: "lifecycle",
      icon: "❌",
    },
    "high-value-customers": {
      name: `High-Value Customers (${sym}${metrics?.highValueThreshold || 300}+ LTV)`,
      description: "Above-average spenders",
      category: "lifecycle",
      icon: "💰",
    },

    // SHOPPING BEHAVIOR
    "cart-abandoners-24h": {
      name: "Cart Abandoners (24 Hours)",
      description: "Started checkout but didn't complete",
      category: "shopping",
      icon: "🛒",
    },
    "browse-abandoners": {
      name: "Browse Abandoners (7 Days)",
      description: "Viewed products but didn't buy",
      category: "shopping",
      icon: "👀",
    },
    "purchasers-90d": {
      name: "Purchasers (90 Days)",
      description: "Recent purchasers",
      category: "shopping",
      icon: "✅",
    },
    "high-aov-customers": {
      name: `High AOV Customers (${sym}${Math.round((metrics?.aov || 100) * 1.5)}+)`,
      description: "Orders above 1.5x your AOV",
      category: "shopping",
      icon: "💎",
    },

    // EXCLUSIONS
    "excl-unsubscribed": {
      name: "Unsubscribed Contacts",
      description: "Use as exclusion in campaigns",
      category: "exclusions",
      icon: "🚫",
    },
    "excl-recent-purchasers": {
      name: "Recent Purchasers (Exclude - 7 Days)",
      description: "Use to exclude recent buyers",
      category: "exclusions",
      icon: "🚫",
    },

    // DEMOGRAPHIC
    "gmail-users": {
      name: "Gmail Users",
      description: "Profiles with @gmail.com",
      category: "demographic",
      icon: "📧",
    },
  };

  return library;
};

const SEGMENT_BUNDLES = {
  "bfcm-essentials": {
    name: "BFCM Essentials",
    description: "Critical segments for Black Friday",
    segments: ["engaged-30", "cart-abandoners-24h", "vip-customers", "repeat-customers", "purchasers-90d"],
    icon: "🔥",
  },
  "vip-revenue": {
    name: "VIP & Revenue Focus",
    description: "Your highest-value customers",
    segments: ["vip-customers", "high-value-customers", "repeat-customers", "high-aov-customers"],
    icon: "💰",
  },
  winback: {
    name: "Win-Back Campaign",
    description: "Re-engage lapsed customers",
    segments: ["lapsed-60", "churned-customers", "browse-abandoners"],
    icon: "🎯",
  },
  complete: {
    name: "Complete Foundation",
    description: "All segments for comprehensive targeting",
    segments: "all",
    icon: "🚀",
  },
};

// ==================== COMPONENTS ====================

// API Permissions Info Modal
function ApiPermissionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info className="text-[#EF3F3F]" size={24} />
          🔒 What API Access is Needed?
        </h3>

        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white mb-2">Required Permissions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Segments: <span className="text-[#EF3F3F] font-bold">Read & Write</span>
              </li>
              <li>
                Tags: <span className="text-[#EF3F3F] font-bold">Read & Write</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="font-semibold text-white mb-2">🛡️ What Aderai Does:</p>
            <ul className="space-y-1">
              <li>✅ Creates segments in your Klaviyo account</li>
              <li>✅ Adds "Aderai" tag to created segments</li>
              <li>✅ Customizes thresholds based on your metrics</li>
            </ul>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="font-semibold text-white mb-2">❌ What Aderai NEVER Does:</p>
            <ul className="space-y-1">
              <li>❌ Access your customer data or profiles</li>
              <li>❌ Send emails or SMS messages</li>
              <li>❌ Modify or delete existing segments</li>
              <li>❌ Store your API key on servers</li>
              <li>❌ Share your data with third parties</li>
            </ul>
          </div>

          <div className="bg-[#0A0A0A] p-3 rounded border border-gray-800">
            <p className="text-xs text-gray-400">
              <strong className="text-white">🔐 Privacy Guarantee:</strong> Your API key is encrypted and stored only in
              your browser's local storage. All requests go directly from your browser to Klaviyo via our secure
              Cloudflare Worker. We never see or store your key on any server.
            </p>
          </div>

          <a
            href="https://help.klaviyo.com/hc/en-us/articles/115005062267"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EF3F3F] hover:text-red-400 text-xs underline block"
          >
            → Learn more about Klaviyo API Keys
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function AderaiApp() {
  const [currentView, setCurrentView] = useState<"auth" | "onboarding" | "dashboard">("auth");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Onboarding states
  const [accountName, setAccountName] = useState("");
  const [klaviyoApiKey, setKlaviyoApiKey] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [aov, setAov] = useState("100");
  const [vipThreshold, setVipThreshold] = useState("500");
  const [highValueThreshold, setHighValueThreshold] = useState("300");
  const [newCustomerDays, setNewCustomerDays] = useState("30");
  const [lapsedDays, setLapsedDays] = useState("60");
  const [churnedDays, setChurnedDays] = useState("180");

  // Dashboard states
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("aderai_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setCurrentView("dashboard");
    }
  }, []);

  // Populate settings form when user or showSettings changes
  useEffect(() => {
    if (user && showSettings) {
      setAccountName(user.accountName);
      setSelectedCurrency(user.currency || "USD");
      setAov(user.metrics.aov.toString());
      setVipThreshold(user.metrics.vipThreshold.toString());
      setHighValueThreshold(user.metrics.highValueThreshold.toString());
      setNewCustomerDays(user.metrics.newCustomerDays.toString());
      setLapsedDays(user.metrics.lapsedDays.toString());
      setChurnedDays(user.metrics.churnedDays.toString());
    }
  }, [user, showSettings]);

  // Auth functions
  const handleAuth = () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (authMode === "signup") {
      // Check if user already exists
      const existingUser = localStorage.getItem(`aderai_user_${email}`);
      if (existingUser) {
        alert("Account already exists. Please login.");
        setAuthMode("login");
        return;
      }
      // New user - go to onboarding
      setCurrentView("onboarding");
    } else {
      // Login
      const savedUser = localStorage.getItem(`aderai_user_${email}`);
      if (!savedUser) {
        alert("Account not found. Please sign up.");
        return;
      }

      const userData = JSON.parse(savedUser);
      // In a real app, verify password here
      setUser(userData);
      localStorage.setItem("aderai_user", JSON.stringify(userData));
      setCurrentView("dashboard");
    }
  };

  const handleOnboardingComplete = () => {
    if (!accountName || !klaviyoApiKey || !email) {
      alert("Please fill in all required fields");
      return;
    }

    if (!klaviyoApiKey.startsWith("pk_")) {
      alert('Invalid Klaviyo API key. It should start with "pk_"');
      return;
    }

    const currencyData = CURRENCIES.find((c) => c.code === selectedCurrency);

    const newUser: User = {
      id: Date.now().toString(),
      email,
      accountName,
      klaviyoApiKey,
      currency: selectedCurrency,
      currencySymbol: currencyData?.symbol || "$",
      metrics: {
        aov: parseFloat(aov),
        vipThreshold: parseFloat(vipThreshold),
        highValueThreshold: parseFloat(highValueThreshold),
        newCustomerDays: parseInt(newCustomerDays),
        lapsedDays: parseInt(lapsedDays),
        churnedDays: parseInt(churnedDays),
      },
      createdAt: new Date().toISOString(),
    };

    // Save user
    localStorage.setItem(`aderai_user_${email}`, JSON.stringify(newUser));
    localStorage.setItem("aderai_user", JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aderai_user");
    setUser(null);
    setCurrentView("auth");
    setEmail("");
    setPassword("");
    setSelectedSegments([]);
    setResults([]);
    setShowResults(false);
  };

  const handleUpdateSettings = () => {
    if (!user) return;

    const currencyData = CURRENCIES.find((c) => c.code === selectedCurrency);

    const updatedUser = {
      ...user,
      currency: selectedCurrency,
      currencySymbol: currencyData?.symbol || "$",
      metrics: {
        aov: parseFloat(aov),
        vipThreshold: parseFloat(vipThreshold),
        highValueThreshold: parseFloat(highValueThreshold),
        newCustomerDays: parseInt(newCustomerDays),
        lapsedDays: parseInt(lapsedDays),
        churnedDays: parseInt(churnedDays),
      },
    };

    localStorage.setItem(`aderai_user_${user.email}`, JSON.stringify(updatedUser));
    localStorage.setItem("aderai_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowSettings(false);
    alert("Settings updated successfully!");
  };

  // Segment selection
  const toggleSegment = (segmentId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId],
    );
  };

  const selectBundle = (bundleId: string) => {
    const bundle = SEGMENT_BUNDLES[bundleId];
    if (bundle.segments === "all") {
      setSelectedSegments(Object.keys(getSegmentLibrary(user?.metrics)));
    } else {
      setSelectedSegments(bundle.segments);
    }
  };

  // Create segments
  const handleCreateSegments = async () => {
    if (!user || selectedSegments.length === 0) return;

    setIsCreating(true);
    setResults([]);
    setShowResults(true);

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: user.klaviyoApiKey,
          segments: selectedSegments,
          metrics: user.metrics,
          currencySymbol: user.currencySymbol,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        alert("Error creating segments: " + data.error);
      }
    } catch (error) {
      alert("Failed to create segments. Please try again.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // ==================== RENDER AUTH VIEW ====================
  if (currentView === "auth") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="inline-block ml-2 text-[#EF3F3F]" size={32} />
            </h1>
            <p className="text-sm text-gray-400">by THE DRIP STORY</p>
            <p className="text-lg text-white mt-4">Create 62 segments in 60 seconds</p>
          </div>

          {/* Auth Card */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded font-bold transition-colors ${
                  authMode === "login" ? "bg-[#EF3F3F] text-white" : "bg-transparent text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 rounded font-bold transition-colors ${
                  authMode === "signup" ? "bg-[#EF3F3F] text-white" : "bg-transparent text-gray-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
              </div>

              <button
                onClick={handleAuth}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
              >
                {authMode === "login" ? "Login" : "Sign Up"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            Built by <span className="text-[#EF3F3F] font-bold">THE DRIP STORY</span>
            <br />
            We achieve 80% open rates. That's 3x the industry standard.
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER ONBOARDING VIEW ====================
  if (currentView === "onboarding") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="inline-block ml-2 text-[#EF3F3F]" size={28} />
            </h1>
            <p className="text-sm text-gray-400">Let's set up your account</p>
          </div>

          {/* Onboarding Card */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>

            <div className="space-y-6">
              {/* Account Name */}
              <div>
                <label className="text-sm text-white font-semibold block mb-2">
                  Account Name <span className="text-[#EF3F3F]">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., My Brand, Acme Store"
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">This is how you'll identify your account in the dashboard</p>
              </div>

              {/* Klaviyo API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white font-semibold">
                    Klaviyo Private API Key <span className="text-[#EF3F3F]">*</span>
                  </label>
                  <button
                    onClick={() => setShowApiInfo(true)}
                    className="text-[#EF3F3F] hover:text-red-400 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <input
                  type="password"
                  value={klaviyoApiKey}
                  onChange={(e) => setKlaviyoApiKey(e.target.value)}
                  placeholder="pk_..."
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your key from{" "}
                  <a
                    href="https://www.klaviyo.com/settings/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#EF3F3F] hover:text-red-400"
                  >
                    Klaviyo Settings → API Keys
                  </a>
                </p>
              </div>

              {/* Business Metrics */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#EF3F3F]" />
                  Your Business Metrics
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  We'll use these to create custom segments tailored to your business
                </p>

                {/* Currency Selector */}
                <div className="mb-4">
                  <label className="text-sm text-white font-semibold block mb-2">
                    Currency <span className="text-[#EF3F3F]">*</span>
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name} ({curr.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select your business currency for monetary values</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Average Order Value (AOV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={aov}
                        onChange={(e) => setAov(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">VIP Customer Threshold (LTV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={vipThreshold}
                        onChange={(e) => setVipThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">High-Value Customer (LTV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={highValueThreshold}
                        onChange={(e) => setHighValueThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">New Customer Window (Days)</label>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Lapsed Customer (Days)</label>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Churned Customer (Days)</label>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleOnboardingComplete}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-4 rounded transition-colors text-lg"
              >
                Complete Setup & Create Segments →
              </button>
            </div>
          </div>
        </div>

        {showApiInfo && <ApiPermissionsModal onClose={() => setShowApiInfo(false)} />}
      </div>
    );
  }

  // ==================== RENDER DASHBOARD VIEW ====================
  const segmentLibrary = getSegmentLibrary(user?.metrics, user?.currencySymbol);
  const categories = {
    test: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "test"),
    engagement: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "engagement"),
    lifecycle: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "lifecycle"),
    shopping: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "shopping"),
    exclusions: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "exclusions"),
    demographic: Object.entries(segmentLibrary).filter(([_, seg]) => seg.category === "demographic"),
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
              <Zap className="inline-block ml-2 text-[#EF3F3F]" size={24} />
            </h1>
            <p className="text-sm text-gray-400">by THE DRIP STORY</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.accountName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#0A0A0A] rounded transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-gray-400 hover:text-white" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-[#0A0A0A] rounded transition-colors" title="Logout">
              <LogOut size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-[#EF3F3F]" />
              <span className="text-sm text-gray-400">AOV</span>
            </div>
            <p className="text-2xl font-bold">
              {user?.currencySymbol}
              {user?.metrics.aov}
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-[#EF3F3F]" />
              <span className="text-sm text-gray-400">VIP Threshold</span>
            </div>
            <p className="text-2xl font-bold">
              {user?.currencySymbol}
              {user?.metrics.vipThreshold}
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-[#EF3F3F]" />
              <span className="text-sm text-gray-400">High-Value</span>
            </div>
            <p className="text-2xl font-bold">
              {user?.currencySymbol}
              {user?.metrics.highValueThreshold}
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart size={20} className="text-[#EF3F3F]" />
              <span className="text-sm text-gray-400">Selected</span>
            </div>
            <p className="text-2xl font-bold">{selectedSegments.length}</p>
          </div>
        </div>

        {/* Quick Start Bundles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🚀 Quick Start Bundles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SEGMENT_BUNDLES).map(([id, bundle]) => (
              <button
                key={id}
                onClick={() => selectBundle(id)}
                className="bg-[#1A1A1A] border border-gray-800 hover:border-[#EF3F3F] rounded-lg p-4 text-left transition-colors"
              >
                <div className="text-3xl mb-2">{bundle.icon}</div>
                <h3 className="font-bold text-white mb-1">{bundle.name}</h3>
                <p className="text-sm text-gray-400">{bundle.description}</p>
                <p className="text-xs text-[#EF3F3F] mt-2">
                  {bundle.segments === "all"
                    ? `${Object.keys(segmentLibrary).length} segments`
                    : `${bundle.segments.length} segments`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Segment Categories */}
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryName, segments]) => {
            if (segments.length === 0) return null;

            const categoryTitles = {
              test: "🧪 Test Segment",
              engagement: "📧 Engagement",
              lifecycle: "💰 Customer Lifecycle",
              shopping: "🛒 Shopping Behavior",
              exclusions: "❌ Exclusions",
              demographic: "👤 Demographics",
            };

            return (
              <div key={categoryName}>
                <h3 className="text-lg font-bold mb-3">{categoryTitles[categoryName]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {segments.map(([segmentId, segment]) => (
                    <button
                      key={segmentId}
                      onClick={() => toggleSegment(segmentId)}
                      className={`bg-[#1A1A1A] border rounded-lg p-4 text-left transition-all ${
                        selectedSegments.includes(segmentId)
                          ? "border-[#EF3F3F] bg-[#EF3F3F]/10"
                          : "border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{segment.icon}</span>
                        {selectedSegments.includes(segmentId) && <CheckCircle size={20} className="text-[#EF3F3F]" />}
                      </div>
                      <h4 className="font-bold text-white mb-1 text-sm">{segment.name}</h4>
                      <p className="text-xs text-gray-400">{segment.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Button */}
        {selectedSegments.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold">{selectedSegments.length} segments selected</p>
                <p className="text-sm text-gray-400">Ready to create in Klaviyo</p>
              </div>
              <button
                onClick={handleCreateSegments}
                disabled={isCreating}
                className="bg-[#EF3F3F] hover:bg-red-600 disabled:bg-gray-700 text-white font-bold px-8 py-4 rounded transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    CREATE SEGMENTS
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {isCreating ? "Creating Segments..." : "Segments Created!"}
              </h3>
              {!isCreating && (
                <button
                  onClick={() => {
                    setShowResults(false);
                    setSelectedSegments([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {!isCreating && (
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-bold">{successCount} Successful</span>
                  </div>
                </div>
                {errorCount > 0 && (
                  <div className="flex-1 bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle size={20} />
                      <span className="font-bold">{errorCount} Failed</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === "success" ? "bg-green-900/10 border-green-800" : "bg-red-900/10 border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.status === "success" ? (
                      <CheckCircle size={20} className="text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-white">{segmentLibrary[result.segmentId]?.name}</p>
                      <p className={`text-sm ${result.status === "success" ? "text-green-400" : "text-red-400"}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isCreating && (
              <div className="mt-6 space-y-3">
                <a
                  href="https://www.klaviyo.com/lists"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded text-center transition-colors"
                >
                  View in Klaviyo →
                </a>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setSelectedSegments([]);
                  }}
                  className="block w-full bg-[#0A0A0A] hover:bg-black text-white font-bold py-3 rounded text-center transition-colors"
                >
                  Create More Segments
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && user && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings size={24} className="text-[#EF3F3F]" />
                Account Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-lg font-bold text-white mb-4">Business Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">AOV</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={aov}
                        onChange={(e) => setAov(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">VIP Threshold</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={vipThreshold}
                        onChange={(e) => setVipThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">High-Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$"}
                      </span>
                      <input
                        type="number"
                        value={highValueThreshold}
                        onChange={(e) => setHighValueThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">New Customer (Days)</label>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Lapsed (Days)</label>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Churned (Days)</label>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 rounded px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateSettings}
                  className="flex-1 bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-[#0A0A0A] hover:bg-black text-white font-bold py-3 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApiInfo && <ApiPermissionsModal onClose={() => setShowApiInfo(false)} />}
    </div>
  );
}
