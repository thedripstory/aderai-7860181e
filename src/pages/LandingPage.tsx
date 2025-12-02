import React, { useState, useEffect } from "react";
import { HelpCircle, Wand2 } from "lucide-react";
import { TubelightNavbar } from "@/components/TubelightNavbar";
import { useABTest, trackABTestConversion } from "@/hooks/useABTest";
import { TimeBasedPopup } from "@/components/TimeBasedPopup";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { AnimatedSegmentVisual } from "@/components/AnimatedSegmentVisual";
import { TrustLogos } from "@/components/TrustLogos";
import { RevenueTestimonials } from "@/components/RevenueTestimonials";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTA } from "@/components/landing/CTA";

/**
 * Landing page with A/B testing for hero variants
 * Composed of modular sections: Hero, Features, HowItWorks, SocialProof, CTA
 */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const heroVariant = useABTest('hero-headline');
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleGetStarted = () => {
    trackABTestConversion('hero-headline');
    navigate("/signup");
  };

  const navItems = [
    { name: "How it works", url: "#how-it-works", icon: Wand2 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
      <Hero variant={heroVariant} onGetStarted={handleGetStarted} />

      {/* Animated Segment Visual */}
      <div className="py-12">
        <AnimatedSegmentVisual />
      </div>

      {/* Trust Logos */}
      <div className="py-16">
        <TrustLogos />
      </div>

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Revenue Testimonials */}
      <div className="py-24">
        <RevenueTestimonials />
      </div>

      {/* Final CTA Section */}
      <CTA />

      {/* Powered By Badge */}
      <div className="py-8">
        <PoweredByBadge />
      </div>

      {/* Time-based Popup */}
      <TimeBasedPopup onGetStarted={handleGetStarted} />
    </div>
  );
}
