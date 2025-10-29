import { Star } from "lucide-react";

export const EmailTestimonial = () => {
  return (
    <section className="px-4 py-12 sm:py-16 bg-secondary/50">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-primary text-primary" />
          ))}
        </div>
        
        <blockquote className="text-xl sm:text-2xl font-medium mb-6 leading-relaxed">
          "The Sales Strategy Portal transformed how we approach our sales pipeline. We've seen a 40% increase in conversion rates in just 3 months."
        </blockquote>
        
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-primary" />
          <div className="text-left">
            <div className="font-semibold">Sarah Chen</div>
            <div className="text-sm text-muted-foreground">VP of Sales, TechCorp</div>
          </div>
        </div>
      </div>
    </section>
  );
};
