import { supabase } from "@/integrations/supabase/client";

interface ErrorLogData {
  errorMessage: string;
  stackTrace?: string;
  pageUrl: string;
  userId?: string;
  errorType?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized error logging utility
 * Logs errors to console in development and saves to database for production monitoring
 */
export class ErrorLogger {
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with full context and save to database
   */
  static async logError(error: Error | string, additionalData?: Record<string, any>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? undefined : error.stack;
    const errorType = typeof error === 'string' ? 'Error' : error.name;

    const logData: ErrorLogData = {
      errorMessage,
      stackTrace,
      pageUrl: window.location.href,
      errorType,
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
      console.error('Type:', errorType);
      console.error('Message:', errorMessage);
      if (stackTrace) console.error('Stack:', stackTrace);
      console.log('Page:', logData.pageUrl);
      if (logData.userId) console.log('User ID:', logData.userId);
      if (additionalData) console.log('Additional Data:', additionalData);
      console.groupEnd();
    }

    // Save to database
    await this.sendToBackend(logData);

    return logData;
  }

  /**
   * Log API errors with additional context
   */
  static async logAPIError(
    endpoint: string,
    error: Error | string,
    statusCode?: number,
    responseData?: any
  ) {
    await this.logError(error, {
      errorType: 'API_ERROR',
      endpoint,
      statusCode,
      responseData,
    });
  }

  /**
   * Log authentication errors
   */
  static async logAuthError(error: Error | string, context: string) {
    await this.logError(error, {
      errorType: 'AUTH_ERROR',
      context,
    });
  }

  /**
   * Log Klaviyo-related errors
   */
  static async logKlaviyoError(
    operation: string,
    error: Error | string,
    apiKeyId?: string
  ) {
    await this.logError(error, {
      errorType: 'KLAVIYO_ERROR',
      operation,
      apiKeyId,
    });
  }

  /**
   * Log segment creation errors
   */
  static async logSegmentError(
    segmentName: string,
    error: Error | string,
    segmentDefinition?: any
  ) {
    await this.logError(error, {
      errorType: 'SEGMENT_ERROR',
      segmentName,
      segmentDefinition,
    });
  }

  /**
   * Log AI suggestion errors
   */
  static async logAIError(error: Error | string, context?: string) {
    await this.logError(error, {
      errorType: 'AI_ERROR',
      context,
    });
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
   * Send errors to database for production monitoring
   */
  private static async sendToBackend(logData: ErrorLogData) {
    try {
      const { error } = await supabase.from('error_logs').insert({
        user_id: logData.userId || null,
        error_type: logData.errorType || 'Error',
        error_message: logData.errorMessage,
        stack_trace: logData.stackTrace,
        page_url: logData.pageUrl,
        user_agent: navigator.userAgent,
      });

      if (error) {
        console.error('Failed to log error to database:', error);
      }
    } catch (dbError) {
      // Fail silently in production to not break the app
      if (this.isDevelopment) {
        console.error('Error in error logging:', dbError);
      }
    }
  }
}
