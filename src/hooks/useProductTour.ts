import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TOUR_SHOWN_KEY = 'aderai_product_tour_shown';

/**
 * Hook to manage product tour modal visibility
 */
export function useProductTour() {
  const [showTour, setShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      // Check if user has seen the tour before
      const tourShown = localStorage.getItem(TOUR_SHOWN_KEY);
      
      if (!tourShown) {
        // First time visitor - show tour
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setShowTour(true);
        }
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeTour = () => {
    setShowTour(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem(TOUR_SHOWN_KEY, 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_SHOWN_KEY);
    setShowTour(true);
  };

  return {
    showTour,
    loading,
    closeTour,
    dontShowAgain,
    resetTour,
  };
}
