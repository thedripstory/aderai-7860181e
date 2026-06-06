import { useEffect, useState } from 'react';
import { PRICING, type CurrencyCode, DEFAULT_CURRENCY, formatPrice, formatPricePerMonth } from '@/lib/pricing';

const SESSION_KEY = 'aderai_currency';

/**
 * Map a country code (ISO 3166-1 alpha-2) to our supported currency.
 * Default to USD for US + Rest of World.
 */
function countryToCurrency(country: string | undefined): CurrencyCode {
  switch ((country || '').toUpperCase()) {
    case 'GB': return 'gbp';
    case 'AU': return 'aud';
    case 'CA': return 'cad';
    default:   return 'usd';
  }
}

/**
 * Instant synchronous guess from browser locale + timezone.
 * Never returns null — renders the right symbol on first paint.
 */
function guessFromLocale(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();

    if (tz.startsWith('Europe/London') || lang === 'en-gb' || lang.endsWith('-gb')) return 'gbp';
    if (tz.startsWith('Australia/') || lang === 'en-au' || lang.endsWith('-au')) return 'aud';
    if (tz.startsWith('America/Toronto') ||
        tz.startsWith('America/Vancouver') ||
        tz.startsWith('America/Edmonton') ||
        tz.startsWith('America/Halifax') ||
        tz.startsWith('America/Winnipeg') ||
        tz.startsWith('America/St_Johns') ||
        tz.startsWith('America/Montreal') ||
        lang === 'en-ca' || lang === 'fr-ca' || lang.endsWith('-ca')) return 'cad';
    return 'usd';
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Detect country from IP using Cloudflare's free public trace endpoint.
 * Returns a 2-letter country code or undefined. No API key needed.
 * Hard 1500ms timeout — never delays the app if the CDN is slow/blocked.
 */
async function detectCountryFromIP(): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return undefined;
    const text = await res.text();
    const match = text.match(/^loc=([A-Z]{2})$/m);
    return match?.[1];
  } catch {
    return undefined;
  }
}

/** Re-exported so admin/preview tooling can map an ISO-2 country to currency. */
export { countryToCurrency };

/**
 * Synchronous getter — returns the cached or locale-guessed currency without React.
 * Use this as a last-resort fallback right before invoking checkout to ensure
 * we never send `undefined` to Stripe.
 */
export function getCurrencySync(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const cached = sessionStorage.getItem(SESSION_KEY) as CurrencyCode | null;
    if (cached && cached in PRICING) return cached;
  } catch { /* noop */ }
  try {
    return guessFromLocale();
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Returns the user's currency.
 * - First paint: instant locale-based guess (zero latency, no flash).
 * - Background: refines via Cloudflare IP geolocation (~50-100ms) and updates silently if different.
 * - Cached in sessionStorage so subsequent loads are instant.
 */
export function useCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;
    try {
      const cached = sessionStorage.getItem(SESSION_KEY) as CurrencyCode | null;
      if (cached && cached in PRICING) return cached;
    } catch { /* noop */ }
    return guessFromLocale();
  });

  useEffect(() => {
    let cancelled = false;

    // Skip IP lookup if we already have a cached result for this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch { /* noop */ }

    detectCountryFromIP().then((country) => {
      if (cancelled) return;
      // On failure (timeout/blocked), persist USD so we don't retry every page.
      const detected = countryToCurrency(country);
      try { sessionStorage.setItem(SESSION_KEY, detected); } catch { /* noop */ }
      setCurrency((prev) => (prev === detected ? prev : detected));
    }).catch(() => {
      // Belt & braces — already handled inside detectCountryFromIP.
      try { sessionStorage.setItem(SESSION_KEY, DEFAULT_CURRENCY); } catch { /* noop */ }
    });

    return () => { cancelled = true; };
  }, []);

  return currency;
}

/** Convenience hook that returns currency + formatted strings. */
export function usePricing() {
  const currency = useCurrency();
  return {
    currency,
    price: formatPrice(currency),
    pricePerMonth: formatPricePerMonth(currency),
    info: PRICING[currency],
  };
}
