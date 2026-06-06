# Aderai Email Communication System — Plan

## Goal

Move ALL user-facing email out of Klaviyo / Resend-direct paths and onto **Lovable Emails** sending from a new Aderai subdomain (`notify.aderai.io`), with picture-perfect Aderai branding and a tight, minimal lifecycle email set.

Note: existing Lovable Email domain is `notify.ipostpaws.com` (legacy from another project). We'll add **a new domain `notify.aderai.io`** dedicated to Aderai. The ipostpaws domain remains untouched.

---

## 1. Domain & Infrastructure

- Add `notify.aderai.io` via the Lovable email setup dialog (you'll click through; Lovable provisions DNS records you add at Cloudflare — NS delegation to `ns3/ns4.lovable.cloud`).
- Lovable auto-runs `setup_email_infra` → creates pgmq queues, `email_send_log`, `suppressed_emails`, `email_unsubscribe_tokens`, cron worker, vault secrets.
- Visible From: `Aderai <hello@aderai.io>` (root domain visible) / `Aderai Billing <billing@aderai.io>`. Reply-to: `hello@aderai.io`.
- Auth emails scaffold via `scaffold_auth_email_templates` so signup confirmation, password reset, email-change, magic link all come from Aderai-branded templates (replacing default Supabase ones).
- App emails scaffold via `scaffold_transactional_email` → single `send-transactional-email` function + template registry under `supabase/functions/_shared/transactional-email-templates/`.

## 2. Email Set (Lifecycle — Minimal)

Exactly these emails go out. Nothing else.

| # | Trigger | Template | From | Notes |
|---|---------|----------|------|-------|
| A1 | Signup (Supabase auth) | `auth/signup-confirm` | hello@ | Email verification link |
| A2 | Password reset request | `auth/recovery` | hello@ | |
| A3 | Email change confirm | `auth/email-change` | hello@ | |
| T1 | Account created & verified | `welcome` | hello@ | Sent once after email confirmed; 5-second delay debounced via flag |
| T2 | Payment succeeded — first subscription | `subscription-confirmed` | billing@ | Only on `customer.subscription.created` / first `invoice.paid`. Uses real Stripe amount + currency. |
| T3 | Payment failed | `payment-failed` | billing@ | On `invoice.payment_failed`. Includes update-card link. |
| T4 | Subscription canceled | `subscription-canceled` | billing@ | On `customer.subscription.deleted`. |
| T5 | First segment created | `first-segment` | hello@ | Sent once on first row in `ai_suggestions` (DB flag `first_segment_email_sent`). |
| T6 | Klaviyo not connected after 48h | `connect-klaviyo-reminder` | hello@ | Single reminder. Cron checks users where `created_at < now()-48h AND no klaviyo_api_key AND reminder_sent=false`. Never re-sends. |

**Explicitly NOT sent:**
- Monthly renewal receipts (silent — Stripe handles internally; user can view in portal).
- Weekly digests, milestone spam, inactivity nudges, marketing.
- Any Klaviyo-originated emails to the Aderai user (Klaviyo remains used only for the user's *own* end-customer segments).

**Deduplication:** every transactional send uses an `idempotencyKey` (e.g. `welcome-${userId}`, `first-segment-${userId}`, `sub-confirmed-${subscriptionId}`) + DB boolean flags (`welcome_email_sent`, `first_segment_email_sent`, `klaviyo_reminder_sent`, `subscription_confirmed_email_sent`) on `public.users` to guarantee single-send semantics across retries.

## 3. Wiring per Trigger

- **A1–A3:** Lovable `auth-email-hook` (auto from scaffold).
- **T1 Welcome:** Triggered from a Postgres trigger on `auth.users` `email_confirmed_at` going non-null → `pg_net` calls `send-transactional-email`. Sets `welcome_email_sent=true`.
- **T2/T3/T4 Billing:** All inside existing `stripe-webhook` — replaces current `send-billing-email` calls with `send-transactional-email` invocations. Uses Stripe's real `amount_total` + `currency` (we already standardized this).
- **T5 First segment:** Inside the segment-creation edge functions (`klaviyo-create-segments`, `klaviyo-create-custom-segment`) — after successful insert, check flag → invoke send → set flag.
- **T6 Klaviyo reminder:** New cron `email-klaviyo-reminder-cron` (every 6h) selects eligible users, sends, sets flag.

## 4. Design System for Emails

Single shared style module `_shared/email-brand.ts` exporting Aderai tokens. All templates import from it — picture-perfect consistency.

- Logo: Aderai logo from R2 (`ADERAI_LOGO_URL` already in code), 140px header, 80px footer.
- Brand color: `#FF6B35` (Aderai orange). Hover/dark accent `#E55A2B`. Light surface `#FFF8F3`. Border `#FFE8D9`.
- Body bg: `#ffffff` (per email spec — never dark).
- Font: system stack matching app (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`).
- Buttons: 8px radius, 14×40 padding, brand bg, white text.
- Layout: 600px container, 30px header w/ 3px orange bottom border, 40×30 content, footer with logo + © + small unsubscribe note (system-appended for transactional).
- Every email: preview text, single H1, one primary CTA, optional secondary link, footer help line "Need help? Reply to this email."

## 5. Email Content (Draft Copy)

**Welcome (T1)** — subject: `Welcome to Aderai — let's deploy your first segment`
- H1: "You're in. 👋"
- Body: 2 short lines. CTA → `/dashboard`. Tip box: "Connect Klaviyo to deploy 67+ pre-built segments in 30 seconds."

**Subscription Confirmed (T2)** — subject: `Your Aderai subscription is active`
- Shows real `formatAmount(amount, currency)` (e.g. `£39.00/month`).
- Next billing date, manage billing button → portal.
- One-line thanks. No upsell.

**Payment Failed (T3)** — subject: `⚠️ Action needed — payment failed`
- Failure reason if available. CTA: "Update payment method" → billing portal. Note: "We'll retry automatically over the next 7 days."

**Subscription Canceled (T4)** — subject: `Your Aderai subscription was canceled`
- Active-until date. Soft reactivation CTA → portal. No begging copy.

**First Segment (T5)** — subject: `🎉 First segment live in Klaviyo`
- Celebrates the moment. CTA: "Browse segment library". Tip: "Bundles deploy 10+ segments at once."

**Klaviyo Reminder (T6)** — subject: `Connect Klaviyo to unlock Aderai`
- Empathetic, single send. CTA: "Connect Klaviyo (30 sec)" → `/klaviyo-setup`. Footer line: "This is the only reminder we'll send."

## 6. Migration / Cleanup

- Keep but stop invoking: `send-email`, `send-welcome-email`, `send-billing-email`, `send-milestone-email`, `send-weekly-digest`, `send-inactivity-reminder`, `send-notification-email`. Mark deprecated in header comment; remove call sites. Don't delete functions yet (rollback safety) — remove in a follow-up after 2 weeks live.
- Remove the milestone DB trigger `check_segment_milestone` invocations from active code path (keep table for analytics).
- Remove all Resend-direct `from: "Aderai <hello@updates.aderai.io>"` usages — they'd conflict with the new `notify.aderai.io` delegation. Audit script: `rg "updates.aderai.io|@thedripstory|onboarding@resend"`.

## 7. Monitoring

- Reuse `email_send_log` (Lovable infra) as source of truth; deduplicate by `message_id`.
- Add a small "Email Delivery" tab in `AdminDashboard` with: time range, template filter, status filter, summary cards, paginated table — using the queries from Lovable email-dashboard guide.

## 8. Rollout Order

1. Add `notify.aderai.io` domain (UI dialog) → wait for DNS verify.
2. `setup_email_infra` (auto).
3. `scaffold_auth_email_templates` → brand → deploy `auth-email-hook`.
4. `scaffold_transactional_email` → add 6 templates + brand module → deploy.
5. Add DB flags migration (`welcome_email_sent`, `first_segment_email_sent`, `klaviyo_reminder_sent`, `subscription_confirmed_email_sent` on `public.users`).
6. Wire triggers (Stripe webhook edits, segment functions, welcome pg_net trigger, reminder cron).
7. Disable / unwire old senders.
8. Admin Email Delivery tab.
9. Send live test for each of the 6 emails to a `@thedripstory.com` test account; visually QA in Gmail + Apple Mail.

---

## 9. Expert Review (10 reviewers, 0–100)

**1. Email Deliverability Expert — 92.** Good: dedicated subdomain, NS delegation, single From identity, low volume = high reputation. Risk: warm-up — sending 6 distinct templates day 1 to a cold subdomain. Rec: send the first 1–2 weeks at natural pace (current user base is small, so non-issue), add DMARC `p=quarantine` only after 2 weeks of clean DKIM.

**2. Backend Architect — 94.** DB flags + idempotency keys solve double-send. Webhook → enqueue → worker model is correct. Concern: Postgres trigger on `auth.users` via `pg_net` can be flaky if the function URL changes. Rec: instead, call `send-transactional-email` from inside the existing auth flow in `Auth.tsx` *after* verifyOtp succeeds, OR from a `handle_new_user_verified` SECURITY DEFINER trigger that writes to a `pending_emails` queue table consumed by the cron worker.

**3. Stripe/Billing Engineer — 95.** Correctly uses real `amount_total`/`currency`; no $9 fallbacks. Watches `customer.subscription.created` + first `invoice.paid` — caution: both fire; key off `invoice.paid` with `billing_reason = 'subscription_create'` to send T2, and **skip** when `billing_reason = 'subscription_cycle'` (silent monthly renewals — exactly the requirement). Rec: explicit switch on `billing_reason`.

**4. UX Writer — 90.** Copy is on-brand and lean. Suggestion: T6 reminder should A/B test subject ("Your Aderai is half-set-up" vs current) later; v1 ship as planned.

**5. Visual Designer — 91.** Brand tokens consistent, but emails render across clients differently. Rec: use `<table>`-based layout under the hood (React Email does this) — verify in Litmus/Email-on-Acid OR at minimum: Gmail web, Gmail iOS, Apple Mail, Outlook 365 web. Logo from R2 must be PNG with explicit width/height attrs (already in `WelcomeEmail`). Add `alt` text.

**6. Privacy / Compliance — 88.** All emails are transactional → CAN-SPAM/GDPR transactional exemption applies; no marketing consent needed. Still: include physical address line in footer + working unsubscribe (Lovable appends). Add a `mailto:hello@aderai.io?subject=unsubscribe` fallback for billing emails (which can't be unsubscribed since they're required) with text explaining why.

**7. QA / Edge Case Hunter — 87.** Edge cases to cover:
   - User signs up, verifies, but Stripe checkout abandoned → only Welcome + Klaviyo reminder fire (correct).
   - Grandfathered $9 user re-subscribes → T2 fires with $9 (correct, uses real amount).
   - User signs up with `@thedripstory.com` (free bypass) → still gets Welcome, never gets T2/T3/T4 (no Stripe events) — correct.
   - User creates segment via bulk bundle → T5 fires once for the first one only (flag check).
   - Klaviyo reminder cron hits a user who connected Klaviyo 47h59m post-signup → race condition. Rec: check `klaviyo_api_key IS NULL` AT SEND TIME inside the function, not just in the cron query.
   - User changes email → A3 to new, notification to old; ensure `welcome_email_sent` flag stays.

**8. Reliability Engineer — 92.** Lovable queue retries 5x + DLQ. Good. Concern: Stripe webhook is critical path — if `send-transactional-email` invoke fails inline, webhook returns 500 and Stripe retries the whole webhook, double-charging the email path. Rec: wrap the email invoke in try/catch and *never* fail the webhook because of email — log to `email_send_log` as 'failed' instead.

**9. Cost / Volume Analyst — 96.** ~6 emails per user lifecycle + monthly silent renewal = trivially under any cap. No concerns.

**10. Product Strategist — 89.** Loves the "only 1 reminder ever" stance — builds trust. Suggestion: add an in-app banner (already exists per memory: KlaviyoSetupBanner) so the single email reminder isn't the only nudge. Plan already aligns. Also consider a T7 "Subscription will end on X" 3 days before period_end when `cancel_at_period_end=true` — but per requirement (silent renewals, minimal email), skip for v1.

**Average: 91.4 → Build as planned**, with these incorporated tweaks:
- Trigger T1 from the auth flow / SECURITY DEFINER trigger writing to a queue table, not raw `pg_net` (Expert 2).
- T2 keys off `invoice.paid` + `billing_reason='subscription_create'`; silent on `subscription_cycle` (Expert 3).
- Email invoke in Stripe webhook wrapped in try/catch, never blocks 200 OK (Expert 8).
- Klaviyo reminder revalidates `klaviyo_api_key IS NULL` at send time (Expert 7).
- Footer includes physical address + mailto-unsubscribe note on billing emails (Expert 6).

---

## 10. Technical Section (for reference)

- New files:
  - `supabase/functions/_shared/email-brand.ts`
  - `supabase/functions/_shared/transactional-email-templates/welcome.tsx`
  - `.../subscription-confirmed.tsx`, `payment-failed.tsx`, `subscription-canceled.tsx`, `first-segment.tsx`, `connect-klaviyo-reminder.tsx`
  - `supabase/functions/_shared/transactional-email-templates/registry.ts` (auto from scaffold; we add entries)
  - `supabase/functions/email-klaviyo-reminder-cron/index.ts`
  - Auth templates from `scaffold_auth_email_templates` (branded).
- DB migration: add 4 boolean columns + indexes on `public.users`; add `pg_cron` schedule for reminder (every 6h).
- Edits: `stripe-webhook/index.ts` (route to new function, key on `billing_reason`), `klaviyo-create-segments/index.ts` + `klaviyo-create-custom-segment/index.ts` (first-segment hook), removal of call sites for deprecated senders, new admin Email Delivery tab in `AdminDashboard.tsx`.
- Untouched: Klaviyo segment logic, Stripe price IDs, currency detection, RLS on user tables.
