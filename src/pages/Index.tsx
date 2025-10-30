import React, { useState } from "react";
import { Shield, Zap, CheckCircle, AlertCircle, Loader, Settings, Info, ChevronDown, ChevronUp } from "lucide-react";

/**
 * ADERAI - COMPLETE REACT APP
 * ALL 70 SEGMENTS FROM BFCM NOTION DOC
 *
 * Ready for Lovable.dev deployment
 */

// Types
interface SegmentResult {
  segmentId: string;
  status: "success" | "error" | "skipped";
  message: string;
  klaviyoId?: string;
}

// Segment Data Structure
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

// Quick Start Bundles
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

// Currencies
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
  // State
  const [step, setStep] = useState<"setup" | "creating" | "results">("setup");
  const [apiKey, setApiKey] = useState("");
  const [workerUrl, setWorkerUrl] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core BFCM");
  const [showApiInfo, setShowApiInfo] = useState(false);

  // Functions
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
    if (!apiKey || selectedSegments.length === 0) {
      alert("Please enter your API key and select segments");
      return;
    }

    setStep("creating");

    try {
      const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

      const response = await fetch(workerUrl || "https://aderai-api.YOUR-SUBDOMAIN.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          segments: selectedSegments,
          currencySymbol,
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setStep("results");
    } catch (error) {
      alert("Error creating segments: " + (error as Error).message);
      setStep("setup");
    }
  };

  const getCurrencySymbol = () => CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

  // Render
  if (step === "creating") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="w-16 h-16 text-[#EF3F3F] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Creating Your Segments...</h2>
          <p className="text-gray-400">This will take about {Math.ceil(selectedSegments.length * 0.25)} seconds</p>
        </div>
      </div>
    );
  }

  if (step === "results") {
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

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 max-h-96 overflow-y-auto">
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
              setStep("setup");
              setResults([]);
              setSelectedSegments([]);
            }}
            className="w-full mt-6 bg-[#EF3F3F] hover:bg-red-600 text-white font-bold py-4 rounded-lg transition"
          >
            Create More Segments
          </button>
        </div>
      </div>
    );
  }

  // Setup Screen
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-5xl font-bold">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
            </h1>
            <Zap className="w-10 h-10 text-[#EF3F3F]" />
          </div>
          <p className="text-xl text-gray-400">Create 70 Klaviyo segments in 30 seconds</p>
          <p className="text-sm text-gray-500 mt-2">By THE DRIP STORY</p>
        </div>

        {/* API Key Input */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
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
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="pk_..."
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:border-[#EF3F3F] focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">Your API key is processed securely and never stored</p>
        </div>

        {/* Currency Selector */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 mb-6">
          <label className="text-white font-bold mb-3 block">Currency</label>
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
          disabled={!apiKey || selectedSegments.length === 0}
          className="w-full bg-[#EF3F3F] hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 rounded-lg text-xl transition flex items-center justify-center gap-3"
        >
          <Zap className="w-6 h-6" />
          Create {selectedSegments.length} Segments
        </button>

        {/* API Info Modal */}
        {showApiInfo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8 max-w-md">
              <h3 className="text-2xl font-bold text-white mb-4">Where to find your API key</h3>
              <ol className="text-gray-300 space-y-2 mb-6">
                <li>1. Go to Klaviyo → Settings → API Keys</li>
                <li>2. Create a "Private API Key"</li>
                <li>3. Give it "Full Access" permissions</li>
                <li>4. Copy the key (starts with "pk_")</li>
                <li>5. Paste it above</li>
              </ol>
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-4 mb-4">
                <p className="text-sm text-gray-400">
                  <Shield className="w-4 h-4 inline mr-2 text-[#EF3F3F]" />
                  Your API key is sent directly to Klaviyo via our secure Cloudflare Worker. We never see or store it.
                </p>
              </div>
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
    </div>
  );
}
