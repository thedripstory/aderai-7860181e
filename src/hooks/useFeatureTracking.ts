import { useEffect } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';

/**
 * Hook to automatically track feature usage across the application
 */
export function useFeatureTracking(featureName: string, metadata?: Record<string, any>) {
  const { trackEvent } = useAnalyticsTracking();

  useEffect(() => {
    // Track feature view
    trackEvent(`feature_viewed`, {
      feature: featureName,
      ...metadata,
    });
  }, [featureName]);

  const trackAction = (action: string, additionalData?: Record<string, any>) => {
    trackEvent(`feature_action`, {
      feature: featureName,
      action,
      ...metadata,
      ...additionalData,
    });
  };

  return { trackAction };
}
