import posthog from 'posthog-js';

// Identify user (call on login/signup)
export const identifyUser = (userId: string, traits?: {
  email?: string;
  name?: string;
  firstName?: string;
  accountName?: string;
  accountType?: string;
  createdAt?: string;
  subscriptionStatus?: string;
  industry?: string;
  klaviyoConnected?: boolean;
}) => {
  try {
    posthog.identify(userId, {
      ...traits,
      $email: traits?.email,
      $name: traits?.name || traits?.firstName,
    });

    if (traits) {
      posthog.people.set(traits);
    }
  } catch (error) {
    console.error('Analytics identify error:', error);
  }
};

// Track events
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics track error:', error);
  }
};

// Group user with their company/account (for B2B analytics)
export const setGroup = (
  groupType: string,
  groupKey: string,
  groupProperties?: Record<string, any>
) => {
  try {
    posthog.group(groupType, groupKey, groupProperties);
  } catch (error) {
    console.error('Analytics group error:', error);
  }
};

// Reset analytics (call on logout)
export const resetAnalytics = () => {
  try {
    posthog.reset();
  } catch (error) {
    console.error('Analytics reset error:', error);
  }
};

// Set user properties without identifying
export const setUserProperties = (properties: Record<string, any>) => {
  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('Analytics setUserProperties error:', error);
  }
};
