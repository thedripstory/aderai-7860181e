import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Gift, DollarSign, Users, TrendingUp, Copy, Star, Wand2, UserPlus } from "lucide-react";
import { TubelightNavbar } from "@/components/TubelightNavbar";
import { useNavigate } from "react-router-dom";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export default function AffiliatePage() {
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
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
    { name: "How it works", url: "/#how-it-works", icon: Wand2 },
    { name: "Pricing", url: "/#pricing", icon: DollarSign },
    { name: "Affiliate", url: "/affiliate", icon: UserPlus },
  ];

  const copyExampleLink = () => {
    navigator.clipboard.writeText("https://aderai.com?ref=YOURCODE");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Tubelight Navbar */}
      <TubelightNavbar items={navItems} />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="group flex items-center">
            <div className="text-4xl font-playfair font-bold tracking-tight hover:scale-105 transition-transform duration-300">
              aderai<span className="text-accent group-hover:animate-pulse">.</span>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-base text-muted-foreground hover:text-foreground transition-colors font-medium hidden sm:block">
              Log in
            </a>
            <button 
              onClick={handleGetStarted} 
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-base font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 overflow-visible">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-400 via-yellow-500 to-orange-600 backdrop-blur-sm px-5 py-2.5 rounded-full border border-orange-300/30 mb-8 animate-fade-in shadow-lg shadow-orange-500/20">
            <Gift className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">
              Partner Program
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight">
            Earn 30% recurring
            <br />
            <span className="text-accent">for life.</span>
          </h1>

          <p className="text-2xl md:text-3xl text-foreground/80 mb-4 max-w-3xl mx-auto font-medium">
            Help brands segment smarter with{" "}
            <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block align-text-bottom ml-1" />
            {" "}and earn commission every month.
          </p>

          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join top marketers, agencies, and creators earning passive income by recommending Aderai.
          </p>

          <div className="flex justify-center mb-8">
            <button 
              onClick={handleGetStarted} 
              className="group relative bg-primary text-primary-foreground px-14 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-3 hover:scale-105 hover:bg-primary/90"
            >
              <span>Join the Program</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>30% lifetime commission</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Monthly payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-muted via-muted to-primary/5 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              It's incredibly simple
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three steps to start earning passive income
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: Gift,
                title: "Sign up & get your link",
                description: "Create your free account and receive your unique affiliate tracking link instantly.",
                color: "primary"
              },
              {
                step: "2",
                icon: Users,
                title: "Share with your audience",
                description: "Recommend Aderai to brands, agencies, or anyone using Klaviyo for email marketing.",
                color: "accent"
              },
              {
                step: "3",
                icon: DollarSign,
                title: "Earn recurring revenue",
                description: "Get paid 30% commission every month, for every customer you refer - forever.",
                color: "orange-500"
              }
            ].map((item, i) => (
              <div key={i} className="group bg-card rounded-3xl p-8 border-2 border-border hover:border-primary transition-all hover:scale-105 relative overflow-hidden shadow-lg">
                <div className={`absolute top-0 right-0 w-40 h-40 bg-${item.color}/10 rounded-full blur-2xl`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-6`}>
                    <item.icon className={`w-6 h-6 text-${item.color}`} />
                  </div>
                  <div className="text-sm font-bold text-muted-foreground mb-2">STEP {item.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Details */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Lucrative commission structure
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Industry-leading payouts with no cap on earnings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-10 border-2 border-primary relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative">
                <TrendingUp className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-3xl font-bold mb-4">30% Recurring</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Earn 30% of every payment your referrals make - for as long as they remain customers.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">Lifetime recurring commission</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">No commission caps or limits</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">Earn from all customer tiers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-10 border-2 border-border relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
              <div className="relative">
                <DollarSign className="w-12 h-12 text-accent mb-6" />
                <h3 className="text-3xl font-bold mb-4">Example Earnings</h3>
                <div className="space-y-4">
                  <div className="bg-muted rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-1">5 brands at $99/mo each</div>
                    <div className="text-2xl font-bold text-primary">$148.50/month</div>
                    <div className="text-xs text-muted-foreground mt-1">$1,782/year passive income</div>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-1">20 brands at $99/mo each</div>
                    <div className="text-2xl font-bold text-primary">$594/month</div>
                    <div className="text-xs text-muted-foreground mt-1">$7,128/year passive income</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">50 brands at $99/mo each</div>
                    <div className="text-2xl font-bold text-primary">$1,485/month</div>
                    <div className="text-xs text-muted-foreground mt-1">$17,820/year passive income</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Link Preview */}
          <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Your Unique Tracking Link</h3>
                <p className="text-muted-foreground text-sm">
                  Share this link anywhere - social media, email, your website, or in conversations.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
              <code className="flex-1 text-sm font-mono">https://aderai.com?ref=YOURCODE</code>
              <button
                onClick={copyExampleLink}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Join */}
      <section className="py-20 px-6 bg-gradient-to-br from-muted via-muted to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Perfect for
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Marketing Agencies",
                description: "Recommend to your DTC clients who use Klaviyo and earn recurring revenue from every account."
              },
              {
                icon: TrendingUp,
                title: "Marketing Consultants",
                description: "Add value to your consulting packages and create an additional passive income stream."
              },
              {
                icon: Star,
                title: "Content Creators",
                description: "Share with your audience of ecommerce brands and earn commission on every signup."
              }
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 border border-border hover:border-primary transition-all hover:scale-105 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to start earning?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join hundreds of partners already earning passive income with Aderai
          </p>
          
          <button 
            onClick={handleGetStarted} 
            className="group relative bg-primary text-primary-foreground px-14 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 inline-flex items-center gap-3 hover:scale-105 hover:bg-primary/90"
          >
            <span>Join the Affiliate Program</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Start earning today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <a href="/" className="inline-block">
              <div className="text-4xl font-playfair font-bold mb-2">
                aderai<span className="text-accent">.</span>
              </div>
            </a>
            <p className="text-sm text-muted-foreground">
              AI-powered segmentation for Klaviyo
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground transition">
              Home
            </a>
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              How it works
            </a>
            <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="/affiliate" className="text-muted-foreground hover:text-foreground transition">
              Become an Affiliate
            </a>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Aderai. Powered by Klaviyo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
