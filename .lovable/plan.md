## Goal
Make authentication emails show and use `https://aderai.io` links only, while preserving confirmation, password reset, invite, magic-link, and email-change behavior.

## Root cause
The branded email template is currently inserting the raw backend verification URL directly into the button and fallback copy link. That URL is technically valid, but it exposes the backend auth endpoint instead of the Aderai domain.

## Plan
1. **Add a first-party auth callback route**
   - Add `/auth/confirm` to the app.
   - It will accept `token_hash`, `type`, and optional `next` parameters from the email link.
   - It will verify the token using the existing auth client, then route users to the correct Aderai page:
     - signup / magic link / invite / email change → `/dashboard` or the provided Aderai `next` path
     - password recovery → `/reset-password`

2. **Rewrite auth email action links before rendering**
   - In the auth email hook, transform the raw backend URL into a first-party URL like:
     ```text
     https://aderai.io/auth/confirm?token_hash=...&type=signup&next=/dashboard
     ```
   - Use that Aderai URL for both the button and the visible fallback link.
   - Keep the original token and auth type intact so existing auth security is not weakened.

3. **Remove origin-based auth redirects**
   - Replace `window.location.origin` in signup and password reset auth calls with the canonical domain:
     ```text
     https://aderai.io
     ```
   - This prevents preview/staging/tool domains from being embedded in new auth emails.

4. **Harden link generation**
   - Only allow `next` paths that stay on `aderai.io`.
   - Fall back safely to `/dashboard` if a redirect is missing or malformed.
   - Avoid exposing raw backend URLs in user-visible email copy.

5. **Deploy and verify**
   - Deploy the updated auth email hook.
   - Preview the signup and recovery email templates and confirm the displayed links are `https://aderai.io/...`.
   - Test the callback flow for signup and password reset so links still work end-to-end.