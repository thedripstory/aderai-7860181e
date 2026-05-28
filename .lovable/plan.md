## The actual bug

The "buttons feel broken" issue comes from decorative elements (animated highlights, layoutId pills, shimmer sweeps) rendered as `absolute inset-0` siblings *inside* interactive buttons WITHOUT `pointer-events-none`. The overlay sits visually on top of the button text/padding and steals hover + click events from anywhere except the small text span (which is force-elevated with `z-10`).

You only hit the "real" button when your cursor is exactly over the label — the rest of the padding goes to the overlay and feels dead. That's exactly what the screenshot of the "Manual Way / Aderai" toggle shows, and it's the same root cause as the "Building" word in the Start Building Segments CTA from the previous turn.

## Confirmed broken on homepage

1. **`ComparisonChart.tsx` — "Manual Way" / "Aderai" toggle** (lines 108, 126)
   The `motion.div layoutId="activeTab"` pill is `absolute inset-0` over the button without `pointer-events-none`. Only the text span (`relative z-10`) is clickable; the rounded padding around it is dead. This is the toggle visible in the user's screenshot.

## Full audit pass

Sweep every interactive element on the homepage (`LandingPage.tsx`, `ComparisonChart.tsx`, `landing/Hero.tsx`, `landing/Features.tsx`, `landing/HowItWorks.tsx`, `landing/SocialProof.tsx`, `landing/Testimonials3D.tsx`, `landing/CTA.tsx`, `RevolvingTestimonials.tsx`, `AnimatedSignUpCTA.tsx`, `TubelightNavbar.tsx`, `TimeBasedPopup.tsx`) and apply this rule:

> Any `<div>` that is a direct or nested child of a `<button>` / `<a>` / `motion.button` and uses `absolute inset-0` (or `absolute` covering the element) MUST have `pointer-events-none` unless it is the actual click target.

For each match, add `pointer-events-none` to the overlay class list. Do not touch overlays already behind content via `-z-10` (those already pass clicks through, e.g. `TubelightNavbar` lamp and `landing/CTA.tsx` backgrounds).

## Verification

After edits, in the browser preview:
1. Load `/`, scroll through every section.
2. For each CTA / toggle / nav item, hover the *padding edges* (not the label) and confirm the `hover:scale-105` / color transition fires.
3. Click each one on a padding edge and confirm navigation/state-change happens (Start building segments → `/signup`, Manual Way / Aderai toggle flips view, Get Started for $9/month → `/signup`, Unlock All 70 Segments → `/signup`, Log in → `/login`, header Get Started → `/signup`, footer links navigate).
4. Report each button tested with pass/fail. Do not claim "fixed" without this checklist.

## Out of scope

- No visual redesign, no copy changes, no layout changes.
- Do not change `z-index`/`relative z-10` spans on labels — leave the existing stacking intact, just stop the overlays from absorbing pointer events.