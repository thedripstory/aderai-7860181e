import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { OnboardingSkipOption } from "@/components/OnboardingSkipOption";
import {
  Building2,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function BrandOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Form data
  const [industry, setIndustry] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [emailListSize, setEmailListSize] = useState("");
  const [goals, setGoals] = useState("");
  const [currentChallenges, setCurrentChallenges] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/signup");
      return;
    }
    setUser(user);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!user) {
        navigate("/signup");
        return;
      }

      // Save onboarding data to users table
      const { error } = await supabase
        .from("users")
        .update({
          industry,
          monthly_revenue_range: monthlyRevenue,
          email_list_size_range: emailListSize,
          marketing_goals: goals,
          current_challenges: currentChallenges,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving onboarding data:", error);
        toast({
          title: "Error",
          description: "Failed to save onboarding data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Let's set up your Klaviyo integration.",
      });

      // Navigate to Brand Dashboard
      navigate("/brand-dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-playfair font-bold">
              Welcome to aderai<span className="text-primary">.</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Let's personalize your experience
          </p>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === currentStep
                    ? "w-12 bg-primary"
                    : step < currentStep
                    ? "w-8 bg-primary/60"
                    : "w-8 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-10 shadow-xl animate-fade-in">
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tell us about your brand</h2>
                  <p className="text-muted-foreground text-sm">Help us understand your business</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">What industry are you in?</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="E.g., Fashion, Beauty, Home & Garden"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="revenue">Approximate monthly revenue</Label>
                  <select
                    id="revenue"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select range</option>
                    <option value="0-10k">$0 - $10,000</option>
                    <option value="10k-50k">$10,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-500k">$100,000 - $500,000</option>
                    <option value="500k+">$500,000+</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="listSize">Email list size</Label>
                  <select
                    id="listSize"
                    value={emailListSize}
                    onChange={(e) => setEmailListSize(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select range</option>
                    <option value="0-1k">0 - 1,000</option>
                    <option value="1k-5k">1,000 - 5,000</option>
                    <option value="5k-10k">5,000 - 10,000</option>
                    <option value="10k-50k">10,000 - 50,000</option>
                    <option value="50k+">50,000+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">What are your goals?</h2>
                  <p className="text-muted-foreground text-sm">Let's align Aderai with your objectives</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="goals">Primary marketing goals</Label>
                  <Textarea
                    id="goals"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="E.g., Increase repeat purchases, improve customer retention, boost AOV..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="challenges">Current challenges</Label>
                  <Textarea
                    id="challenges"
                    value={currentChallenges}
                    onChange={(e) => setCurrentChallenges(e.target.value)}
                    placeholder="What are your biggest email marketing challenges right now?"
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ready to Go */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3">You're all set!</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Ready to revolutionize your email segmentation with AI
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">70+ Pre-built Segments</p>
                    <p className="text-sm text-muted-foreground">Ready to deploy in your Klaviyo account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">AI Segment Suggester</p>
                    <p className="text-sm text-muted-foreground">Get personalized segment recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Advanced Analytics</p>
                    <p className="text-sm text-muted-foreground">Track performance and optimize campaigns</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                Back
              </Button>
            ) : (
              <div className="flex items-center">
                <OnboardingSkipOption />
              </div>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                className="ml-auto"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? "Setting up..." : "Go to Dashboard"}
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <PoweredByBadge />
        </div>
      </div>
    </div>
  );
}
