## Goal

Make confetti rare and intentional, and replace hardcoded "2025" in footers with a dynamic year so it correctly shows 2026 (and future years).

## 1. Fix the multi-burst confetti bug (root cause of "3-4 confetti in a row")

`src/components/SuccessAnimation.tsx`'s `useEffect` depends on `[show, onComplete]`. In `SegmentCreationFlow.tsx` the parent passes a fresh inline `onComplete={() => {...}}` arrow each render, so every parent re-render while `show === true` re-runs the effect and fires `confetti()` again. Combined with realtime job updates streaming in during/after completion, this produces 3–4 bursts.

Fix in `src/components/SuccessAnimation.tsx`:
- Remove `onComplete` from the effect dependency array (depend on `[show]` only).
- Add a `useRef<boolean>` "alreadyFired" guard so confetti fires exactly once per `show: false → true` transition. Reset the ref when `show` flips back to `false`.
- Keep the `getConfettiEnabled()` gate.

## 2. Make the single burst subtler

Still in `SuccessAnimation.tsx`, soften the one remaining burst:
- `particleCount: 100 → 60`
- `spread: 70 → 55`
- Keep brand colors.

## 3. Remove the second confetti source on the welcome path

`src/components/WelcomeBackModal.tsx` also fires a full `confetti()` 300ms after opening, unconditionally (no preference check, no guard). This is the other "out of nowhere" burst the user is seeing after returning to the app.

Changes:
- Gate it on `getConfettiEnabled()`.
- Only fire when there is a "celebratory" amount of work to acknowledge (e.g. `totalSegments >= 5`), so quick small completions don't trigger it.
- Use the same softer params (60 / 55).
- Guard with a `useRef` so it cannot fire twice for the same mount.

Net effect: at most one subtle confetti burst per meaningful success event, respecting the user's Settings toggle.

## 4. Audit — no other confetti sources

`rg` confirms the only `canvas-confetti` call sites are `SuccessAnimation.tsx` and `WelcomeBackModal.tsx`. Nothing else to touch.

## 5. Dynamic year in footers (shows 2026 now, auto-updates later)

Two files hardcode `© 2025`:

- `src/pages/LandingPage.tsx` line 741: `© 2025 Aderai. All rights reserved.` → replace with `© {new Date().getFullYear()} Aderai. All rights reserved.`
- `src/components/EmailFooter.tsx` line 29: `© 2025 Aderai. Powered by Klaviyo.` → replace with `© {new Date().getFullYear()} Aderai. Powered by Klaviyo.`

`src/components/DashboardFooter.tsx` already uses `currentYear = new Date().getFullYear()` — no change needed.

## Files touched

- `src/components/SuccessAnimation.tsx` — single-fire guard, softer params, effect dep fix
- `src/components/WelcomeBackModal.tsx` — gate on preference + threshold + single-fire guard, softer params
- `src/pages/LandingPage.tsx` — dynamic year in footer
- `src/components/EmailFooter.tsx` — dynamic year in footer

## Non-goals / guardrails

- No changes to segment creation logic, realtime subscription, or Settings toggle behavior.
- The existing "Celebration confetti" toggle in Settings continues to work and now fully suppresses both sources when off.
- No new dependencies, no DB changes, no edge function changes.
