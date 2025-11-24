import { Button } from "@/components/ui/button";

export const EmailCTA = () => {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-foreground text-background rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get Started in Seconds
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Deploy 70+ segments to Klaviyo instantly. No setup, no complexity, just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="text-base font-semibold bg-background text-foreground hover:bg-background/90"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base font-semibold border-2 border-background/30 text-background hover:bg-background/10"
            >
              See how it works
            </Button>
          </div>
          
          <p className="text-sm opacity-80 font-medium">
            Instant setup • Works with Klaviyo
          </p>
        </div>
      </div>
    </section>
  );
};
