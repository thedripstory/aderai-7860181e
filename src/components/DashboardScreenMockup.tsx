import { useEffect, useState } from "react";

export function DashboardScreenMockup() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('dashboard-mockup-section');
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = element.offsetHeight;
      
      // Start animation when section enters viewport
      const start = windowHeight;
      const end = -elementHeight;
      const range = start - end;
      const current = rect.top - windowHeight / 2;
      const progress = Math.max(0, Math.min(1, 1 - (current / (range / 2))));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform: emerges from top, straightens to center, returns to top
  const calculateTransform = () => {
    if (scrollProgress < 0.5) {
      // Emerging and straightening phase (0 to 0.5)
      const phase = scrollProgress * 2; // 0 to 1
      const rotateX = -30 * (1 - phase); // -30deg to 0deg (tilted back to flat)
      const translateY = -50 * (1 - phase); // -50% to 0% (above to center)
      const scale = 0.6 + (0.4 * phase); // 0.6 to 1
      const opacity = 0.2 + (0.8 * phase); // 0.2 to 1
      
      return {
        transform: `perspective(1500px) rotateX(${rotateX}deg) translateY(${translateY}%) scale(${scale})`,
        opacity,
      };
    } else {
      // Returning phase (0.5 to 1)
      const phase = (scrollProgress - 0.5) * 2; // 0 to 1
      const rotateX = -30 * phase; // 0deg to -30deg (flat to tilted back)
      const translateY = -50 * phase; // 0% to -50% (center to above)
      const scale = 1 - (0.4 * phase); // 1 to 0.6
      const opacity = 1 - (0.8 * phase); // 1 to 0.2
      
      return {
        transform: `perspective(1500px) rotateX(${rotateX}deg) translateY(${translateY}%) scale(${scale})`,
        opacity,
      };
    }
  };

  const style = calculateTransform();

  return (
    <section 
      id="dashboard-mockup-section" 
      className="relative py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            className="w-full max-w-6xl transition-all duration-300 ease-out"
            style={style}
          >
            <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-card to-card/50 rounded-2xl border-4 border-border shadow-2xl overflow-hidden">
              {/* Screen frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-background/20">
                {/* Placeholder for dashboard screenshot */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-7xl">📊</div>
                    <div className="text-2xl font-bold text-foreground">Dashboard Preview</div>
                    <div className="text-sm text-muted-foreground">Klaviyo Segment Management</div>
                  </div>
                </div>
              </div>
              
              {/* Screen glare effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              
              {/* Screen edge highlights */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
