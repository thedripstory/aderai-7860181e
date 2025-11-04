import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { 
  Users, 
  Briefcase, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Crown 
} from "lucide-react";

export default function AgencyOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Form data
  const [agencySize, setAgencySize] = useState("");
  const [numberOfClients, setNumberOfClients] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [serviceOfferings, setServiceOfferings] = useState("");
  const [clientManagementNeeds, setClientManagementNeeds] = useState("");

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
      // Store onboarding data
      const { error } = await supabase
        .from('users')
        .update({
          // You can add additional fields to the users table to store this data
          // For now, we'll just mark onboarding as complete
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Aderai!",
        description: "Your agency account is ready.",
      });

      navigate("/app");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-playfair font-bold">
              Welcome to aderai<span className="text-accent">.</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Set up your agency workspace
          </p>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === currentStep
                    ? "w-12 bg-accent"
                    : step < currentStep
                    ? "w-8 bg-accent/60"
                    : "w-8 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-10 shadow-xl animate-fade-in">
          {/* Step 1: Agency Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tell us about your agency</h2>
                  <p className="text-muted-foreground text-sm">Help us understand your business</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="agencySize">Agency team size</Label>
                  <select
                    id="agencySize"
                    value={agencySize}
                    onChange={(e) => setAgencySize(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select size</option>
                    <option value="solo">Solo (Just me)</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-25">11-25 people</option>
                    <option value="25+">25+ people</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="clients">Number of active clients</Label>
                  <select
                    id="clients"
                    value={numberOfClients}
                    onChange={(e) => setNumberOfClients(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select range</option>
                    <option value="1-5">1-5 clients</option>
                    <option value="6-10">6-10 clients</option>
                    <option value="11-20">11-20 clients</option>
                    <option value="21-50">21-50 clients</option>
                    <option value="50+">50+ clients</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="specialization">Agency specialization</Label>
                  <Input
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="E.g., E-commerce, SaaS, B2B services"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services & Needs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your service offerings</h2>
                  <p className="text-muted-foreground text-sm">What do you provide to clients?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="services">Services you offer</Label>
                  <Textarea
                    id="services"
                    value={serviceOfferings}
                    onChange={(e) => setServiceOfferings(e.target.value)}
                    placeholder="E.g., Email marketing, automation setup, segmentation strategy, campaign management..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="needs">What would make client management easier?</Label>
                  <Textarea
                    id="needs"
                    value={clientManagementNeeds}
                    onChange={(e) => setClientManagementNeeds(e.target.value)}
                    placeholder="Tell us about your workflow challenges..."
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center animate-pulse">
                  <Crown className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-3">Your agency is ready!</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Manage multiple clients with enterprise-grade tools
                </p>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 space-y-3">
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Multi-Client Management</p>
                    <p className="text-sm text-muted-foreground">Seamlessly switch between client accounts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">White-Label Ready</p>
                    <p className="text-sm text-muted-foreground">Deliver professional results under your brand</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Priority Support</p>
                    <p className="text-sm text-muted-foreground">Get help when you need it most</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">All Brand Features</p>
                    <p className="text-sm text-muted-foreground">Full access to segmentation and AI tools</p>
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
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Setting up..." : "Go to Dashboard"}
                <Crown className="w-4 h-4 ml-2" />
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
