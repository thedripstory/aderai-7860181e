import React, { useState, useEffect } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';

interface AnalyticsLoadingStateProps {
  progress: { current: number; total: number };
}

const LOADING_TIPS = [
  "Fetching your segments from Klaviyo...",
  "Analyzing audience data...",
  "Calculating profile counts...",
  "Building your analytics dashboard...",
  "Almost there...",
];

export const AnalyticsLoadingState: React.FC<AnalyticsLoadingStateProps> = ({ progress }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rotate tips every 4 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = progress.total > 0 
    ? Math.min(Math.round((progress.current / progress.total) * 100), 95)
    : Math.min(elapsedSeconds * 5, 90); // Fake progress if no total

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Main container with glassmorphism */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Background glow effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[80px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Aggressive rotating loader */}
          <div className="relative w-16 h-16 mb-6">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-3 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            
            {/* Middle counter-rotating ring */}
            <div className="absolute inset-2 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            
            {/* Inner pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Loading Analytics</h3>
          </div>

          {/* Reassuring message */}
          <p className="text-sm text-muted-foreground mb-6">
            This might take a moment depending on your segment count.
            <br />
            <span className="text-xs opacity-70">We're fetching data directly from Klaviyo.</span>
          </p>

          {/* Progress bar */}
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium text-primary">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>

          {/* Segment count */}
          {progress.current > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{progress.current.toLocaleString()} segments fetched</span>
            </div>
          )}

          {/* Rotating tips */}
          <div className="h-5 overflow-hidden">
            <p 
              key={tipIndex}
              className="text-xs text-muted-foreground/80 animate-fade-in"
            >
              {LOADING_TIPS[tipIndex]}
            </p>
          </div>

          {/* Elapsed time */}
          <div className="mt-4 text-xs text-muted-foreground/60">
            {elapsedSeconds}s elapsed
          </div>
        </div>
      </div>
    </div>
  );
};
