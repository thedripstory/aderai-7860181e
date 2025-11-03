import { Zap, Users, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

interface Segment {
  id: number;
  name: string;
  profiles: number;
  status: 'creating' | 'syncing' | 'complete';
  delay: number;
}

const SEGMENTS: Segment[] = [
  { id: 1, name: "Sleeping Giants", profiles: 2847, status: 'creating', delay: 0 },
  { id: 2, name: "Intent Lurkers", profiles: 12493, status: 'creating', delay: 400 },
  { id: 3, name: "Velocity Buyers", profiles: 8234, status: 'creating', delay: 800 },
  { id: 4, name: "Ghost Cart Revivalists", profiles: 5621, status: 'creating', delay: 1200 },
];

export const AutomationFlow = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [segments, setSegments] = useState<Segment[]>(SEGMENTS);
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

  useEffect(() => {
    if (!isVisible) return;

    const timers = segments.map((segment, index) => {
      return setTimeout(() => {
        // Creating phase
        setTimeout(() => {
          setSegments(prev => prev.map(s => 
            s.id === segment.id ? { ...s, status: 'syncing' } : s
          ));
        }, segment.delay + 1000);

        // Syncing phase
        setTimeout(() => {
          setSegments(prev => prev.map(s => 
            s.id === segment.id ? { ...s, status: 'complete' } : s
          ));
        }, segment.delay + 2500);
      }, segment.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  const getStatusColor = (status: Segment['status']) => {
    switch (status) {
      case 'creating': return 'border-orange-500/30 bg-orange-500/5';
      case 'syncing': return 'border-primary/30 bg-primary/5';
      case 'complete': return 'border-emerald-500/30 bg-emerald-500/5';
    }
  };

  const getStatusIcon = (status: Segment['status']) => {
    switch (status) {
      case 'creating': return <Zap className="w-3 h-3 text-orange-500 animate-pulse" />;
      case 'syncing': return <ArrowRight className="w-3 h-3 text-primary animate-pulse" />;
      case 'complete': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    }
  };

  const getStatusText = (status: Segment['status']) => {
    switch (status) {
      case 'creating': return 'Creating...';
      case 'syncing': return 'Syncing...';
      case 'complete': return 'Live';
    }
  };

  return (
    <div ref={flowRef} className="relative w-full max-w-2xl mx-auto lg:mx-0">
      {/* Gradient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Dashboard Header */}
        <div 
          className={`bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-lg">Live Deployment</div>
                <div className="text-xs text-muted-foreground">Real-time sync active</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Connected</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {isVisible ? '70' : '0'}
              </div>
              <div className="text-xs text-muted-foreground">Segments Ready</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-primary transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                29K+
              </div>
              <div className="text-xs text-muted-foreground">Total Profiles</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-accent transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                &lt;30s
              </div>
              <div className="text-xs text-muted-foreground">Deploy Time</div>
            </div>
          </div>

          {/* Klaviyo Connection Indicator - Aggressive Loader */}
          <div className="flex items-center justify-center gap-3 py-4 px-4 bg-muted/50 rounded-xl border border-border/50 relative overflow-hidden">
            {/* Background pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[slide-in-right_1.5s_ease-in-out_infinite]" />
            
            <span className="text-sm font-medium relative z-10">Syncing to</span>
            <img src={klaviyoLogo} alt="Klaviyo" className="h-4 relative z-10" />
            
            {/* Aggressive rotating loader */}
            <div className="relative w-8 h-8 ml-2">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              
              {/* Middle counter-rotating ring */}
              <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              
              {/* Inner pulsing core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
              
              {/* Orbiting particles */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              </div>
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Segment Cards */}
        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`bg-card border-2 rounded-xl p-4 transition-all duration-500 hover:scale-[1.02] ${
                getStatusColor(segment.status)
              } ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
              style={{ transitionDelay: `${segment.delay}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{segment.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {segment.profiles.toLocaleString()} profiles
                      </span>
                      {segment.status === 'complete' && (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full">
                  {getStatusIcon(segment.status)}
                  <span className="text-xs font-medium">{getStatusText(segment.status)}</span>
                </div>
              </div>
              {segment.status !== 'complete' && (
                <div className="mt-3">
                  <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ${
                        segment.status === 'creating' ? 'w-1/3' : 'w-2/3'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div 
          className={`mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all duration-700 ${
            segments.every(s => s.status === 'complete') && isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          style={{ transitionDelay: '3000ms' }}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            All segments deployed successfully
          </span>
        </div>
      </div>
    </div>
  );
};
