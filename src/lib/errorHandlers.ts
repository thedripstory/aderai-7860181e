import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized error handling class for the application
 * Provides consistent error handling, logging, and user messaging
 */
export class ErrorHandler {
  /**
   * Handles errors in a standardized way across the application
   * @param error - The error object or message
   * @param userMessage - User-friendly message to display
   * @param context - Additional context for logging (userId, component, action, metadata)
   * 
   * @example
   * ```typescript
   * await ErrorHandler.handleError(
   *   error,
   *   'Failed to create segments',
   *   { userId: user.id, component: 'SegmentCreator' }
   * );
   * ```
   */
  static async handleError(
    error: any,
    userMessage: string,
    context?: ErrorContext
  ) {
    console.error('Error occurred:', error, context);

    // Show user-friendly message
    toast.error(userMessage, {
      description: process.env.NODE_ENV === 'development' 
        ? error.message 
        : undefined,
      duration: 5000,
    });

    // Log to database
    try {
      const errorLog = {
        error_type: error.name || 'UnknownError',
        error_message: error.message || String(error),
        stack_trace: error.stack,
        user_id: context?.userId,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      };

      await supabase.from('error_logs').insert(errorLog);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Handles API-specific errors with appropriate user messaging
   * @param error - API error object
   * @param endpoint - API endpoint that failed
   * @param context - Additional context for logging
   */
  static async handleAPIError(
    error: any,
    endpoint: string,
    context?: ErrorContext
  ) {
    const userMessage = this.getAPIErrorMessage(error);
    
    await this.handleError(error, userMessage, {
      ...context,
      action: `API call to ${endpoint}`,
    });
  }

  /**
   * Maps API error status codes to user-friendly messages
   * @param error - API error object with status code
   * @returns Human-readable error message
   */
  static getAPIErrorMessage(error: any): string {
    if (error.status === 401) return 'Session expired. Please log in again.';
    if (error.status === 403) return 'You don\'t have permission to do that.';
    if (error.status === 404) return 'The requested resource was not found.';
    if (error.status === 429) return 'Too many requests. Please try again later.';
    if (error.status >= 500) return 'Server error. Our team has been notified.';
    return 'An error occurred. Please try again.';
  }

  /**
   * Handles form validation errors
   * @param fieldErrors - Object mapping field names to error messages
   */
  static handleValidationError(fieldErrors: Record<string, string>) {
    const firstError = Object.values(fieldErrors)[0];
    toast.error('Validation Error', {
      description: firstError,
      duration: 4000,
    });
  }

  /**
   * Handles network connectivity errors
   * @param error - Network error object
   * @param context - Additional context for logging
   */
  static async handleNetworkError(error: any, context?: ErrorContext) {
    const isOffline = !navigator.onLine;
    const message = isOffline
      ? 'You appear to be offline. Please check your connection.'
      : 'Network error. Please check your connection and try again.';

    await this.handleError(error, message, {
      ...context,
      action: 'network_request',
    });
  }
}

/**
 * Retries a function with exponential backoff
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @returns Promise resolving to the function's result
 * @throws The last error if all retries fail
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => supabase.functions.invoke('my-function'),
 *   3,
 *   1000
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = delayMs * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
