## Plan

1. **Stop the false profile-creation failure during signup**
   - Update the signup flow so the browser no longer tries to manually create the user profile after the auth signup call.
   - Trust the backend signup trigger that already creates `users` and `notification_preferences` records.
   - Keep the existing PostHog, Meta Pixel, Stripe checkout, Klaviyo, routing, and welcome-email behavior unchanged.

2. **Clean up duplicate backend trigger setup**
   - Add a small database migration that removes the extra duplicate notification-preferences trigger on new users.
   - Keep the correct profile trigger and one notification-preferences trigger in place.
   - This prevents duplicate trigger work during signup while preserving the intended profile creation.

3. **Replace support email everywhere visible**
   - Replace every `akshat@aderai.io` reference in app UI and edge-function email copy with `hello@aderai.io`.
   - This includes the signup/payment error toast shown in your screenshot, onboarding errors, settings support link, and outgoing app/email templates.

4. **Validate the fix**
   - Check the relevant source references are updated.
   - Re-run targeted signup-related checks/log inspection after changes so the profile error is not being produced by the app path.

## Technical notes

- The backend functions and triggers currently exist, but there are two notification-preference triggers attached to new auth users.
- The screenshot error is coming from `src/pages/Auth.tsx`, specifically the client-side manual profile fallback. Because newly signed-up users may not yet have an authenticated session, that fallback can hit row-level access rules and show `Profile Creation Error` even when auth signup itself succeeded.