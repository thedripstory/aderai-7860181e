import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLogger } from '@/lib/errorLogger';

interface OnboardingProgress {
  currentStep: number;
  stepsCompleted: string[];
  lastStepAt: string;
}

/**
 * Hook to manage onboarding progress persistence
 */
export function useOnboardingProgress(userId?: string) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProgress({
          currentStep: data.current_step,
          stepsCompleted: data.steps_completed as string[],
          lastStepAt: data.last_step_at,
        });
      }
    } catch (error) {
      ErrorLogger.logError(error as Error, {
        context: 'useOnboardingProgress.loadProgress',
        userId,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveProgress = useCallback(async (step: number, completedSteps: string[]) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          current_step: step,
          steps_completed: completedSteps,
          last_step_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setProgress({
        currentStep: step,
        stepsCompleted: completedSteps,
        lastStepAt: new Date().toISOString(),
      });
    } catch (error) {
      ErrorLogger.logError(error as Error, {
        context: 'useOnboardingProgress.saveProgress',
        userId,
        step,
      });
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    saveProgress,
    reloadProgress: loadProgress,
  };
}
