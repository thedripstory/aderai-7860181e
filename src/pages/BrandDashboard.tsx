import React, { useState, useEffect } from "react";
import {
  Building2,
  Settings as SettingsIcon,
  LogOut,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  Key,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { ProductTourModal } from "@/components/ProductTourModal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import { useProductTour } from "@/hooks/useProductTour";
import { useGuidedTour, TourStep } from "@/hooks/useGuidedTour";
import { ErrorLogger } from "@/lib/errorLogger";
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

export default function BrandDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [klaviyoKeysCount, setKlaviyoKeysCount] = useState(0);
  const [segmentsCreated, setSegmentsCreated] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Session timeout monitoring
  const { showWarning, sessionExpiresAt, refreshSession, dismissWarning } = useSessionTimeout();
  
  // Analytics tracking
  const { trackEvent } = useAnalyticsTracking();
  
  // Product tour
  const { showTour, closeTour, dontShowAgain } = useProductTour();
  
  // Guided tour steps
  const tourSteps: TourStep[] = [
    {
      intro: '<h3>Welcome to aderai! 🎉</h3><p>Let\'s take a quick tour of your brand dashboard and show you the key features.</p>',
      title: 'Welcome',
    },
    {
      element: '.ai-segment-card',
      intro: '<h4>AI Segment Suggester</h4><p>This powerful feature analyzes your business and automatically suggests the perfect customer segments tailored to your goals. Click here to start creating segments in seconds!</p>',
      position: 'bottom',
      title: 'AI Segment Suggester',
    },
    {
      element: '.analytics-card',
      intro: '<h4>Analytics Dashboard</h4><p>Track your segment performance with real-time analytics. Monitor growth metrics, engagement rates, and revenue impact all in one place.</p>',
      position: 'bottom',
      title: 'Analytics',
    },
    {
      element: '[data-tour="quick-stats"]',
      intro: '<h4>Quick Stats</h4><p>Get a snapshot of your account status: active Klaviyo integrations, total segments created, and overall account health.</p>',
      position: 'bottom',
      title: 'Dashboard Stats',
    },
    {
      intro: '<h3>You\'re all set! 🚀</h3><p>Start by connecting your Klaviyo account, then let our AI suggest segments tailored to your business. Need help? Click the settings button anytime.</p>',
      title: 'Ready to Go!',
    },
  ];

  const {
    tourEnabled,
    tourCompleted,
    setTourEnabled,
    completeTour,
    skipTour,
    restartTour,
  } = useGuidedTour(tourSteps, 'brand_dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // Soft check for email verification (warn but allow access)
      if (!userData?.email_verified) {
        toast({
          title: "Email Not Verified",
          description: "Please verify your email to unlock all features",
          variant: "default",
        });
      }

      // Verify onboarding and klaviyo setup completion
      if (!userData?.onboarding_completed) {
        navigate("/onboarding/brand");
        return;
      }
      
      if (!userData?.klaviyo_setup_completed) {
        navigate("/klaviyo-setup");
        return;
      }

      setCurrentUser(userData);

      // Load Klaviyo keys count
      const { data: keysData } = await supabase
        .from("klaviyo_keys")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      setKlaviyoKeysCount(keysData?.length || 0);

      // Load AI suggestions count as proxy for segments created
      const { data: suggestionsData } = await supabase
        .from("ai_suggestions")
        .select("id")
        .eq("user_id", user.id);

      setSegmentsCreated(suggestionsData?.length || 0);
      
      // Track dashboard view
      trackEvent('brand_dashboard_view', {
        klaviyo_keys: keysData?.length || 0,
        segments_created: suggestionsData?.length || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      ErrorLogger.logError(error as Error, {
        context: 'BrandDashboard.loadDashboardData',
      });
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4 animate-fade-in">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>
          </div>
          <p className="text-muted-foreground animate-fade-in">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Session Timeout Warning */}
      {showWarning && (
        <SessionTimeoutWarning
          onRefresh={refreshSession}
          onDismiss={dismissWarning}
          expiresAt={sessionExpiresAt}
        />
      )}
      
      {/* Product Tour Modal */}
      {showTour && (
        <ProductTourModal
          onClose={closeTour}
          onDontShowAgain={dontShowAgain}
        />
      )}
      
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Brand Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {currentUser?.account_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {tourCompleted && (
                <Button variant="outline" size="sm" onClick={restartTour}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Restart Tour
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/settings")}>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/login");
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Email Verification Banner */}
        {currentUser && (
          <EmailVerificationBanner
            userEmail={currentUser.email}
            emailVerified={currentUser.email_verified}
            userId={currentUser.id}
          />
        )}

        {/* Onboarding Progress Bar */}
        <OnboardingProgressBar
          emailVerified={currentUser?.email_verified || false}
          klaviyoSetupCompleted={currentUser?.klaviyo_setup_completed || false}
          hasCreatedSegments={segmentsCreated > 0}
        />

        {/* Intro.js Tour */}
        <Steps
          enabled={tourEnabled}
          steps={tourSteps}
          initialStep={0}
          onExit={skipTour}
          onComplete={completeTour}
          options={{
            showProgress: true,
            showBullets: true,
            exitOnOverlayClick: false,
            doneLabel: 'Get Started!',
            nextLabel: 'Next →',
            prevLabel: '← Back',
            skipLabel: 'Skip Tour',
          }}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-tour="quick-stats">
          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <Key className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">{klaviyoKeysCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Klaviyo Integrations</p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-3xl font-bold">{segmentsCreated}</span>
            </div>
            <p className="text-sm text-muted-foreground">Segments Created</p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-3xl font-bold">
                {klaviyoKeysCount > 0 ? "Active" : "Setup"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Account Status</p>
          </div>
        </div>

        {/* Setup Check */}
        {klaviyoKeysCount === 0 && (
          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Complete Your Setup</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't connected your Klaviyo account yet. Complete the setup to start
                  creating powerful customer segments.
                </p>
                <Button onClick={() => navigate("/klaviyo-setup")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Klaviyo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="ai-segment-card bg-card rounded-lg border-2 border-primary/20 p-6 hover:border-primary transition-colors group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Segment Suggester</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Let AI analyze your business and suggest the perfect customer segments for your goals.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Start Creating Segments
            </Button>
          </div>

          <div className="analytics-card bg-card rounded-lg border-2 border-accent/20 p-6 hover:border-accent transition-colors group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed analytics and performance metrics for your customer segments.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full"
            >
              View Analytics
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border-2 border-border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  klaviyoKeysCount > 0
                    ? "bg-green-500 text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {klaviyoKeysCount > 0 ? "✓" : "1"}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Connect Klaviyo Account</h4>
                <p className="text-sm text-muted-foreground">
                  Add your Klaviyo API key to start creating segments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  segmentsCreated > 0
                    ? "bg-green-500 text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {segmentsCreated > 0 ? "✓" : "2"}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Create Your First Segment</h4>
                <p className="text-sm text-muted-foreground">
                  Use our AI suggester or choose from pre-built templates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted-foreground/20 text-muted-foreground">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Analyze Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Track segment growth and engagement metrics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
