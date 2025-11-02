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
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-[#2A2A2A]" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black">
              <span className="text-[#EF3F3F]">ADER</span>
              <span className="text-white">AI</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-400 hover:text-white transition">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-gray-400 hover:text-white transition">
              Login
            </a>
            <button
              onClick={handleGetStarted}
              className="bg-[#EF3F3F] hover:bg-[#DC2626] px-6 py-2 rounded-lg font-semibold transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EF3F3F]/10 border border-[#EF3F3F]/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#EF3F3F]" />
              <span className="text-sm text-gray-300">Powered by AI + $50M in Proven Email Strategies</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Create <span className="text-[#EF3F3F]">70 Klaviyo Segments</span>
              <br />
              In 30 Seconds
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Stop wasting 10+ hours manually building segments. Let AI create agency-level email segmentation for your
              e-commerce brand in under a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="bg-[#EF3F3F] hover:bg-[#DC2626] px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition"
              >
                Start For $49
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Setup in 3 minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Works with any platform
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 mb-12">
            <div className="aspect-video bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-[#EF3F3F]/20">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-[#EF3F3F] mx-auto mb-4" />
                <p className="text-gray-500">[Hero Product Screenshot - Dashboard View]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-[#1A1A1A] border-y border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-black text-[#EF3F3F] mb-2">70</div>
            <div className="text-gray-400">Pre-Built Segments</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-[#EF3F3F] mb-2">30s</div>
            <div className="text-gray-400">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-[#EF3F3F] mb-2">$50M+</div>
            <div className="text-gray-400">Revenue Driven</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-[#EF3F3F] mb-2">16</div>
            <div className="text-gray-400">Currencies Supported</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">The Problem With Klaviyo Segmentation</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Most e-commerce brands leave millions on the table because they don't have the time or expertise to build
              proper segments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="w-12 h-12 bg-[#EF3F3F]/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#EF3F3F]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Takes Forever</h3>
              <p className="text-gray-400">
                Creating 70 segments manually takes 10-15 hours. Most brands give up after building 5-10 basic segments.
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="w-12 h-12 bg-[#EF3F3F]/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#EF3F3F]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Too Complex</h3>
              <p className="text-gray-400">
                Klaviyo's Boolean logic is intimidating. Small syntax errors cause segments to fail silently.
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
              <div className="w-12 h-12 bg-[#EF3F3F]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#EF3F3F]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expensive Agencies</h3>
              <p className="text-gray-400">
                Agencies charge $5K-$15K for segmentation setup. You don't own the knowledge or methodology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-20 px-6 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">The Aderai Solution</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Agency-level segmentation in 30 seconds, not 10 hours. AI-powered, platform-agnostic, and customized to
              YOUR business metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border border-[#EF3F3F]/20 rounded-xl p-8">
                <div className="aspect-video bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-[#2A2A2A]">
                  <p className="text-gray-500">[Screenshot: Segment Selection Dashboard]</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EF3F3F]/10 border border-[#EF3F3F]/30 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-[#EF3F3F]" />
                <span className="text-sm text-gray-300">Core Feature</span>
              </div>
              <h3 className="text-3xl font-black mb-4">70 Pre-Built Segments</h3>
              <p className="text-lg text-gray-400 mb-6">
                VIP Customers, Cart Abandoners, Lapsed Buyers, At-Risk VIPs, and 66 more segments organized into 7
                strategic categories. Every segment proven to drive revenue in real e-commerce brands.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Automatically customized to your AOV, currency, and lifecycle metrics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Works across Shopify, WooCommerce, BigCommerce, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Intelligent fallbacks ensure segments work even with limited data
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-[#EF3F3F]/10 border border-[#EF3F3F]/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#EF3F3F]" />
                <span className="text-sm text-gray-300">NEW: AI-Powered</span>
              </div>
              <h3 className="text-3xl font-black mb-4">AI Segment Suggester</h3>
              <p className="text-lg text-gray-400 mb-6">
                Tell us your business goal (revenue, retention, engagement) and our AI creates custom segments
                specifically for YOUR brand's industry, use case, and customer behavior.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Conversational wizard understands your business context</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Suggests 3-5 custom segments with reasoning and campaign ideas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">One-tap creation directly in Klaviyo</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border border-[#EF3F3F]/20 rounded-xl p-8">
                <div className="aspect-video bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-[#2A2A2A]">
                  <p className="text-gray-500">[Screenshot: AI Suggester Interface]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border border-[#EF3F3F]/20 rounded-xl p-8">
                <div className="aspect-video bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-[#2A2A2A]">
                  <p className="text-gray-500">[Screenshot: Analytics Dashboard]</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EF3F3F]/10 border border-[#EF3F3F]/30 rounded-full px-4 py-2 mb-6">
                <BarChart3 className="w-4 h-4 text-[#EF3F3F]" />
                <span className="text-sm text-gray-300">Analytics Included</span>
              </div>
              <h3 className="text-3xl font-black mb-4">Real-Time Segment Analytics</h3>
              <p className="text-lg text-gray-400 mb-6">
                Track segment performance, monitor growth trends, identify top performers, and export reports. All your
                segment data in one beautiful dashboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Live profile counts and growth metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">7-day trend visualization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">CSV export for reporting</span>
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
            <h2 className="text-4xl md:text-5xl font-black mb-6">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From signup to segments live in Klaviyo in under 3 minutes. No coding, no complexity, no bullshit.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EF3F3F] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-gray-400">Choose Brand or Agency account. Enter your details.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#EF3F3F] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Klaviyo</h3>
              <p className="text-gray-400">Add your Klaviyo API key. We validate it instantly.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#EF3F3F] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Customize Metrics</h3>
              <p className="text-gray-400">Enter your AOV, currency, and lifecycle thresholds.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#EF3F3F] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Create Segments</h3>
              <p className="text-gray-400">Select segments or use AI. Hit create. Done.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleGetStarted}
              className="bg-[#EF3F3F] hover:bg-[#DC2626] px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2 transition"
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
      <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-black mb-4">
                <span className="text-[#EF3F3F]">ADER</span>
                <span className="text-white">AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                By THE DRIP STORY
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
          <div className="border-t border-[#2A2A2A] pt-8 text-center text-sm text-gray-500">
            © 2025 Aderai by THE DRIP STORY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
