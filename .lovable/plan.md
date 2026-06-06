## Pricing change: $9 → $39 (multi-currency, IP-detected)

### Decisions locked in
- **Existing subscribers**: grandfathered at $9 forever. We do NOT touch any existing Stripe subscription. Only the checkout for new signups uses the new prices.
- **Geo detection**: native, instant. Use `Intl.DateTimeFormat().resolvedOptions().timeZone` + `navigator.language` for first paint (synchronous, zero latency, zero deps), then refine in the background with a free no-key endpoint (`https://ipapi.co/json/` or Cloudflare's `https://www.cloudflare.com/cdn-cgi/trace`) and swap silently if the country differs. No spinner, no flash — default currency renders immediately based on locale, then corrects within ~100ms if needed.

### Currency map (single source of truth)
```
US + RoW → USD $39
GB       → GBP £39
AU       → AUD $59  (display as "A$59")
CA       → CAD $59  (display as "C$59")
```

### Backend — Stripe

1. **Create 3 new Stripe Prices** alongside the existing USD $39 price (which we'll also create — current live price is $9). Using `stripe--create_stripe_product_and_price`:
   - Product "Aderai Monthly" — USD 3900, recurring monthly → `price_id_usd`
   - Same product, GBP 3900 monthly → `price_id_gbp`
   - Same product, AUD 5900 monthly → `price_id_aud`
   - Same product, CAD 5900 monthly → `price_id_cad`

2. **`stripe-create-checkout`** — accept an optional `currency` field in the request body (`usd|gbp|aud|cad`, default `usd`), map it to the right price id, and pass that into `stripe.checkout.sessions.create`. The hardcoded `STRIPE_PRICE_ID` fallback becomes a lookup table. Existing `STRIPE_PRICE_ID` env var stays as the USD default for safety.

3. **`stripe-webhook`** — no logic change needed. It already records whatever price the customer checked out with.

4. **`stripe-get-subscription-details`** — the `let amount = 9` default becomes a dynamic read from `subscription.items.data[0].price.unit_amount` / `.currency` (already partially done) so grandfathered users correctly see "$9" and new users see "$39" / "£39" / etc.

5. **Webhook + check-subscription** — unchanged. They already use the actual Stripe subscription, so grandfathered $9 customers continue working untouched.

### Frontend

1. **New file `src/lib/pricing.ts`** — single source of truth:
   ```ts
   export const PRICING = {
     usd: { symbol: '$',  amount: 39, code: 'USD', display: '$39'  },
     gbp: { symbol: '£',  amount: 39, code: 'GBP', display: '£39'  },
     aud: { symbol: 'A$', amount: 59, code: 'AUD', display: 'A$59' },
     cad: { symbol: 'C$', amount: 59, code: 'CAD', display: 'C$59' },
   } as const;
   export type CurrencyCode = keyof typeof PRICING;
   ```

2. **New hook `src/hooks/useCurrency.ts`**:
   - Synchronous initial value from `navigator.language` + timezone (`en-GB`/`Europe/London` → gbp, `en-AU`/`Australia/*` → aud, `en-CA`/`America/Toronto|Vancouver|...` → cad, else usd). Returns instantly, no flash.
   - On mount, `fetch('https://www.cloudflare.com/cdn-cgi/trace')` (tiny, ~50ms, no key, returns `loc=GB` line). Map country code → currency. If different from locale guess, update state silently. Cache result in `sessionStorage` so subsequent renders are instant.

3. **Replace all hardcoded `$9` strings** with `usePricing()` output in:
   - `src/pages/LandingPage.tsx` (hero "Just $9/month")
   - `src/components/ComparisonChart.tsx` (table cell + CTA button)
   - `src/components/landing/CTA.tsx` ("$9/month for agency-level…")
   - `src/components/landing/SocialProof.tsx` (testimonial copy — keep as static testimonial but update to "$39" since it's marketing claim, not a real quote per memory rules; we'll rewrite to drop the price reference rather than fabricate)
   - `src/components/landing/Testimonials3D.tsx` (same — drop price references from testimonial bodies; price doesn't belong in fake testimonials)
   - `src/components/ui/sign-in-card.tsx` ("$9/month • Cancel anytime")
   - `src/pages/Settings.tsx` (Resubscribe + Subscribe Now buttons — show user's current price if grandfathered, else new price)
   - `src/components/ProtectedRoute.tsx` (paywall CTA — always new price since by definition not yet subscribed)

4. **`ProtectedRoute.tsx` checkout call** — pass detected `currency` into `supabase.functions.invoke('stripe-create-checkout', { body: { currency } })`. Same for `Settings.tsx`.

5. **Grandfather display logic in `Settings.tsx`**: the existing-subscriber CTA reads `subscription_status` + `subscription_price_amount` from `useAuth`/profile and shows their actual current price, not the new price.

### Admin / docs (cosmetic, non-functional)

- `src/components/AdminSubscriptionMonitoring.tsx` — MRR calc currently `activeSubscriptions * 9`. Change to sum actual `subscription_amount_cents` from the `users` table (we already store it via webhook). Falls back to $9 if null (grandfathered legacy rows).
- `src/lib/helpArticlesData.ts` — update copy to "starts at $39/month (regional pricing applies)".
- `src/pages/AdminSetup.tsx` — update doc string.
- `ENVIRONMENT_VARIABLES.md` — update mentions.
- `supabase/functions/send-billing-email/_templates/billing.tsx` — `amount = '$9'` default → read from actual invoice amount passed in (already passed via webhook); only the default fallback changes to `'$39'`.

### Memory updates
Update `mem://strategy/business-model-paid-subscription` and the Core index line from "$9/mo" to "$39/mo USD (regional: £39 / A$59 / C$59). Existing $9 subscribers grandfathered."

### What we explicitly DO NOT touch
- The `stripe-webhook`, `stripe-check-subscription`, `stripe-cancel-subscription`, `stripe-resume-subscription`, `stripe-create-portal-session` functions — pricing is read from Stripe, not hardcoded.
- The subscription gate (`_shared/checkSubscription.ts`).
- Any existing customer's Stripe subscription object.
- Cron jobs, RLS, segment code.

### Verification checklist (post-build)
1. Visit `/` from a US IP → see `$39/month` everywhere.
2. Override locale to `en-GB` → see `£39` instantly.
3. Click "Get Started" → Stripe Checkout shows GBP £39.
4. Existing test user with $9 subscription opens `/settings` → sees "$9/month" (their actual price), can manage portal normally.
5. New user signs up + pays → webhook stores `subscription_amount = 3900`, `currency = 'usd'`; gate works.
6. `stripe-get-subscription-details` returns correct price per user.

### Files to edit (summary)
- New: `src/lib/pricing.ts`, `src/hooks/useCurrency.ts`
- Edit: `src/pages/LandingPage.tsx`, `src/pages/Settings.tsx`, `src/pages/AdminSetup.tsx`, `src/components/ComparisonChart.tsx`, `src/components/landing/CTA.tsx`, `src/components/landing/SocialProof.tsx`, `src/components/landing/Testimonials3D.tsx`, `src/components/ui/sign-in-card.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/AdminSubscriptionMonitoring.tsx`, `src/lib/helpArticlesData.ts`, `ENVIRONMENT_VARIABLES.md`
- Edit edge functions: `supabase/functions/stripe-create-checkout/index.ts`, `supabase/functions/stripe-get-subscription-details/index.ts`, `supabase/functions/send-billing-email/_templates/billing.tsx`, `supabase/functions/check-setup-status/index.ts`
- Stripe: create 4 new Prices via `stripe--create_stripe_product_and_price`
- Memory: update business-model memory + Core index
