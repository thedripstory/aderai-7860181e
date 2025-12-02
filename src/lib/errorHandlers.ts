import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
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

  static getAPIErrorMessage(error: any): string {
    if (error.status === 401) return 'Session expired. Please log in again.';
    if (error.status === 403) return 'You don\'t have permission to do that.';
    if (error.status === 404) return 'The requested resource was not found.';
    if (error.status === 429) return 'Too many requests. Please try again later.';
    if (error.status >= 500) return 'Server error. Our team has been notified.';
    return 'An error occurred. Please try again.';
  }

  static handleValidationError(fieldErrors: Record<string, string>) {
    const firstError = Object.values(fieldErrors)[0];
    toast.error('Validation Error', {
      description: firstError,
      duration: 4000,
    });
  }

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
