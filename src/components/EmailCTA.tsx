import { Button } from "@/components/ui/button";

export const EmailCTA = () => {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-primary rounded-2xl p-8 sm:p-12 text-center text-primary-foreground shadow-elegant">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Accelerate Your Sales?
          </h2>
          <p className="text-lg mb-8 opacity-95 max-w-xl mx-auto">
            Join thousands of sales teams already using the Sales Strategy Portal to close more deals and drive revenue growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-base bg-background text-foreground hover:bg-background/90"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-sm opacity-80">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
