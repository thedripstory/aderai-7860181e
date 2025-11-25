import { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: email,
                userName: accountName || email.split('@')[0],
                accountType: 'brand',
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block group">
            <div className="text-4xl font-playfair font-bold tracking-tight hover:scale-105 transition-transform duration-300">
              aderai<span className="text-accent group-hover:animate-pulse">.</span>
            </div>
          </a>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "Get started with Aderai for free" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="accountName"
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="My Business"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
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
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-12"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold group"
                size="lg"
              >
                {loading ? (
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 border-2 border-transparent border-t-primary-foreground border-r-primary-foreground rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              
              {isSignUp && (
                <p className="text-xs text-muted-foreground text-center">
                  Free forever • No credit card required
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <span className="text-primary font-medium hover:underline">
                  {isSignUp ? "Sign in" : "Sign up"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
