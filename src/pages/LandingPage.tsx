import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Zap, Clock, MousePointerClick } from "lucide-react";
import { TornPaperDivider } from "@/components/TornPaperDivider";

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
          scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            ADERAI<span className="text-accent">.</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition font-medium">
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
              className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Segment like a<br />
            <span className="text-accent">$50M brand.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            70 segments in 30 seconds. What takes 10+ hours manually, done instantly with Aderai.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-md text-base font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
            >
              Get started for $49
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-transparent border-2 border-foreground text-foreground px-8 py-4 rounded-md text-base font-semibold hover:bg-foreground hover:text-background transition">
              See how it works
            </button>
          </div>

          {/* Time comparison */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            <div className="bg-muted rounded-lg p-8 text-left border border-border">
              <Clock className="w-8 h-8 text-muted-foreground mb-4" />
              <div className="text-sm text-muted-foreground mb-2">Manual segmentation</div>
              <div className="text-4xl font-bold mb-3">10+ hours</div>
              <div className="text-sm text-muted-foreground">
                Building 70 segments manually in Klaviyo, debugging Boolean logic, testing each one.
              </div>
            </div>
            <div className="bg-card rounded-lg p-8 text-left border-2 border-accent shadow-md">
              <MousePointerClick className="w-8 h-8 text-accent mb-4" />
              <div className="text-sm text-accent font-semibold mb-2">With Aderai</div>
              <div className="text-4xl font-bold mb-3">30 seconds</div>
              <div className="text-sm text-muted-foreground">
                Select segments, customize to your metrics, deploy. All segments auto-created.
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl font-bold text-muted-foreground/20 mb-2">70</div>
                <p className="text-muted-foreground">Segment library preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Torn Paper Divider */}
      <TornPaperDivider className="text-muted" />

      {/* The Problem */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Most brands leave 40% of email revenue on the table
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              While top brands deploy 70 segments, you're stuck with 5 basic ones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="text-5xl font-bold text-accent mb-4">10-15h</div>
              <h3 className="text-xl font-bold mb-3">Takes forever</h3>
              <p className="text-muted-foreground">
                Creating 70 segments manually. Most brands give up after 5-10.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="text-5xl font-bold text-accent mb-4">$5-15K</div>
              <h3 className="text-xl font-bold mb-3">Agency costs</h3>
              <p className="text-muted-foreground">
                Expensive setup fees. You don't own the methodology.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="text-5xl font-bold text-accent mb-4">40%</div>
              <h3 className="text-xl font-bold mb-3">Revenue lost</h3>
              <p className="text-muted-foreground">
                Without proper segmentation, you miss high-value opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-background flip" />

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Deploy in 4 steps</h2>
            <p className="text-xl text-muted-foreground">From signup to live segments in under 3 minutes</p>
          </div>

          <div className="space-y-12">
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
              className="bg-primary text-primary-foreground px-8 py-4 rounded-md text-base font-semibold hover:bg-primary/90 transition shadow-sm inline-flex items-center gap-2"
            >
              Start now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-muted" />

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
              <p className="text-muted-foreground">
                Track segment performance. Monitor growth. Export reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider className="text-background flip" />

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple pricing</h2>
            <p className="text-xl text-muted-foreground">Pay once. Use forever. 100% money-back guarantee.</p>
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
                  <span className="text-sm">1 Klaviyo account</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition"
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
                  <span className="text-sm">2 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Client switching</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-3 rounded-md font-semibold hover:bg-foreground hover:text-background transition"
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
                  <span className="text-sm">5 Klaviyo accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-transparent border-2 border-foreground text-foreground py-3 rounded-md font-semibold hover:bg-foreground hover:text-background transition"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold tracking-tight mb-4">
                ADERAI<span className="text-accent">.</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered segmentation
                <br />
                for Klaviyo
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
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 Aderai. Powered by Klaviyo.
          </div>
        </div>
      </footer>
    </div>
  );
}
