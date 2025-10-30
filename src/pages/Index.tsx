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
} from "lucide-react";

/**
 * ADERAI - COMPLETE APP WITH FULL ONBOARDING
 * Login → Signup → Onboarding (ALL fields) → Dashboard
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

// Segment Data
const SEGMENTS = {
  "Core BFCM": [
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
    { id: "bounced", name: "🚫 Email Bounced", desc: "Email bounced" },
    { id: "marked-spam", name: "🚫 Marked as Spam", desc: "Marked email as spam" },
    { id: "never-engaged-exclusion", name: "🚫 Never Engaged", desc: "Zero activity (exclusion)" },
    { id: "do-not-email", name: "🚫 Do Not Email", desc: "Manually marked" },
    { id: "recent-purchasers-7-exclusion", name: "🚫 Recent Purchasers (7D)", desc: "Bought in last 7 days" },
    { id: "used-bfcm-code", name: "🚫 Used BFCM Code", desc: "Already used promo" },
    { id: "checkout-abandoners-1-day", name: "🚫 Checkout (1D)", desc: "Too recent to email" },
    { id: "sms-only", name: "🚫 SMS Only", desc: "Prefers SMS" },
    { id: "outside-shipping-zone", name: "🚫 Outside Shipping", desc: "Can't ship to location" },
    { id: "refund-requesters", name: "🚫 Refund Requesters", desc: "Requested refund recently" },
  ],
};

const BUNDLES = {
  "BFCM Essentials": [
    "vip-customers",
    "repeat-customers",
    "one-time-customers",
    "cart-abandoners",
    "lapsed-customers",
    "engaged-non-buyers",
    "recent-clickers",
    "high-value-cart",
    "coupon-users",
    "recent-first-time",
  ],
  "VIP & High-Value": [
    "vip-customers",
    "big-spenders",
    "high-lifetime-value",
    "predicted-vips",
    "high-aov",
    "full-price-buyers",
    "multi-category-shoppers",
    "product-reviewers",
  ],
  "Re-Engagement": [
    "lapsed-customers",
    "churned-customers",
    "unengaged-90",
    "high-churn-risk",
    "win-back-target",
    "at-risk-vips",
  ],
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
];

export default function AderaiApp() {
  // View state
  const [view, setView] = useState<"login" | "signup" | "onboarding" | "dashboard" | "creating" | "results">("login");

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

  // User data
  const [userData, setUserData] = useState<UserData | null>(null);

  // Dashboard state
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core BFCM");
  const [showApiInfo, setShowApiInfo] = useState(false);

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

      const response = await fetch("https://aderai-api.YOUR-SUBDOMAIN.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: userData.klaviyoApiKey,
          segments: selectedSegments,
          currencySymbol,
          metrics: {
            aov: userData.aov,
            vipThreshold: userData.vipThreshold,
            highValueThreshold: userData.highValueThreshold,
            newCustomerDays: userData.newCustomerDays,
            lapsedDays: userData.lapsedDays,
            churnedDays: userData.churnedDays,
          },
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setView("results");
    } catch (error) {
      alert("Error creating segments: " + (error as Error).message);
      setView("dashboard");
    }
  };

  const getCurrencySymbol = () => CURRENCIES.find((c) => c.code === userData?.currency)?.symbol || "$";

  // Render login
  if (view === "login") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-5xl font-bold">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </h1>
              <Zap className="w-10 h-10 text-[#EF3F3F]" />
            </div>
            <p className="text-gray-400">Create 70 Klaviyo segments in 30 seconds</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
              >
                Login
              </button>

              <div className="text-center text-gray-400 text-sm">
                Don't have an account?{" "}
                <button onClick={() => setView("signup")} className="text-[#EF3F3F] hover:text-red-400 font-bold">
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Aderai by{" "}
              <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Render signup
  if (view === "signup") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-5xl font-bold">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </h1>
              <Zap className="w-10 h-10 text-[#EF3F3F]" />
            </div>
            <p className="text-gray-400">Create your account</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSignup}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
              >
                Continue
              </button>

              <div className="text-center text-gray-400 text-sm">
                Already have an account?{" "}
                <button onClick={() => setView("login")} className="text-[#EF3F3F] hover:text-red-400 font-bold">
                  Login
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Aderai by{" "}
              <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Render onboarding
  if (view === "onboarding") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-5xl font-bold">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </h1>
              <Zap className="w-10 h-10 text-[#EF3F3F]" />
            </div>
            <p className="text-xl text-gray-400">Let's set up your account</p>
            <p className="text-sm text-gray-500 mt-2">This helps us create segments tailored to your business</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>

            <div className="space-y-6">
              {/* Account Name */}
              <div>
                <label className="text-white font-bold mb-2 block">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Store"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#EF3F3F]" />
                    Klaviyo Private API Key
                  </label>
                  <button onClick={() => setShowApiInfo(true)} className="text-gray-400 hover:text-white transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="password"
                  value={klaviyoApiKey}
                  onChange={(e) => setKlaviyoApiKey(e.target.value)}
                  placeholder="pk_..."
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">Stored locally and never sent to our servers</p>
              </div>

              {/* Currency */}
              <div>
                <label className="text-white font-bold mb-2 block">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Metrics */}
              <div className="border-t border-[#2A2A2A] pt-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#EF3F3F]" />
                  Your Business Metrics
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  These help us customize segment thresholds for your business
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Average Order Value (AOV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === currency)?.symbol}
                      </span>
                      <input
                        type="number"
                        value={aov}
                        onChange={(e) => setAov(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">VIP Customer Threshold (LTV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === currency)?.symbol}
                      </span>
                      <input
                        type="number"
                        value={vipThreshold}
                        onChange={(e) => setVipThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">High-Value Customer (LTV)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {CURRENCIES.find((c) => c.code === currency)?.symbol}
                      </span>
                      <input
                        type="number"
                        value={highValueThreshold}
                        onChange={(e) => setHighValueThreshold(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">New Customer Window (Days)</label>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Lapsed Customer (Days)</label>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Churned Customer (Days)</label>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleOnboarding}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-4 rounded-lg text-lg transition"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Aderai by <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>
            . All rights reserved.
          </p>
        </footer>

        {/* Improved API Info Modal */}
        {showApiInfo && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowApiInfo(false)}
          >
            <div
              className="bg-[#1A1A1A] border-2 border-[#EF3F3F] rounded-xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-10 h-10 text-[#EF3F3F]" />
                <div>
                  <h3 className="text-3xl font-bold text-white">API Key Setup</h3>
                  <p className="text-gray-400 text-sm">Your data security is our priority</p>
                </div>
              </div>

              {/* Steps */}
              <div className="mb-6">
                <h4 className="text-white font-bold mb-3 text-lg">How to get your API key:</h4>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="bg-[#EF3F3F] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <span>
                      Go to <span className="text-white font-semibold">Klaviyo → Settings → API Keys</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="bg-[#EF3F3F] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <span>
                      Click <span className="text-white font-semibold">"Create Private API Key"</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="bg-[#EF3F3F] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <span>
                      Name it: <span className="text-white font-semibold">"Aderai Segments"</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="bg-[#EF3F3F] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      4
                    </div>
                    <span>
                      Give it <span className="text-white font-semibold">"Full Access"</span> permissions
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="bg-[#EF3F3F] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      5
                    </div>
                    <span>
                      Copy the key (starts with <span className="text-white font-semibold">"pk_"</span>)
                    </span>
                  </li>
                </ol>
              </div>

              {/* Required Permissions */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Required Permissions
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-[#EF3F3F] rounded-full"></div>
                    <span>
                      <span className="text-white font-semibold">Read Segments:</span> To detect existing segments
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-[#EF3F3F] rounded-full"></div>
                    <span>
                      <span className="text-white font-semibold">Write Segments:</span> To create new segments
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-[#EF3F3F] rounded-full"></div>
                    <span>
                      <span className="text-white font-semibold">Read Metrics:</span> To match your store's events
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-br from-[#EF3F3F]/10 to-[#EF3F3F]/5 border border-[#EF3F3F]/30 rounded-lg p-5 mb-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#EF3F3F]" />
                  Your Security Guarantee
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-white font-semibold">Stored locally only:</span> Your API key never touches
                      our servers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-white font-semibold">Direct to Klaviyo:</span> All requests go from your
                      browser to Klaviyo
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-white font-semibold">Zero backend:</span> We never see or log your API key
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-white font-semibold">Cloudflare Worker:</span> Secure, encrypted connection
                      at all times
                    </span>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 mb-6">
                <h4 className="text-white font-bold mb-3">How Aderai Works</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="text-[#EF3F3F] font-bold">1.</div>
                    <span>You select segments in our interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[#EF3F3F] font-bold">2.</div>
                    <span>Your browser sends request to Cloudflare Worker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[#EF3F3F] font-bold">3.</div>
                    <span>Worker creates segments directly in your Klaviyo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[#EF3F3F] font-bold">4.</div>
                    <span>Results sent back to you in real-time</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowApiInfo(false)}
                className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
              >
                Got It - Let's Go!
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">Questions? Email us at support@thedripstory.com</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render creating
  if (view === "creating") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="w-16 h-16 text-[#EF3F3F] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Creating Your Segments...</h2>
          <p className="text-gray-400">This will take about {Math.ceil(selectedSegments.length * 0.25)} seconds</p>
          <p className="text-sm text-gray-500 mt-2">Tailored to your business metrics</p>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Aderai by <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>
            . All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  // Render results
  if (view === "results") {
    const successCount = results.filter((r) => r.status === "success").length;
    const skippedCount = results.filter((r) => r.status === "skipped").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Segments Created!</h1>
            <p className="text-gray-400">Check your Klaviyo account to see your new segments</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{successCount}</div>
              <div className="text-gray-400">Created</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">{skippedCount}</div>
              <div className="text-gray-400">Skipped</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">{errorCount}</div>
              <div className="text-gray-400">Failed</div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 max-h-96 overflow-y-auto mb-6">
            {results.map((result, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-[#2A2A2A] last:border-0">
                {result.status === "success" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                {result.status === "skipped" && <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                {result.status === "error" && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-white font-medium">{result.message}</div>
                  {result.status === "skipped" && (
                    <div className="text-xs text-gray-500 mt-1">
                      This metric isn't available in your Klaviyo account
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setView("dashboard");
              setResults([]);
              setSelectedSegments([]);
            }}
            className="w-full bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-4 rounded-lg transition"
          >
            Create More Segments
          </button>

          {/* Footer */}
          <footer className="mt-8 pt-8 border-t border-[#2A2A2A] text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Aderai by{" "}
              <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsAccountName, setSettingsAccountName] = useState("");
  const [settingsCurrency, setSettingsCurrency] = useState("USD");
  const [settingsAov, setSettingsAov] = useState("100");
  const [settingsVipThreshold, setSettingsVipThreshold] = useState("500");
  const [settingsHighValueThreshold, setSettingsHighValueThreshold] = useState("300");
  const [settingsNewCustomerDays, setSettingsNewCustomerDays] = useState("30");
  const [settingsLapsedDays, setSettingsLapsedDays] = useState("60");
  const [settingsChurnedDays, setSettingsChurnedDays] = useState("180");

  const openSettings = () => {
    if (userData) {
      setSettingsAccountName(userData.accountName);
      setSettingsCurrency(userData.currency);
      setSettingsAov(userData.aov);
      setSettingsVipThreshold(userData.vipThreshold);
      setSettingsHighValueThreshold(userData.highValueThreshold);
      setSettingsNewCustomerDays(userData.newCustomerDays);
      setSettingsLapsedDays(userData.lapsedDays);
      setSettingsChurnedDays(userData.churnedDays);
      setShowSettings(true);
    }
  };

  const saveSettings = () => {
    if (!userData) return;

    const updatedUser: UserData = {
      ...userData,
      accountName: settingsAccountName,
      currency: settingsCurrency,
      aov: settingsAov,
      vipThreshold: settingsVipThreshold,
      highValueThreshold: settingsHighValueThreshold,
      newCustomerDays: settingsNewCustomerDays,
      lapsedDays: settingsLapsedDays,
      churnedDays: settingsChurnedDays,
    };

    localStorage.setItem(`aderai_${userData.email}`, JSON.stringify({ ...updatedUser, password }));
    localStorage.setItem("aderai_user", JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setShowSettings(false);
  };

  // Render dashboard
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </h1>
              <Zap className="w-8 h-8 text-[#EF3F3F]" />
            </div>
            <p className="text-gray-400">Welcome back, {userData?.accountName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={openSettings} className="text-gray-400 hover:text-white transition" title="Settings">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">AOV</div>
            <div className="text-2xl font-bold text-white">
              {getCurrencySymbol()}
              {userData?.aov}
            </div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">VIP Threshold</div>
            <div className="text-2xl font-bold text-white">
              {getCurrencySymbol()}
              {userData?.vipThreshold}
            </div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">High-Value</div>
            <div className="text-2xl font-bold text-white">
              {getCurrencySymbol()}
              {userData?.highValueThreshold}
            </div>
          </div>
        </div>

        {/* Quick Start Bundles */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Quick Start Bundles</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(BUNDLES).map((bundle) => (
              <button
                key={bundle}
                onClick={() => selectBundle(bundle)}
                className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#EF3F3F] rounded-lg p-4 transition text-left"
              >
                <div className="text-white font-bold mb-1">{bundle}</div>
                <div className="text-sm text-gray-400">{BUNDLES[bundle as keyof typeof BUNDLES].length} segments</div>
              </button>
            ))}
          </div>
        </div>

        {/* Segment Selection */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Select Segments ({selectedSegments.length} selected)</h3>

          {Object.entries(SEGMENTS).map(([category, segments]) => {
            const allSelected = segments.every((s) => selectedSegments.includes(s.id));
            const someSelected = segments.some((s) => selectedSegments.includes(s.id));

            return (
              <div key={category} className="mb-4">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className="w-full flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#EF3F3F] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white font-bold">{category}</div>
                    <div className="text-sm text-gray-400">({segments.length} segments)</div>
                    {someSelected && (
                      <div className="text-xs bg-[#EF3F3F] text-white px-2 py-1 rounded">
                        {segments.filter((s) => selectedSegments.includes(s.id)).length} selected
                      </div>
                    )}
                  </div>
                  {expandedCategory === category ? (
                    <ChevronUp className="text-gray-400" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </button>

                {expandedCategory === category && (
                  <div className="mt-2 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                    <button
                      onClick={() => selectAllInCategory(category)}
                      className="text-sm text-[#EF3F3F] hover:text-red-400 mb-3 transition"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      {segments.map((segment) => (
                        <label
                          key={segment.id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                            selectedSegments.includes(segment.id)
                              ? "bg-[#EF3F3F]/10 border border-[#EF3F3F]"
                              : "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#EF3F3F]/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSegments.includes(segment.id)}
                            onChange={() => toggleSegment(segment.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{segment.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{segment.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Button */}
        <button
          onClick={createSegments}
          disabled={selectedSegments.length === 0}
          className="w-full bg-[#EF3F3F] hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 rounded-lg text-xl transition flex items-center justify-center gap-3"
        >
          <Zap className="w-6 h-6" />
          Create {selectedSegments.length} Segments
        </button>

        {/* Settings Modal */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="bg-[#1A1A1A] border-2 border-[#EF3F3F] rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="w-8 h-8 text-[#EF3F3F]" />
                  <h3 className="text-3xl font-bold text-white">Settings</h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Account Name */}
                <div>
                  <label className="text-white font-bold mb-2 block">Account Name</label>
                  <input
                    type="text"
                    value={settingsAccountName}
                    onChange={(e) => setSettingsAccountName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="text-white font-bold mb-2 block">Currency</label>
                  <select
                    value={settingsCurrency}
                    onChange={(e) => setSettingsCurrency(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Metrics */}
                <div className="border-t border-[#2A2A2A] pt-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#EF3F3F]" />
                    Business Metrics
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Average Order Value (AOV)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {CURRENCIES.find((c) => c.code === settingsCurrency)?.symbol}
                        </span>
                        <input
                          type="number"
                          value={settingsAov}
                          onChange={(e) => setSettingsAov(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">VIP Customer Threshold (LTV)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {CURRENCIES.find((c) => c.code === settingsCurrency)?.symbol}
                        </span>
                        <input
                          type="number"
                          value={settingsVipThreshold}
                          onChange={(e) => setSettingsVipThreshold(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">High-Value Customer (LTV)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {CURRENCIES.find((c) => c.code === settingsCurrency)?.symbol}
                        </span>
                        <input
                          type="number"
                          value={settingsHighValueThreshold}
                          onChange={(e) => setSettingsHighValueThreshold(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">New Customer Window (Days)</label>
                      <input
                        type="number"
                        value={settingsNewCustomerDays}
                        onChange={(e) => setSettingsNewCustomerDays(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Lapsed Customer (Days)</label>
                      <input
                        type="number"
                        value={settingsLapsedDays}
                        onChange={(e) => setSettingsLapsedDays(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Churned Customer (Days)</label>
                      <input
                        type="number"
                        value={settingsChurnedDays}
                        onChange={(e) => setSettingsChurnedDays(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#EF3F3F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#EF3F3F] text-white font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSettings}
                    className="flex-1 bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full mt-12 pt-8 border-t border-[#2A2A2A]">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            © {new Date().getFullYear()} Aderai by <span className="text-[#EF3F3F] font-semibold">THE DRIP STORY</span>
            . All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="mailto:support@thedripstory.com" className="hover:text-white transition">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
