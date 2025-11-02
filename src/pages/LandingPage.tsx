import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Zap, Clock, MousePointerClick } from "lucide-react";
import { TornPaperDivider } from "@/components/TornPaperDivider";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { TrustLogos } from "@/components/TrustLogos";
import { TestimonialCard } from "@/components/TestimonialCard";
import { AnimatedSegmentVisual } from "@/components/AnimatedSegmentVisual";
import { AnimatedUnderline } from "@/components/AnimatedUnderline";
import { CircleDoodle } from "@/components/CircleDoodle";
import { ArrowDoodle } from "@/components/ArrowDoodle";

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            ADERAI<span className="text-accent">.</span>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#how-it-works" className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium">
              How it works
            </a>
            <a href="#pricing" className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium">
              Log in
            </a>
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-base font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 via-background to-primary/5"></div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full">
          {/* Top Badge */}
          <div className="mb-12 flex justify-center animate-fade-in">
            <div className="relative">
              <PoweredByBadge />
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-accent rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
              <span className="block mb-4">Segment like a</span>
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-primary animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
                  $50M brand
                </span>
                <CircleDoodle delay="1.2s">
                  <span className="invisible">$50M brand</span>
                </CircleDoodle>
              </span>
            </h1>
            
            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 mb-10 flex-wrap animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">
                  <AnimatedUnderline delay="1.4s">70 segments</AnimatedUnderline>
                </span>
              </div>
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">
                  <AnimatedUnderline delay="1.6s">30 seconds</AnimatedUnderline>
                </span>
              </div>
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border">
                <MousePointerClick className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">One-click deploy</span>
              </div>
            </div>
            
            <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-medium animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
              What takes <strong className="text-foreground">10+ hours</strong> manually, done <strong className="text-accent">instantly</strong> with enterprise-level precision
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
              <button
                onClick={handleGetStarted}
                className="group bg-accent text-accent-foreground px-12 py-6 rounded-full text-xl font-bold hover:bg-accent/90 transition-all duration-300 shadow-2xl hover:shadow-accent/50 hover:scale-110 flex items-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">Get started for $49</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </button>
              <button className="bg-transparent border-3 border-foreground text-foreground px-12 py-6 rounded-full text-xl font-bold hover:bg-foreground hover:text-background transition-all duration-300 shadow-lg">
                Watch demo
              </button>
            </div>
          </div>

          {/* Before/After Comparison - Redesigned */}
          <div className="max-w-6xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}>
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-muted-foreground/50 to-accent z-0">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full"></div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8">
                {/* Before Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition"></div>
                  <div className="relative bg-card rounded-3xl p-10 border-2 border-border">
                    <div className="absolute -top-6 left-8 bg-muted-foreground text-background px-6 py-2 rounded-full text-sm font-bold uppercase">
                      Old way
                    </div>
                    <Clock className="w-14 h-14 text-muted-foreground/50 mb-6 mt-4" />
                    <div className="text-7xl font-black mb-4 text-muted-foreground">10+</div>
                    <div className="text-2xl font-bold mb-4">hours wasted</div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Manually building Boolean logic, testing conditions, debugging errors across 70 segments
                    </p>
                    <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 bg-destructive rounded-full"></span>
                      Frustrating & time-consuming
                    </div>
                  </div>
                </div>

                {/* After Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent/50 rounded-3xl blur opacity-50 group-hover:opacity-75 transition"></div>
                  <div className="relative bg-card rounded-3xl p-10 border-2 border-accent shadow-2xl shadow-accent/20">
                    <div className="absolute -top-6 left-8 bg-accent text-accent-foreground px-6 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      New way
                    </div>
                    <MousePointerClick className="w-14 h-14 text-accent mb-6 mt-4" />
                    <div className="text-7xl font-black mb-4 text-accent relative inline-block">
                      <CircleDoodle delay="2s">30s</CircleDoodle>
                    </div>
                    <div className="text-2xl font-bold mb-4">One-click magic</div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Select, customize, deploy. All 70 segments auto-created with perfect logic and tested accuracy
                    </p>
                    <div className="mt-6 pt-6 border-t border-accent/20 flex items-center gap-2 text-sm text-accent font-semibold">
                      <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                      Instant & effortless
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: "1.3s", animationFillMode: "forwards" }}>
            <AnimatedSegmentVisual />
          </div>
          
          {/* Trust Logos */}
          <div className="pt-12 animate-fade-in" style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}>
            <TrustLogos />
          </div>
        </div>
      </section>

      {/* Torn Paper Divider */}
      <TornPaperDivider className="text-muted" />

      {/* The Problem */}
      <section className="py-32 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              Most brands leave{" "}
              <span className="inline-block">
                <CircleDoodle delay="0.3s"><span className="text-accent">40%</span></CircleDoodle>
              </span>{" "}
              of email<br className="hidden md:block" /> revenue on the table
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              While top brands deploy <AnimatedUnderline delay="0.5s">70 segments</AnimatedUnderline>, you&apos;re stuck with 5 basic ones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-card rounded-2xl p-10 shadow-md border-2 border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300">
              <div className="text-6xl font-bold text-accent mb-6">10-15h</div>
              <h3 className="text-2xl font-bold mb-4">Takes forever</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Creating 70 segments manually. Most brands give up after 5-10.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-10 shadow-md border-2 border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300">
              <div className="text-6xl font-bold text-accent mb-6">$5-15K</div>
              <h3 className="text-2xl font-bold mb-4">Agency costs</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Expensive setup fees. You don't own the methodology.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-10 shadow-md border-2 border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300">
              <div className="text-6xl font-bold text-accent mb-6">40%</div>
              <h3 className="text-2xl font-bold mb-4">Revenue lost</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Without proper segmentation, you miss high-value opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-background flip" />

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Deploy in <span className="inline-block"><CircleDoodle delay="0.2s">4 steps</CircleDoodle></span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              From signup to live segments in <AnimatedUnderline delay="0.4s">under 3 minutes</AnimatedUnderline>
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                step: "01",
                title: "Connect Klaviyo",
                description: "Add your Klaviyo API key. Instant validation. Secure connection.",
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
                description: "One click. All segments created in Klaviyo. Ready to use in campaigns.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-12 items-start group">
                <div className="text-7xl font-bold text-muted-foreground/10 group-hover:text-accent/30 transition-colors duration-300 flex-shrink-0">{item.step}</div>
                <div className="flex-1 pt-4">
                  <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-10 py-5 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center gap-3"
            >
              Start now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-muted" />

      {/* Features */}
      <section className="py-32 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Everything you need</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">70 proven segments</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                VIP customers, at-risk buyers, cart abandoners. Every segment drives revenue.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI suggester</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Describe your goal. Get custom segments specifically for your brand.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time analytics</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Track segment performance. Monitor growth. Export reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-background flip" />

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">Loved by brands & agencies</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Real results from real customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            <TestimonialCard
              quote="Deployed 70 segments in under a minute. Email revenue jumped 42% in the first month."
              author="Marcus Rodriguez"
              role="Head of Growth"
              company="Premium Beauty Co."
              metric="+42%"
            />
            <TestimonialCard
              quote="What used to take my team 2 weeks now takes 30 seconds. This is a game-changer for our agency."
              author="Sarah Chen"
              role="Founder"
              company="Growth Labs Agency"
              metric="2 weeks → 30s"
            />
            <TestimonialCard
              quote="The AI suggester is incredible. It recommended segments I never would have thought of."
              author="James Wilson"
              role="Marketing Director"
              company="Luxe Lifestyle"
              metric="+$87K"
            />
          </div>
          
          <div className="text-center pt-8">
            <PoweredByBadge />
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-muted" />

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">Simple pricing</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              <AnimatedUnderline delay="0.2s">Pay once</AnimatedUnderline>. Use forever. <strong className="text-foreground">100% money-back guarantee.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="bg-card rounded-2xl border-2 border-accent p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden transform hover:scale-105">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-6 py-2 text-xs font-bold rounded-bl-2xl">
                MOST POPULAR
              </div>
              <div className="text-center mb-8 mt-8">
                <h3 className="text-3xl font-bold mb-4">Brand</h3>
                <div className="mb-6">
                  <span className="text-6xl font-bold">$49</span>
                  <span className="text-muted-foreground text-lg">/one-time</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base">70 segments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base">AI suggester</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base">Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base">1 Klaviyo account</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-accent text-accent-foreground py-4 rounded-full font-bold text-lg hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get started
              </button>
            </div>

            {/* Agency */}
            <div className="bg-card rounded-2xl border-2 border-border p-10 hover:border-accent/30 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Agency</h3>
                <div className="mb-6">
                  <span className="text-6xl font-bold">$89</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">Everything in Brand</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">2 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">Client switching</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-4 rounded-full font-bold text-lg hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Get started
              </button>
            </div>

            {/* Agency Pro */}
            <div className="bg-card rounded-2xl border-2 border-border p-10 hover:border-accent/30 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Agency Pro</h3>
                <div className="mb-6">
                  <span className="text-6xl font-bold">$199</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">Everything in Agency</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">5 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-4 rounded-full font-bold text-lg hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Get started
              </button>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <PoweredByBadge />
          </div>
        </div>
      </section>
      
      <TornPaperDivider className="text-background flip" />

      {/* Footer */}
      <footer className="border-t border-border py-20 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-3xl font-bold tracking-tight mb-6">
                ADERAI<span className="text-accent">.</span>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                AI-powered segmentation
                <br />
                for Klaviyo
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-base">Product</h4>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-base">Company</h4>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-base">Legal</h4>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between text-base text-muted-foreground gap-6">
            <div>© 2025 Aderai. All rights reserved.</div>
            <PoweredByBadge />
          </div>
        </div>
      </footer>
    </div>
  );
}
