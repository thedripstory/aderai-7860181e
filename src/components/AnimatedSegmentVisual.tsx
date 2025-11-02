import { useState, useEffect } from "react";
import { Sparkles, Crown, Heart, ShoppingBag, Zap, TrendingUp, Users, Target } from "lucide-react";

interface Feature {
  id: string;
  icon: any;
  category: string;
  title: string;
  description: string;
  gradient: string;
  stats?: {
    primary: string;
    secondary: string;
  };
}

const FEATURES: Feature[] = [
  {
    id: "1",
    icon: Crown,
    category: "Core Essentials",
    title: "VIP & Loyalty Segments",
    description: "Identify and nurture your most valuable customers with intelligent lifetime value tracking",
    gradient: "from-purple-600 via-pink-600 to-purple-700",
    stats: {
      primary: "Top 10% LTV",
      secondary: "Auto-updating"
    }
  },
  {
    id: "2",
    icon: Heart,
    category: "Engagement & Activity",
    title: "Behavioral Intelligence",
    description: "Track engagement patterns, email interactions, and site activity across your entire customer base",
    gradient: "from-blue-600 via-cyan-600 to-blue-700",
    stats: {
      primary: "Real-time sync",
      secondary: "30+ metrics"
    }
  },
  {
    id: "3",
    icon: ShoppingBag,
    category: "Shopping Behavior",
    title: "Purchase Insights",
    description: "Deep dive into shopping patterns, cart behavior, and product preferences to drive conversions",
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    stats: {
      primary: "15+ behaviors",
      secondary: "Live tracking"
    }
  },
  {
    id: "4",
    icon: Zap,
    category: "Value & Lifecycle",
    title: "Predictive Segments",
    description: "AI-powered predictions for churn risk, future VIPs, and lifecycle stage transitions",
    gradient: "from-orange-600 via-amber-600 to-orange-700",
    stats: {
      primary: "ML-powered",
      secondary: "Daily updates"
    }
  },
];

export const AnimatedSegmentVisual = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeFeature = FEATURES[activeIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto my-16">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-3xl" />
      
      <div className="relative">
        {/* Main Feature Display */}
        <div 
          className="relative bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${activeFeature.gradient} opacity-5 transition-all duration-700`} />
          
          {/* Content Grid */}
          <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
            {/* Left: Feature Info */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Category badge */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-0 animate-fade-in">
                <Sparkles className="w-3 h-3" />
                {activeFeature.category}
              </div>

              {/* Title with icon */}
              <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${activeFeature.gradient} shadow-lg`}>
                  <activeFeature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {activeFeature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                {activeFeature.description}
              </p>

              {/* Stats */}
              {activeFeature.stats && (
                <div className="flex items-center gap-6 pt-4 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeFeature.gradient}`} />
                    <span className="font-semibold">{activeFeature.stats.primary}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{activeFeature.stats.secondary}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Interactive Visualization */}
            <div className="flex items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              <div className="relative w-full aspect-square max-w-md">
                {/* Floating segments visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Center pulse */}
                  <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-br ${activeFeature.gradient} opacity-20 animate-pulse`} />
                  <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-br ${activeFeature.gradient} opacity-30`} />
                  
                  {/* Orbiting elements */}
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i * 60) + (activeIndex * 15);
                    const radius = 120;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    const icons = [Users, TrendingUp, Target, ShoppingBag, Crown, Heart];
                    const Icon = icons[i % icons.length];
                    
                    return (
                      <div
                        key={i}
                        className="absolute transition-all duration-1000 ease-out"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                          transitionDelay: `${i * 50}ms`
                        }}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeFeature.gradient} shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Feature Navigation */}
          <div className="relative px-8 lg:px-12 pb-8">
            <div className="flex items-center justify-center gap-3">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className="group relative"
                  aria-label={`View ${feature.title}`}
                >
                  {/* Progress bar for active item */}
                  {index === activeIndex && (
                    <div className="absolute -top-2 left-0 right-0 h-0.5 bg-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${feature.gradient} animate-[slide-in-right_4s_linear]`}
                      />
                    </div>
                  )}
                  
                  {/* Dot indicator */}
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? `bg-gradient-to-r ${feature.gradient} scale-125` 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`} />
                </button>
              ))}
            </div>

            {/* Feature counter */}
            <div className="text-center mt-4 text-xs text-muted-foreground font-medium">
              {activeIndex + 1} of {FEATURES.length}
            </div>
          </div>
        </div>

        {/* Capability tags */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            "70+ Segment Types",
            "Real-time Sync",
            "AI-Powered Insights",
            "Lifetime Value Tracking",
            "Behavioral Targeting"
          ].map((tag, i) => (
            <div
              key={tag}
              className="px-4 py-2 bg-muted/50 backdrop-blur-sm rounded-full text-sm text-muted-foreground border border-border/50 hover:border-primary/50 transition-colors opacity-0 animate-fade-in"
              style={{ animationDelay: `${400 + i * 50}ms`, animationFillMode: "forwards" }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
