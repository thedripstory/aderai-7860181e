import { toast } from 'sonner';

/**
 * Centralized toast notification helpers with consistent styling and behavior
 */

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 3000,
  });
};

export const showErrorToast = (title: string, description?: string, onRetry?: () => void) => {
  toast.error(title, {
    description: description || 'Please try again or contact support if the issue persists',
    duration: Infinity, // Requires manual dismiss for errors
    action: onRetry ? {
      label: 'Retry',
      onClick: onRetry,
    } : undefined,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 5000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 3000,
  });
};

/**
 * Show a loading toast that can be updated later
 * Returns the toast ID for updates
 */
export const showLoadingToast = (title: string, description?: string) => {
  return toast.loading(title, {
    description,
  });
};

/**
 * Update a loading toast to success
 */
export const updateToastToSuccess = (toastId: string | number, title: string, description?: string) => {
  toast.success(title, {
    id: toastId,
    description,
    duration: 3000,
  });
};

/**
 * Update a loading toast to error
 */
export const updateToastToError = (toastId: string | number, title: string, description?: string) => {
  toast.error(title, {
    id: toastId,
    description,
    duration: Infinity,
  });
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
