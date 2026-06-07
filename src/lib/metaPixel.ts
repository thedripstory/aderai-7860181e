declare global {
  interface Window {
    fbq: (
      command: string,
      eventName: string,
      params?: Record<string, any>,
      options?: { eventID?: string }
    ) => void;
  }
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, any>,
  eventID?: string
): void {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, params, eventID ? { eventID } : undefined);
    }
  } catch {
    // Never throw; Meta Pixel must never block user flow
  }
}

export function generateEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
