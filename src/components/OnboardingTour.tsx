import React from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ADERAI_LOGO_URL } from '@/components/AderaiLogo';

interface OnboardingTourProps {
  run: boolean;
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  run,
  stepIndex,
  onCallback,
  onComplete,
}) => {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-4 p-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <img 
              src={ADERAI_LOGO_URL} 
              alt="Aderai" 
              className="h-10 dark:invert"
            />
            <h2 className="text-2xl font-bold text-center">Welcome to Aderai!</h2>
          </div>
          <p className="text-lg mb-4 text-center">
            Let's take a quick tour to help you get started with AI-powered customer segmentation.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            This will only take 30 seconds. You can skip or restart this tour anytime.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: {
        options: {
          width: 500,
        },
      },
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Your Dashboard</h3>
          <p>
            Track your progress here. See how many segments you've created, AI suggestions used, and your Klaviyo connection status.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="segments-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Create Segments</h3>
          <p>
            Access 70+ pre-built customer segments. Create powerful audiences in seconds with our templates covering everything from VIP customers to churn prevention.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="ai-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">AI Suggestions</h3>
          <p>
            Get AI-powered segment recommendations tailored to your business. Just describe your goal, and our AI will suggest the perfect segments for you.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="analytics-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Analytics & Performance</h3>
          <p>
            Monitor how your segments perform over time. Track engagement, revenue, and identify your most valuable customer groups.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="settings-button"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Settings & Klaviyo Connection</h3>
          <p>
            Connect your Klaviyo account here to start creating segments. You can also manage your profile, notifications, and API keys.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-4 p-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">You're All Set!</h2>
          </div>
          <p className="text-lg mb-4 text-center">
            Ready to supercharge your email marketing with smart customer segments?
          </p>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Start by connecting your Klaviyo account to unlock all features.
          </p>
          <Button 
            onClick={() => {
              onComplete();
              navigate('/klaviyo-setup');
            }}
            className="w-full"
            size="lg"
          >
            Connect Klaviyo Account
          </Button>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: {
        options: {
          width: 500,
        },
      },
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton={false}
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose
      disableCloseOnEsc
      hideCloseButton
      callback={onCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '6px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '8px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Complete Tour',
        next: 'Next',
      }}
    />
  );
};