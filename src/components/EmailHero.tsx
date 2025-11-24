import { Button } from "@/components/ui/button";
import heroImage from "@/assets/sales-portal-hero.jpg";

export const EmailHero = () => {
  return (
    <section className="px-4 py-12 sm:py-16 text-center bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-md bg-accent/10 border border-accent/20">
          <span className="text-sm font-semibold text-accent font-playfair">
            aderai for Klaviyo
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
          70 segments.
          <br />
          <span className="text-muted-foreground">One click.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
          What takes 10+ hours manually, done in 30 seconds. Enterprise-level segmentation without the agency price tag.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-base font-semibold">
            Get started for $49
          </Button>
          <Button variant="outline" size="lg" className="text-base font-semibold">
            See how it works
          </Button>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-lg border border-border">
          <img 
            src={heroImage} 
            alt="Aderai Segmentation Dashboard showing Klaviyo segment management interface" 
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};
