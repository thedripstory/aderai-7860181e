import { supabase } from "@/integrations/supabase/client";

interface ErrorLogData {
  errorMessage: string;
  stackTrace?: string;
  pageUrl: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized error logging utility
 * Logs errors to console in development and can be extended to send to backend
 */
export class ErrorLogger {
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with full context
   */
  static async logError(error: Error | string, additionalData?: Record<string, any>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? undefined : error.stack;

    const logData: ErrorLogData = {
      errorMessage,
      stackTrace,
      pageUrl: window.location.href,
      metadata: additionalData,
    };

    // Get current user if available
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        logData.userId = user.id;
      }
    } catch {
      // Silently fail if unable to get user
    }

    // Console logging in development
    if (this.isDevelopment) {
      console.group(`🔴 Error at ${new Date().toISOString()}`);
      console.error('Message:', errorMessage);
      if (stackTrace) console.error('Stack:', stackTrace);
      console.log('Page:', logData.pageUrl);
      if (logData.userId) console.log('User ID:', logData.userId);
      if (additionalData) console.log('Additional Data:', additionalData);
      console.groupEnd();
    }

    // Can be extended to send to backend analytics service
    // await this.sendToBackend(logData);

    return logData;
  }

  /**
   * Log a warning (non-critical error)
   */
  static async logWarning(message: string, additionalData?: Record<string, any>) {
    if (this.isDevelopment) {
      console.warn(`⚠️ Warning: ${message}`, additionalData);
    }
  }

  /**
   * Log informational message for debugging
   */
  static logInfo(message: string, additionalData?: Record<string, any>) {
    if (this.isDevelopment) {
      console.log(`ℹ️ Info: ${message}`, additionalData);
    }
  }

  /**
   * Private method to send errors to backend (placeholder)
   */
  private static async sendToBackend(logData: ErrorLogData) {
    // Future implementation: Send to analytics service or error tracking
    // await supabase.from('error_logs').insert(logData);
  }
}
