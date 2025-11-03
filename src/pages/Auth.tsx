import { useState, useEffect } from "react";
import { Building2, Users, Sparkles, Zap } from "lucide-react";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { CircleDoodle } from "@/components/CircleDoodle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthProps {
  onComplete: (user: any) => void;
  initialView?: "choice" | "brand-signup" | "agency-signup" | "brand-login" | "agency-login";
}

export default function Auth({ onComplete, initialView = "choice" }: AuthProps) {
  const [authView, setAuthView] = useState(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Capture referral code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('aderai_ref', ref);
      
      // Track the affiliate click
      trackAffiliateClick(ref);
    } else {
      // Check if we have a stored referral code
      const storedRef = localStorage.getItem('aderai_ref');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, []);

  const trackAffiliateClick = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-track-click', {
        body: {
          affiliateCode: code,
          referrer: document.referrer || null,
        },
      });

      if (error) {
        console.error('Failed to track affiliate click:', error);
      } else {
        console.log('Affiliate click tracked:', data);
      }
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const handleAuth = async () => {
    // Input validation using basic checks (Zod would be better for production)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email?.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (authView.includes("signup") && !accountName?.trim()) {
      setError("Please enter your account name");
      return;
    }

    if (authView.includes("signup") && accountName.length > 100) {
      setError("Account name is too long (max 100 characters)");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      if (authView.includes("signup")) {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: {
              account_name: accountName,
              account_type: authView.includes("agency") ? "agency" : "brand",
              referred_by: referralCode || null,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          // Insert user into users table with referral code
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              password_hash: 'handled_by_auth',
              account_name: accountName,
              account_type: authView.includes("agency") ? "agency" : "brand",
              referred_by: referralCode || null,
              email_verified: false,
            });

          if (insertError) {
            console.error('Error inserting user:', insertError);
          }

          // Clear stored referral code
          localStorage.removeItem('aderai_ref');

          toast({
            title: "Account created!",
            description: "Welcome to Aderai. Check your email to verify your account.",
          });
          
          // User is now authenticated via Supabase - no localStorage needed
          onComplete(authData.user);
        }
      } else {
        // Sign in
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
          
          // User is now authenticated via Supabase - no localStorage needed
          onComplete(authData.user);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // Choice View
  if (authView === "choice") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Futuristic background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="w-full max-w-lg relative z-10">
          <div className="text-center mb-12">
            {/* Futuristic Klaviyo 10x Logo */}
            <div className="relative inline-block mb-6 group">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
              
              {/* Logo container with glass effect */}
              <div className="relative bg-background/80 backdrop-blur-xl border-2 border-primary/30 rounded-3xl p-6 shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-105">
                <img 
                  src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png" 
                  alt="Klaviyo" 
                  className="h-12 w-auto mx-auto mb-2 animate-fade-in"
                />
                
                {/* 10x Badge with special effects */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-md opacity-50" />
                  <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-4xl font-black tracking-wider">10X</span>
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
                
                {/* Subtitle with glow */}
                <p className="text-sm font-semibold mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
                  Next-Gen Segmentation Platform
                </p>
              </div>
              
              {/* Orbiting particles */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '0 80px' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent animate-[spin_4s_linear_infinite_reverse]" style={{ transformOrigin: '0 80px', animationDelay: '1.5s' }} />
            </div>

            <p className="text-muted-foreground text-xl mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Choose your account type
            </p>
            {referralCode && (
              <div className="inline-block bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-sm text-primary font-semibold">
                  🎁 Referred by: {referralCode}
                </p>
              </div>
            )}
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <PoweredByBadge />
            </div>
          </div>

          <div className="grid gap-6">
            <button
              onClick={() => setAuthView("brand-signup")}
              className="bg-card border-2 border-primary rounded-2xl p-8 hover:shadow-lg transition text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <Building2 className="w-10 h-10 text-primary" />
                <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Brand</h3>
              <p className="text-muted-foreground mb-4">Perfect for single brands and businesses</p>
              <div className="text-3xl font-bold mb-4">
                <CircleDoodle>$49</CircleDoodle>
                <span className="text-base text-muted-foreground font-normal">/one-time</span>
              </div>
              <div className="text-sm text-muted-foreground">• 70 segments • AI suggester • Analytics</div>
            </button>

            <button
              onClick={() => setAuthView("agency-signup")}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <Users className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <p className="text-muted-foreground mb-4">Manage multiple clients effortlessly</p>
              <div className="text-3xl font-bold mb-4">
                $89<span className="text-base text-muted-foreground font-normal">/month</span>
              </div>
              <div className="text-sm text-muted-foreground">• Everything in Brand • Multiple clients</div>
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => setAuthView("brand-login")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Already have an account? <span className="text-accent font-semibold">Sign in</span>
            </button>
            <br />
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup Forms
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => setAuthView("choice")}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 transition-all hover:gap-3"
        >
          ← Back
        </button>

        <div className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-8 shadow-2xl hover:shadow-primary/10 transition-all animate-fade-in">
          <div className="text-center mb-8">
            {/* Futuristic Klaviyo 10x Logo for login */}
            <div className="relative inline-block mb-4 group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative bg-background/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-4">
                <img 
                  src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png" 
                  alt="Klaviyo" 
                  className="h-8 w-auto mx-auto mb-1"
                />
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    10X
                  </span>
                  <Sparkles className="w-3 h-3 text-accent" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {authView.includes("signup") ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground">
              {authView.includes("brand") ? "Brand Account" : "Agency Account"}
            </p>
            <div className="mt-4">
              <PoweredByBadge />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-6">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {authView.includes("signup") && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {authView.includes("brand") ? "Brand Name" : "Agency Name"}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={authView.includes("brand") ? "My Brand" : "My Agency"}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-bold hover:bg-primary/90 transition disabled:opacity-50 shadow-lg"
            >
              {loading ? "Please wait..." : authView.includes("signup") ? "Create Account" : "Sign In"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (authView === "brand-signup") setAuthView("brand-login");
                else if (authView === "brand-login") setAuthView("brand-signup");
                else if (authView === "agency-signup") setAuthView("agency-login");
                else if (authView === "agency-login") setAuthView("agency-signup");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {authView.includes("signup") ? "Already have an account? " : "Need an account? "}
              <span className="text-accent font-semibold">
                {authView.includes("signup") ? "Sign in" : "Sign up"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
