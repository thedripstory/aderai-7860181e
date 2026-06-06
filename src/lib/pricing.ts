/**
 * Pricing single source of truth.
 * Display values for the landing page and CTAs.
 * Backend Stripe Price IDs are mapped in supabase/functions/stripe-create-checkout/index.ts.
 */

export const PRICING = {
  usd: { symbol: '$',  amount: 39, code: 'USD', display: '$39'  },
  gbp: { symbol: '£',  amount: 39, code: 'GBP', display: '£39'  },
  aud: { symbol: 'A$', amount: 59, code: 'AUD', display: 'A$59' },
  cad: { symbol: 'C$', amount: 59, code: 'CAD', display: 'C$59' },
} as const;

export type CurrencyCode = keyof typeof PRICING;

export const DEFAULT_CURRENCY: CurrencyCode = 'usd';

export function formatPrice(currency: CurrencyCode): string {
  return PRICING[currency].display;
}

export function formatPricePerMonth(currency: CurrencyCode): string {
  return `${PRICING[currency].display}/month`;
}
