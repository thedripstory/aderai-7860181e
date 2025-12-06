import React, { useState, useEffect, lazy, Suspense } from "react";
import { CheckCircle2, ArrowRight, Zap, Clock, MousePointerClick, Star, Sparkles, X, Wand2, BarChart3, HelpCircle } from "lucide-react";
import { TubelightNavbar } from "@/components/TubelightNavbar";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";
const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";
import { AnimatedSignUpCTA } from "@/components/AnimatedSignUpCTA";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { TrustLogos } from "@/components/TrustLogos";
import { FlipTestimonialCard } from "@/components/FlipTestimonialCard";
import { AnimatedUnderline } from "@/components/AnimatedUnderline";
import { CircleDoodle } from "@/components/CircleDoodle";
import { ArrowDoodle } from "@/components/ArrowDoodle";
import { AnimatedTimeCounter } from "@/components/AnimatedTimeCounter";
import { RevolvingTestimonials } from "@/components/RevolvingTestimonials";
import { TimeBasedPopup } from "@/components/TimeBasedPopup";
import { AderaiLogo } from "@/components/AderaiLogo";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Globe } from "@/components/ui/globe";
import { useNavigate } from "react-router-dom";
import { SectionPlaceholder } from "@/components/ui/SectionPlaceholder";

