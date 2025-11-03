import React from 'react';
import { Users, CheckCircle2, Briefcase, Zap } from 'lucide-react';

const AderaiTickerSection = () => {
  const problems = [
    { text: "agency retainers", color: "muted" },
    { text: "10+ hours of work", color: "purple" },
    { text: "scattered segments", color: "muted" },
    { text: "missed revenue", color: "orange" },
    { text: "manual setup", color: "muted" }
  ];

  const getColorClass = (color: string) => {
    if (color === "orange") return "text-orange-500";
    if (color === "purple") return "text-purple-600";
    return "text-muted-foreground";
  };

  return (
    <section className="relative w-full py-12 px-6 bg-muted/20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12 mb-12">
          {/* Left: Heading */}
          <div className="relative flex-shrink-0 md:w-[320px]">
            {/* Star decoration */}
            <div className="absolute -left-2 -top-2 w-4 h-4 text-orange-500">
              <svg viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0L14.5 10.5L25 13L14.5 15.5L12.5 26L10.5 15.5L0 13L10.5 10.5L12.5 0Z" fill="currentColor"/>
              </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Wave goodbye to
            </h2>

            {/* Curved arrow */}
            <div className="hidden md:block absolute -right-20 top-4 w-24 h-16 pointer-events-none opacity-50">
              <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path 
                  d="M5 8 Q 40 -3, 78 18 L 74 24 M 78 18 L 71 20" 
                  stroke="#f97316" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Right: Ticker */}
          <div className="flex-1 w-full md:max-w-[500px]">
            <div className="relative h-[220px]">
              {/* Gradient fades */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-muted/20 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/20 to-transparent z-10" />
              
              {/* Scrolling content */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="flex flex-col gap-2"
                  style={{ animation: 'tickerScroll 12s linear infinite' }}
                >
                  {[...problems, ...problems, ...problems].map((problem, idx) => (
                    <div key={idx} className="h-[44px] flex items-center">
                      <h3 className={`text-3xl md:text-4xl font-bold ${getColorClass(problem.color)}`}>
                        {problem.text}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-border/40 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">10K+</div>
              <div className="text-xs text-muted-foreground">Brands</div>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">70+</div>
              <div className="text-xs text-muted-foreground">Segments</div>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">99%</div>
              <div className="text-xs text-muted-foreground">Time Saved</div>
            </div>

            <div>
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">4.8★</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes tickerScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-${problems.length * 46}px); }
        }
      `}} />
    </section>
  );
};

export default AderaiTickerSection;
