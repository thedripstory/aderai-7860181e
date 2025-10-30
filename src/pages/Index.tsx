import React, { useState } from "react";
import {
  Zap,
  Target,
  TrendingUp,
  ShoppingCart,
  Mail,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

// Color scheme matching The Drip Story
const COLORS = {
  primary: "#EF3F3F",
  background: "#0A0A0A",
  card: "#1A1A1A",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "#2A2A2A",
  success: "#10B981",
  error: "#EF4444",
};

// Complete segment library from BFCM Playbook
const SEGMENT_LIBRARY = {
  engagement: {
    title: "📧 Engagement & Activity",
    icon: Mail,
    color: COLORS.primary,
    segments: [
      {
        id: "engaged-30",
        name: "Engaged (Last 30 days)",
        emoji: "🫡",
        description: "Opened or clicked in last 30 days",
      },
      {
        id: "engaged-60",
        name: "Engaged (Last 60 Days)",
        emoji: "☝🏻",
        description: "Opened or clicked in last 60 days",
      },
      {
        id: "engaged-90",
        name: "Engaged (Last 90 Days)",
        emoji: "🤑",
        description: "Opened or clicked in last 90 days",
      },
      { id: "highly-engaged", name: "Highly Engaged", emoji: "🔝", description: "Opened 5+ emails in last 30 days" },
      { id: "recent-clickers", name: "Recent Clickers", emoji: "😎", description: "Clicked link in last 14 days" },
      { id: "engaged-non-buyers", name: "Engaged Non-Buyers", emoji: "📕", description: "Active but never purchased" },
      {
        id: "active-site-30",
        name: "Active on Site (Last 30 Days)",
        emoji: "👁️‍🗨️",
        description: "Visited website recently",
      },
      {
        id: "unengaged-90",
        name: "Unengaged (90+ Days Inactive)",
        emoji: "👎🏻",
        description: "No activity for 90+ days",
      },
      {
        id: "unengaged-180",
        name: "Unengaged (180+ Days Inactive)",
        emoji: "🙅🏻‍♂️",
        description: "No activity for 180+ days",
      },
    ],
  },

  lifecycle: {
    title: "💰 Customer Lifecycle & Value",
    icon: TrendingUp,
    color: "#10B981",
    segments: [
      { id: "new-subscribers", name: "New Subscribers", emoji: "🤩", description: "Subscribed in last 7 days" },
      {
        id: "recent-first-time",
        name: "Recent First-Time Customers",
        emoji: "💰",
        description: "First purchase in last 30 days",
      },
      { id: "repeat-customers", name: "Repeat Customers", emoji: "💸", description: "Purchased 2+ times" },
      { id: "one-time-customers", name: "One-Time Customers", emoji: "1️⃣", description: "Purchased exactly once" },
      { id: "active-customers", name: "Active Customers", emoji: "🥰", description: "Purchased in last 90 days" },
      { id: "lapsed-customers", name: "Lapsed Customers", emoji: "☹️", description: "No purchase in 90-180 days" },
      { id: "churned-customers", name: "Churned Customers", emoji: "😟", description: "No purchase in 180+ days" },
      { id: "vip-customers", name: "VIP Customers", emoji: "👑", description: "Top 10% by lifetime value" },
      { id: "big-spenders", name: "Big Spenders", emoji: "⚡", description: "High average order value" },
      { id: "bargain-shoppers", name: "Bargain Shoppers", emoji: "💫", description: "Only buy on discount" },
      { id: "high-churn-risk", name: "High Churn Risk", emoji: "😥", description: "Showing signs of disengagement" },
      {
        id: "likely-purchase-soon",
        name: "Likely to Purchase Soon",
        emoji: "☺️",
        description: "High engagement, no recent purchase",
      },
      { id: "predicted-vips", name: "Predicted VIPs", emoji: "❤️‍🔥", description: "Showing VIP purchase patterns" },
      { id: "high-aov", name: "High AOV", emoji: "🪄", description: "Average order value above $X" },
      { id: "low-aov", name: "Low AOV", emoji: "🪫", description: "Average order value below $X" },
    ],
  },

  shopping: {
    title: "🛒 Shopping Behaviour",
    icon: ShoppingCart,
    color: "#F59E0B",
    segments: [
      { id: "all-customers", name: "All Customers (PUR ≥ 1)", emoji: "🛍️", description: "Anyone who has purchased" },
      {
        id: "never-purchased",
        name: "Never Purchased (Prospects)",
        emoji: "🥎",
        description: "Subscribed but no orders",
      },
      {
        id: "recent-purchasers-30",
        name: "Recent Purchasers (Last 30 Days)",
        emoji: "🔥",
        description: "Purchased in last month",
      },
      { id: "abandoned-cart", name: "Abandoned Cart", emoji: "🛒", description: "Items in cart, no checkout" },
      {
        id: "abandoned-cart-high-value",
        name: "Abandoned Cart - High Value",
        emoji: "🔑",
        description: "Cart value above $X",
      },
      {
        id: "abandoned-checkout",
        name: "Abandoned Checkout",
        emoji: "🗃️",
        description: "Started checkout, didn't complete",
      },
      {
        id: "abandoned-checkout-high-value",
        name: "Abandoned Checkout - High Value",
        emoji: "🚛",
        description: "High-value abandoned checkout",
      },
      {
        id: "browse-abandonment",
        name: "Browse Abandonment",
        emoji: "📱",
        description: "Viewed products, no cart add",
      },
      {
        id: "category-interest",
        name: "Category Interest",
        emoji: "🫣",
        description: "Viewed specific category 3+ times",
      },
      {
        id: "product-specific-interest",
        name: "Product-Specific Interest",
        emoji: "📦",
        description: "Viewed specific product multiple times",
      },
      { id: "cross-sell", name: "Cross-Sell", emoji: "🔀", description: "Bought product A, show product B" },
      { id: "category-buyers", name: "Category Buyers", emoji: "⚽", description: "Purchased from specific category" },
      {
        id: "multi-category-shoppers",
        name: "Multi-Category Shoppers",
        emoji: "🤹🏻",
        description: "Bought from 2+ categories",
      },
      {
        id: "frequent-site-visitors",
        name: "Frequent Site Visitors",
        emoji: "🖥️",
        description: "Visits site 5+ times/month",
      },
      { id: "coupon-users", name: "Coupon Users", emoji: "🚦", description: "Uses discount codes regularly" },
      { id: "full-price-buyers", name: "Full-Price Buyers", emoji: "💲", description: "Never uses discounts" },
      { id: "product-reviewers", name: "Product Reviewers", emoji: "🖊️", description: "Left product reviews" },
      { id: "non-reviewers", name: "Non-Reviewers", emoji: "💭", description: "Purchased but never reviewed" },
    ],
  },

  demographic: {
    title: "👤 Profile & Demographics",
    icon: User,
    color: "#8B5CF6",
    segments: [
      { id: "gender-male", name: "Gender - Male", emoji: "👦🏻", description: "Male identified profiles" },
      { id: "gender-female", name: "Gender - Female", emoji: "👩🏻", description: "Female identified profiles" },
      { id: "gender-uncertain", name: "Gender - Uncertain", emoji: "🦸🏻", description: "Gender not specified" },
      {
        id: "location-country",
        name: "Location - by Country/Region",
        emoji: "🌎",
        description: "Target specific countries",
      },
      {
        id: "location-radius",
        name: "Location - Proximity Radius",
        emoji: "📍",
        description: "Within X miles of location",
      },
      {
        id: "birthday-upcoming",
        name: "Birthday Upcoming (This Month)",
        emoji: "🎂",
        description: "Birthday in current month",
      },
      { id: "age-groups", name: "Age Group Segments", emoji: "😌", description: "Segment by age ranges" },
      {
        id: "region-eu-non-eu",
        name: "Region Segments (EU vs Non-EU)",
        emoji: "🗺️",
        description: "EU vs non-EU customers",
      },
    ],
  },

  exclusions: {
    title: "❌ Exclusion Filters",
    icon: Filter,
    color: "#EF4444",
    segments: [
      { id: "excl-unsubscribed", name: "Unsubscribed Contacts", emoji: "🗑️", description: "Opted out of emails" },
      { id: "excl-bounced", name: "Bounced Email Addresses", emoji: "🎾", description: "Email addresses that bounced" },
      { id: "excl-not-opted-in", name: "Not Opted-In Profiles", emoji: "🚥", description: "No explicit consent" },
      {
        id: "excl-recent-purchasers",
        name: "Recent Purchasers",
        emoji: "🔜",
        description: "Just bought (exclude from promo)",
      },
      { id: "excl-refunded", name: "Refunded Customers", emoji: "🎣", description: "Requested refund recently" },
      {
        id: "excl-negative-feedback",
        name: "Negative Feedback",
        emoji: "🤕",
        description: "Left negative reviews/complaints",
      },
      { id: "excl-unengaged", name: "Unengaged Subscribers", emoji: "🎯", description: "Never engaged with emails" },
      { id: "excl-sunset", name: "Sunset Segment", emoji: "🌇", description: "Inactive 365+ days, ready to remove" },
      { id: "excl-high-churn", name: "High Churn Risk", emoji: "🥴", description: "About to unsubscribe" },
      {
        id: "excl-received-5-0-engagement",
        name: "Received 5, opened or clicked 0",
        emoji: "📧",
        description: "Got 5 emails, zero engagement",
      },
      {
        id: "excl-received-3-in-3-days",
        name: "Received 3 in the last 3 days",
        emoji: "😨",
        description: "Already got 3 emails recently",
      },
      { id: "excl-marked-spam", name: "Marked Spam", emoji: "⚠️", description: "Marked previous email as spam" },
    ],
  },
};

const QUICK_START_BUNDLES = {
  bfcm: {
    name: "BFCM Essentials",
    description: "10 critical segments for Black Friday success",
    segments: [
      "engaged-30",
      "vip-customers",
      "abandoned-cart",
      "never-purchased",
      "lapsed-customers",
      "recent-first-time",
      "high-aov",
      "excl-unsubscribed",
      "excl-bounced",
      "excl-recent-purchasers",
    ],
  },
  vip: {
    name: "VIP & High-Value Pack",
    description: "8 revenue-focused segments for big spenders",
    segments: [
      "vip-customers",
      "big-spenders",
      "predicted-vips",
      "high-aov",
      "full-price-buyers",
      "repeat-customers",
      "multi-category-shoppers",
      "excl-refunded",
    ],
  },
  reengagement: {
    name: "Re-Engagement Bundle",
    description: "6 segments to win back inactive customers",
    segments: [
      "lapsed-customers",
      "churned-customers",
      "unengaged-90",
      "engaged-non-buyers",
      "high-churn-risk",
      "abandoned-cart",
    ],
  },
  complete: {
    name: "Complete Foundation",
    description: "All 62 segments - the full suite",
    segments: "all",
  },
};

export default function AderaiApp() {
  const [apiKey, setApiKey] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<{ segmentId: string; status: "success" | "error"; message: string }[]>([]);
  const [currentStep, setCurrentStep] = useState<"setup" | "select" | "creating" | "complete">("setup");
  const [workerUrl, setWorkerUrl] = useState("https://aderai-api.akshat-619.workers.dev/create-segments");

  const toggleSegment = (segmentId: string) => {
    const newSelected = new Set(selectedSegments);
    if (newSelected.has(segmentId)) {
      newSelected.delete(segmentId);
    } else {
      newSelected.add(segmentId);
    }
    setSelectedSegments(newSelected);
  };

  const selectAll = (categoryKey: string) => {
    const newSelected = new Set(selectedSegments);
    SEGMENT_LIBRARY[categoryKey as keyof typeof SEGMENT_LIBRARY].segments.forEach((seg) => {
      newSelected.add(seg.id);
    });
    setSelectedSegments(newSelected);
  };

  const deselectAll = (categoryKey: string) => {
    const newSelected = new Set(selectedSegments);
    SEGMENT_LIBRARY[categoryKey as keyof typeof SEGMENT_LIBRARY].segments.forEach((seg) => {
      newSelected.delete(seg.id);
    });
    setSelectedSegments(newSelected);
  };

  const loadBundle = (bundleKey: string) => {
    const bundle = QUICK_START_BUNDLES[bundleKey as keyof typeof QUICK_START_BUNDLES];
    if (bundle.segments === "all") {
      const allSegments = new Set<string>();
      Object.values(SEGMENT_LIBRARY).forEach((category) => {
        category.segments.forEach((seg) => allSegments.add(seg.id));
      });
      setSelectedSegments(allSegments);
    } else {
      setSelectedSegments(new Set(bundle.segments));
    }
  };

  const createSegments = async () => {
    if (!apiKey || selectedSegments.size === 0) return;

    setIsCreating(true);
    setCurrentStep("creating");
    setResults([]);

    try {
      const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          segments: Array.from(selectedSegments),
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setCurrentStep("complete");
    } catch (error) {
      console.error("Error creating segments:", error);
      setResults([
        { segmentId: "error", status: "error", message: "Failed to connect to API. Check your Worker URL." },
      ]);
      setCurrentStep("complete");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: "100vh", color: COLORS.text }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "1.5rem 2rem" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ color: COLORS.primary }}>ADER</span>
              <span>AI</span>
              <Zap style={{ color: COLORS.primary }} size={32} />
            </h1>
            <p style={{ color: COLORS.textMuted, margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
              by <span style={{ color: COLORS.primary, fontWeight: 600 }}>THE DRIP STORY</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ color: COLORS.textMuted, fontSize: "0.875rem" }}>
              {selectedSegments.size} segments selected
            </span>
            <a
              href="https://thedripstory.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textMuted,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
              }}
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        {/* Setup Step */}
        {currentStep === "setup" && (
          <div style={{ maxWidth: "600px", margin: "4rem auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
                CREATE <span style={{ color: COLORS.primary }}>62 SEGMENTS</span> IN SECONDS
              </h2>
              <p style={{ color: COLORS.textMuted, fontSize: "1.125rem" }}>
                Stop wasting time building segments manually. Aderai creates hyper-targeted segments in your Klaviyo
                account with one click.
              </p>
            </div>

            <div
              style={{
                backgroundColor: COLORS.card,
                padding: "2rem",
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                Klaviyo Private API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="pk_..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  color: COLORS.text,
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}
              />
              <p style={{ color: COLORS.textMuted, fontSize: "0.875rem", marginBottom: "1rem" }}>
                Get your API key from Klaviyo → Settings → API Keys
              </p>

              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Cloudflare Worker URL</label>
              <input
                type="text"
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                placeholder="https://your-worker.workers.dev/create-segments"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  color: COLORS.text,
                  fontSize: "1rem",
                  marginBottom: "1.5rem",
                }}
              />

              <button
                onClick={() => setCurrentStep("select")}
                disabled={!apiKey}
                style={{
                  width: "100%",
                  padding: "1rem",
                  backgroundColor: apiKey ? COLORS.primary : COLORS.border,
                  color: COLORS.text,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  cursor: apiKey ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Continue to Segment Selection →
              </button>
            </div>
          </div>
        )}

        {/* Selection Step */}
        {currentStep === "select" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Select Your <span style={{ color: COLORS.primary }}>Segments</span>
              </h2>
              <p style={{ color: COLORS.textMuted }}>Choose individual segments or use a quick-start bundle</p>
            </div>

            {/* Quick Start Bundles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {Object.entries(QUICK_START_BUNDLES).map(([key, bundle]) => (
                <button
                  key={key}
                  onClick={() => loadBundle(key)}
                  style={{
                    backgroundColor: COLORS.card,
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    textAlign: "left",
                    color: COLORS.text,
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = COLORS.primary)}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1.125rem", marginBottom: "0.5rem" }}>{bundle.name}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: "0.875rem" }}>{bundle.description}</div>
                </button>
              ))}
            </div>

            {/* Category Segments */}
            {Object.entries(SEGMENT_LIBRARY).map(([categoryKey, category]) => {
              const CategoryIcon = category.icon;
              const categorySelected = category.segments.filter((seg) => selectedSegments.has(seg.id)).length;

              return (
                <div key={categoryKey} style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <CategoryIcon size={24} style={{ color: category.color }} />
                      <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{category.title}</h3>
                      <span style={{ color: COLORS.textMuted, fontSize: "0.875rem" }}>
                        ({categorySelected}/{category.segments.length})
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => selectAll(categoryKey)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: COLORS.background,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: "4px",
                          color: COLORS.text,
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => deselectAll(categoryKey)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: COLORS.background,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: "4px",
                          color: COLORS.text,
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {category.segments.map((segment) => {
                      const isSelected = selectedSegments.has(segment.id);
                      return (
                        <label
                          key={segment.id}
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: "0.75rem",
                            padding: "1rem",
                            backgroundColor: isSelected ? `${COLORS.primary}15` : COLORS.card,
                            border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSegment(segment.id)}
                            style={{ marginTop: "0.25rem", cursor: "pointer", accentColor: COLORS.primary }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                              {segment.emoji} {segment.name}
                            </div>
                            <div style={{ fontSize: "0.8125rem", color: COLORS.textMuted }}>{segment.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Create Button */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: COLORS.background,
                borderTop: `1px solid ${COLORS.border}`,
                padding: "1.5rem 0",
              }}
            >
              <button
                onClick={createSegments}
                disabled={selectedSegments.size === 0 || isCreating}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  backgroundColor: selectedSegments.size > 0 ? COLORS.primary : COLORS.border,
                  color: COLORS.text,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  cursor: selectedSegments.size > 0 ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                }}
              >
                {isCreating ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
                Create {selectedSegments.size} Segments in Klaviyo
              </button>
            </div>
          </div>
        )}

        {/* Creating Step */}
        {currentStep === "creating" && (
          <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
            <Loader2
              size={64}
              style={{ color: COLORS.primary, animation: "spin 1s linear infinite", margin: "0 auto 2rem" }}
            />
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Creating Segments...</h2>
            <p style={{ color: COLORS.textMuted }}>
              This will take a few seconds. We're creating {selectedSegments.size} segments in your Klaviyo account.
            </p>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === "complete" && (
          <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <CheckCircle2 size={64} style={{ color: COLORS.success, margin: "0 auto 1rem" }} />
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Segments Created!</h2>
              <p style={{ color: COLORS.textMuted }}>Check your Klaviyo account to see your new segments</p>
            </div>

            <div
              style={{ backgroundColor: COLORS.card, borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}
            >
              {results.map((result, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem",
                    borderBottom: idx < results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  }}
                >
                  {result.status === "success" ? (
                    <CheckCircle2 size={20} style={{ color: COLORS.success, flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: COLORS.error, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{result.segmentId}</div>
                    <div style={{ fontSize: "0.875rem", color: COLORS.textMuted }}>{result.message}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentStep("setup");
                setSelectedSegments(new Set());
                setResults([]);
              }}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: COLORS.primary,
                color: COLORS.text,
                border: "none",
                borderRadius: "6px",
                fontSize: "1.125rem",
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Create More Segments
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "2rem",
          textAlign: "center",
          color: COLORS.textMuted,
          fontSize: "0.875rem",
        }}
      >
        <p>
          Built by{" "}
          <a href="https://thedripstory.com" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 600 }}>
            THE DRIP STORY
          </a>{" "}
          - We achieve 80% open rates. That's 3x the industry standard.
        </p>
      </footer>
    </div>
  );
}
