import React from 'react';
import { Users, CheckCircle2, Briefcase, Zap } from 'lucide-react';

const AderaiTickerSection = () => {
  const problems = [
    { text: "manual segmentation", style: "gray" },
    { text: "wasted agency fees", style: "gradient-orange" },
    { text: "complex Boolean logic", style: "gray" },
    { text: "10+ hours of work", style: "gradient-purple" },
    { text: "scattered segments", style: "gray" },
    { text: "missed revenue", style: "gradient-orange" },
    { text: "debugging nightmares", style: "gray" }
  ];

  const getTextStyle = (style: string) => {
    switch(style) {
      case "gradient-orange":
        return "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent";
      case "gradient-purple":
        return "bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <section className="relative w-full py-20 px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Content - Flex Layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 mb-20">
          {/* Left: Heading with Star Decoration */}
          <div className="relative flex-shrink-0">
            {/* Decorative Star Icon */}
            <div className="absolute -left-3 -top-3 w-6 h-6 text-primary">
              <svg viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0L14.5 10.5L25 13L14.5 15.5L12.5 26L10.5 15.5L0 13L10.5 10.5L12.5 0Z" fill="currentColor"/>
              </svg>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Wave goodbye to
            </h2>

            {/* Decorative Arrow - Desktop Only */}
            <div className="hidden lg:block absolute -right-32 top-8 w-[140px] h-[100px] pointer-events-none">
              <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path 
                  d="M10 15 Q 60 -5, 110 25 L 105 35 M 110 25 L 100 28" 
                  stroke="url(#arrowGradient)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right: Ticker Animation */}
          <div className="flex-1 w-full">
            <div className="relative h-[300px] md:h-[320px]">
              {/* Top Fade */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-muted/30 to-transparent z-10 pointer-events-none" />
              
              {/* Ticker Content */}
              <div 
                className="absolute inset-0 flex flex-col gap-3 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
                }}
              >
                <div 
                  className="flex flex-col gap-3 hover:[animation-play-state:paused]"
                  style={{
                    animation: 'tickerScroll 18s linear infinite'
                  }}
                >
                  {/* Triple the items for seamless loop */}
                  {[...problems, ...problems, ...problems].map((problem, index) => (
                    <div 
                      key={index}
                      className="flex-shrink-0 h-[60px] flex items-center"
                    >
                      <h3 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${getTextStyle(problem.style)}`}>
                        {problem.text}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Fade */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted/30 to-transparent z-10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-border pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <div className="text-sm text-muted-foreground font-medium">Brands Using Aderai</div>
            </div>

            <div className="group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                70+
              </div>
              <div className="text-sm text-muted-foreground font-medium">Pre-built Segments</div>
            </div>

            <div className="group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                99%
              </div>
              <div className="text-sm text-muted-foreground font-medium">Time Saved</div>
            </div>

            <div className="group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                4.8★
              </div>
              <div className="text-sm text-muted-foreground font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes tickerScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-${problems.length * 63}px);
          }
        }
      `}} />
    </section>
  );
};

export default AderaiTickerSection;
