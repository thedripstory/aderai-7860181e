import { useState, useEffect } from "react";
import { Building2, Users, ArrowRight } from "lucide-react";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { CircleDoodle } from "@/components/CircleDoodle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthProps {
  onComplete: (user: any) => void;
  initialView?: "choice" | "brand-signup" | "agency-signup";
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
  const navigate = useNavigate();

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
      // Check if user already exists first
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

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
        // Handle specific error cases
        if (signUpError.message.includes("already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(signUpError.message);
        }
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
          // Don't block signup if user insert fails, auth user is already created
        }

        // Clear stored referral code
        localStorage.removeItem('aderai_ref');

        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: authData.user.email,
              userName: accountName,
              accountType: authView.includes("agency") ? "agency" : "brand",
              userId: authData.user.id
            }
          });
        } catch (emailError) {
          console.error("Welcome email error:", emailError);
          // Don't block signup if email fails
        }

        toast({
          title: "Account created!",
          description: "Check your email for a welcome message and to confirm your account.",
        });
        
        // Verify onboarding_completed before redirecting
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', authData.user.id)
          .single();

        if (userData?.onboarding_completed) {
          // Already onboarded, go to dashboard
          const accountType = authView.includes("agency") ? "agency" : "brand";
          navigate(accountType === "agency" ? "/agency-dashboard" : "/dashboard");
        } else {
          // Need onboarding
          const accountType = authView.includes("agency") ? "agency" : "brand";
          navigate(`/onboarding/${accountType}`);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Elegant Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-6">
              <h1 className="text-6xl md:text-7xl font-playfair font-bold tracking-tight">
                aderai<span className="text-primary">.</span>
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-2 opacity-30" />
            </div>
            <p className="text-xl text-muted-foreground font-light max-w-md mx-auto">
              AI-powered segmentation for modern marketers
            </p>
            
            {referralCode && (
              <div className="mt-6 inline-block bg-primary/10 border border-primary/20 rounded-full px-6 py-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-sm text-primary font-medium">
                  🎁 Referred by: {referralCode}
                </p>
              </div>
            )}
          </div>

          {/* Account Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Brand Account */}
            <button
              onClick={() => setAuthView("brand-signup")}
              className="group relative bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary rounded-3xl p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 text-left animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="absolute top-6 right-6">
                <span className="text-xs bg-primary/10 text-primary px-4 py-1.5 rounded-full font-semibold">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Brand</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Perfect for single brands looking to elevate their email marketing strategy
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/one-time</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                  70 pre-built segments
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                  AI segment suggester
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                  Advanced analytics
                </li>
              </ul>

              <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Agency Account */}
            <button
              onClick={() => setAuthView("agency-signup")}
              className="group relative bg-card/50 backdrop-blur-sm border-2 border-border hover:border-accent rounded-3xl p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1 text-left animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Agency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Manage multiple clients effortlessly with our agency plan
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$89</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3" />
                  Everything in Brand
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3" />
                  Multiple client accounts
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3" />
                  Priority support
                </li>
              </ul>

              <div className="flex items-center text-accent font-semibold group-hover:gap-3 gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="text-muted-foreground mb-4">Already have an account?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/brand-login")}
                  className="px-6 py-2 rounded-full border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-primary font-medium"
                >
                  Brand Sign In
                </button>
                <button
                  onClick={() => navigate("/agency-login")}
                  className="px-6 py-2 rounded-full border border-accent/20 hover:border-accent hover:bg-accent/5 transition-all text-accent font-medium"
                >
                  Agency Sign In
                </button>
              </div>
            </div>
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </a>
            <div className="pt-4">
              <PoweredByBadge />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Forms Only
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => setAuthView("choice")}
          className="text-muted-foreground hover:text-foreground mb-8 flex items-center gap-2 transition-all hover:gap-3"
        >
          ← Back to account selection
        </button>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-10 shadow-xl animate-fade-in">
          {/* Elegant Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <h1 className="text-4xl font-playfair font-bold">
                aderai<span className="text-primary">.</span>
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-1 opacity-30" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Create your account</h2>
            <p className="text-muted-foreground text-sm">
              {authView.includes("brand") ? "Brand Account" : "Agency Account"}
            </p>
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
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : "Create Account"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="text-center">
              <button
                onClick={() => {
                  if (authView === "brand-signup") navigate("/brand-login");
                  else if (authView === "agency-signup") navigate("/agency-login");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account?{" "}
                <span className={authView.includes("brand") ? "text-primary font-semibold" : "text-accent font-semibold"}>
                  Sign in
                </span>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => {
                  if (authView.includes("brand")) {
                    setAuthView("agency-signup");
                  } else {
                    setAuthView("brand-signup");
                  }
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Looking for {authView.includes("brand") ? "Agency" : "Brand"} account? <span className={authView.includes("brand") ? "text-accent font-semibold" : "text-primary font-semibold"}>Switch here</span>
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
