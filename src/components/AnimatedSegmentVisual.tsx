import { useState, useEffect } from "react";
import { MousePointerClick, Sparkles, CheckCircle2, Zap } from "lucide-react";
interface Step {
  id: string;
  number: string;
  icon: any;
  title: string;
  description: string;
}
const STEPS: Step[] = [{
  id: "1",
  number: "01",
  icon: MousePointerClick,
  title: "Connect Klaviyo",
  description: "One-click authentication. No API keys, no technical setup required."
}, {
  id: "2",
  number: "02",
  icon: Sparkles,
  title: "Select Segments",
  description: "Choose from 70+ pre-built segments or let AI create custom ones for your brand."
}, {
  id: "3",
  number: "03",
  icon: Zap,
  title: "Deploy Instantly",
  description: "All segments auto-created in Klaviyo in 30 seconds. No manual work."
}, {
  id: "4",
  number: "04",
  icon: CheckCircle2,
  title: "Start Targeting",
  description: "Segments sync in real-time. Begin creating personalized campaigns immediately."
}];
export const AnimatedSegmentVisual = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);
  const activeStep = STEPS[activeIndex];
  return <div className="relative w-full max-w-6xl mx-auto my-16">
      {/* Minimal ambient glow */}
      <div className="absolute inset-0 bg-primary/3 rounded-3xl blur-3xl" />
      
      <div className="relative">
        {/* Section header */}
        <div className="text-center mb-12 space-y-3">
          
          <h2 className="text-3xl lg:text-4xl font-bold">
            Powered by <span className="text-primary">Klaviyo.</span>
          </h2>
        </div>

        {/* Main Step Display */}
        <div className="relative bg-background/40 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.9)]" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
          {/* Content */}
          <div className="relative grid lg:grid-cols-2 gap-12 p-8 lg:p-16">
            {/* Left: Step Info */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Step number */}
              <div className="opacity-0 animate-fade-in">
                <span className="text-7xl font-bold text-primary/20">
                  {activeStep.number}
                </span>
              </div>

              {/* Title with icon */}
              <div className="space-y-4 opacity-0 animate-fade-in" style={{
              animationDelay: "100ms",
              animationFillMode: "forwards"
            }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary border border-primary/20">
                  <activeStep.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold leading-tight">
                  {activeStep.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed opacity-0 animate-fade-in" style={{
              animationDelay: "200ms",
              animationFillMode: "forwards"
            }}>
                {activeStep.description}
              </p>
            </div>

            {/* Right: Fixed Placeholder Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                  alt="Dashboard visualization placeholder"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Bottom: Step Navigation */}
          <div className="relative px-8 lg:px-16 pb-8">
            <div className="flex items-center justify-center gap-8">
              {STEPS.map((step, index) => <button key={step.id} onClick={() => {
              setActiveIndex(index);
              setIsAutoPlaying(false);
            }} className="group relative flex flex-col items-center gap-2 min-w-[60px]" aria-label={`View step ${step.number}`}>
                  {/* Progress bar for active item */}
                  {index === activeIndex && <div className="absolute -top-3 left-0 right-0 h-0.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-[slide-in-right_4s_linear]" />
                    </div>}
                  
                  {/* Step number */}
                  <span className={`text-xs font-bold transition-all duration-300 ${index === activeIndex ? "text-primary scale-110" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}>
                    {step.number}
                  </span>
                </button>)}
            </div>
          </div>
        </div>

        {/* Bottom animated comparison */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <div className="flex items-center gap-3 opacity-0 animate-fade-in" style={{
          animationDelay: "400ms",
          animationFillMode: "forwards"
        }}>
            <div className="text-right">
              <div className="text-3xl font-bold text-muted-foreground/30 line-through">10+ hours</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Manual setup</div>
            </div>
          </div>
          
          <div className="relative opacity-0 animate-fade-in" style={{
          animationDelay: "600ms",
          animationFillMode: "forwards"
        }}>
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-ping" style={{
            animationDuration: "2s"
          }} />
          </div>
          
          <div className="flex items-center gap-3 opacity-0 animate-fade-in" style={{
          animationDelay: "800ms",
          animationFillMode: "forwards"
        }}>
            <div className="text-left">
              <div className="text-3xl font-bold text-primary">30 seconds</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-0.5">
                
                <span className="font-playfair font-bold">aderai<span className="text-accent">.</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};