import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Key, Sparkles, Target } from "lucide-react";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";

interface OnboardingFlowProps {
  userId: string;
}

export const OnboardingFlow = ({ userId }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracking();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent("onboarding_flow_started", { step: currentStep });
  }, []);

  const steps = [
    {
      title: "Welcome to Aderai!",
      description: "Let's get you set up in 3 simple steps",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <Sparkles className="w-16 h-16 mx-auto text-primary" />
            <h3 className="text-2xl font-bold">Welcome to Aderai</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The AI-powered segmentation tool that helps you create high-converting email segments in minutes, not hours.
            </p>
          </div>
          <div className="grid gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">AI-Powered Suggestions</h4>
                <p className="text-sm text-muted-foreground">
                  Get intelligent segment recommendations based on your business goals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">One-Click Deployment</h4>
                <p className="text-sm text-muted-foreground">
                  Create segments in Klaviyo instantly with a single click
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Performance Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Track segment performance and optimize your email marketing
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Connect Klaviyo",
      description: "Link your Klaviyo account to get started",
      icon: Key,
      content: (
        <div className="space-y-4 text-center">
          <Key className="w-16 h-16 mx-auto text-primary" />
          <h3 className="text-2xl font-bold">Connect Your Klaviyo Account</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We'll need your Klaviyo API key to create and manage segments on your behalf.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2 max-w-md mx-auto">
            <h4 className="font-semibold text-sm">How to get your API key:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Log in to your Klaviyo account</li>
              <li>Go to Settings → API Keys</li>
              <li>Create a new Private API Key</li>
              <li>Copy and paste it in the next step</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Ready to create your first segment",
      icon: Target,
      content: (
        <div className="space-y-4 text-center">
          <Target className="w-16 h-16 mx-auto text-primary" />
          <h3 className="text-2xl font-bold">You're Ready to Go!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your Klaviyo account is connected. Let's create your first high-converting segment!
          </p>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg max-w-md mx-auto">
            <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Start with our AI-powered segment suggestions to quickly identify your most valuable customer groups.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      trackEvent("onboarding_klaviyo_connect_clicked");
      navigate("/klaviyo-setup");
      return;
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      trackEvent("onboarding_step_completed", { step: currentStep, next_step: nextStep });
    } else {
      trackEvent("onboarding_flow_completed");
      navigate("/dashboard");
    }
  };

  const handleSkip = async () => {
    trackEvent("onboarding_flow_skipped", { step: currentStep });
    navigate("/dashboard");
  };

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-card/80 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index + 1 === currentStep
                      ? "w-8 bg-primary"
                      : index + 1 < currentStep
                      ? "w-2 bg-primary"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <CardTitle className="text-center">{currentStepData.title}</CardTitle>
          <CardDescription className="text-center">{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip for now
            </Button>
            <Button onClick={handleNext} disabled={loading} className="flex-1">
              {currentStep === 2 ? "Connect Klaviyo" : currentStep === steps.length ? "Go to Dashboard" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
