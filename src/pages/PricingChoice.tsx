import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PoweredByBadge } from '@/components/PoweredByBadge';

export default function PricingChoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    
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

  const plans = {
    starter: {
      name: 'Starter',
      monthlyPrice: 29,
      annualPrice: 290,
      monthlyPriceId: 'price_1SU6QZ0lE1soQQfxlPVL4Y4o',
      annualPriceId: 'price_1SU6Qa0lE1soQQfxmnrUkvRq',
      features: [
        '1 Klaviyo account',
        '50 pre-built segments',
        'Basic analytics',
        'Email support',
        '10 AI suggestions/month',
      ],
    },
    professional: {
      name: 'Professional',
      monthlyPrice: 79,
      annualPrice: 790,
      monthlyPriceId: 'price_1SU6Qc0lE1soQQfxhAc7VuLn',
      annualPriceId: 'price_1SU6Qd0lE1soQQfxReyLn2ka',
      popular: true,
      features: [
        'Everything in Starter',
        '70+ pre-built segments',
        'Advanced analytics',
        'Priority email support',
        'Unlimited AI suggestions',
        'Custom segment creation',
        'Export capabilities',
        'Real-time sync',
      ],
    },
    growth: {
      name: 'Growth',
      monthlyPrice: 149,
      annualPrice: 1490,
      monthlyPriceId: 'price_1SU6Qe0lE1soQQfx0v5Q3jka',
      annualPriceId: 'price_1SU6Qf0lE1soQQfxhhpZP4nq',
      features: [
        'Everything in Professional',
        '2 Klaviyo accounts',
        'White-label reports',
        'API access',
        'Dedicated success manager',
        'Custom integrations',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
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
          <p className="text-xl text-muted-foreground mb-8">
            Select the billing cycle that works best for you
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-card rounded-full border-2 border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plans.starter.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">
                    ${billingCycle === 'monthly' ? plans.starter.monthlyPrice : plans.starter.annualPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-primary font-semibold">
                    Save ${(plans.starter.monthlyPrice * 12) - plans.starter.annualPrice} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plans.starter.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(
                  billingCycle === 'monthly' ? plans.starter.monthlyPriceId : plans.starter.annualPriceId,
                  'starter'
                )}
                disabled={loading !== null}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {loading === 'starter' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative border-2 border-primary hover:border-primary/80 transition-all shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 fill-white" />
                MOST POPULAR
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plans.professional.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${billingCycle === 'monthly' ? plans.professional.monthlyPrice : plans.professional.annualPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-primary font-semibold">
                    Save ${(plans.professional.monthlyPrice * 12) - plans.professional.annualPrice} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plans.professional.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(
                  billingCycle === 'monthly' ? plans.professional.monthlyPriceId : plans.professional.annualPriceId,
                  'professional'
                )}
                disabled={loading !== null}
                className="w-full"
                size="lg"
              >
                {loading === 'professional' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Growth Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plans.growth.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">
                    ${billingCycle === 'monthly' ? plans.growth.monthlyPrice : plans.growth.annualPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-primary font-semibold">
                    Save ${(plans.growth.monthlyPrice * 12) - plans.growth.annualPrice} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plans.growth.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(
                  billingCycle === 'monthly' ? plans.growth.monthlyPriceId : plans.growth.annualPriceId,
                  'growth'
                )}
                disabled={loading !== null}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {loading === 'growth' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
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
