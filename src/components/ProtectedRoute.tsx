import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorLogger } from '@/lib/errorLogger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

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
            
            // Check subscription status
            if (profile) {
              const isActive = profile.subscription_status === 'active' || 
                               profile.subscription_status === 'trialing';
              setHasActiveSubscription(isActive);
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
              
              // Check subscription status
              if (profile) {
                const isActive = profile.subscription_status === 'active' || 
                                 profile.subscription_status === 'trialing';
                setHasActiveSubscription(isActive);
              }
            } catch (err) {
              await ErrorLogger.logError(err as Error, {
                context: 'Auth state change profile check failed',
              });
              setHasProfile(false);
            }
          });
        } else {
          setHasProfile(null);
          setHasActiveSubscription(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

  // Still checking auth, profile, or subscription
  if (isAuthenticated === null || (isAuthenticated && hasProfile === null) || (isAuthenticated && hasProfile && hasActiveSubscription === null)) {
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

  // Authenticated but no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-md mx-auto p-8 bg-card rounded-2xl border border-border shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Subscription Required</h2>
          <p className="text-muted-foreground mb-6">
            To access Aderai, please complete your subscription setup.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isCheckingSubscription}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold mb-3 disabled:opacity-50"
          >
            {isCheckingSubscription ? 'Setting up...' : 'Complete Subscription - $9/month'}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Authenticated with profile and active subscription, render children
  return <>{children}</>;
}
