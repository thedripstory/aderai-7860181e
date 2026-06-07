/// <reference types="vite/client" />

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
