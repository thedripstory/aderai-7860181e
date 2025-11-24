import React, { useState, useEffect } from "react";
import { CheckCircle, CheckCircle2, ArrowRight, Zap, Clock, MousePointerClick, Star, Sparkles, X, Wand2, BarChart3, HelpCircle } from "lucide-react";
import { TubelightNavbar } from "@/components/TubelightNavbar";
const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { TrustLogos } from "@/components/TrustLogos";
import { FlipTestimonialCard } from "@/components/FlipTestimonialCard";
import { AnimatedSegmentVisual } from "@/components/AnimatedSegmentVisual";
import { AnimatedUnderline } from "@/components/AnimatedUnderline";
import { CircleDoodle } from "@/components/CircleDoodle";
import { ArrowDoodle } from "@/components/ArrowDoodle";
import { AnimatedTimeCounter } from "@/components/AnimatedTimeCounter";
import { AutomationFlow } from "@/components/AutomationFlow";
import { RevolvingTestimonials } from "@/components/RevolvingTestimonials";
import { TimeBasedPopup } from "@/components/TimeBasedPopup";
import { ValueCalculator } from "@/components/ValueCalculator";
import { ComparisonChart } from "@/components/ComparisonChart";
import { RevenueTestimonials } from "@/components/RevenueTestimonials";
import { useNavigate } from "react-router-dom";
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleGetStarted = () => {
    navigate("/signup");
  };

  const navItems = [
    { name: "How it works", url: "#how-it-works", icon: Wand2 },
  ];

  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Tubelight Navbar */}
      <TubelightNavbar items={navItems} />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="group flex items-center">
            <div className="text-4xl font-playfair font-bold tracking-tight hover:scale-105 transition-transform duration-300">
              aderai<span className="text-accent group-hover:animate-pulse">.</span>
            </div>
          </a>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <a
              href="/help"
              className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </a>
            
            <button
              onClick={() => navigate("/login")}
              className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Log in
            </button>

            <button 
              onClick={handleGetStarted} 
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-base font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30"
            >
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-12 px-6 overflow-visible">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: "1s"
        }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
              <div className="flex -space-x-2">
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/cm-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/kraus-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/tiger-marr-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/uppl-logo-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
              </div>
              <span className="text-muted-foreground">10,00+ brands use Aderai</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">4.8/5</span>
              <span className="text-muted-foreground">(727 reviews)</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                Works directly with Klaviyo
              </span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-400 via-yellow-500 to-orange-600 backdrop-blur-sm px-5 py-2.5 rounded-full border border-orange-300/30 mb-8 animate-fade-in shadow-lg shadow-orange-500/20 hover:scale-110 hover:rotate-2 hover:shadow-2xl hover:shadow-orange-400/40 transition-all duration-300 cursor-pointer relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <CheckCircle2 className="w-4 h-4 text-white relative z-10" />
              <span className="text-sm font-bold text-white uppercase tracking-wide relative z-10">
                Official Klaviyo Partner
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-12 tracking-tight leading-tight">
              70 Klaviyo Segments<br />
              <span className="text-accent block my-4">in 30 Seconds</span>
            </h1>

            <p className="text-2xl md:text-3xl text-foreground/80 mb-12 max-w-3xl mx-auto font-medium text-center">
              Stop spending hours building segments manually. Deploy expert-grade segmentation straight into{" "}
              <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom ml-1" />
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-8">
              <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-14 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-3 hover:scale-105 hover:bg-primary/90">
                <span>Start building segments</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Setup in under 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Interactive Comparison Cards */}
          <div className="relative max-w-5xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before Card */}
              <div className="group bg-gradient-to-br from-muted to-muted/50 rounded-3xl p-8 border-2 border-border hover:border-border/50 transition-all hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-background/50 rounded-xl border border-border">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-500/20">
                      YOUR CURRENT WAY
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                    Manual Segmentation
                  </div>
                  <div className="text-5xl font-bold mb-4 text-foreground">10+ hours</div>

                  <div className="space-y-3">
                    {["Build 70 segments one by one", "Debug complex Boolean logic", "Test each segment manually", "Fix errors & edge cases"].map((item, i) => <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>)}
                  </div>
                </div>
              </div>

              {/* After Card */}
              <div className="group bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-8 border-2 border-primary hover:border-primary/80 transition-all hover:scale-[1.02] relative overflow-hidden shadow-xl hover:shadow-2xl animate-[slide-in-right_0.8s_ease-out_0.3s_both]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 animate-pulse">
                      NEW WAY
                    </div>
                  </div>

                  <div className="text-sm text-primary mb-2 font-bold uppercase tracking-wide">With Aderai</div>
                  <div className="text-5xl font-bold mb-4 text-foreground">
                    <CircleDoodle delay="1.5s">
                      <AnimatedTimeCounter />
                    </CircleDoodle>
                  </div>

                  <div className="space-y-3">
                    {["Select from 70 pre-built segments", "Customize to your metrics", "One-click deploy to Klaviyo", "All segments auto-created"].map((item, i) => <div key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </div>)}
                  </div>
                </div>
              </div>

              {/* Arrow Connection */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-background border-2 border-primary rounded-full p-4 shadow-xl">
                  <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
            </div>

            {/* Revolving Testimonials */}
            <RevolvingTestimonials />
          </div>

          {/* Visual Demo */}
          <AnimatedSegmentVisual />

          {/* CTA Button */}
          <div className="mt-20 text-center">
            <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-12 py-6 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-3">
              <span>Start Building Segments</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
            </button>
          </div>

          {/* Trust Logos */}
          <div className="mt-20 mb-0">
            <TrustLogos />
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="pt-16 pb-20 px-6 bg-gradient-to-br from-muted via-muted to-primary/5 relative z-0 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                  <img src={klaviyoLogo} alt="Klaviyo" className="h-[1em] inline-block align-text-bottom" /> Official API Partner
                </span>
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Literal 1 click segmentation.
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  With official API integration, Aderai deploys high-impact audience segments directly into your{" "}
                  <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom mx-1" />
                  {" "}account, instantly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Triggers</h3>
                    <p className="text-muted-foreground text-sm">
                      Automatically detect customer behaviors and segment in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Segment Score</h3>
                    <p className="text-muted-foreground text-sm">
                      Monitor segment health with actionable performance indicators
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Deployment</h3>
                    <p className="text-muted-foreground text-sm">
                      <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.85em] inline-block align-text-bottom mx-1" loading="lazy" />
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={handleGetStarted} className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center">
                Get Started
              </button>
            </div>

            {/* Right Workflow Visual */}
            <div className="relative">
              <AutomationFlow />
            </div>
          </div>
        </div>
      </section>

      {/* Discover Hidden Segments */}
      <section id="how-it-works" className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Segment Discovery
              </span>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            Segments you didn't know existed
          </h2>

          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Access expert-grade audience segments that top brands use to drive 40%+ revenue increases
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Card 1 - VIP Reactivation */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-black hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] relative overflow-visible">
              {/* EXPLOSIVE Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none z-50">
                <span className="absolute top-0 left-[5%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out]">💵</span>
                <span className="absolute top-0 left-[15%] text-7xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.05s]">💵</span>
                <span className="absolute top-0 left-[25%] text-9xl opacity-0 group-hover:animate-[confetti-3_2.1s_ease-out_0.1s]">💵</span>
                <span className="absolute top-0 left-[35%] text-8xl opacity-0 group-hover:animate-[confetti-4_2.3s_ease-out_0.15s]">💵</span>
                <span className="absolute top-0 left-[45%] text-7xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.2s]">💵</span>
                <span className="absolute top-0 left-[55%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.25s]">💵</span>
                <span className="absolute top-0 left-[65%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.3s]">💵</span>
                <span className="absolute top-0 left-[75%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.35s]">💵</span>
                <span className="absolute top-0 left-[85%] text-9xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.4s]">💵</span>
                <span className="absolute top-0 left-[95%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.45s]">💵</span>
                <span className="absolute top-0 left-[10%] text-7xl opacity-0 group-hover:animate-[confetti-4_2.1s_ease-out_0.5s]">💵</span>
                <span className="absolute top-0 left-[20%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.3s_ease-out_0.55s]">💵</span>
                <span className="absolute top-0 left-[30%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out_0.6s]">💵</span>
                <span className="absolute top-0 left-[40%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.2s_ease-out_0.65s]">💵</span>
                <span className="absolute top-0 left-[50%] text-9xl opacity-0 group-hover:animate-[confetti-5_2.1s_ease-out_0.7s]">💵</span>
                <span className="absolute top-0 left-[60%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.3s_ease-out_0.75s]">💵</span>
                <span className="absolute top-0 left-[70%] text-7xl opacity-0 group-hover:animate-[confetti-4_2s_ease-out_0.8s]">💵</span>
                <span className="absolute top-0 left-[80%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.85s]">💵</span>
                <span className="absolute top-0 left-[90%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.9s]">💵</span>
                <span className="absolute top-0 left-[12%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.95s]">💵</span>
              </div>
              <div className="bg-white rounded-2xl p-6 mb-6 min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-500 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                <div className="relative w-full space-y-3">
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border-2 border-black shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-black font-medium">VIP At-Risk</span>
                      <span className="text-xs font-bold text-black">2,847 profiles</span>
                    </div>
                    <div className="text-sm font-semibold text-black">LTV &gt; $5k, no purchase 60d</div>
                  </div>
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border-2 border-dashed border-black">
                    <div className="text-xs text-black mb-1">Suggested action</div>
                    <div className="text-sm font-semibold text-black">Exclusive 20% VIP comeback</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    Hidden gem
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-black">VIP Reactivation</h3>
              <p className="text-sm text-gray-700">
                Target high-value customers before they churn with AI-powered win-back campaigns.
              </p>
            </div>

            {/* Card 2 - Browse Abandoners */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-black hover:border-orange-600 hover:shadow-2xl hover:shadow-orange-600/30 transition-all duration-500 hover:scale-[1.02] relative overflow-visible">
              {/* EXPLOSIVE Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none z-50">
                <span className="absolute top-0 left-[5%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out]">💵</span>
                <span className="absolute top-0 left-[15%] text-7xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.05s]">💵</span>
                <span className="absolute top-0 left-[25%] text-9xl opacity-0 group-hover:animate-[confetti-3_2.1s_ease-out_0.1s]">💵</span>
                <span className="absolute top-0 left-[35%] text-8xl opacity-0 group-hover:animate-[confetti-4_2.3s_ease-out_0.15s]">💵</span>
                <span className="absolute top-0 left-[45%] text-7xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.2s]">💵</span>
                <span className="absolute top-0 left-[55%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.25s]">💵</span>
                <span className="absolute top-0 left-[65%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.3s]">💵</span>
                <span className="absolute top-0 left-[75%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.35s]">💵</span>
                <span className="absolute top-0 left-[85%] text-9xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.4s]">💵</span>
                <span className="absolute top-0 left-[95%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.45s]">💵</span>
                <span className="absolute top-0 left-[10%] text-7xl opacity-0 group-hover:animate-[confetti-4_2.1s_ease-out_0.5s]">💵</span>
                <span className="absolute top-0 left-[20%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.3s_ease-out_0.55s]">💵</span>
                <span className="absolute top-0 left-[30%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out_0.6s]">💵</span>
                <span className="absolute top-0 left-[40%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.2s_ease-out_0.65s]">💵</span>
                <span className="absolute top-0 left-[50%] text-9xl opacity-0 group-hover:animate-[confetti-5_2.1s_ease-out_0.7s]">💵</span>
                <span className="absolute top-0 left-[60%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.3s_ease-out_0.75s]">💵</span>
                <span className="absolute top-0 left-[70%] text-7xl opacity-0 group-hover:animate-[confetti-4_2s_ease-out_0.8s]">💵</span>
                <span className="absolute top-0 left-[80%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.85s]">💵</span>
                <span className="absolute top-0 left-[90%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.9s]">💵</span>
                <span className="absolute top-0 left-[12%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.95s]">💵</span>
              </div>
              <div className="bg-white rounded-2xl p-6 mb-6 min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-600 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-red-50 transition-all duration-500">
                <div className="relative w-full space-y-3">
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border-2 border-black shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-black font-medium">Intent Buyers</span>
                      <span className="text-xs font-bold text-black">12,493 profiles</span>
                    </div>
                    <div className="text-sm font-semibold text-black">3+ views, $0 cart, 7d</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 border-2 border-black">
                      <div className="text-xs font-bold text-black">42%</div>
                      <div className="text-[10px] text-gray-700">Conversion rate</div>
                    </div>
                    <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 border-2 border-black">
                      <div className="text-xs font-bold text-black">$127</div>
                      <div className="text-[10px] text-gray-700">Avg order</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Top performer
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-black">Browse Abandoners</h3>
              <p className="text-sm text-gray-700">
                Convert window shoppers into buyers with behavior-triggered nudges and social proof.
              </p>
            </div>

            {/* Card 3 - Category Champions */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-black hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] relative overflow-visible">
              {/* EXPLOSIVE Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none z-50">
                <span className="absolute top-0 left-[5%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out]">💵</span>
                <span className="absolute top-0 left-[15%] text-7xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.05s]">💵</span>
                <span className="absolute top-0 left-[25%] text-9xl opacity-0 group-hover:animate-[confetti-3_2.1s_ease-out_0.1s]">💵</span>
                <span className="absolute top-0 left-[35%] text-8xl opacity-0 group-hover:animate-[confetti-4_2.3s_ease-out_0.15s]">💵</span>
                <span className="absolute top-0 left-[45%] text-7xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.2s]">💵</span>
                <span className="absolute top-0 left-[55%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.25s]">💵</span>
                <span className="absolute top-0 left-[65%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.3s]">💵</span>
                <span className="absolute top-0 left-[75%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.35s]">💵</span>
                <span className="absolute top-0 left-[85%] text-9xl opacity-0 group-hover:animate-[confetti-5_2s_ease-out_0.4s]">💵</span>
                <span className="absolute top-0 left-[95%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.2s_ease-out_0.45s]">💵</span>
                <span className="absolute top-0 left-[10%] text-7xl opacity-0 group-hover:animate-[confetti-4_2.1s_ease-out_0.5s]">💵</span>
                <span className="absolute top-0 left-[20%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.3s_ease-out_0.55s]">💵</span>
                <span className="absolute top-0 left-[30%] text-8xl opacity-0 group-hover:animate-[confetti-1_2s_ease-out_0.6s]">💵</span>
                <span className="absolute top-0 left-[40%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.2s_ease-out_0.65s]">💵</span>
                <span className="absolute top-0 left-[50%] text-9xl opacity-0 group-hover:animate-[confetti-5_2.1s_ease-out_0.7s]">💵</span>
                <span className="absolute top-0 left-[60%] text-8xl opacity-0 group-hover:animate-[confetti-2_2.3s_ease-out_0.75s]">💵</span>
                <span className="absolute top-0 left-[70%] text-7xl opacity-0 group-hover:animate-[confetti-4_2s_ease-out_0.8s]">💵</span>
                <span className="absolute top-0 left-[80%] text-9xl opacity-0 group-hover:animate-[confetti-6_2.2s_ease-out_0.85s]">💵</span>
                <span className="absolute top-0 left-[90%] text-8xl opacity-0 group-hover:animate-[confetti-1_2.1s_ease-out_0.9s]">💵</span>
                <span className="absolute top-0 left-[12%] text-7xl opacity-0 group-hover:animate-[confetti-3_2.3s_ease-out_0.95s]">💵</span>
              </div>
              <div className="bg-white rounded-2xl p-6 mb-6 min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-500 group-hover:bg-gradient-to-br group-hover:from-yellow-50 group-hover:to-orange-50 transition-all duration-500">
                <div className="relative w-full space-y-3">
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border-2 border-black shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-black font-medium">Skincare Enthusiasts</span>
                      <span className="text-xs font-bold text-black">8,234 profiles</span>
                    </div>
                    <div className="text-sm font-semibold text-black">70%+ orders in category</div>
                  </div>
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border-2 border-dashed border-black">
                    <div className="text-xs text-black mb-1">Cross-sell opportunity</div>
                    <div className="text-sm font-semibold text-black">New arrivals + bundles</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    High intent
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-black">Category Champions</h3>
              <p className="text-sm text-gray-700">
                Identify category lovers and cross-sell with laser precision based on purchase patterns.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-12 py-6 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-3">
              <span>Unlock All 70 Segments</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Elegant Divider */}
      <div className="relative py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-4">
            {/* Left Line */}
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border to-border" />
            
            {/* Center Ornament */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            
            {/* Right Line */}
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-border to-border" />
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <section className="py-20 px-6 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Success Stories that <span className="text-[#ff6b6b] font-bold">INSPIRE</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how brands and agencies achieve results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FlipTestimonialCard name="Sophia" role="Marketing Lead" company="Trendify" story="Sophia, the marketing lead at Trendify, used AI-driven analytics to dive deep into customer behavior. The insights led to a 40% increase in engagement and a 50% rise in repeat purchases, creating long-term customer relationships." metrics={[{
            label: "gain in retention",
            value: "40%"
          }, {
            label: "surge in profits",
            value: "50%"
          }]} delay="0s" />

            <FlipTestimonialCard name="Marcus" role="Head of Growth" company="Premium Beauty Co." story="Marcus deployed 70 segments in under a minute using Aderai. Email revenue jumped 42% in the first month as personalized campaigns reached the right customers at the right time, transforming their email strategy." metrics={[{
            label: "email revenue increase",
            value: "+42%"
          }, {
            label: "deployment time",
            value: "60 sec"
          }]} delay="0.1s" />

            <FlipTestimonialCard name="Sarah" role="Founder" company="Growth Labs Agency" story="What used to take Sarah's team 2 weeks now takes 30 seconds. This game-changing efficiency allowed her agency to serve 5x more clients while maintaining quality, leading to $200K+ in additional annual revenue." metrics={[{
            label: "time saved",
            value: "99%"
          }, {
            label: "revenue increase",
            value: "+$200K"
          }]} delay="0.2s" />
          </div>

          <div className="mt-16 text-center">
            <PoweredByBadge />
          </div>
        </div>
      </section>

        {/* Value Calculator Section */}
        <ValueCalculator />

        {/* Comparison Chart Section */}
        <ComparisonChart />

        {/* Revenue Testimonials Section */}
        <RevenueTestimonials />

        {/* Features Section */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/20 mb-8">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-base font-bold text-primary uppercase tracking-wide">
                  Built for E-commerce
                </span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Built for Klaviyo brands.<br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Optimized for growth.
                </span>
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-4">Dynamic Segments</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create once, auto-update forever. Segments sync with your <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.85em] inline-block align-text-bottom mx-0.5" loading="lazy" /> data in real-time.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-4">Performance Analytics</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor segment health, track metrics, and optimize campaigns with built-in analytics.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <MousePointerClick className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-4">One-Click Deploy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select segments, customize thresholds, deploy. All 70 segments created instantly in Klaviyo.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <PoweredByBadge />
            </div>
          </div>
        </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-gradient-to-br from-muted via-background to-muted overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Stats Bar - Unique Element */}
          <div className="py-12 border-b border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  10,000+
                </div>
                <div className="text-sm text-muted-foreground">Happy Brands</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  70+
                </div>
                <div className="text-sm text-muted-foreground">Pre-built Segments</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  99%
                </div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  4.8★
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  Rating on 
                  <svg className="h-4 w-auto" viewBox="0 0 64 64" fill="currentColor">
                    <path d="M32 0C14.3 0 0 14.3 0 32s14.3 32 32 32 32-14.3 32-32S49.7 0 32 0zm0 58C17.6 58 6 46.4 6 32S17.6 6 32 6s26 11.6 26 26-11.6 26-26 26z"/>
                    <path d="M44.6 25.3c-.2-.5-.7-.9-1.2-1l-8.5-1.2-3.8-7.7c-.4-.9-1.8-.9-2.2 0l-3.8 7.7-8.5 1.2c-.6.1-1 .5-1.2 1-.2.5-.1 1.1.3 1.5l6.2 6-1.5 8.4c-.1.6.1 1.1.6 1.5.5.3 1.1.4 1.6.1l7.6-4 7.6 4c.2.1.5.2.7.2.3 0 .6-.1.9-.3.5-.3.7-.9.6-1.5l-1.5-8.4 6.2-6c.4-.4.5-1 .3-1.5z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section - Unique Element */}
          <div className="py-16 border-b border-border/50">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Stay Updated
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Get segmentation tips & updates
              </h3>
              <p className="text-muted-foreground mb-6">
                Join 10,000+ marketers getting weekly insights on 
                <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.9em] inline-block align-text-bottom mx-1" loading="lazy" /> 
                segmentation
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="py-12">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              {/* Brand Column - Larger */}
              <div className="md:col-span-2">
                <div className="text-3xl font-playfair font-bold mb-4">
                  aderai<span className="text-accent">.</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex flex-col items-start gap-1">
                  <span>AI-powered segmentation</span>
                  <span className="flex items-center gap-1">
                    for <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.9em] inline-block align-text-bottom" loading="lazy" />
                  </span>
                </p>
              </div>

              {/* Links Columns */}
              <div>
                <h4 className="font-bold mb-4 text-sm">Product</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Features</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>How it Works</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-sm">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>About</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Contact</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Careers</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-sm">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Privacy</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Terms</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      <span>Security</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                © 2025 Aderai. All rights reserved.
              </div>
              <PoweredByBadge />
            </div>
          </div>
        </div>
      </footer>

      <TimeBasedPopup onGetStarted={handleGetStarted} />
    </div>;
}