# Segment Creation Flow + Confetti Preference Fixes

Four targeted fixes. No business logic changes beyond the edge function emitting per-segment progress.

## 1. Remove the highlighted "currentSegment" card at the top. It should only show when there's just a SINGLE segment being pushed and not when there are multiple.

File: `src/components/SegmentCreationFlow.tsx`

- The big block showing "Site Visitors (30 Days) — Visited site in last 30 days" is the `currentSegment` card (Target-icon card inside `<AnimatePresence>`).
- Hide it entirely when `loading === false`. While loading, keep a small "Currently creating: &nbsp;" line (not a giant card) so the modal still feels alive, or drop the card entirely and rely on the list below. Simpler: remove the card block in all states — the per-segment list already communicates what's happening.
- Net effect: completed modal shows only header + progress bar + scrollable result list + Done.

## 2. Real-time progress bar + "X of N" counter

Root cause: `klaviyo-create-segments` processes all batches server-side and only returns at the very end. The client's realtime subscription on `segment_creation_jobs` exists (`useKlaviyoSegments.ts` lines 113–170) but the row is never updated mid-flight, so it jumps from 0/14 → 14/14.

Changes:

**a. `supabase/functions/klaviyo-create-segments/index.ts**`

- Accept an optional `jobId` in the request body (already passed from the hook via existing job record — wire it through `requestBody` in `useKlaviyoSegments.ts` around line 319).
- Inside the batch loop (around line 2139), after each segment completes (success / exists / error / skipped), update `segment_creation_jobs` for that `jobId` with running counters:
  - `segments_processed`, `success_count`, `error_count`, `completed_segment_ids`, `failed_segment_ids`.
- Use a service-role Supabase client (already used elsewhere in the function or create with `SUPABASE_SERVICE_ROLE_KEY`) so RLS doesn't block writes.
- Skip the update if `jobId` is null (defensive).

**b. `src/hooks/useKlaviyoSegments.ts**`

- Pass `jobId: jobRecordId` into the `requestBody` sent to `klaviyo-create-segments`.
- In the realtime subscription handler (lines 127–144), also update `batchProgress.segmentsProcessed` and append per-segment entries to `results` so the green checkmark list fills incrementally. Derive new completions by diffing `completed_segment_ids` / `failed_segment_ids` against current `results`.
- Compute `currentBatch` from `Math.floor(segments_processed / BATCH_SIZE) + 1` so "Processing batch X of Y" advances.

**c. `src/components/SegmentCreationFlow.tsx**`

- Remove the "~Xs remaining" line (the `batchProgress.estimatedTimeRemaining > 0` block).
- Remove `estimatedTimeRemaining` calculation in the hook (optional cleanup) or just stop rendering it.
- Keep the progress bar driven by `batchProgress.segmentsProcessed / totalSegments` — which now updates in real time.

## 3. Confetti toggle in Settings

**a. New preference**

- Store in `localStorage` under `aderai:confetti_enabled` (default `true`). No DB migration needed — purely client preference.
- Add tiny helper in `src/lib/utils.ts` or new `src/lib/preferences.ts`:
  - `getConfettiEnabled(): boolean`
  - `setConfettiEnabled(v: boolean): void`

**b. `src/components/SuccessAnimation.tsx**`

- Before calling `confetti(...)`, check `getConfettiEnabled()`. If `false`, skip the confetti call but still show the green check + title + auto-complete.

**c. `src/pages/Settings.tsx**`

- Add a "Preferences" section (or append to existing) with a `<Switch>`:
  - Label: "Celebration confetti"
  - Description: "Show a confetti burst when segments are created successfully."
  - Default ON. Reads/writes via the helper. Persists immediately.

## 4. Technical notes

- The edge function must use the service-role client for the in-flight job updates to bypass RLS on `segment_creation_jobs`.
- Realtime is already enabled on `segment_creation_jobs` (verified in `pg_publication_tables`).
- No DB migration required.
- Result list ordering in the modal: dedupe by `segmentId` when merging realtime updates so we don't double-render.

## Files touched

- `src/components/SegmentCreationFlow.tsx` — remove top card, remove ETA line
- `src/hooks/useKlaviyoSegments.ts` — pass jobId, merge realtime updates into `results` + `batchProgress`
- `supabase/functions/klaviyo-create-segments/index.ts` — per-segment job row updates via service role
- `src/components/SuccessAnimation.tsx` — gate confetti on preference
- `src/pages/Settings.tsx` — add confetti toggle
- `src/lib/preferences.ts` (new, small) — localStorage helpers