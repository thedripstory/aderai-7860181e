import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Layers } from "lucide-react";

export function AnimatedStatsBar() {
  const [speedCount, setSpeedCount] = useState(0);
  const [segmentCount, setSegmentCount] = useState(0);

  useEffect(() => {
    // Animate speed counter
    const speedInterval = setInterval(() => {
      setSpeedCount((prev) => {
        if (prev >= 200) {
          clearInterval(speedInterval);
          return 200;
        }
        return prev + 8;
      });
    }, 20);

    // Animate segment counter
    const segmentInterval = setInterval(() => {
      setSegmentCount((prev) => {
        if (prev >= 70) {
          clearInterval(segmentInterval);
          return 70;
        }
        return prev + 3;
      });
    }, 30);

    return () => {
      clearInterval(speedInterval);
      clearInterval(segmentInterval);
    };
  }, []);

  return (
    <div className="mt-8 relative">
      {/* Main stats container */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20 backdrop-blur-sm overflow-hidden relative">
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Speed Metric */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary">{speedCount}x</span>
                  <span className="text-sm text-muted-foreground">faster</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                    style={{ width: `${(speedCount / 200) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cost Metric */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                  <span className="text-sm text-muted-foreground">monthly</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Segments Metric */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-accent">{segmentCount}</span>
                  <span className="text-sm text-muted-foreground">segments</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-1000 ease-out"
                    style={{ width: `${(segmentCount / 70) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flowing animation line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent animate-[slide-in-right_3s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Supporting text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Join 10,000+ brands scaling their email revenue with Aderai
        </span>
      </div>
    </div>
  );
}
