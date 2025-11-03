import React, { useState, useEffect } from "react";
import { CheckCircle, CheckCircle2, ArrowRight, Zap, Clock, MousePointerClick, Star, Sparkles, X } from "lucide-react";
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
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleGetStarted = () => {
    window.location.href = "/signup";
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-playfair font-bold">
            aderai<span className="text-accent">.</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition font-medium"
            >
              How it works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition font-medium">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition font-medium">
              Log in
            </a>
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 px-6 overflow-visible">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{
              animationDelay: "1s",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
                  />
                ))}
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
                Works directly with <img src={klaviyoLogo} alt="Klaviyo" className="h-[1em] inline-block align-text-bottom" />
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
              Segment like a<br />
              <span className="text-accent block my-4">$50M brand.</span>
            </h1>

            <p className="text-2xl md:text-3xl text-foreground/80 mb-4 max-w-3xl mx-auto font-medium text-center">
              Instantly Create 70+ segments, with one click- straight inside{" "}
              <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom ml-1" />
            </p>

            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Deploy expert-grade Klaviyo segmentation without the agency price tag.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleGetStarted}
                className="group relative bg-primary text-primary-foreground px-14 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-3 hover:scale-105 hover:bg-primary/90"
              >
                <span>Start building segments</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Pricing & Trust */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>One-time cost</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No monthly fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Instant access</span>
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
                    {[
                      "Build 70 segments one by one",
                      "Debug complex Boolean logic",
                      "Test each segment manually",
                      "Fix errors & edge cases",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
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
                    {[
                      "Select from 70 pre-built segments",
                      "Customize to your metrics",
                      "One-click deploy to Klaviyo",
                      "All segments auto-created",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </div>
                    ))}
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
            <button
              onClick={handleGetStarted}
              className="group relative bg-primary text-primary-foreground px-12 py-6 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-3"
            >
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
                      Push segments to <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] inline-block align-text-bottom mx-1" /> with one click - no manual work
                    </p>
                  </div>
                </div>
              </div>

              <button className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center">
                Unlock Forever
              </button>
            </div>

            {/* Right Workflow Visual */}
            <div className="relative">
              <AutomationFlow />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Deploy in <CircleDoodle delay="0.2s">4 steps</CircleDoodle>
            </h2>
            <p className="text-xl text-muted-foreground">
              From signup to live segments in <AnimatedUnderline delay="0.4s">under 3 minutes</AnimatedUnderline>
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: (
                  <span className="flex items-center gap-2">
                    Connect <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom" />
                  </span>
                ),
                description: (
                  <span>
                    Add your <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] inline-block align-text-bottom mx-1" /> API key. Instant validation. Secure connection.
                  </span>
                ),
              },
              {
                step: "02",
                title: "Choose your segments",
                description: "Browse 70 pre-built segments organized by strategy. Or use AI to suggest custom ones.",
              },
              {
                step: "03",
                title: "Customize metrics",
                description: "Enter your AOV, currency, lifecycle thresholds. Segments auto-adjust to your business.",
              },
              {
                step: "04",
                title: "Deploy instantly",
                description: (
                  <span>
                    One click. All segments created in <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.85em] inline-block align-text-bottom mx-1" />. Ready to use in campaigns.
                  </span>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-8 items-start">
                <div className="text-6xl font-bold text-muted-foreground/20 flex-shrink-0">{item.step}</div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-lg text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground px-14 py-7 rounded-2xl text-xl font-bold shadow-2xl inline-flex items-center gap-4 overflow-hidden transition-all duration-500 hover:bg-[position:100%_0] hover:scale-110 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-rotate-1 active:scale-105"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

              <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">
                Get My Segments Now - $49
              </span>
              <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300" />

              {/* Corner sparkles */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
              <div
                className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                style={{ animationDelay: "0.2s" }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Zap className="w-8 h-8 mb-4 text-accent" />
              <h3 className="text-xl font-bold mb-3">70 proven segments</h3>
              <p className="text-muted-foreground">
                VIP customers, at-risk buyers, cart abandoners. Every segment drives revenue.
              </p>
            </div>
            <div>
              <Zap className="w-8 h-8 mb-4 text-accent" />
              <h3 className="text-xl font-bold mb-3">AI suggester</h3>
              <p className="text-muted-foreground">
                Describe your goal. Get custom segments specifically for your brand.
              </p>
            </div>
            <div>
              <Zap className="w-8 h-8 mb-4 text-accent" />
              <h3 className="text-xl font-bold mb-3">Real-time analytics</h3>
              <p className="text-muted-foreground">Track segment performance. Monitor growth. Export reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-6 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Our Clients</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Success Stories that <span className="italic text-primary">Inspire</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how brands and agencies achieve results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FlipTestimonialCard
              name="Sophia"
              role="Marketing Lead"
              company="Trendify"
              story="Sophia, the marketing lead at Trendify, used AI-driven analytics to dive deep into customer behavior. The insights led to a 40% increase in engagement and a 50% rise in repeat purchases, creating long-term customer relationships."
              metrics={[
                {
                  label: "gain in retention",
                  value: "40%",
                },
                {
                  label: "surge in profits",
                  value: "50%",
                },
              ]}
              delay="0s"
            />

            <FlipTestimonialCard
              name="Marcus"
              role="Head of Growth"
              company="Premium Beauty Co."
              story="Marcus deployed 70 segments in under a minute using Aderai. Email revenue jumped 42% in the first month as personalized campaigns reached the right customers at the right time, transforming their email strategy."
              metrics={[
                {
                  label: "email revenue increase",
                  value: "+42%",
                },
                {
                  label: "deployment time",
                  value: "60 sec",
                },
              ]}
              delay="0.1s"
            />

            <FlipTestimonialCard
              name="Sarah"
              role="Founder"
              company="Growth Labs Agency"
              story="What used to take Sarah's team 2 weeks now takes 30 seconds. This game-changing efficiency allowed her agency to serve 5x more clients while maintaining quality, leading to $200K+ in additional annual revenue."
              metrics={[
                {
                  label: "time saved",
                  value: "99%",
                },
                {
                  label: "revenue increase",
                  value: "+$200K",
                },
              ]}
              delay="0.2s"
            />
          </div>

          <div className="mt-16 text-center">
            <PoweredByBadge />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple pricing</h2>
            <p className="text-xl text-muted-foreground">
              <AnimatedUnderline delay="0.2s">Pay once</AnimatedUnderline>. Use forever.{" "}
              <strong>100% money-back guarantee.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="bg-card rounded-lg border-2 border-primary p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-sm font-semibold text-primary mb-2">MOST POPULAR</div>
                <h3 className="text-2xl font-bold mb-2">Brand</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-muted-foreground">/one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">70 segments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">AI suggester</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm flex items-center gap-1">
                    1 <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom" /> account
                  </span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition"
              >
                Get started
              </button>
            </div>

            {/* Agency */}
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Agency</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">$89</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm flex items-center gap-1">
                    2 <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom" /> accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Client switching</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-3 rounded-full font-semibold hover:bg-foreground hover:text-background transition"
              >
                Get started
              </button>
            </div>

            {/* Agency Pro */}
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Agency Pro</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">$199</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Agency</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm flex items-center gap-1">
                    5 <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom" /> accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-3 rounded-full font-semibold hover:bg-foreground hover:text-background transition"
              >
                Get started
              </button>
            </div>
          </div>

          <div className="mt-16 text-center">
            <PoweredByBadge />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-playfair font-bold mb-4">
                aderai<span className="text-accent">.</span>
              </div>
              <p className="text-sm text-muted-foreground flex flex-col items-start gap-1">
                <span>AI-powered segmentation</span>
                <span className="flex items-center gap-1">
                  for <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom" />
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
            <div>© 2025 Aderai. All rights reserved.</div>
            <PoweredByBadge />
          </div>
        </div>
      </footer>

      <TimeBasedPopup onGetStarted={handleGetStarted} />
    </div>
  );
}
