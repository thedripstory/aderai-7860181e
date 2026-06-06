## Goal
Harden the new $39 multi-currency pricing across frontend, Stripe, and email — plus add an admin currency previewer.

---

### 1. Robust currency fallback → instant USD checkout

**`src/hooks/useCurrency.ts`**
- Wrap the Cloudflare `/cdn-cgi/trace` call in `Promise.race` with a 1500 ms timeout so a slow/blocked CDN never delays anything.
- On any failure (timeout, network, parse, empty `loc`), persist `usd` in `sessionStorage` so we don't re-attempt every navigation, and keep the locale guess on screen.
- Export a new synchronous helper `getCurrencySync()` that returns the cached / locale-guessed currency without React. Used by checkout call sites so we never send `undefined`.

**`src/pages/Auth.tsx`, `src/pages/Settings.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/ui/sign-in-card.tsx`**
- Replace the current `useCurrency()` read at click-time with `currency ?? getCurrencySync() ?? 'usd'` before invoking `stripe-create-checkout`. Guarantees a valid 3-letter code is always sent.

**`supabase/functions/stripe-create-checkout/index.ts`**
- Already defaults unknown currency to `usd`. Add explicit guard: if `requestedCurrency` is empty/null/not in `PRICE_IDS`, log a warning and use `usd`. No behaviour change for valid inputs.

### 2. Admin pricing preview page

**New route `src/pages/AdminPricingPreview.tsx`** (added to admin nav; admin-only via existing `is_admin()` check)
- Country/currency selector (USD / GBP / AUD / CAD + free-form ISO-2 input that maps via `countryToCurrency`).
- Live preview panel that renders the actual `LandingPage` hero/CTA copy using the selected currency (re-uses `PRICING` + `formatPrice`).
- "Test checkout" button that calls `stripe-create-checkout` with the chosen currency and opens the resulting Stripe Checkout URL in a new tab so you can verify the price/currency shown by Stripe before publishing.
- Shows the resolved Stripe Price ID for each currency (read-only) so a mismatch is obvious at a glance.

**`src/components/AdminDashboard.tsx`** — add a nav entry "Pricing Preview" linking to the new page.

### 3. Billing-email tests using real Stripe amount/currency

**`supabase/functions/stripe-webhook/index.ts`**
- Replace the hard-coded fallback `9` in the three `sendBillingEmail` calls with `(session.amount_total ?? 0) / 100` etc. Never invent a price; if Stripe didn't send one, omit the field so the template falls back to its own default rather than a misleading "$9".

**`supabase/functions/send-billing-email/_templates/billing.tsx`**
- Format `amount` + `currency` together via a small helper (`formatAmount(amount, currency)`) so `A$59`, `£39`, `C$59`, `$9` (grandfathered) all render correctly. Currency symbol map mirrors `src/lib/pricing.ts`.

**New `supabase/functions/send-billing-email/index.test.ts`** (Deno test)
- Test cases:
  1. New $39 USD subscriber → email body contains `$39` and `/month`.
  2. Grandfathered $9 USD subscriber → email body contains `$9` (not `$39`).
  3. £39 GBP subscriber → email body contains `£39`.
  4. A$59 AUD subscriber → email body contains `A$59`.
  5. Missing amount/currency → template renders without crashing and does NOT contain a fabricated price.
- Uses `renderAsync` directly on `<BillingEmail …/>` — no network, no Resend call — and `assertStringIncludes`.

Run with `supabase--test_edge_functions { functions: ["send-billing-email"] }`.

### 4. End-to-end Stripe + codebase verification

**Stripe side** (read-only verification via `stripe--fetch_stripe_resources` / `stripe_api_execute`):
- Confirm the four live Price IDs in `stripe-create-checkout/index.ts` exist, are `active: true`, `recurring.interval = month`, and have unit_amounts 3900 USD, 3900 GBP, 5900 AUD, 5900 CAD.
- Confirm the old `$9` USD price still exists and is active (needed for grandfathered renewals).
- Confirm the `STRIPE_PRICE_ID` env override either matches the new USD price or is unset (currently overrides USD — could silently break the new price). Document the resolved value.

**Codebase sweep**
- `rg -n "\\$9|price_1[A-Za-z0-9]+"` across `src/` and `supabase/` to catch any leftover `$9` strings or stale Price IDs. Fix any straggler in copy, docs, help articles, or admin MRR estimates.
- Confirm `AdminSubscriptionMonitoring.tsx` MRR uses real `subscription_amount_cents` where available and only falls back to $39 estimate when null.

**Runtime smoke test**
- From browser preview: open `/` from US locale → expect `$39`. Override `navigator.language` to `en-GB` via devtools → expect `£39` after refresh. Click "Get Started" → confirm Stripe Checkout page shows £39/month.
- Repeat for AUD and CAD via the new admin preview page.
- Replay a test `checkout.session.completed` webhook with each currency in Stripe dashboard → confirm `send-billing-email` log shows the matching amount/currency and the test inbox renders correctly.

---

## Files

**New**
- `src/pages/AdminPricingPreview.tsx`
- `supabase/functions/send-billing-email/index.test.ts`

**Edited**
- `src/hooks/useCurrency.ts` (timeout + `getCurrencySync` export)
- `src/lib/pricing.ts` (export `countryToCurrency` for the admin page)
- `src/pages/Auth.tsx`, `src/pages/Settings.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/ui/sign-in-card.tsx` (use `getCurrencySync` safety net)
- `src/components/AdminDashboard.tsx` (nav entry)
- `src/components/AdminSubscriptionMonitoring.tsx` (only if sweep finds stale $9)
- `supabase/functions/stripe-create-checkout/index.ts` (explicit unknown-currency guard + log)
- `supabase/functions/stripe-webhook/index.ts` (drop hard-coded `9` fallbacks)
- `supabase/functions/send-billing-email/_templates/billing.tsx` (currency-aware formatter)

**Untouched (per prior batches)**
- Subscription gate, cron secret wiring, all other Stripe edge functions (`stripe-webhook` event handling, `stripe-check-subscription`, cancel/resume/portal), RLS, segment code.

## Confirmation flow
I'll execute the four tasks in order and confirm each one before moving to the next: (1) fallback, (2) admin preview page, (3) email tests pass, (4) Stripe + codebase audit results.