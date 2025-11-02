import { Star } from "lucide-react";

export const EmailTestimonial = () => {
  return (
    <section className="px-4 py-12 sm:py-16 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-accent text-accent" />
          ))}
        </div>
        
        <blockquote className="text-xl sm:text-2xl font-medium mb-6 leading-relaxed">
          "Deployed 70 segments in under a minute. Email revenue jumped 42% in the first month. This is what we've been missing."
        </blockquote>
        
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="text-left">
            <div className="font-semibold">Marcus Rodriguez</div>
            <div className="text-sm text-muted-foreground">Head of Growth, Premium Beauty Co.</div>
          </div>
        </div>
      </div>
    </section>
  );
};
