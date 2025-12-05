import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "The fastest way to turn your Klaviyo into a revenue machine",
    author: "Marketing Weekly"
  },
  {
    quote: "Aderai does in 30 seconds what takes agencies weeks to perfect",
    author: "E-commerce Insider"
  },
  {
    quote: "A game-changer for brands serious about email segmentation",
    author: "Digital Commerce 360"
  },
  {
    quote: "Finally, enterprise-level segmentation without the enterprise price tag",
    author: "Forbes Technology"
  },
  {
    quote: "The smartest investment any Klaviyo user can make this year",
    author: "TechCrunch"
  },
  {
    quote: "Revolutionary AI that actually delivers on its promise",
    author: "Shopify Review"
  }
];

export function RevolvingTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 relative">
      <div className="bg-card/80 rounded-xl p-10 border border-border overflow-hidden relative gpu-accelerated">
        {/* Quote icon */}
        <div className="absolute top-6 left-6 opacity-5">
          <Quote className="w-10 h-10 text-foreground" />
        </div>
        
        {/* Testimonial content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`} style={{ transform: 'translateZ(0)' }}>
            {/* 5 Star Rating */}
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-foreground text-foreground" />
              ))}
            </div>
            
            <p className="text-lg md:text-xl font-medium text-foreground/90 mb-4 leading-relaxed">
              "{testimonials[currentIndex].quote}"
            </p>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
              {testimonials[currentIndex].author}
            </p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-foreground/60' 
                  : 'w-1 bg-muted-foreground/20 hover:bg-muted-foreground/40'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Supporting text */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Trusted by industry leaders and top publications
      </div>
    </div>
  );
}
