import { Button } from "@/components/ui/button";

export const EmailCTA = () => {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-primary rounded-xl p-8 sm:p-12 text-center text-primary-foreground shadow-elegant">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Investment Is Protected
          </h2>
          <p className="text-lg mb-8 opacity-95 max-w-xl mx-auto">
            Try risk-free. If these 70 segments don't boost your email performance, get 100% of your money back. Zero risk.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="text-base font-semibold bg-background text-foreground hover:bg-background/90"
            >
              Start For $49
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm opacity-90 font-medium">
            Instant setup • 100% money-back guarantee • Works with Klaviyo
          </p>
        </div>
      </div>
    </section>
  );
};
