import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';

interface OnboardingTourState {
  run: boolean;
  stepIndex: number;
  tourCompleted: boolean;
}

export function useOnboardingTour() {
  const [tourState, setTourState] = useState<OnboardingTourState>({
    run: false,
    stepIndex: 0,
    tourCompleted: false,
  });
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useAnalyticsTracking();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed, created_at')
        .eq('id', user.id)
        .single();

      // Start tour if user just signed up and hasn't completed onboarding
      const isNewUser = userData?.created_at && 
        (new Date().getTime() - new Date(userData.created_at).getTime()) < 5 * 60 * 1000; // 5 minutes
      
      const shouldStartTour = !userData?.onboarding_completed;

      if (shouldStartTour) {
        setTourState({ run: true, stepIndex: 0, tourCompleted: false });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTour = () => {
    trackEvent('tour_started');
    setTourState({ run: true, stepIndex: 0, tourCompleted: false });
  };

  const skipTour = async (stepIndex: number) => {
    trackEvent('tour_skipped', { step: stepIndex });
    setTourState({ run: false, stepIndex: 0, tourCompleted: true });
    await markOnboardingComplete();
  };

  const completeTour = async () => {
    trackEvent('tour_completed');
    setTourState({ run: false, stepIndex: 0, tourCompleted: true });
    await markOnboardingComplete();
  };

  const markOnboardingComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  };

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, index, type, action } = data;

    // Handle step navigation
    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
        trackEvent('tour_step_completed', { step: index });
      } else if (action === ACTIONS.PREV) {
        setTourState(prev => ({ ...prev, stepIndex: index - 1 }));
      }
    }

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      completeTour();
    } else if (status === STATUS.SKIPPED || action === ACTIONS.SKIP) {
      skipTour(index);
    } else if (action === ACTIONS.CLOSE) {
      setTourState(prev => ({ ...prev, run: false }));
    }
  }, [trackEvent]);

  return {
    ...tourState,
    loading,
    startTour,
    skipTour,
    completeTour,
    handleJoyrideCallback,
  };
}