import DatabaseWithRestApi from "@/components/ui/database-with-rest-api";
import { Zap } from "lucide-react";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export const AnimatedSegmentVisual = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto my-16">
      {/* Minimal ambient glow */}
      <div className="absolute inset-0 bg-primary/3 rounded-3xl blur-3xl" />
      
      <div className="relative">
        {/* Section header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2">
            <span className="text-accent">Powered</span> <span className="text-accent">by</span> <img src={klaviyoLogo} alt="Klaviyo" className="h-[0.9em] inline-block relative top-[0.1em]" />
          </h2>
        </div>

        {/* Database API Visual */}
        <div className="flex justify-center">
          <DatabaseWithRestApi
            badgeTexts={{
              first: "Connect",
              second: "Select",
              third: "Deploy",
              fourth: "Target",
            }}
            buttonTexts={{
              first: "aderai",
              second: "70+ Segments",
            }}
            title="Instant Klaviyo Segmentation in 30 Seconds"
            circleText="70+"
            lightColor="hsl(5, 77%, 66%)"
          />
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
    </div>
  );
};
