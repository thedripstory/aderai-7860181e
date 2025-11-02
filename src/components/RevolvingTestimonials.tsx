import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

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
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border border-primary/20 backdrop-blur-sm overflow-hidden relative">
        {/* Quote icon */}
        <div className="absolute top-6 left-6 opacity-10">
          <Quote className="w-12 h-12 text-primary" />
        </div>
        
        {/* Testimonial content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <p className="text-xl md:text-2xl font-bold text-foreground mb-4 leading-relaxed">
              "{testimonials[currentIndex].quote}"
            </p>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              — {testimonials[currentIndex].author}
            </p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-6">
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
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Animated gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent animate-[slide-in-right_3s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Supporting text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Trusted by industry leaders and top publications
        </span>
      </div>
    </div>
  );
}
