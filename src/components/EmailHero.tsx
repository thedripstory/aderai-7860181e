import { Button } from "@/components/ui/button";
import heroImage from "@/assets/sales-portal-hero.jpg";

export const EmailHero = () => {
  return (
    <section className="bg-gradient-hero px-4 py-12 sm:py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium bg-gradient-primary bg-clip-text text-transparent">
            🚀 New Product Launch
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Transform Your Sales Strategy
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
          Introducing the Sales Strategy Portal - your all-in-one platform to analyze, optimize, and scale your sales operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="hero" size="lg" className="text-base">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="text-base">
            Watch Demo
          </Button>
        </div>
        
        <div className="rounded-xl overflow-hidden shadow-elegant border border-border">
          <img 
            src={heroImage} 
            alt="Sales Strategy Portal Dashboard" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};
