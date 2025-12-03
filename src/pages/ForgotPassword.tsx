import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset instructions",
      });
    } catch (error: any) {
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
          <a href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img 
              src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/black-logo-png.png" 
              alt="Aderai" 
              className="h-10 w-auto mx-auto dark:invert"
            />
          </a>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="w-fit gap-2 -ml-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription className="text-sm">
                  {emailSent
                    ? "Check your email for reset instructions"
                    : "We'll send you a link to reset your password"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {!emailSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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

                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold">
                  {loading ? (
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 border-2 border-transparent border-t-primary-foreground border-r-primary-foreground rounded-full animate-spin" />
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full h-12"
                >
                  Return to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
