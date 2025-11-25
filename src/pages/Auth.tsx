import { useState, useEffect } from "react";
import { Building2, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorLogger } from "@/lib/errorLogger";

interface AuthProps {
  onComplete?: (user: any) => void;
  initialView?: "signup" | "signin";
}

export default function Auth({ onComplete, initialView = "signup" }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
              account_name: accountName || email.split('@')[0],
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Send welcome email
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to: email,
                template_name: 'welcome',
                template_data: {
                  userName: accountName || email.split('@')[0],
                  accountName: accountName || email.split('@')[0],
                },
                userId: authData.user.id,
              },
            });
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Don't block signup on email error
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
      // Log authentication error
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-10 shadow-xl">
          <div className="text-center mb-8">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Get started with Aderai" : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Business"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <a
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            
            {isSignUp && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Free forever • No credit card required
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
