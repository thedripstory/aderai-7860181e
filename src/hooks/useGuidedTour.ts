import { useEffect, useState } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

const TOUR_COMPLETED_KEY = 'aderai_guided_tour_completed';

export interface TourStep {
  element?: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  title?: string;
}

/**
 * Hook to manage intro.js guided tours
 */
export function useGuidedTour(tourSteps: TourStep[], tourName: string = 'default') {
  const [tourEnabled, setTourEnabled] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    // Check if tour has been completed before
    const completed = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${tourName}`);
    if (!completed) {
      // Auto-start tour after a short delay
      const timer = setTimeout(() => {
        setTourEnabled(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTourCompleted(true);
    }
  }, [tourName]);

  const completeTour = () => {
    localStorage.setItem(`${TOUR_COMPLETED_KEY}_${tourName}`, 'true');
    setTourEnabled(false);
    setTourCompleted(true);
  };

  const skipTour = () => {
    completeTour();
  };

  const restartTour = () => {
    setTourEnabled(true);
  };

  const resetTour = () => {
    localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${tourName}`);
    setTourCompleted(false);
    setTourEnabled(true);
  };

  return {
    tourEnabled,
    tourCompleted,
    setTourEnabled,
    completeTour,
    skipTour,
    restartTour,
    resetTour,
  };
}
