import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureTourStep {
  id: string;
  element?: string;
  title: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const FEATURE_TOUR_STEPS: FeatureTourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to New Features! 🎉',
    intro: `
      <h3>Exciting Updates!</h3>
      <p>We've added powerful new tools to help you:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Track ROI and campaign performance</li>
        <li>Monitor segment health in real-time</li>
        <li>Leverage AI for predictive analytics</li>
        <li>Manage agency tools and clients (for agencies)</li>
      </ul>
      <p>Let's take a quick tour!</p>
    `,
  },
  {
    id: 'feature-showcase',
    title: 'Feature Showcase',
    intro: `
      <h4>Value Demonstration Hub</h4>
      <p>Access our comprehensive showcase featuring:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>ROI Calculator:</strong> Calculate potential revenue gains</li>
        <li><strong>Comparison Charts:</strong> Manual vs Automated segmentation</li>
        <li><strong>Success Stories:</strong> Real customer testimonials with revenue numbers</li>
      </ul>
      <p>Perfect for demonstrating value to stakeholders!</p>
    `,
    element: '[data-tour="feature-showcase"]',
    position: 'bottom',
  },
  {
    id: 'roi-tracker',
    title: 'ROI Tracker',
    intro: `
      <h4>Track Your Success 📊</h4>
      <p>Monitor campaign performance with:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Revenue generated per campaign</li>
        <li>Time saved with automation</li>
        <li>Engagement rate tracking</li>
        <li>Historical campaign data</li>
        <li>Top performing segments</li>
      </ul>
      <p>All your metrics in one beautiful dashboard!</p>
    `,
    element: '[data-tour="roi-tracker"]',
    position: 'bottom',
  },
  {
    id: 'segment-health',
    title: 'Segment Health Monitor',
    intro: `
      <h4>Keep Segments Healthy 💚</h4>
      <p>Real-time health monitoring shows:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Status:</strong> Healthy, Warning, or Critical</li>
        <li><strong>Trends:</strong> Growing, Stable, or Declining</li>
        <li><strong>Size:</strong> Current member count</li>
        <li><strong>Recommendations:</strong> Actionable insights</li>
      </ul>
      <p>Never let a segment go stale again!</p>
    `,
    element: '[data-tour="segment-health"]',
    position: 'bottom',
  },
  {
    id: 'ai-features',
    title: 'AI-Powered Insights',
    intro: `
      <h4>Predictive Intelligence 🤖</h4>
      <p>Leverage AI for:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Performance Forecasting:</strong> 30-day segment predictions</li>
        <li><strong>Churn Prediction:</strong> Identify at-risk customers</li>
        <li><strong>Confidence Scores:</strong> Know how reliable predictions are</li>
        <li><strong>Risk Factors:</strong> Understand what's driving changes</li>
        <li><strong>Opportunities:</strong> Discover growth potential</li>
      </ul>
      <p>Make data-driven decisions with confidence!</p>
    `,
    element: '[data-tour="ai-features"]',
    position: 'bottom',
  },
  {
    id: 'agency-tools',
    title: 'Agency Tools (Agency Only)',
    intro: `
      <h4>Manage Your Agency 🏢</h4>
      <p>Exclusive tools for agency partners:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Client Scorecards:</strong> White-label performance reports</li>
        <li><strong>Team Management:</strong> Permissions and roles</li>
        <li><strong>Cross-Client Insights:</strong> Portfolio-wide analytics</li>
        <li><strong>Proposal Generator:</strong> AI-powered client proposals</li>
      </ul>
      <p>Scale your agency with powerful tools!</p>
    `,
    element: '[data-tour="agency-tools"]',
    position: 'bottom',
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    intro: `
      <h4>Access Anytime 🗺️</h4>
      <p>Find all new features:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Main Dashboard:</strong> Check the "More" tab</li>
        <li><strong>Brand Dashboard:</strong> See "Explore New Features" section</li>
        <li><strong>Agency Dashboard:</strong> Dedicated "Agency Tools" and "AI" tabs</li>
      </ul>
      <p>Everything is just a click away!</p>
    `,
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🚀',
    intro: `
      <h3>Tour Complete!</h3>
      <p>You now know how to:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✅ Calculate and track ROI</li>
        <li>✅ Monitor segment health</li>
        <li>✅ Leverage AI predictions</li>
        <li>✅ Navigate all new features</li>
      </ul>
      <p><strong>Pro Tip:</strong> You can restart this tour anytime from Settings!</p>
      <p style="margin-top: 15px;">Ready to explore? Let's get started!</p>
    `,
  },
];

export function useFeatureTour() {
  const [tourEnabled, setTourEnabled] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has completed the feature tour
      const { data } = await supabase
        .from('onboarding_progress')
        .select('steps_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.steps_completed) {
        const stepsArray = data.steps_completed as string[];
        const completed = stepsArray.includes('feature_tour_completed');
        setTourCompleted(completed);
        
        // Auto-start tour for new users who haven't seen it
        if (!completed) {
          setTourEnabled(true);
        }
      } else {
        // New user, start tour
        setTourEnabled(true);
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTour = async () => {
    setTourEnabled(false);
    setTourCompleted(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('onboarding_progress')
        .select('steps_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentSteps = (existing?.steps_completed as string[]) || [];
      const updatedSteps = [...currentSteps, 'feature_tour_completed'];

      if (existing) {
        await supabase
          .from('onboarding_progress')
          .update({ 
            steps_completed: updatedSteps,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            steps_completed: updatedSteps,
            current_step: 1
          });
      }
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const skipTour = async () => {
    setTourEnabled(false);
    await completeTour();
  };

  const restartTour = () => {
    setTourEnabled(true);
    setTourCompleted(false);
  };

  return {
    tourSteps: FEATURE_TOUR_STEPS,
    tourEnabled,
    tourCompleted,
    loading,
    setTourEnabled,
    completeTour,
    skipTour,
    restartTour,
  };
}
