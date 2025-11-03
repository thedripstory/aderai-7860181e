import { useEffect, useRef, useState } from "react";
import { Link2, Wand2, Zap, CheckCircle } from "lucide-react";

const steps = [
  {
    badge: "Connect",
    title: "Link Your Klaviyo Account",
    description:
      "Seamlessly connect your Klaviyo account with one click. Our secure integration takes less than 30 seconds to set up.",
    icon: Link2,
  },
  {
    badge: "Select",
    title: "Choose Your Segments",
    description:
      "Browse our library of 70+ expert‑grade segments. Pick the ones that match your goals and customer behavior patterns.",
    icon: Wand2,
  },
  {
    badge: "Deploy",
    title: "One‑Click Deployment",
    description:
      "Push selected segments directly to your Klaviyo account instantly. No manual configuration, no Boolean logic, no headaches.",
    icon: Zap,
  },
  {
    badge: "Grow",
    title: "Watch Revenue Grow",
    description:
      "Target the right customers at the right time. Track performance and watch your email revenue soar by 40%+.",
    icon: CheckCircle,
  },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

export const ScrollSteps = () => {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // Robust midpoint detector – picks the step that contains the viewport center
  useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = 0;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = rect.bottom + window.scrollY;
        if (mid >= top && mid <= bottom) current = i;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div className="grid lg:grid-cols-5 gap-12 items-start">
        {/* Left – single sticky number + line */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-28">
            <div className="flex items-start gap-6">
              <div className="leading-none select-none">
                <div className="text-[120px] font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  {pad(active)}
                </div>
              </div>
              <div className="relative mt-6">
                <div className="w-[3px] h-[70vh] rounded-full bg-gradient-to-b from-primary via-accent to-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right – steps that reveal while scrolling (page scroll, not inner) */}
        <div className="lg:col-span-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === active;
            return (
              <div
                key={i}
                ref={(el) => (refs.current[i] = el)}
                className="min-h-[85vh] flex items-center py-16"
              >
                <div
                  className={`w-full transition-all duration-700 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-8"
                  }`}
                >
                  {/* Mobile step number */}
                  <div className="lg:hidden text-7xl font-bold mb-6 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                    {pad(i)}
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {s.title}
                  </h3>

                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {s.description}
                  </p>

                  {/* Visual card */}
                  <div className="mt-10 relative group">
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-card border-2 border-border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                          <Icon className="w-10 h-10 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-full w-5/6 animate-pulse" />
                          <div className="h-4 bg-muted rounded-full w-4/6" />
                          <div className="h-4 bg-muted rounded-full w-3/6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
