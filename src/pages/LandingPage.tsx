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
      <section className="pt-40 pb-32 px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center animate-fade-in">
            <PoweredByBadge />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tight leading-[1.1] animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Segment like a<br />
            <span className="inline-block mt-2">
              <CircleDoodle delay="1s">
                <span className="text-accent">$50M brand</span>
              </CircleDoodle>
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <AnimatedUnderline delay="1.3s">70 segments</AnimatedUnderline> in 30 seconds. What takes <AnimatedUnderline delay="1.5s">10+ hours</AnimatedUnderline> manually, done <strong className="text-foreground">instantly</strong> with Aderai.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-10 py-5 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3"
            >
              Get started for $49
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-transparent border-2 border-foreground text-foreground px-10 py-5 rounded-full text-lg font-semibold hover:bg-foreground hover:text-background transition-all duration-300">
              See how it works
            </button>
          </div>

          {/* Time comparison */}
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-32 relative animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            <div className="bg-muted rounded-2xl p-10 text-left border-2 border-border hover:border-muted-foreground/20 transition-all duration-300 hover:shadow-lg">
              <Clock className="w-10 h-10 text-muted-foreground mb-6" />
              <div className="text-sm text-muted-foreground font-semibold mb-3 uppercase tracking-wide">Manual segmentation</div>
              <div className="text-5xl font-bold mb-4">10+ hours</div>
              <div className="text-base text-muted-foreground leading-relaxed">
                Building 70 segments manually in Klaviyo, debugging Boolean logic, testing each one.
              </div>
            </div>
            <div className="bg-card rounded-2xl p-10 text-left border-2 border-accent shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16"></div>
              <MousePointerClick className="w-10 h-10 text-accent mb-6 relative z-10" />
              <div className="text-sm text-accent font-bold mb-3 uppercase tracking-wide relative z-10">With Aderai</div>
              <div className="text-5xl font-bold mb-4 relative z-10 inline-block">
                <CircleDoodle delay="1.8s">30 seconds</CircleDoodle>
              </div>
              <div className="text-base text-muted-foreground leading-relaxed relative z-10">
                Select segments, customize to your metrics, deploy. All segments auto-created.
              </div>
            </div>
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <ArrowDoodle direction="right" />
            </div>
          </div>

          {/* Visual Demo */}
          <div className="mb-24">
            <AnimatedSegmentVisual />
          </div>
          
          <div className="pt-8">
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
