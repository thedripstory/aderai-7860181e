import { useEffect, useState } from "react";

export function DashboardScreenMockup() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('dashboard-screen-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      
      // Animation starts when section top is 80vh from top, completes at 30vh
      const startTrigger = vh * 0.8;
      const endTrigger = vh * 0.3;
      const range = startTrigger - endTrigger;
      
      const rawProgress = (startTrigger - rect.top) / range;
      const progress = Math.max(0, Math.min(1, rawProgress));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth easing function
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(scrollProgress);

  // Transform: starts tilted back, becomes flat and centered
  const rotateX = -20 * (1 - easedProgress);
  const rotateY = -4 * (1 - easedProgress);
  const scale = 0.85 + 0.15 * easedProgress;
  const translateY = 12 * (1 - easedProgress);
  const opacity = 0.15 + 0.85 * easedProgress;

  return (
    <section 
      id="dashboard-screen-section" 
      className="relative h-[140vh] overflow-visible mb-16"
    >
      <div className="sticky top-[18vh] z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div
              className="relative w-full aspect-[16/9.5] rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl transition-all duration-300 ease-out"
              style={{
                transform: `perspective(1800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${translateY}%)`,
                opacity,
                willChange: 'transform, opacity',
              }}
            >
              {/* Placeholder image */}
              <img
                src="/placeholder.svg"
                alt="Aderai Dashboard - Klaviyo Segmentation Tool"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent pointer-events-none" />

              {/* Edge highlights */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
