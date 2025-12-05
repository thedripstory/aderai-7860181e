import { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorLogger } from '@/lib/errorLogger';
import { CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isVerifyingWithStripe, setIsVerifyingWithStripe] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if email has free access (bypass subscription)
  const hasFreeAccess = userEmail?.toLowerCase().endsWith('@thedripstory.com') ?? false;

  // Verify subscription directly with Stripe (safety net for webhook delays)
  const verifyWithStripe = useCallback(async () => {
    setIsVerifyingWithStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-check-subscription');
      
      if (error) {
        ErrorLogger.logError(error, { context: 'Stripe verification failed' });
        return false;
      }
      
      if (data?.subscribed) {
        // Stripe says active! Update local state
        setSubscriptionStatus('active');
        toast.success('Payment confirmed! Welcome to Aderai.');
        
        // Clear the payment=success param to prevent re-verification on refresh
        searchParams.delete('payment');
        setSearchParams(searchParams, { replace: true });
        
        return true;
      }
      
      return false;
    } catch (err) {
      ErrorLogger.logError(err as Error, { context: 'Stripe verification error' });
      return false;
    } finally {
      setIsVerifyingWithStripe(false);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);

      // Check if user has profile
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('id, subscription_status')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            await ErrorLogger.logError(error, {
              context: 'Error checking user profile',
              userId: session.user.id,
            });
            setHasProfile(false);
            
            // Log orphan user detection
            await supabase.from('analytics_events').insert({
              user_id: session.user.id,
              event_name: 'orphan_user_detected',
              event_metadata: {
                email: session.user.email,
                detected_at: new Date().toISOString(),
                error: error.message,
              }
            });

            toast.error('Profile not found. Please contact support at akshat@aderai.io', {
              duration: 10000,
            });
          } else {
            setHasProfile(!!profile);
            const dbStatus = profile?.subscription_status || 'inactive';
            setSubscriptionStatus(dbStatus);
            
            // Safety net: If coming from Stripe checkout and DB shows inactive,
            // verify directly with Stripe (webhook may not have processed yet)
            const paymentParam = searchParams.get('payment');
            if (paymentParam === 'success' && dbStatus !== 'active' && dbStatus !== 'trialing') {
              // Give webhook 2.5 seconds to process first
              const verifyWithRetries = async (attempt = 1, maxAttempts = 4) => {
                const verified = await verifyWithStripe();
                if (verified) return;
                
                if (attempt < maxAttempts) {
                  // Exponential backoff: 2s, 4s, 6s
                  const delay = attempt * 2000;
                  toast.info(`Verifying payment... (attempt ${attempt}/${maxAttempts})`, {
                    duration: delay - 500,
                  });
                  setTimeout(() => verifyWithRetries(attempt + 1, maxAttempts), delay);
                } else {
                  toast.error('Payment verification taking longer than expected. Click "Check Payment Status" to retry.', {
                    duration: 8000,
                  });
                }
              };
              
              setTimeout(() => verifyWithRetries(), 2500);
            } else if (paymentParam === 'success' && (dbStatus === 'active' || dbStatus === 'trialing')) {
              // Payment already processed by webhook, show success and clean URL
              toast.success('Payment confirmed! Welcome to Aderai.');
              searchParams.delete('payment');
              searchParams.delete('session_id');
              setSearchParams(searchParams, { replace: true });
            }
          }
        } catch (err) {
          await ErrorLogger.logError(err as Error, {
            context: 'Profile check failed',
          });
          setHasProfile(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email || null);
        
        if (session?.user) {
          // Use queueMicrotask to defer profile check and avoid Supabase auth deadlock
          queueMicrotask(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('users')
                .select('id, subscription_status')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                await ErrorLogger.logError(error, {
                  context: 'Profile check error during auth change',
                  userId: session.user.id,
                });
                await supabase.from('analytics_events').insert({
                  user_id: session.user.id,
                  event_name: 'orphan_user_auth_change',
                  event_metadata: {
                    email: session.user.email,
                    error: error.message,
                  }
                });
              }
              
              setHasProfile(!!profile);
              setSubscriptionStatus(profile?.subscription_status || 'inactive');
            } catch (err) {
              await ErrorLogger.logError(err as Error, {
                context: 'Auth state change profile check failed',
              });
              setHasProfile(false);
            }
          });
        } else {
          setHasProfile(null);
          setSubscriptionStatus(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams, verifyWithStripe]);

  const handleSubscribe = async () => {
    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      toast.error('Error setting up payment. Please try again.');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleUpdatePayment = async () => {
    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-portal-session', {
        body: { origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      toast.error('Error opening billing portal. Please try again.');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setIsCheckingSubscription(true);
    const verified = await verifyWithStripe();
    setIsCheckingSubscription(false);
    
    if (!verified) {
      toast.error('Subscription not found. Please complete payment or contact support.');
    }
  };

  // Still checking auth, profile, or subscription
  if (isAuthenticated === null || (isAuthenticated && hasProfile === null) || (isAuthenticated && hasProfile && subscriptionStatus === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          </div>
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no profile (orphan user)
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg border border-border shadow-lg">
          <h2 className="text-xl font-bold text-destructive mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Your user profile could not be found. This is a rare issue that our team has been notified about.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Please contact support at <strong>akshat@aderai.io</strong> to resolve this issue.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Check for active subscription (active or trialing) or free access for whitelisted domains
  const hasActiveSubscription = hasFreeAccess || subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  // Past due subscription - payment failed (skip for free access users)
  if (!hasFreeAccess && subscriptionStatus === 'past_due') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-md mx-auto p-8 bg-card rounded-2xl border border-border shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            Your last payment didn't go through. Please update your payment method to continue using Aderai.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleUpdatePayment}
              disabled={isCheckingSubscription}
              className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {isCheckingSubscription ? 'Opening...' : 'Update Payment Method'}
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isCheckingSubscription}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              {isCheckingSubscription ? 'Setting up...' : 'Retry Payment'}
            </button>
            <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1 mt-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Payments securely processed by The Drip Story FZE LLC
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but no active subscription (inactive, canceled, etc.)
  if (!hasActiveSubscription) {
    // Check if we're currently verifying with Stripe (coming from checkout)
    const isComingFromCheckout = searchParams.get('payment') === 'success';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-md mx-auto p-8 bg-card rounded-2xl border border-border shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            {isVerifyingWithStripe ? (
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
            ) : (
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {isVerifyingWithStripe 
              ? 'Verifying Payment...' 
              : isComingFromCheckout 
                ? 'Payment Processing' 
                : subscriptionStatus === 'canceled' 
                  ? 'Subscription Ended' 
                  : 'Subscription Required'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isVerifyingWithStripe 
              ? 'Please wait while we confirm your payment with Stripe...'
              : isComingFromCheckout
                ? 'Your payment is being processed. This usually takes a few seconds.'
                : subscriptionStatus === 'canceled' 
                  ? 'Your subscription has been canceled. Resubscribe to regain access to Aderai.'
                  : 'To access Aderai, please complete your subscription setup.'}
          </p>
          
          {isComingFromCheckout && !isVerifyingWithStripe && (
            <button
              onClick={handleRefreshSubscription}
              disabled={isCheckingSubscription}
              className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors font-semibold mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingSubscription ? 'animate-spin' : ''}`} />
              {isCheckingSubscription ? 'Checking...' : 'Check Payment Status'}
            </button>
          )}
          
          {!isVerifyingWithStripe && (
            <>
              <button
                onClick={handleSubscribe}
                disabled={isCheckingSubscription}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold mb-3 disabled:opacity-50"
              >
                {isCheckingSubscription ? 'Setting up...' : subscriptionStatus === 'canceled' ? 'Resubscribe - $9/month' : isComingFromCheckout ? 'Try Again - $9/month' : 'Complete Subscription - $9/month'}
              </button>
              <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1 mb-3">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Payments securely processed by The Drip Story FZE LLC
              </p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Authenticated with profile and active subscription, render children
  return <>{children}</>;
}
