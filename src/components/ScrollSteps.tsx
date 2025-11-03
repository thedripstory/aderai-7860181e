import { useEffect, useRef, useState } from "react";
import { Link2, Wand2, Zap, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    badge: "Connect",
    title: "Link Your Klaviyo Account",
    description: "Seamlessly connect your Klaviyo account with one click. Our secure integration takes less than 30 seconds to set up.",
    icon: Link2,
  },
  {
    number: "02",
    badge: "Select",
    title: "Choose Your Segments",
    description: "Browse our library of 70+ expert-grade segments. Select the ones that match your business goals and customer behavior patterns.",
    icon: Wand2,
  },
  {
    number: "03",
    badge: "Deploy",
    title: "One-Click Deployment",
    description: "Push selected segments directly to your Klaviyo account instantly. No manual configuration, no Boolean logic, no headaches.",
    icon: Zap,
  },
  {
    number: "04",
    badge: "Grow",
    title: "Watch Revenue Grow",
    description: "Start targeting the right customers at the right time. Track segment performance and watch your email revenue soar by 40%+.",
    icon: CheckCircle,
  },
];

export const ScrollSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
          }
        },
        {
          threshold: 0.6,
          rootMargin: "-20% 0px -20% 0px",
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column - Sticky Step Numbers */}
        <div className="sticky top-32 hidden lg:block">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`transition-all duration-500 ${
                  activeStep === index
                    ? "opacity-100 translate-x-0"
                    : "opacity-30 -translate-x-4"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`text-8xl font-bold transition-all duration-500 ${
                      activeStep === index
                        ? "text-primary"
                        : "text-muted-foreground/20"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div
                    className={`w-1 h-24 rounded-full transition-all duration-500 ${
                      activeStep === index
                        ? "bg-gradient-to-b from-primary to-accent"
                        : "bg-border"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Scrolling Content */}
        <div className="space-y-32 lg:space-y-96">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                ref={(el) => (stepRefs.current[index] = el)}
                className="min-h-[60vh] flex items-center"
              >
                <div className="w-full">
                  {/* Mobile Step Number */}
                  <div className="lg:hidden text-6xl font-bold text-primary mb-6">
                    {step.number}
                  </div>

                  <div
                    className={`transition-all duration-700 ${
                      activeStep === index
                        ? "opacity-100 translate-y-0"
                        : "opacity-40 translate-y-8"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                      {step.title}
                    </h3>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                      {step.description}
                    </p>

                    {/* Visual Element */}
                    <div className="mt-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl blur-xl" />
                      <div className="relative bg-card border-2 border-border rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full mb-2 w-3/4" />
                            <div className="h-3 bg-muted rounded-full w-1/2" />
                          </div>
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
