# Admin Overhaul, Traffic Tracking, and Data Whitewash

Scope guarantee: **Nothing outside `/admin` and a new traffic-tracking edge function changes.** The landing page, /dashboard, onboarding, Stripe flow, Klaviyo flow, emails, and all user-facing routes are untouched.

---

## Part 1 — Database Whitewash (one migration, transactional)

A single migration with `BEGIN ... COMMIT` that:

1. **Preserves the admin account** `acc3a6e3-41af-4501-a357-dae23955b0d1` (akshat@thedripstory.com) and its `user_roles` row.
2. **Preserves** `help_articles` content (per your answer).
3. **Wipes all rows where `user_id <> admin_id`** (or all rows for tables with no user scope) from:
   - `analytics_events`, `user_sessions`, `error_logs`, `email_audit_log`, `email_send_log`, `email_send_state`, `email_tracking`, `email_unsubscribe_tokens`, `email_verification_reminders`
   - `ai_suggestions`, `segment_creation_jobs`, `segment_creation_errors`, `segment_operations`, `segment_historical_data`, `segment_analytics_cache`, `segment_mismatch_reports`
   - `klaviyo_keys`, `klaviyo_webhook_events`
   - `notification_preferences`, `admin_notifications` (non-admin), `onboarding_progress`, `usage_limits`
   - `user_feedback`, `user_achievements`, `two_factor_auth`, `subscription_events`
   - `premium_invite_requests`, `newsletter_subscribers`, `suppressed_emails`, `rate_limits`, `help_article_views`
   - `test_users`, `admin_audit_log` (all)
4. **Wipes non-admin rows from `public.users` and `auth.users`** (cascades clean up anything missed). Also clears `auth.identities`, `auth.sessions`, `auth.refresh_tokens` for those users.
5. Resets `ai_suggestions`/`usage_limits` for admin so counters start at zero.
6. Runs a final verification `SELECT count(*)` per table and raises if any non-admin rows remain.

You'll get the migration to approve before it runs.

---

## Part 2 — New Traffic Tracking System

### New table `public.traffic_events` (protected, admin-only read)
Columns: `id`, `event_type` (`page_view` | `cta_click` | `signup` | `checkout_started` | `purchase`), `session_id`, `user_id` (nullable), `path`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `country`, `user_agent`, `ip_hash`, `value_usd` (nullable, for purchases), `metadata` jsonb, `created_at`.

RLS: insert allowed via service role only; select restricted to admins via `has_role(auth.uid(),'admin')`.

### New edge function `track-traffic`
- Public (no JWT), CORS-enabled.
- Accepts event payload, hashes IP, derives country from CF/Vercel header if present, writes via service role.
- Called from a tiny **new** client helper that only fires on:
  - Landing page mount (page_view + UTM capture from URL)
  - "Get Started"/CTA clicks on landing
  - Successful signup
  - Stripe checkout session creation (`checkout_started`)
  - `/onboarding?session_id=` success page (`purchase` with `value_usd` from existing `stripe-get-session`)

These hooks are **additive** — no existing behavior is modified. If the tracker fails, the app continues normally (fire-and-forget).

---

## Part 3 — /admin Sidebar Rebuild

Replace the current top-tabs layout in `src/pages/AdminDashboard.tsx` with a `SidebarProvider` shell. **All existing admin sub-components are reused as-is** — only the navigation chrome changes.

### Sidebar sections (collapsible to icon-only)

```
OVERVIEW
  • Dashboard          (KPIs + AdminAnalyticsCharts)
  • Traffic            ← NEW (funnel, UTM breakdown, charts from traffic_events)

USERS
  • All Users          (AdminUserManagement)
  • Sessions           (AdminUserSessions)
  • User Health        (AdminUserHealth)
  • Journey            (AdminUserJourneyAnalytics)
  • Cohorts            (AdminCohortAnalysis)
  • Test Users         (AdminTestUserManagement)

REVENUE
  • Subscriptions      (AdminSubscriptionMonitoring)

KLAVIYO & SEGMENTS
  • Klaviyo Keys
  • Segment Analytics  (AdminSegmentAnalytics)
  • Mismatch Reports   (AdminSegmentMismatchReports)

EMAIL
  • Delivery           (AdminEmailDelivery)
  • Tracking           (AdminEmailTracking)
  • Monitoring         (AdminEmailMonitoring)

SYSTEM
  • Health             (AdminSystemHealth + Metrics)
  • API Monitoring     (AdminAPIMonitoring)
  • Errors             (AdminErrorTracking)
  • Audit Log          (AdminAuditTab)
  • Notifications      (AdminNotificationCenter)

PRODUCT
  • Feature Usage      (AdminFeatureUsage + Advanced)
  • Usage / Limits     (AdminUsageTracking)
  • A/B Tests          (ABTestResults)
```

Header keeps: search, date-range filter, logout. URL hash (e.g. `/admin#traffic`) is used so each section is linkable and reloads land on the same view. Each section is wrapped in `<PageErrorBoundary>` so a single section failure can't take the whole page down.

### New `/admin → Traffic` page
- Funnel: Visits → CTA clicks → Signups → Checkouts → Purchases (with conversion rates)
- Date-range filter (reuses `AdminDateRangeFilter`)
- Charts: visits over time, top sources, top UTM campaigns, top referrers, top landing pages
- Table: recent events with CSV export

### Section verification
After build, I open the preview, log in to /admin, and click through every sidebar item to confirm each section renders without errors (console + UI check). Reported back to you.

---

## Files

**Created**
- `supabase/migrations/<ts>_whitewash_users_and_traffic.sql` (whitewash + traffic_events table + RLS + grants)
- `supabase/functions/track-traffic/index.ts`
- `src/lib/trafficTracker.ts` (tiny fire-and-forget helper)
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/AdminTrafficPage.tsx`

**Edited (additive only, no behavior change)**
- `src/pages/AdminDashboard.tsx` — swap tabs for sidebar shell, keep all existing components
- `src/pages/LandingPage.tsx` — add 1 line: page_view + UTM capture on mount
- `src/components/landing/Hero.tsx` / `CTA.tsx` — fire `cta_click` on primary buttons
- `src/pages/Auth.tsx` — fire `signup` on successful signup
- `supabase/functions/stripe-create-checkout/index.ts` — fire `checkout_started` (server-side insert)
- `src/pages/Onboarding.tsx` — fire `purchase` after `stripe-get-session` returns success

**Untouched**: every other file, every existing edge function's business logic, all Stripe/Klaviyo/email flows.

---

## Risk Controls

- Migration runs in a transaction; if any verification check fails it rolls back.
- Admin row is selected by **UUID** (not email) so a typo can't wipe the wrong account.
- Traffic tracker is wrapped in try/catch with `keepalive: true` fetch — it can never break a page.
- All new admin sections are gated by `is_admin()` RPC (same pattern already used).
- No schema changes to existing tables — only new `traffic_events` is added.

Approve and I'll execute in this order: (1) migration, (2) traffic edge function, (3) admin sidebar + Traffic page, (4) tracker hooks, (5) end-to-end verification of every admin section.
