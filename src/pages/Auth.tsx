import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SignInCard } from "@/components/ui/sign-in-card";
import { ErrorLogger } from "@/lib/errorLogger";

interface AuthProps {
  onComplete?: (user: any) => void;
  initialView?: "signup" | "signin";
}

export default function Auth({ onComplete, initialView = "signup" }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === "signup");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (email: string, password: string, firstName?: string, brandName?: string) => {
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: firstName || '',
              account_name: brandName || email.split('@')[0],
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: email,
                userName: firstName || email.split('@')[0],
                accountType: 'brand',
                userId: authData.user.id,
              },
            });
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }

          // Award "Beta Pioneer" achievement
          try {
            const { data: achievement } = await supabase
              .from('achievements')
              .select('id')
              .eq('criteria_type', 'beta_user')
              .single();

            if (achievement) {
              await supabase
                .from('user_achievements')
                .insert({
                  user_id: authData.user.id,
                  achievement_id: achievement.id
                });
            }
          } catch (achievementError) {
            console.error('Error awarding beta achievement:', achievementError);
          }

          toast({
            title: "Account created!",
            description: "Welcome to Aderai",
          });
          navigate('/onboarding');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      await ErrorLogger.logAuthError(
        error, 
        isSignUp ? 'signup' : 'signin'
      );
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInCard
      isSignUp={isSignUp}
      onToggleMode={() => setIsSignUp(!isSignUp)}
      onSubmit={handleAuth}
      isLoading={loading}
    />
  );
}
