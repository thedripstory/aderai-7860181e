import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track user journey analytics events
 */
export function useAnalyticsTracking() {
  const trackEvent = useCallback(async (
    eventName: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_name: eventName,
        event_metadata: metadata || {},
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      console.log(`📊 Event tracked: ${eventName}`, metadata);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  return { trackEvent };
}

/**
 * Auto-track page views
 */
export function usePageViewTracking() {
  const { trackEvent } = useAnalyticsTracking();

  useEffect(() => {
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
    });
  }, [window.location.pathname]);
}
