import DOMPurify from 'dompurify';

/**
 * Input sanitization utilities using DOMPurify
 * Provides XSS protection for all user inputs across the application
 * All functions remove potentially dangerous content while preserving safe data
 */

/**
 * Sanitizes a string by removing all HTML tags and scripts
 * @param input - The string to sanitize
 * @returns Sanitized string with all HTML removed
 * 
 * @example
 * ```typescript
 * const safe = sanitizeString("<script>alert('xss')</script>Hello");
 * // Returns: "Hello"
 * ```
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Use DOMPurify to strip all HTML tags
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
  
  return clean.trim();
}

/**
 * Sanitizes email addresses and validates format
 * @param email - Email string to sanitize
 * @returns Sanitized lowercase email or empty string if invalid
 * 
 * @example
 * ```typescript
 * sanitizeEmail(" USER@EXAMPLE.COM "); // Returns: "user@example.com"
 * sanitizeEmail("not-an-email"); // Returns: ""
 * ```
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
 * Sanitizes numeric input, removing non-digit characters
 * @param input - The number as string
 * @param defaultValue - Default value if input is invalid (default: '0')
 * @returns Sanitized number string
 * 
 * @example
 * ```typescript
 * sanitizeNumber("$1,234.56"); // Returns: "1234.56"
 * sanitizeNumber("abc"); // Returns: "0"
 * ```
 */
export function sanitizeNumber(input: string, defaultValue: string = '0'): string {
  if (!input) return defaultValue;
  
  const sanitized = input.replace(/[^\d.]/g, '');
  return sanitized || defaultValue;
}

/**
 * Validates password strength without sanitization
 * Passwords should be hashed, not sanitized
 * @param password - The password to validate
 * @returns Object with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validatePassword("short");
 * // Returns: { isValid: false, error: "Password must be at least 8 characters" }
 * ```
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
 * Sanitizes HTML content while allowing safe formatting tags
 * Use for rich text content where some formatting is needed (e.g., user bios, descriptions)
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML with only safe tags (b, i, em, strong, p, br)
 * 
 * @example
 * ```typescript
 * const safe = sanitizeHTML("<p>Safe <b>content</b></p><script>alert('xss')</script>");
 * // Returns: "<p>Safe <b>content</b></p>"
 * ```
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  return clean;
}

/**
 * Validates and sanitizes URLs to prevent protocol-based attacks
 * Blocks dangerous protocols like javascript:, data:, and vbscript:
 * @param url - URL string to validate
 * @returns Sanitized URL or empty string if dangerous protocol detected
 * 
 * @example
 * ```typescript
 * sanitizeURL("javascript:alert('xss')"); // Returns: ""
 * sanitizeURL("https://example.com"); // Returns: "https://example.com"
 * ```
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeString(url);
  
  // Block dangerous protocols
  if (
    sanitized.toLowerCase().startsWith('javascript:') ||
    sanitized.toLowerCase().startsWith('data:') ||
    sanitized.toLowerCase().startsWith('vbscript:')
  ) {
    return '';
  }
  
  return sanitized;
}

/**
 * Limits string length to prevent DoS attacks via oversized inputs
 * @param input - String to limit
 * @param maxLength - Maximum allowed length
 * @returns Truncated string
 * 
 * @example
 * ```typescript
 * limitLength("x".repeat(10000), 100); // Returns string of length 100
 * ```
 */
export function limitLength(input: string, maxLength: number): string {
  return input.slice(0, maxLength);
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
        // Generic string sanitization using DOMPurify
        sanitized[key] = sanitizeString(value) as any;
      }
    }
  }
  
  return sanitized;
}
