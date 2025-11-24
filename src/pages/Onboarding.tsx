import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFlow } from "@/components/OnboardingFlow";

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
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed, klaviyo_setup_completed')
        .eq('id', session.user.id)
        .single();

      if (userData?.onboarding_completed && userData?.klaviyo_setup_completed) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
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

  return <OnboardingFlow userId={userId} />;
}
