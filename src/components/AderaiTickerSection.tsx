import React from 'react';

const AderaiTickerSection = () => {
  const problems = [
    "fragmented AI workflows",
    "disconnected tools",
    "lost context",
    "repetitive prompts",
    "scattered insights",
    "workflow chaos",
    "productivity bottlenecks"
  ];

  return (
    <section className="relative w-full py-20 px-4 bg-[#f5f5f5] overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        {/* Main Container */}
        <div className="relative">
          {/* Decorative Star Icon - Top Left */}
          <div className="absolute left-0 top-0 w-6 h-6 -translate-y-1/2 text-purple-600">
            <svg viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 0L14.5 10.5L25 13L14.5 15.5L12.5 26L10.5 15.5L0 13L10.5 10.5L12.5 0Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black">
              Wave goodbye to
            </h2>
          </div>

          {/* Ticker Container with Overlay Gradients */}
          <div className="relative h-[280px] md:h-[320px]">
            {/* Top Overlay Gradient */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#f5f5f5] to-transparent z-10 pointer-events-none" />
            
            {/* Ticker Content */}
            <div 
              className="absolute inset-0 flex flex-col gap-2 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)'
              }}
            >
              <div 
                className="flex flex-col gap-2 hover:[animation-play-state:paused]"
                style={{
                  animation: `tickerScroll 20s linear infinite`
                }}
              >
                {/* Render problems 3 times for seamless loop */}
                {[...problems, ...problems, ...problems].map((problem, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 h-[60px] flex items-center"
                  >
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                      <span 
                        className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent"
                      >
                        {problem}
                      </span>
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Overlay Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f5f5f5] to-transparent z-10 pointer-events-none" />
          </div>

          {/* Doodle Arrow - Positioned absolutely */}
          <div className="absolute left-[280px] top-[60px] w-[180px] h-[120px] pointer-events-none hidden md:block">
            <svg viewBox="0 0 155 123" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M10 10 Q 80 -10, 140 30 L 135 40 M 140 30 L 130 35" 
                stroke="url(#arrowGradient)" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes tickerScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-${problems.length * 62}px);
          }
        }
      `}} />
    </section>
  );
};

export default AderaiTickerSection;
