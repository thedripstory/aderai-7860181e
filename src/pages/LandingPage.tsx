import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Target,
  BarChart3,
  Gift,
} from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Klaviyo</span>
              <span className="text-foreground"> AI</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition font-medium">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition font-medium">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-muted-foreground hover:text-foreground transition font-medium">
              Login
            </a>
            <button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold transition shadow-button"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI-Powered Segmentation for Klaviyo</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Segment Like A <span className="text-primary">$50M Brand</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-medium">
              Deploy 70 battle-tested segments in 30 seconds. Zero guesswork. Enterprise-level segmentation without the agency price tag.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition shadow-button"
              >
                Start For $49
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-secondary hover:bg-secondary/80 border border-border px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Instant setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                100% money-back guarantee
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Works with Klaviyo
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-card border border-border rounded-xl p-8 mb-12 shadow-elegant">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">[Dashboard Preview - Klaviyo AI Segmentation]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-secondary/50 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">70</div>
            <div className="text-muted-foreground font-medium">Pre-Built Segments</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">30s</div>
            <div className="text-muted-foreground font-medium">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">40%+</div>
            <div className="text-muted-foreground font-medium">Revenue Increase</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">16</div>
            <div className="text-muted-foreground font-medium">Currencies Supported</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Segment Gap Is Costing You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              While competitors deploy 70 segments, you're stuck with 5. Most brands leave 40% of potential email revenue on the table.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Takes 10+ Hours</h3>
              <p className="text-muted-foreground">
                Creating 70 segments manually takes 10-15 hours. Most brands give up after building 5-10 basic segments.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Too Complex</h3>
              <p className="text-muted-foreground">
                Klaviyo's Boolean logic is intimidating. Small syntax errors cause segments to fail silently.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expensive Agencies</h3>
              <p className="text-muted-foreground">
                Agencies charge $5K-$15K for segmentation setup. You don't own the knowledge or methodology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop Guessing. Start Converting.</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Enterprise-level segmentation in 30 seconds. AI-powered, Klaviyo-native, customized to YOUR business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="bg-card border border-border rounded-xl p-8 shadow-elegant">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                  <p className="text-muted-foreground font-medium">[Screenshot: 70 Segment Library]</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Core Feature</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">70 Battle-Tested Segments</h3>
              <p className="text-lg text-muted-foreground mb-6">
                VIP Customers, At-Risk Buyers, Lapsed Customers, High-Intent Browsers, and 66 more proven segments. Every segment drives revenue.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">
                    Automatically customized to your AOV, currency, and lifecycle
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">Works across Shopify, WooCommerce, BigCommerce, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">
                    Intelligent fallbacks ensure segments work with limited data
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI-Powered</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">AI Segment Suggester</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Tell our AI your business goal. Get custom segments specifically for YOUR industry, use case, and customer behavior.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">Conversational wizard understands your context</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">Suggests 3-5 custom segments with reasoning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">One-tap creation directly in Klaviyo</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-card border border-border rounded-xl p-8 shadow-elegant">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                  <p className="text-muted-foreground font-medium">[Screenshot: AI Suggester]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-card border border-border rounded-xl p-8 shadow-elegant">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                  <p className="text-muted-foreground font-medium">[Screenshot: Analytics Dashboard]</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 mb-6">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Analytics Included</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Real-Time Performance Tracking</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Track segment performance, monitor growth, identify top performers. All your segment data in one dashboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">Live profile counts and growth metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">7-day trend visualization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">CSV export for reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Deploy In Minutes, Not Weeks</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              From signup to live segments in under 3 minutes. No coding, no complexity, no BS.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-muted-foreground">Choose Brand or Agency. Enter your details.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Klaviyo</h3>
              <p className="text-muted-foreground">Add your Klaviyo API key. Instant validation.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Customize</h3>
              <p className="text-muted-foreground">Enter AOV, currency, lifecycle thresholds.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Deploy</h3>
              <p className="text-muted-foreground">Select segments or use AI. Hit create. Done.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2 transition shadow-button"
            >
              Start Creating Segments
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              No hidden fees. No subscriptions for brands. Agencies get volume discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Pricing */}
            <div className="bg-[#0A0A0A] border-2 border-[#EF3F3F] rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#EF3F3F] text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black mb-2">Brand</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black text-[#EF3F3F]">$49</span>
                  <span className="text-gray-400"> one-time</span>
                </div>
                <p className="text-gray-400">Perfect for single brands</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">70 pre-built segments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">AI segment suggester</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Real-time analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">1 Klaviyo account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Lifetime access</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-[#EF3F3F] hover:bg-[#DC2626] py-3 rounded-lg font-bold transition"
              >
                Get Started
              </button>
            </div>

            {/* Agency 2 Clients */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black mb-2">Agency</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black">$89</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">Up to 2 clients</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Everything in Brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">2 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Agency dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Client switching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Bulk operations</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] py-3 rounded-lg font-bold transition"
              >
                Get Started
              </button>
            </div>

            {/* Agency 5 Clients */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black mb-2">Agency Pro</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black">$199</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">Up to 5 clients</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Everything in Agency</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">5 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">White-label option</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Advanced analytics</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] py-3 rounded-lg font-bold transition"
              >
                Get Started
              </button>
            </div>

            {/* Agency 10 Clients */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black mb-2">Agency Elite</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black">$349</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">Up to 10 clients</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">10 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Quarterly strategy calls</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] py-3 rounded-lg font-bold transition"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#EF3F3F]/10 border border-[#EF3F3F]/30 rounded-full px-6 py-3">
              <Gift className="w-5 h-5 text-[#EF3F3F]" />
              <span className="text-gray-300">
                Become an affiliate and earn 10% recurring + 20% one-time commissions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Loved By E-Commerce Brands</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join hundreds of brands using Aderai to drive revenue through better segmentation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-[#EF3F3F] fill-[#EF3F3F]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">
                  "This is exactly what we needed. We went from 5 basic segments to 70 in under 5 minutes. Our email
                  revenue jumped 30% in the first month."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-bold">Sarah Johnson</div>
                    <div className="text-sm text-gray-400">Marketing Director, BeautyBrand</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 inline-block">
              <div className="aspect-video w-full max-w-2xl bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-[#EF3F3F]/20">
                <div className="text-center">
                  <Play className="w-16 h-16 text-[#EF3F3F] mx-auto mb-4" />
                  <p className="text-gray-500">[Video Testimonial Placeholder]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#EF3F3F] to-[#DC2626]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready To 10x Your Email Revenue?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of brands using Aderai to create agency-level segments in seconds. No credit card required to
            start.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-[#EF3F3F] hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2 transition"
          >
            Start For $49
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Setup in 3 minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No contracts
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold tracking-tight mb-4">
                <span className="text-primary">Klaviyo</span>
                <span className="text-foreground"> AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Powered by Klaviyo
                <br />
                70 Segments. 30 Seconds.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Affiliate Program
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 Klaviyo AI Segmentation. Powered by Klaviyo.
          </div>
        </div>
      </footer>
    </div>
  );
}
