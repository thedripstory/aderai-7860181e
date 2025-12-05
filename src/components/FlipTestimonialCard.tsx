import React, { useState, useEffect, useRef } from 'react';
import { Quote, TrendingUp } from 'lucide-react';

interface FlipTestimonialCardProps {
  name: string;
  role: string;
  company: string;
  story: string;
  metrics: {
    label: string;
    value: string;
  }[];
  image?: string;
  delay?: string;
}

export const FlipTestimonialCard = ({ 
  name, 
  role, 
  company, 
  story, 
  metrics,
  image,
  delay = "0s"
}: FlipTestimonialCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Auto-flip only when card is visible (performance optimization)
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;
    
    let autoFlipInterval: NodeJS.Timeout | null = null;
    let flipBackTimeout: NodeJS.Timeout | null = null;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start timer only when visible
          if (!autoFlipInterval) {
            const randomDelay = Math.random() * 10000 + 5000;
            autoFlipInterval = setInterval(() => {
              setIsFlipped(true);
              flipBackTimeout = setTimeout(() => {
                setIsFlipped(false);
              }, 3000);
            }, randomDelay + 15000);
          }
        } else {
          // Stop timer when not visible
          if (autoFlipInterval) {
            clearInterval(autoFlipInterval);
            autoFlipInterval = null;
          }
          if (flipBackTimeout) {
            clearTimeout(flipBackTimeout);
            flipBackTimeout = null;
          }
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(cardElement);
    
    return () => {
      observer.disconnect();
      if (autoFlipInterval) clearInterval(autoFlipInterval);
      if (flipBackTimeout) clearTimeout(flipBackTimeout);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="group perspective-1000 h-[480px] cursor-pointer animate-fade-in"
      style={{ animationDelay: delay }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border-2 border-border p-8 shadow-xl hover:shadow-2xl transition-all">
          <div className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Quote className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Success Story
              </div>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="text-2xl font-bold mb-4">{name}'s Breakthrough</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {story}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {metrics.slice(0, 2).map((metric, idx) => (
                <div key={idx} className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-1">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Click to see full story
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl border-2 border-primary/30 p-8 shadow-2xl">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {image && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                  <img src={image} alt={`${name} profile photo`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
                <p className="text-xs text-primary font-semibold">{company}</p>
              </div>
            </div>

            <div className="flex-1 mb-6">
              <p className="text-foreground/90 leading-relaxed mb-6">
                {story}
              </p>

              <div className="space-y-3">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-bold text-primary">{metric.value}</span>
                      <span className="text-sm text-muted-foreground ml-2">{metric.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
