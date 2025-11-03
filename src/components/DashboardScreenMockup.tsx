import { useEffect, useState } from "react";

export function DashboardScreenMockup() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('dashboard-mockup-section');
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;

      // Progress from when section top is near bottom (85vh) to mid viewport (35vh)
      const start = vh * 0.85;
      const end = vh * 0.35;
      const raw = (start - rect.top) / (start - end);
      const progress = Math.max(0, Math.min(1, raw));

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform: single-phase entry to flat center
  const calculateTransform = () => {
    // 0 => tilted/partially hidden, 1 => flat/centered/fully visible
    const p = scrollProgress;
    const rotateX = -16 * (1 - p);
    const rotateZ = -3 * (1 - p);
    const translateY = 8 * (1 - p); // percent
    const scale = 0.9 + 0.1 * p;
    const opacity = 0.1 + 0.9 * p;

    return {
      transform: `perspective(1400px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) translateY(${translateY}%) scale(${scale})`,
      opacity,
      willChange: 'transform, opacity',
    };
  };

  const style = calculateTransform();

  return (
    <section 
      id="dashboard-mockup-section" 
      className="relative h-[160vh] overflow-visible"
    >
      <div className="container mx-auto px-4 h-full">
        <div className="sticky top-[22vh] z-10 flex items-center justify-center">
          <div
            className="w-full max-w-6xl transition-transform duration-200 ease-out"
            style={style}
          >
            <div className="relative w-full aspect-[16/10] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Placeholder for future dashboard screenshot */}
              <img
                src="/placeholder.svg"
                alt="Product dashboard preview - Klaviyo segmentation tool"
                loading="lazy"
                className="w-full h-full object-cover"
              />

              {/* Subtle glare using semantic token */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent pointer-events-none" />

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
