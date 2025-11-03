import React from 'react';
import { Users, CheckCircle2, Briefcase, Zap } from 'lucide-react';

const AderaiTickerSection = () => {
  const problems = [
    { text: "manual segmentation", color: "muted" },
    { text: "wasted agency fees", color: "orange" },
    { text: "complex Boolean logic", color: "muted" },
    { text: "10+ hours of work", color: "purple" },
    { text: "scattered segments", color: "muted" },
    { text: "missed revenue", color: "orange" },
    { text: "debugging nightmares", color: "muted" }
  ];

  const getColorClass = (color: string) => {
    if (color === "orange") return "text-orange-500";
    if (color === "purple") return "text-purple-600";
    return "text-muted-foreground";
  };

  return (
    <section className="relative w-full py-16 px-6 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16 mb-16">
          {/* Left: Heading */}
          <div className="relative flex-shrink-0">
            {/* Star decoration */}
            <div className="absolute -left-2 -top-2 w-5 h-5 text-orange-500">
              <svg viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0L14.5 10.5L25 13L14.5 15.5L12.5 26L10.5 15.5L0 13L10.5 10.5L12.5 0Z" fill="currentColor"/>
              </svg>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
              Wave goodbye to
            </h2>

            {/* Curved arrow */}
            <div className="hidden lg:block absolute -right-28 top-6 w-32 h-20 pointer-events-none opacity-60">
              <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path 
                  d="M5 10 Q 50 -5, 95 20 L 90 28 M 95 20 L 87 23" 
                  stroke="#f97316" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Right: Ticker */}
          <div className="flex-1 w-full">
            <div className="relative h-[280px]">
              {/* Gradient fades */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-muted/20 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/20 to-transparent z-10" />
              
              {/* Scrolling content */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="flex flex-col gap-2"
                  style={{ animation: 'tickerScroll 16s linear infinite' }}
                >
                  {[...problems, ...problems, ...problems].map((problem, idx) => (
                    <div key={idx} className="h-[56px] flex items-center">
                      <h3 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${getColorClass(problem.color)}`}>
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
        <div className="border-t border-border/40 pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">10,000+</div>
              <div className="text-xs text-muted-foreground">Brands Using Aderai</div>
            </div>

            <div>
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">70+</div>
              <div className="text-xs text-muted-foreground">Pre-built Segments</div>
            </div>

            <div>
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">99%</div>
              <div className="text-xs text-muted-foreground">Time Saved</div>
            </div>

            <div>
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">4.8★</div>
              <div className="text-xs text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes tickerScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-${problems.length * 58}px); }
        }
      `}} />
    </section>
  );
};

export default AderaiTickerSection;
