import { useState } from "react";
import { TrendingUp, Users, DollarSign, Target, ChevronRight } from "lucide-react";

interface Segment {
  id: string;
  name: string;
  count: number;
  revenue: string;
  engagement: number;
  color: string;
  trend: "up" | "down";
  criteria: string;
}

const SEGMENTS: Segment[] = [
  {
    id: "1",
    name: "VIP Customers",
    count: 1247,
    revenue: "$124.5K",
    engagement: 89,
    color: "from-purple-500 to-pink-500",
    trend: "up",
    criteria: "LTV > $500 • Purchase frequency > 5/mo"
  },
  {
    id: "2",
    name: "At-Risk Buyers",
    count: 3891,
    revenue: "$67.2K",
    engagement: 34,
    color: "from-orange-500 to-red-500",
    trend: "down",
    criteria: "No purchase in 30 days • Previous regular buyer"
  },
  {
    id: "3",
    name: "High AOV Shoppers",
    count: 892,
    revenue: "$98.7K",
    engagement: 72,
    color: "from-blue-500 to-cyan-500",
    trend: "up",
    criteria: "AOV > $150 • Purchase in last 14 days"
  },
  {
    id: "4",
    name: "Cart Abandoners",
    count: 5234,
    revenue: "$45.1K",
    engagement: 28,
    color: "from-yellow-500 to-orange-500",
    trend: "up",
    criteria: "Cart value > $50 • Abandoned < 24hrs ago"
  },
];

export const AnimatedSegmentVisual = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto my-12">
      <div className="bg-gradient-to-br from-background via-muted/50 to-background rounded-2xl border-2 border-border/50 p-8 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-1">Active Segments</h3>
            <p className="text-sm text-muted-foreground">Live performance metrics • Updated in real-time</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Live</span>
          </div>
        </div>

        {/* Segments Grid */}
        <div className="grid gap-4">
          {SEGMENTS.map((segment, index) => {
            const isHovered = hoveredId === segment.id;
            const isSelected = selectedId === segment.id;
            
            return (
              <div
                key={segment.id}
                className="group relative cursor-pointer transition-all duration-300 opacity-0 animate-fade-in"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards"
                }}
                onMouseEnter={() => setHoveredId(segment.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(selectedId === segment.id ? null : segment.id)}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${segment.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                
                {/* Card content */}
                <div className={`relative bg-card border-2 rounded-xl p-5 transition-all duration-300 ${
                  isHovered || isSelected 
                    ? "border-primary shadow-lg scale-[1.02]" 
                    : "border-border hover:border-primary/50"
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Segment info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${segment.color}`} />
                        <h4 className="font-bold text-lg truncate">{segment.name}</h4>
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          segment.trend === "up" 
                            ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                          <TrendingUp className={`w-3 h-3 ${segment.trend === "down" ? "rotate-180" : ""}`} />
                          {segment.trend === "up" ? "+12%" : "-8%"}
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">{segment.count.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">{segment.revenue}</span>
                          <span className="text-xs text-muted-foreground">revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">{segment.engagement}%</span>
                          <span className="text-xs text-muted-foreground">engaged</span>
                        </div>
                      </div>

                      {/* Criteria - shown on hover/select */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        isHovered || isSelected ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}>
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 font-mono">
                          {segment.criteria}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action */}
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/90">
                        Launch Campaign
                      </button>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        isSelected ? "rotate-90" : ""
                      }`} />
                    </div>
                  </div>

                  {/* Engagement bar */}
                  <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${segment.color} transition-all duration-1000 ease-out`}
                      style={{ 
                        width: isHovered || isSelected ? `${segment.engagement}%` : "0%"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer stats */}
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">4 of 70</span> active segments
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            View all segments
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
