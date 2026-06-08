## Root cause (confirmed from logs)

The signup itself succeeds (auth log shows `/signup` → 200 + email hook ran). Immediately after, the browser calls `stripe-create-checkout`, which fails with:

- Auth API: `403 invalid claim: missing sub claim` / `bad_jwt` on `/user`
- Edge function log: `Error creating checkout session: User not authenticated or email not available`

Why: **"Confirm email" is enabled on the auth project.** When confirmations are on, `supabase.auth.signUp()` returns a user but **no session / no access token**. The Stripe checkout edge function uses `verify_jwt = true` and calls `supabaseClient.auth.getUser(token)` — with no real token it 403s and throws the "User not authenticated" error the toast surfaces.

So the flow is broken by design right now: user signs up → must confirm email → but we try to charge them before they ever get a session. That's why this keeps coming back regardless of UI fixes.

## Fix

1. **Turn off the email-confirmation requirement for signup** so `signUp()` returns a session immediately and the very next call to `stripe-create-checkout` is authenticated.
   - Do this via the Cloud auth configuration (Confirm email = OFF). Email verification becomes a *post-signup* nudge, not a hard gate before payment.
   - We already have an in-app `EmailVerificationBanner` and a `send-verification-email` function to prompt the user to verify after they're in.

2. **Send our own branded "verify your email" email after signup** instead of relying on the auth confirmation email.
   - Trigger `send-verification-email` (Aderai-branded, from `hello@aderai.io`) from the signup success path, right after `trigger-app-email` welcome.
   - This keeps the Aderai branding the user already insisted on and removes the ugly auth confirm email entirely.

3. **Harden `stripe-create-checkout` so it fails loudly with a useful message** instead of a generic toast, in case auth is ever missing again.
   - If `getUser(token)` returns no user, respond with a specific code (`NOT_AUTHENTICATED`) and have `Auth.tsx` show a clearer toast (e.g. "Your session didn't start — please sign in and try again") and route to `/auth` instead of `/signup?payment=error`.

4. **Validate end-to-end after the change**
   - New signup with a fresh `+random@thedripstory.com` email.
   - Confirm: signup 200 → session present → `stripe-create-checkout` returns a URL → redirect to Stripe Checkout (no toast).
   - Confirm the Aderai-branded verification email lands (from `hello@aderai.io`, sender name "Aderai").
   - Check `stripe-create-checkout` edge logs are clean.

## Technical notes

- File(s) to edit:
  - `supabase/config.toml` — set the auth `enable_confirmations = false` for the email provider (or the equivalent setting). Keep everything else as-is.
  - `src/pages/Auth.tsx` — after successful signup, call `send-verification-email` (best-effort, non-blocking), and improve the error branch around the `stripe-create-checkout` call.
  - `supabase/functions/stripe-create-checkout/index.ts` — return a structured `NOT_AUTHENTICATED` error instead of throwing a generic string when there's no user.

- No DB migration required. No change to Stripe products, prices, webhooks, or CAPI.

- This is the same root cause behind the earlier "Profile Creation Error" loop: the client was running post-signup work that requires a session before one exists. Removing the email-confirmation gate fixes the class of bug, not just this one symptom.
