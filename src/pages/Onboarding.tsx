import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { toast } from "sonner";

export default function Onboarding() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if user has already completed onboarding
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_completed, klaviyo_setup_completed')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast.error('Error loading onboarding status. Please refresh the page.');
        setLoading(false);
        return;
      }

      if (!userData) {
        console.error('User profile not found in onboarding');
        toast.error('Profile not found. Please contact support at akshat@aderai.io');
        navigate('/login');
        return;
      }

      if (userData.onboarding_completed && userData.klaviyo_setup_completed) {
        navigate('/dashboard');
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <PageErrorBoundary pageName="Onboarding">
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="group flex items-center gap-3">
              <div className="text-3xl font-playfair font-bold tracking-tight hover:scale-105 transition-transform duration-300">
                aderai<span className="text-accent group-hover:animate-pulse">.</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <OnboardingFlow userId={userId} />
    </div>
    </PageErrorBoundary>
  );
}
