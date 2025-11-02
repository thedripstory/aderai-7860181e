import { Mail, GitBranch, MessageSquare, Database, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const AutomationFlow = () => {
  const [isVisible, setIsVisible] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (flowRef.current) {
      observer.observe(flowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={flowRef} className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Gradient Background Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl opacity-60" />
      
      <div className="relative">
        {/* Trigger Node */}
        <div 
          className={`flex items-center gap-3 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg mb-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold">New email subscriber</div>
            <div className="text-sm text-muted-foreground">trigger</div>
          </div>
        </div>

        {/* Connector Line */}
        <div 
          className={`w-0.5 bg-gradient-to-b from-primary/40 to-accent/40 mx-auto mb-6 transition-all duration-500 origin-top ${
            isVisible ? 'h-8 opacity-100' : 'h-0 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        />

        {/* Branch Node */}
        <div 
          className={`flex items-center gap-3 bg-card border-2 border-accent/20 rounded-xl p-4 shadow-lg mb-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="font-semibold">Check purchase history</div>
            <div className="text-sm text-muted-foreground">conditional</div>
          </div>
        </div>

        {/* Split Connector */}
        <div 
          className={`flex justify-between items-start mb-6 px-8 transition-all duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold text-primary mb-2">Yes</div>
            <div 
              className={`w-0.5 bg-gradient-to-b from-accent/40 to-primary/40 transition-all duration-500 origin-top ${
                isVisible ? 'h-8 opacity-100' : 'h-0 opacity-0'
              }`}
              style={{ transitionDelay: '600ms' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold text-accent mb-2">No</div>
            <div 
              className={`w-0.5 bg-gradient-to-b from-accent/40 to-orange-500/40 transition-all duration-500 origin-top ${
                isVisible ? 'h-8 opacity-100' : 'h-0 opacity-0'
              }`}
              style={{ transitionDelay: '600ms' }}
            />
          </div>
        </div>

        {/* Action Nodes */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className={`flex flex-col items-center gap-3 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">VIP welcome</div>
              <div className="text-xs text-muted-foreground">#segment-1</div>
            </div>
          </div>

          <div 
            className={`flex flex-col items-center gap-3 bg-card border-2 border-orange-500/20 rounded-xl p-4 shadow-lg transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">New customer</div>
              <div className="text-xs text-muted-foreground">#segment-2</div>
            </div>
          </div>
        </div>

        {/* Bottom Connector */}
        <div 
          className={`w-0.5 bg-gradient-to-b from-primary/40 to-transparent mx-auto mt-6 mb-6 transition-all duration-500 origin-top ${
            isVisible ? 'h-8 opacity-100' : 'h-0 opacity-0'
          }`}
          style={{ transitionDelay: '1000ms' }}
        />

        {/* Final Action */}
        <div 
          className={`flex items-center gap-3 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '1100ms' }}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Auto-segment created</div>
            <div className="text-sm text-muted-foreground">in Klaviyo</div>
          </div>
        </div>
      </div>
    </div>
  );
};
