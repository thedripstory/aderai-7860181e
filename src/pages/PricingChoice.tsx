import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PoweredByBadge } from '@/components/PoweredByBadge';

export default function PricingChoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);

  const handleCheckout = async (priceId: string, plan: 'monthly' | 'annual') => {
    setLoading(plan);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with payment.",
          variant: "destructive",
        });
        navigate('/signup');
        return;
      }

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: { priceId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (checkoutError) throw checkoutError;
      
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const features = [
    'Access to all 70+ premium Klaviyo segments',
    'Automated segment creation & setup',
    'Real-time performance tracking',
    'Priority customer support',
    'Regular segment updates & new additions',
    'Unlimited segment cloning',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <button
          onClick={() => navigate('/signup')}
          className="text-muted-foreground hover:text-foreground mb-8 flex items-center gap-2 transition-all hover:gap-3"
        >
          ← Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Select the billing cycle that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Billed monthly • Cancel anytime
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout('price_1SU61e0lE1soQQfxwKcXj7M5', 'monthly')}
                disabled={loading !== null}
                className="w-full"
                size="lg"
              >
                {loading === 'monthly' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Monthly Plan'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-2 border-primary hover:border-primary/80 transition-all shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Save $98/year
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Annual</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">$490</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <div className="text-sm">
                  <span className="line-through text-muted-foreground">$588</span>
                  <span className="text-primary font-semibold ml-2">Save 17%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed annually • Best value
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout('price_1SU67J0lE1soQQfxEXDs4KYi', 'annual')}
                disabled={loading !== null}
                className="w-full"
                size="lg"
                variant="default"
              >
                {loading === 'annual' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Annual Plan'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            ✓ 30-day money-back guarantee • ✓ Cancel anytime • ✓ Secure payment
          </p>
          <PoweredByBadge />
        </div>
      </div>
    </div>
  );
}