// Lazy load heavy components
const ComparisonChart = lazy(() => import('@/components/ComparisonChart').then(m => ({ default: m.ComparisonChart })));
const Testimonials3D = lazy(() => import('@/components/landing/Testimonials3D').then(m => ({ default: m.Testimonials3D })));
const SegmentFlowEffect = lazy(() => import('@/components/SegmentFlowEffect').then(m => ({ default: m.SegmentFlowEffect })));
const AnimatedSegmentVisual = lazy(() => import('@/components/AnimatedSegmentVisual').then(m => ({ default: m.AnimatedSegmentVisual })));
const AutomationFlow = lazy(() => import('@/components/AutomationFlow').then(m => ({ default: m.AutomationFlow })));
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const heroVariant = useABTest('hero-headline');
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleGetStarted = () => {
    trackABTestConversion('hero-headline');
    navigate("/signup");
  };

  const navItems = [
    { name: "How it works", url: "#how-it-works", icon: Wand2 },
  ];

  return <div className="min-h-screen bg-background overflow-x-hidden scroll-smooth">
      {/* Tubelight Navbar */}
      <TubelightNavbar items={navItems} />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between">
          {/* Logo */}
          <AderaiLogo href="/" size="lg" showKlaviyoBadge className="scale-90 sm:scale-100" />

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/help"
              className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </a>
            
            <button
              onClick={() => navigate("/login")}
              className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Log in
            </button>

            <button 
              onClick={handleGetStarted} 
              className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 sm:pt-32 md:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 overflow-visible gpu-accelerated">
        {/* Background Elements - optimized with reduced blur */}
        <div className="absolute inset-0 -z-10 contain-paint">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/8 rounded-full blur-2xl" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/8 rounded-full blur-2xl" style={{ transform: 'translateZ(0)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl" style={{ transform: 'translateZ(0)' }} />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Trust Indicators */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 text-sm">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-border shadow-sm">
              <div className="flex -space-x-2">
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/cm-round-min.png" alt="Customer logo" className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/kraus-round-min.png" alt="Customer logo" className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/tiger-marr-round-min.png" alt="Customer logo" className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 border-background" loading="lazy" />
                <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/uppl-logo-round-min.png" alt="Customer logo" className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 border-background" loading="lazy" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">Trusted by growing brands</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                Works directly with Klaviyo
              </span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-400 via-yellow-500 to-orange-600 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-orange-300/30 mb-6 sm:mb-8 animate-fade-in shadow-lg shadow-orange-500/20 hover:scale-110 hover:rotate-2 hover:shadow-2xl hover:shadow-orange-400/40 transition-all duration-300 cursor-pointer relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white relative z-10" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide relative z-10">
                Official Klaviyo Partner
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-12 tracking-tight leading-tight px-2">
              {heroVariant === 'A' ? (
                <>
                  <span className="block">70 Klaviyo Segments</span>
                  <span className="text-accent block my-1 sm:my-2 md:my-4">in 30 Seconds</span>
                </>
              ) : (
                <>
                  <span className="block">Segment like a</span>
                  <span className="text-accent block my-1 sm:my-2 md:my-4">$50M brand.</span>
                </>
              )}
            </h1>

            {heroVariant === 'A' ? (
              <p className="text-lg sm:text-2xl md:text-3xl text-foreground/80 mb-8 sm:mb-12 max-w-3xl mx-auto font-medium text-center px-2">
                Stop spending hours building segments manually. Deploy expert-grade segmentation straight into{" "}
                <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] sm:h-[0.9em] inline-block align-text-bottom ml-1" />
              </p>
            ) : (
              <div className="mb-8 sm:mb-12 max-w-3xl mx-auto px-2">
                <p className="text-lg sm:text-2xl md:text-3xl text-foreground/80 mb-3 sm:mb-4 font-medium text-center">
                  Instantly import 70+ segments, with one click- straight inside{" "}
                  <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] sm:h-[0.9em] inline-block align-text-bottom ml-1" />
                </p>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center">
                  Deploy expert-grade Klaviyo segmentation without the agency price tag.
                </p>
              </div>
            )}

            {/* CTA Button */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-8 sm:px-14 py-4 sm:py-6 rounded-full text-base sm:text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-2 sm:gap-3 hover:scale-105 hover:bg-primary/90">
                <span>Start building segments</span>
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Just $9/month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>70+ expert segments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Setup in under 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Interactive Comparison Cards */}
          <div className="relative max-w-5xl mx-auto mb-16 sm:mb-24">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Before Card */}
              <div className="group bg-gradient-to-br from-muted to-muted/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-border hover:border-border/50 transition-all hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-red-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-3 bg-background/50 rounded-xl border border-border">
                      <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground" />
                    </div>
                    <div className="px-2.5 sm:px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-bold rounded-full border border-red-500/20">
                      YOUR CURRENT WAY
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                    Manual Segmentation
                  </div>
                  <div className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 text-foreground">10+ hours</div>

                  <div className="space-y-2 sm:space-y-3">
                    {["Build 70 segments one by one", "Debug complex Boolean logic", "Test each segment manually", "Fix errors & edge cases"].map((item, i) => <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <X className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>)}
                  </div>
                </div>
              </div>

              {/* After Card */}
              <div className="group bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-primary hover:border-primary/80 transition-all hover:scale-[1.02] relative overflow-hidden shadow-xl hover:shadow-2xl gpu-accelerated">
                <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/10 rounded-full blur-xl contain-paint" style={{ transform: 'translateZ(0)' }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                    </div>
                    <div className="px-2.5 sm:px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold rounded-full border border-emerald-500/30">
                      NEW WAY
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-primary mb-2 font-bold uppercase tracking-wide">With Aderai</div>
                  <div className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
                    <CircleDoodle delay="1.5s">
                      <AnimatedTimeCounter />
                    </CircleDoodle>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {["Select from 70 pre-built segments", "Customize to your metrics", "One-click deploy to Klaviyo", "All segments auto-created"].map((item, i) => <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </div>)}
                  </div>
                </div>
              </div>

              {/* Arrow Connection */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-background border-2 border-primary rounded-full p-3 sm:p-4 shadow-xl">
                  <ArrowRight className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Revolving Testimonials */}
            <RevolvingTestimonials />
          </div>

          {/* Visual Demo */}
          <Suspense fallback={<SectionPlaceholder height="400px" />}>
            <AnimatedSegmentVisual />
          </Suspense>

          {/* CTA Button */}
          <div className="mt-12 sm:mt-20 text-center">
            <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-2 sm:gap-3">
              <span>Start Building Segments</span>
              <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl sm:rounded-2xl" />
            </button>
          </div>

          {/* Trust Logos */}
          <div className="mt-12 sm:mt-20 mb-0">
            <TrustLogos />
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-muted via-muted to-primary/5 relative z-0 overflow-hidden contain-layout gpu-accelerated">
        {/* Decorative Elements - static, no animations */}
        <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-xl contain-paint" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-xl contain-paint" style={{ transform: 'translateZ(0)' }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <ScrollReveal direction="left">
            <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                  <img src={klaviyoLogo} alt="Klaviyo" className="h-[1em] inline-block align-text-bottom" /> Official API Partner
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  Literal 1 click segmentation.
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  With official API integration, Aderai deploys high-impact audience segments directly into your{" "}
                  <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] sm:h-[0.9em] inline-block align-text-bottom mx-1" />
                  {" "}account, instantly.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Smart Triggers</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Automatically detect customer behaviors and segment in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Segment Score</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Monitor segment health with actionable performance indicators
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Instant Deployment</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.85em] inline-block align-text-bottom mx-1" loading="lazy" />
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={handleGetStarted} className="group px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center text-sm sm:text-base">
                Get Started
              </button>
            </div>
            </ScrollReveal>

            {/* Right Workflow Visual */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative mt-8 lg:mt-0">
                <Suspense fallback={<SectionPlaceholder height="400px" />}>
                  <AutomationFlow />
                </Suspense>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Discover Hidden Segments */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 bg-background contain-layout">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
                  Segment Discovery
                </span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-center px-2">
              Segments you didn't know existed
            </h2>

            <p className="text-base sm:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-3xl mx-auto px-2">
              Access expert-grade audience segments that top brands use to drive 40%+ revenue increases
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
            {/* Card 1 - VIP Reactivation */}
            <ScrollReveal delay={0}>
              <div className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] relative">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 min-h-[220px] sm:min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-500 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                  <div className="relative w-full space-y-2 sm:space-y-3">
                    <div className="bg-white backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border-2 border-black shadow-sm">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-black font-medium">VIP At-Risk</span>
                        <span className="text-[10px] sm:text-xs font-bold text-black">2,847 profiles</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-black">LTV &gt; $5k, no purchase 60d</div>
                    </div>
                    <div className="bg-white backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border-2 border-dashed border-black">
                      <div className="text-[10px] sm:text-xs text-black mb-1">Suggested action</div>
                      <div className="text-xs sm:text-sm font-semibold text-black">Exclusive 20% VIP comeback</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                      Hidden gem
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">VIP Reactivation</h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Target high-value customers before they churn with AI-powered win-back campaigns.
                </p>
              </div>
            </ScrollReveal>

            {/* Card 2 - Browse Abandoners */}
            <ScrollReveal delay={0.1}>
              <div className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] relative">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 min-h-[220px] sm:min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-500 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                  <div className="relative w-full space-y-2 sm:space-y-3">
                    <div className="bg-white backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border-2 border-black shadow-sm">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-black font-medium">Intent Buyers</span>
                        <span className="text-[10px] sm:text-xs font-bold text-black">12,493 profiles</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-black">3+ views, $0 cart, 7d</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 border-2 border-black">
                        <div className="text-[10px] sm:text-xs font-bold text-black">42%</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-700">Conversion rate</div>
                      </div>
                      <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 border-2 border-black">
                        <div className="text-[10px] sm:text-xs font-bold text-black">$127</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-700">Avg order</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      Top performer
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">Browse Abandoners</h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Convert window shoppers into buyers with behavior-triggered nudges and social proof.
                </p>
              </div>
            </ScrollReveal>

            {/* Card 3 - Category Champions */}
            <ScrollReveal delay={0.2}>
              <div className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] relative sm:col-span-2 md:col-span-1">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 min-h-[220px] sm:min-h-[280px] flex items-center justify-center relative overflow-hidden border-2 border-black group-hover:border-orange-500 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                  <div className="relative w-full space-y-2 sm:space-y-3">
                    <div className="bg-white backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border-2 border-black shadow-sm">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-black font-medium">Skincare Enthusiasts</span>
                        <span className="text-[10px] sm:text-xs font-bold text-black">8,234 profiles</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-black">70%+ orders in category</div>
                    </div>
                    <div className="bg-white backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border-2 border-dashed border-black">
                      <div className="text-[10px] sm:text-xs text-black mb-1">Cross-sell opportunity</div>
                      <div className="text-xs sm:text-sm font-semibold text-black">New arrivals + bundles</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      High intent
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">Category Champions</h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Identify category lovers and cross-sell with laser precision based on purchase patterns.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <button onClick={handleGetStarted} className="group relative bg-primary text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 rounded-full text-base sm:text-xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-2 sm:gap-3">
                <span>Unlock All 70 Segments</span>
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </ScrollReveal>
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
              <div className="relative flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
            
            {/* Right Line */}
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-border to-border" />
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden contain-layout gpu-accelerated">
        {/* Decorative Elements - static */}
        <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-xl contain-paint" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-xl contain-paint" style={{ transform: 'translateZ(0)' }} />

        <div className="max-w-7xl mx-auto relative">
          {/* Header Section */}
          <ScrollReveal>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 px-2">
                Success Stories that <span className="text-[#ff6b6b] font-bold">INSPIRE</span>
              </h2>

              <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
                Discover how brands and agencies achieve results.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <ScrollReveal delay={0}>
            <FlipTestimonialCard name="Sophia" role="Marketing Lead" company="Trendify" story="Sophia, the marketing lead at Trendify, used AI-driven analytics to dive deep into customer behavior. The insights led to a 40% increase in engagement and a 50% rise in repeat purchases, creating long-term customer relationships." metrics={[{
            label: "gain in retention",
            value: "40%"
          }, {
            label: "surge in profits",
            value: "50%"
          }]} delay="0s" />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
            <FlipTestimonialCard name="Marcus" role="Head of Growth" company="Premium Beauty Co." story="Marcus deployed 70 segments in under a minute using Aderai. Email revenue jumped 42% in the first month as personalized campaigns reached the right customers at the right time, transforming their email strategy." metrics={[{
            label: "email revenue increase",
            value: "+42%"
          }, {
            label: "deployment time",
            value: "60 sec"
          }]} delay="0.1s" />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
            <div className="sm:col-span-2 md:col-span-1">
            <FlipTestimonialCard name="Sarah" role="Founder" company="Growth Labs Agency" story="What used to take Sarah's team 2 weeks now takes 30 seconds. This game-changing efficiency allowed her agency to serve 5x more clients while maintaining quality, leading to $200K+ in additional annual revenue." metrics={[{
            label: "time saved",
            value: "99%"
          }, {
            label: "revenue increase",
            value: "+$200K"
          }]} delay="0.2s" />
            </div>
            </ScrollReveal>
          </div>

          <div className="mt-10 sm:mt-16 text-center">
            <PoweredByBadge />
          </div>
        </div>
      </section>

        {/* Comparison Chart Section */}
        <ScrollReveal>
          <Suspense fallback={<SectionPlaceholder height="500px" />}>
            <ComparisonChart />
          </Suspense>
        </ScrollReveal>


        {/* 3D Testimonials Wall */}
        <Suspense fallback={<SectionPlaceholder height="600px" />}>
          <Testimonials3D />
        </Suspense>

        {/* Live Aderai Users Globe Section */}
        <section className="py-20 px-4 bg-background relative overflow-hidden contain-layout gpu-accelerated">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                    Live Activity
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Trusted by Marketers <span className="text-primary">Everywhere</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Real brands. Real results. Deploying segments right now.
                </p>
              </div>
            </ScrollReveal>

            <div className="relative min-h-[550px] md:min-h-[700px]">
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden md:block" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(251, 100, 21, 0.3)" />
                    <stop offset="100%" stopColor="rgba(251, 100, 21, 0)" />
                  </linearGradient>
                  <linearGradient id="line-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(251, 100, 21, 0.3)" />
                    <stop offset="100%" stopColor="rgba(251, 100, 21, 0)" />
                  </linearGradient>
                </defs>
                {/* Top left card to center */}
                <path d="M 180 140 Q 350 200 400 300" stroke="url(#line-gradient-1)" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.5" />
                {/* Top right card to center */}
                <path d="M 620 160 Q 500 220 400 300" stroke="url(#line-gradient-2)" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.5" />
              </svg>
              
              {/* Floating Stat Cards - optimized with GPU acceleration */}
              <div className="absolute left-4 md:left-16 top-20 md:top-32 z-20 gpu-accelerated" style={{ animation: 'float 6s ease-in-out infinite' }}>
                <div className="bg-white/95 rounded-2xl p-4 shadow-xl border border-gray-200 relative">
                  <div className="text-2xl md:text-3xl font-bold text-black">{(2500 + Math.floor(Math.random() * 500)).toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-600">segments deployed today</div>
                  <div className="absolute -right-2 top-1/2 w-4 h-px bg-gradient-to-r from-primary/40 to-transparent hidden md:block" />
                </div>
              </div>
              
              <div className="absolute right-4 md:right-16 top-28 md:top-40 z-20 gpu-accelerated" style={{ animation: 'float 6s ease-in-out infinite 1s' }}>
                <div className="bg-white/95 rounded-2xl p-4 shadow-xl border border-gray-200 relative">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{42 + Math.floor(Math.random() * 15)}</div>
                  <div className="text-xs md:text-sm text-gray-600">countries active</div>
                  <div className="absolute -left-2 top-1/2 w-4 h-px bg-gradient-to-l from-primary/40 to-transparent hidden md:block" />
                </div>
              </div>
              
              <div className="absolute left-8 md:left-24 bottom-16 md:bottom-24 z-20 gpu-accelerated" style={{ animation: 'float 6s ease-in-out infinite 2s' }}>
                <div className="bg-white/95 rounded-2xl p-4 shadow-xl border border-gray-200 relative">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">+{115 + Math.floor(Math.random() * 25)}%</div>
                  <div className="text-xs md:text-sm text-gray-600">avg. engagement lift</div>
                  <div className="absolute -right-2 top-1/2 w-4 h-px bg-gradient-to-r from-green-500/40 to-transparent hidden md:block" />
                </div>
              </div>
              
              <div className="absolute right-8 md:right-20 bottom-24 md:bottom-32 z-20 gpu-accelerated" style={{ animation: 'float 6s ease-in-out infinite 3s' }}>
                <div className="bg-white/95 rounded-2xl p-4 shadow-xl border border-gray-200 relative">
                  <div className="text-2xl md:text-3xl font-bold text-black">{(1.1 + Math.random() * 0.3).toFixed(1)}M+</div>
                  <div className="text-xs md:text-sm text-gray-600">profiles segmented</div>
                  <div className="absolute -left-2 top-1/2 w-4 h-px bg-gradient-to-l from-primary/40 to-transparent hidden md:block" />
                </div>
              </div>
              
              {/* Floating Globe with parallax */}
              <div className="relative w-full max-w-[650px] md:max-w-[750px] aspect-square mx-auto transform-gpu hover:scale-[1.02] transition-transform duration-700">
                <Globe className="inset-0 scale-100 md:scale-110" />
              </div>
              
              {/* Subtle glow underneath - optimized blur */}
              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-40 bg-gradient-to-t from-primary/15 to-transparent blur-2xl contain-paint" style={{ transform: 'translateZ(0)' }} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-20 px-4 bg-background contain-layout">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary/10 border-2 border-primary/20 mb-6 sm:mb-8">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base font-bold text-primary uppercase tracking-wide">
                  Built for E-commerce
                </span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-2">
                Built for Klaviyo brands.<br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Optimized for growth.
                </span>
              </h3>
            </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
              <ScrollReveal delay={0}>
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Zap className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Dynamic Segments</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Create once, auto-update forever. Segments sync with your <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.85em] inline-block align-text-bottom mx-0.5" loading="lazy" /> data in real-time.
                </p>
              </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Performance Analytics</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Monitor segment health, track metrics, and optimize campaigns with built-in analytics.
                </p>
              </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
              <div className="text-center sm:col-span-2 md:col-span-1">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <MousePointerClick className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">One-Click Deploy</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Select segments, customize thresholds, deploy. All 70 segments created instantly in Klaviyo.
                </p>
              </div>
              </ScrollReveal>
            </div>

            <div className="mt-10 sm:mt-16 text-center">
              <AnimatedSignUpCTA />
            </div>
          </div>
        </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-gradient-to-br from-muted via-background to-muted contain-layout">
        {/* Decorative Elements - moved inside with proper positioning */}
        <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-xl contain-paint -translate-x-1/4 -translate-y-1/4" style={{ transform: 'translateZ(0) translate(-25%, -25%)' }} />
        <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-xl contain-paint translate-x-1/4 translate-y-1/4" style={{ transform: 'translateZ(0) translate(25%, 25%)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Segment Flow Effect Section */}
          <Suspense fallback={<SectionPlaceholder height="50vh" />}>
            <SegmentFlowEffect />
          </Suspense>

          {/* Main Footer Content */}
          <div className="py-6 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Brand Column - Larger */}
              <div className="col-span-2">
                <div className="mb-3 sm:mb-4">
                  <AderaiLogo size="lg" showHoverEffect={false} className="scale-90 sm:scale-100" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 flex flex-col items-start gap-1">
                  <span>AI-powered segmentation</span>
                  <span className="flex items-center gap-1">
                    for <img src={klaviyoLogo} alt="Klaviyo logo" className="h-[0.9em] inline-block align-text-bottom" loading="lazy" />
                  </span>
                </p>
              </div>

              {/* Links Columns */}
              <div>
                <h4 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">Product</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li>
                    <a href="#how-it-works" className="hover:text-foreground transition-colors flex items-center gap-1 group w-fit">
                      How it Works
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
                    </a>
                  </li>
                  <li>
                    <a href="/help" className="hover:text-foreground transition-colors flex items-center gap-1 group w-fit">
                      Help Center
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">Resources</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li>
                    <a href="/help?category=getting-started" className="hover:text-foreground transition-colors flex items-center gap-1 group w-fit">
                      Getting Started
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
                    </a>
                  </li>
                  <li>
                    <a href="/help?category=ai-features" className="hover:text-foreground transition-colors flex items-center gap-1 group w-fit">
                      AI Features
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/50 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
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