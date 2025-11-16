import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
  loading: boolean;
}

export const PRODUCTS = {
  // Legacy (keeping for backward compatibility)
  MONTHLY: 'prod_TQxxNSSeWmdV78',
  ANNUAL: 'prod_TQy36zS2cBQfNA',
  
  // Starter Tier
  STARTER_MONTHLY: 'prod_TQyNYayWcak1LD',
  STARTER_ANNUAL: 'prod_TQyNhOary22G61',
  
  // Professional Tier
  PROFESSIONAL_MONTHLY: 'prod_TQyNqTuT8G0VQQ',
  PROFESSIONAL_ANNUAL: 'prod_TQyN4QXXAVxorC',
  
  // Growth Tier
  GROWTH_MONTHLY: 'prod_TQyN8YoV6GSIQJ',
  GROWTH_ANNUAL: 'prod_TQyNcyCFBy9N4I',
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    loading: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({ subscribed: false, loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        setSubscription({ subscribed: false, loading: false });
        return;
      }

      setSubscription({
        subscribed: data?.subscribed || false,
        product_id: data?.product_id,
        subscription_end: data?.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setSubscription({ subscribed: false, loading: false });
    }
  }, []);

  const requireSubscription = useCallback((showToast = true) => {
    if (!subscription.loading && !subscription.subscribed) {
      if (showToast) {
        toast({
          title: "Subscription Required",
          description: "Please complete your payment to access this feature.",
          variant: "destructive",
        });
      }
      navigate('/pricing-choice');
      return false;
    }
    return true;
  }, [subscription, navigate, toast]);

  useEffect(() => {
    checkSubscription();

    // Refresh subscription status every 30 seconds
    const interval = setInterval(checkSubscription, 30000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  // Determine tier and billing
  const isStarter = subscription.product_id === PRODUCTS.STARTER_MONTHLY || subscription.product_id === PRODUCTS.STARTER_ANNUAL;
  const isProfessional = subscription.product_id === PRODUCTS.PROFESSIONAL_MONTHLY || subscription.product_id === PRODUCTS.PROFESSIONAL_ANNUAL || subscription.product_id === PRODUCTS.MONTHLY || subscription.product_id === PRODUCTS.ANNUAL;
  const isGrowth = subscription.product_id === PRODUCTS.GROWTH_MONTHLY || subscription.product_id === PRODUCTS.GROWTH_ANNUAL;
  
  const isMonthly = [PRODUCTS.STARTER_MONTHLY, PRODUCTS.PROFESSIONAL_MONTHLY, PRODUCTS.GROWTH_MONTHLY, PRODUCTS.MONTHLY].includes(subscription.product_id || '');
  const isAnnual = [PRODUCTS.STARTER_ANNUAL, PRODUCTS.PROFESSIONAL_ANNUAL, PRODUCTS.GROWTH_ANNUAL, PRODUCTS.ANNUAL].includes(subscription.product_id || '');

  return {
    ...subscription,
    checkSubscription,
    requireSubscription,
    isMonthly,
    isAnnual,
    isStarter,
    isProfessional,
    isGrowth,
    tier: isStarter ? 'starter' : isProfessional ? 'professional' : isGrowth ? 'growth' : 'unknown',
  };
}
