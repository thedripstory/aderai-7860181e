import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // Check if user has profile
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking user profile:', error);
          setHasProfile(false);
          
          // Log orphan user detection
          await supabase.from('analytics_events').insert({
            user_id: session.user.id,
            event_name: 'orphan_user_detected',
            event_metadata: {
              email: session.user.email,
              detected_at: new Date().toISOString(),
            }
          });

          toast.error('Profile not found. Please contact support at akshat@aderai.io', {
            duration: 10000,
          });
        } else {
          setHasProfile(!!profile);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // Defer profile check to avoid Supabase deadlock
      if (session?.user) {
        queueMicrotask(async () => {
          const { data: profile, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Profile check error:', error);
            setHasProfile(false);
          } else {
            setHasProfile(!!profile);
          }
        });
      } else {
        setHasProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking auth or profile
  if (isAuthenticated === null || (isAuthenticated && hasProfile === null)) {
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

  // Authenticated with profile, render children
  return <>{children}</>;
}
