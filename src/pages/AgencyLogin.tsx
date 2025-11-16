import { useState, useEffect } from "react";
import { Users, ArrowRight } from "lucide-react";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AgencyLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if this is a password reset callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsSettingNewPassword(true);
      toast({
        title: "Set New Password",
        description: "Please enter your new password below.",
      });
    }
  }, []);

  const handleSetNewPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully reset. Please sign in.",
      });

      setIsSettingNewPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, "/agency-login");
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

  const handlePasswordReset = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!resetEmail?.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!emailRegex.test(resetEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/agency-login`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      
      setShowPasswordReset(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email?.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('aderai_remember', 'true');
        }

        // Check user completion status
        const { data: userData } = await supabase
          .from("users")
          .select("onboarding_completed, account_type")
          .eq("id", authData.user.id)
          .single();

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        // Route based on completion status
        if (!userData?.onboarding_completed) {
          navigate("/onboarding/agency");
        } else {
          navigate("/app");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-bold mb-2">Reset Password</h3>
            <p className="text-muted-foreground mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@agency.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetEmail("");
                  }}
                  disabled={resetLoading}
                  className="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="flex-1 bg-accent text-accent-foreground px-4 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 shadow-lg"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground mb-8 flex items-center gap-2 transition-all hover:gap-3"
        >
          ← Back to home
        </button>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-10 shadow-xl animate-fade-in">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <h1 className="text-5xl font-playfair font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-accent">
                aderai<span className="text-accent">.</span>
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent mt-2 opacity-30" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Agency Login</h2>
            <p className="text-muted-foreground text-sm">
              Welcome back to your agency account
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-6 animate-fade-in">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {isSettingNewPassword ? (
            /* Set New Password Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  onKeyDown={(e) => e.key === 'Enter' && handleSetNewPassword()}
                />
              </div>

              <button
                onClick={handleSetNewPassword}
                disabled={loading}
                className="w-full bg-accent text-accent-foreground font-semibold py-3 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                <button
                  onClick={() => {
                    setShowPasswordReset(true);
                    setResetEmail(email);
                  }}
                  className="text-xs text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-full font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="text-center">
              <button
                onClick={() => navigate("/signup")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Don't have an account? <span className="text-accent font-semibold">Sign up</span>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate("/brand-login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Looking for Brand Login? <span className="text-primary font-semibold">Switch here</span>
              </button>
            </div>
            <div className="flex justify-center">
              <PoweredByBadge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
