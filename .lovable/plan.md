## 1. Payment verification popup for whitelisted free-access users

**Issue:** `apoorva+leezus@thedripstory.com` paid with a 100% off coupon and was granted access, but the "Payment verification taking longer than expected" toast still fires.

**Root cause:** In `src/components/ProtectedRoute.tsx`, the `payment=success` retry loop runs unconditionally inside `checkAuth()` whenever `subscription_status` in our DB isn't `active`/`trialing` — even when the user's email is whitelisted (`@thedripstory.com`). The whitelist is only consulted later (`hasFreeAccess`) when deciding whether to render the paywall, so the retry chain and final error toast still fire in the background for free-access users.

**Fix:**

- Compute `isFreeAccessEmail` from `session.user.email` directly inside `checkAuth()`.
- Skip the entire `verifyWithRetries` chain (and its final error toast) when `isFreeAccessEmail` is true.
- Also clean the `payment=success` / `session_id` URL params for free-access users so refreshing doesn't re-trigger anything.

## 2. Segment name issues

### 2a. `????` (emoji) prefix in 3 exclusion segments

**Issue:** Klaviyo renders the leading 🚫 emoji as `????`. In `supabase/functions/klaviyo-create-segments/index.ts`:

- Line 1121 — `🚫 Recent Purchasers Exclusion (14 Days)`
- Line 1132 — `🚫 Not Receiving Marketing`
- Line 1150 — `🚫 Never Opened Any Email`

**Fix:** Remove the `🚫`  prefix from these three names. Per project memory ("Emoji Removal Names"), no emoji should ever appear in segment names. Add a defensive sanitizer at the top of the segment-creation flow that strips any non-ASCII chars (and trims) from every `name` before sending to Klaviyo — so a future regression can't slip through. Also for all exclude segments that are being pushed to Klaviyo, add a "(Exclude)" at the starting of the name so people can easily find those segments within Klaviyo and differentiate them from other segments.

### 2b. "Not Opted In (Email)" definition is wrong

**Issue:** Current definition (line 1428) uses `profile-marketing-consent` with `can_receive_marketing: false, consent_status.subscription: 'any'`, which doesn't match Klaviyo's "Implicit consent subscribers" filter.

**Fix:** Update the definition to mirror Klaviyo's native "Implicit consent" filter:

```ts
{
  type: 'profile-marketing-consent',
  consent: {
    channel: 'email',
    can_receive_marketing: true,
    consent_status: { subscription: 'never_subscribed' }
  }
}
```

This produces profiles who can be marketed to but have never explicitly subscribed (Klaviyo's "implicit consent subscribers").

## 3. Premium Invite gate (Analytics tab)

**Issue A — copy:** `src/components/PremiumInviteGate.tsx` shows the heading "Aderai Premium" and subhead "Advanced Analytics is available exclusively for Aderai Premium members."

**Fix:** Change heading to **"Invite-only, currently under testing."** and rewrite the subhead to match (e.g. "{featureName} is currently invite-only while we test with select brands."). Keep the existing "Invite Only" pill.

**Issue B — data storage:** Verified the table `premium_invite_requests` exists and the insert path works (1 row from an earlier submission is present). The form's `handleSubmit` correctly inserts `first_name`, `brand_name`, `email`, `projected_yearly_revenue`, `currency`, `feature_requested`, `status: 'pending'`. No code change needed for storage; will confirm by adding a short success-state check (already shown via `setSubmitted(true)`). I'll surface this in the response so you can verify in admin.

## 4. "AI segments are not getting created" — investigation

**Findings:**

- The user `apoorva+leezus@thedripstory.com` has **0 rows** in `usage_limits` and **0 rows** in `ai_suggestions`. So they did NOT hit the daily 10-suggestion limit — the AI call never completed successfully (or was never invoked end-to-end).
- `klaviyo-suggest-segments` uses Lovable AI Gateway (`google/gemini-2.5-flash`) with `response_format: json_object` but **no `max_tokens**` set. Per the known Lovable failure mode, Gemini can hit its default token limit and return empty content with `finishReason: MAX_TOKENS` — which then trips the `JSON.parse` failure and bubbles up as a generic "Failed to parse AI response" error.
- The function does handle 429/402 from the gateway, but the frontend likely swallows the parse-failure or surfaces it as a non-actionable toast.

**Fix (small, surgical):**

- Add `max_tokens: 8192` to the AI Gateway request body.
- Log the raw `aiData` (incl. `finish_reason`) when JSON.parse fails so we can diagnose future failures.
- Pass a clearer error message back to the client (e.g. "AI returned an incomplete response — please try again") instead of the generic parse error.

This will likely unblock the user; if it doesn't, the new logs will tell us exactly why on the next attempt.

## Files to edit

```
src/components/ProtectedRoute.tsx                          (issue 1)
supabase/functions/klaviyo-create-segments/index.ts        (issues 2a, 2b)
src/components/PremiumInviteGate.tsx                       (issue 3A copy)
supabase/functions/klaviyo-suggest-segments/index.ts       (issue 4)
```

No DB migrations, no new packages. All changes scoped to the four files above.