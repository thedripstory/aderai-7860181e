## Goal

The "Create This Segment" path in the AI section keeps failing against Klaviyo. Instead of fighting the Klaviyo segment-creation API for AI-generated definitions, pivot the AI section into an **inspiration/ideas generator**: the user describes a goal, and we return a richer list of related segment ideas with clear descriptions — no Klaviyo write call. Users can then create the ones they like manually in Klaviyo (or via the existing pre-built segments flow elsewhere in the app).

## What changes (UI / behavior)

In `src/components/AISegmentSuggester.tsx`:

1. **Remove the "Create This Segment" button** and all `createAiSegment` logic, including:
   - `creatingSegment` / `segmentCreationComplete` state
   - `<SegmentCreationModal>` mount
   - The `klaviyo-create-custom-segment` invoke and its analytics/PostHog "AI Suggestion Applied" tracking
2. **Reframe copy** so it's clearly an idea/inspiration tool, not a builder:
   - Header: "Get Segment Ideas" (was "Describe Your Goal")
   - Sub: "Tell us what you're trying to achieve and we'll suggest related segment ideas you can build in Klaviyo."
   - CTA button: "Generate Segment Ideas" (was "Generate AI Suggestions")
   - Section title: "Suggested Segment Ideas" (was "AI Suggestions")
   - Empty/Loading messages updated to match
3. **Richer per-suggestion card** — for each idea show:
   - Name (without the " | Aderai" suffix stripped for display only)
   - 2–3 sentence description (why this segment matters + who it targets)
   - A small bulleted "Criteria" summary in plain English (e.g. "Placed Order with Item Name = Jaadugar in the last 7 days")
   - Optional "View technical definition" collapsible (kept as-is for power users)
   - A "Copy idea" button (copies name + description + plain-English criteria to clipboard) — replaces the create button
4. **Ask for more ideas at once**: bump server-side suggestion count from 3–5 to **6–10** related variants so the user truly gets adjacent/similar segments (e.g. "browsed X last 7 days", "bought X twice", "bought X + Y", "bought X then churned 30d").

## What changes (server)

In `supabase/functions/klaviyo-suggest-segments/index.ts`:

1. Update the system prompt so the AI returns **6–10 related variants** around the user's stated goal, explicitly varying:
   - Time window (7d / 30d / 90d / all-time)
   - Frequency (bought once / twice / 3+)
   - Behavior type (browsed / added to cart / purchased)
   - Adjacent products or categories if mentioned
2. Add a new field to each segment object: `plain_english_criteria: string[]` — short human-readable bullets the UI renders directly (no JSON parsing on the client).
3. Keep the existing `definition` object so the "technical definition" collapsible still works, but **do not** require it to be valid for Klaviyo creation (since we no longer POST it).
4. No changes to auth, rate limiting, daily-limit counting, or `useAILimits` — one prompt still = one AI suggestion used.

## What we explicitly keep

- `klaviyo-create-custom-segment` edge function stays deployed (used by other surfaces if any; verified only `AISegmentSuggester.tsx` calls it — safe to leave untouched to avoid breaking anything else).
- All pre-built segments / bundles / bulk-creation flows in the rest of the app are untouched.
- AI daily limits, usage counter UI, achievements, analytics events for `ai_suggestion_used`.
- "View technical definition" accordion (collapsed by default, per existing memory).
- No DB migrations, no new dependencies, no auth/routing changes.

## Risk / regression check

- Only one file calls `klaviyo-create-custom-segment` from the UI (`AISegmentSuggester.tsx`); removing that call cannot break other surfaces.
- `SegmentCreationModal` is also used by other flows (`SegmentCreationFlow`, bulk creation); we only remove its usage *here*, not the component.
- `useAILimits` and `incrementUsage` continue to work unchanged.
- Confetti / footer / resume-job / preferences work from earlier turns is untouched.

## Files touched

- `src/components/AISegmentSuggester.tsx` — remove create flow, add ideas-list UI with copy button + plain-English criteria
- `supabase/functions/klaviyo-suggest-segments/index.ts` — return 6–10 variants + `plain_english_criteria[]`
