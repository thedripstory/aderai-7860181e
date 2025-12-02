/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user inputs
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/script content
 * @param input - The string to sanitize
 * @returns Sanitized string safe for display/storage
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Sanitizes an email address
 * @param email - The email to sanitize
 * @returns Sanitized email or empty string if invalid format
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const sanitized = email.toLowerCase().trim();
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitizes a numeric input
 * @param input - The number as string
 * @returns Sanitized number string or default value
 */
export function sanitizeNumber(input: string, defaultValue: string = '0'): string {
  if (!input) return defaultValue;
  
  const sanitized = input.replace(/[^\d.]/g, '');
  return sanitized || defaultValue;
}

/**
 * Sanitizes a password (validates strength, no sanitization needed for storage)
 * @param password - The password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes form data object by applying appropriate sanitization to each field
 * @param data - Object containing form data
 * @returns Sanitized data object
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      // Sanitize string fields
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value) as any;
      } else if (key.toLowerCase().includes('password')) {
        // Don't sanitize passwords, just validate
        sanitized[key] = value as any;
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        // If it looks like a number, sanitize as number
        sanitized[key] = sanitizeNumber(value) as any;
      } else {
        // Generic string sanitization
        sanitized[key] = sanitizeString(value) as any;
      }
    }
  }
  
  return sanitized;
}
