import { useState } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function BrandLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

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
              <h1 className="text-5xl font-playfair font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                aderai<span className="text-primary">.</span>
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-2 opacity-30" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Brand Login</h2>
            <p className="text-muted-foreground text-sm">
              Welcome back to your account
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-6 animate-fade-in">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="text-center">
              <button
                onClick={() => navigate("/signup")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Don't have an account? <span className="text-primary font-semibold">Sign up</span>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate("/agency-login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Looking for Agency Login? <span className="text-accent font-semibold">Switch here</span>
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
