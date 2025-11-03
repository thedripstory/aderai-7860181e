import { useEffect, useState } from "react";

export function ScrollScreenMockup() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('screen-mockup-trigger');
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress: 0 (tilted behind) -> 0.5 (flat centered) -> 1 (tilted behind again)
      const start = windowHeight * 0.8;
      const end = -windowHeight * 0.5;
      const range = start - end;
      const current = rect.top - start;
      const progress = Math.max(0, Math.min(1, -current / range));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform based on scroll progress
  // 0 -> 0.5: emerge and straighten
  // 0.5 -> 1: tilt back and duck behind
  const calculateTransform = () => {
    if (scrollProgress < 0.5) {
      // Emerging phase
      const phase = scrollProgress * 2; // 0 to 1
      const rotateX = 25 * (1 - phase); // 25deg to 0deg
      const translateY = 30 * (1 - phase); // 30% to 0%
      const scale = 0.7 + (0.3 * phase); // 0.7 to 1
      const opacity = 0.3 + (0.7 * phase); // 0.3 to 1
      
      return {
        transform: `perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}%) scale(${scale})`,
        opacity,
        zIndex: 10
      };
    } else {
      // Ducking phase
      const phase = (scrollProgress - 0.5) * 2; // 0 to 1
      const rotateX = -25 * phase; // 0deg to -25deg
      const translateY = -30 * phase; // 0% to -30%
      const scale = 1 - (0.3 * phase); // 1 to 0.7
      const opacity = 1 - (0.7 * phase); // 1 to 0.3
      
      return {
        transform: `perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}%) scale(${scale})`,
        opacity,
        zIndex: phase > 0.5 ? 1 : 10
      };
    }
  };

  const style = calculateTransform();

  return (
    <div 
      id="screen-mockup-trigger"
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{ height: '200vh' }}
    >
      <div
        className="sticky top-1/2 -translate-y-1/2 w-full max-w-5xl mx-auto px-4 transition-all duration-100"
        style={style}
      >
        <div className="relative w-full aspect-video bg-card rounded-2xl border-4 border-border shadow-2xl overflow-hidden">
          {/* Screen mockup frame */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-background">
            {/* Placeholder for dashboard screenshot */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-xl font-medium">Dashboard Preview</div>
                <div className="text-sm opacity-60 mt-2">Screenshot placeholder</div>
              </div>
            </div>
          </div>
          
          {/* Screen reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
