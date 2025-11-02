import { Button } from "@/components/ui/button";
import heroImage from "@/assets/sales-portal-hero.jpg";

export const EmailHero = () => {
  return (
    <section className="bg-gradient-hero px-4 py-12 sm:py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-semibold text-primary">
            🚀 AI-Powered Segmentation for Klaviyo
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Segment Like A $50M Brand
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
          Deploy 70 battle-tested segments in 30 seconds. Zero guesswork. Enterprise-level segmentation without the agency price tag.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-base font-semibold">
            Start For $49
          </Button>
          <Button variant="outline" size="lg" className="text-base font-semibold">
            Watch Demo
          </Button>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-elegant border border-border">
          <img 
            src={heroImage} 
            alt="Klaviyo AI Segmentation Dashboard" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};
