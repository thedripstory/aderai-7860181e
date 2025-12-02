import React from "react";
import { Users, Zap, TrendingUp, Target } from "lucide-react";

const statsData = [
  { icon: Users, label: "10,000+ brands using Aderai", value: "10K+" },
  { icon: Zap, label: "70+ segments available", value: "70+" },
  { icon: TrendingUp, label: "42% avg revenue increase", value: "42%" },
  { icon: Target, label: "99% time saved", value: "99%" },
  { icon: Users, label: "5000+ segments deployed daily", value: "5K+" },
  { icon: Zap, label: "60 second avg deployment", value: "60s" },
];

export const AnimatedStatsBar = () => {
  return (
    <div className="relative w-full overflow-hidden py-12 bg-gradient-to-r from-muted via-background to-muted">
      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Animated ticker */}
      <div className="flex animate-[slide-left_40s_linear_infinite] hover:[animation-play-state:paused]">
        {/* First set */}
        {statsData.map((stat, idx) => (
          <div
            key={`first-${idx}`}
            className="flex items-center gap-4 px-8 flex-shrink-0 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground whitespace-nowrap">{stat.label}</span>
            </div>
            <div className="w-px h-12 bg-border/50 ml-8" />
          </div>
        ))}
        
        {/* Duplicate set for seamless loop */}
        {statsData.map((stat, idx) => (
          <div
            key={`second-${idx}`}
            className="flex items-center gap-4 px-8 flex-shrink-0 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground whitespace-nowrap">{stat.label}</span>
            </div>
            <div className="w-px h-12 bg-border/50 ml-8" />
          </div>
        ))}
      </div>
      
      {/* Bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Gradient overlays on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
