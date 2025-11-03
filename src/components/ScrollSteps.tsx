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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const { top, bottom } = ref.getBoundingClientRect();
          const absoluteTop = top + window.scrollY;
          const absoluteBottom = bottom + window.scrollY;

          if (scrollPosition >= absoluteTop && scrollPosition <= absoluteBottom) {
            setActiveStep(index);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <div className="grid lg:grid-cols-5 gap-12">
        {/* Left Column - Sticky Step Numbers */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-32 space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`transition-all duration-700 ${
                  activeStep === index
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-20 -translate-x-8 scale-95"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`text-[120px] leading-none font-bold transition-all duration-700 ${
                      activeStep === index
                        ? "bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent"
                        : "text-muted-foreground/10"
                    }`}
                  >
                    {step.number}
                  </div>
                  {activeStep === index && (
                    <div className="w-2 h-32 rounded-full bg-gradient-to-b from-primary via-accent to-primary animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Scrolling Content */}
        <div className="lg:col-span-3 space-y-[50vh]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                ref={(el) => (stepRefs.current[index] = el)}
                className="min-h-screen flex items-center py-20"
              >
                <div className="w-full">
                  {/* Mobile Step Number */}
                  <div
                    className={`lg:hidden text-8xl font-bold mb-8 transition-all duration-700 ${
                      activeStep === index
                        ? "bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent"
                        : "text-muted-foreground/20"
                    }`}
                  >
                    {step.number}
                  </div>

                  <div
                    className={`transition-all duration-1000 ${
                      activeStep === index
                        ? "opacity-100 translate-y-0"
                        : "opacity-30 translate-y-12"
                    }`}
                  >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border-2 border-primary/20 mb-8 shadow-lg">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">
                        {step.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                      {step.description}
                    </p>

                    {/* Visual Card */}
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
