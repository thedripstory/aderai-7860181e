# Fix AI segment product filter + AI counter

## Problem 1 — AI segment misses product filter

When the AI suggests "Recent Purchasers of Jaadugar | Aderai", `klaviyo-create-custom-segment` calls OpenAI with a system prompt that only knows how to emit a basic `profile-metric` block (metric_id + count + timeframe). It has no instructions for the per-event property filter, so the resulting Klaviyo segment is just "Ordered Product at least once in last 30 days" — Jaadugar is lost.

Klaviyo supports per-event property filtering via `metric_filters` on a `profile-metric` condition (already used elsewhere in the codebase for `Discount Codes`). For product-scoped segments we need:

```json
"metric_filters": [{
  "property": "Item Name",
  "filter": { "type": "string", "operator": "equals", "value": "Jaadugar" }
}]
```

## Problem 2 — "10 of 10 AI suggestions remaining" never decreases

`increment-ai-usage` runs the UPDATE through the user-scoped client (anon key + user JWT). The function doesn't `.select()` after update, so if RLS silently blocks the UPDATE the call still returns success and the counter stays at 10. The frontend then calls `checkLimit()` which re-reads the same unchanged row.

## Plan

### A. Add product/property filter support to AI segment creation
File: `supabase/functions/klaviyo-create-custom-segment/index.ts`

1. Expand the system prompt with a new RULES section explaining `metric_filters` for event property filtering, including examples for:
   - Product name filter: `{ property: "Item Name", filter: { type: "string", operator: "equals", value: "<PRODUCT>" } }`
   - Discount filter: `{ property: "Discount Codes", filter: { type: "string", operator: "is-set" } }`
2. Add a rule: if the segment name or description references a specific product, collection, category, SKU, coupon code, or other identifiable value, the AI MUST include a corresponding `metric_filters` entry on the relevant event (Placed Order / Ordered Product / Viewed Product). Never drop the qualifier silently.
3. Switch model to `gpt-5` (project standard) and keep `response_format: json_object`.
4. After parsing `segmentDef`, run a small server-side sanity check: if the original `segmentName`/`segmentDescription` contains a quoted or capitalized product token (heuristic: words appearing in both name and description that aren't common words) and the produced definition has zero `metric_filters`, return a 422 with a clear error so the UI surfaces "couldn't qualify segment by product" instead of silently creating a too-broad segment.

### B. Make the AI counter decrement reliably
File: `supabase/functions/increment-ai-usage/index.ts`

1. Use the service-role client for the UPDATE/INSERT (read user from JWT with anon client, then write with service role) so RLS can't silently no-op the increment.
2. Add `.select().single()` to the UPDATE and return the actual new `ai_suggestions_today` value.
3. If the row doesn't change (rowcount 0), throw — so the frontend's try/catch surfaces a real error instead of a phantom success.

File: `src/hooks/useAILimits.ts`

4. In `incrementUsage`, optimistically decrement `remaining` and increment `total_used` immediately on success (using the returned `new_count`), then still call `checkLimit()` in the background. This makes the UI counter visibly move the instant the user clicks Generate, even before the refetch lands.

### C. No other surfaces touched
- Frontend `AISegmentSuggester.tsx` already calls `incrementUsage()` on success — no change needed beyond the hook update.
- `klaviyo-create-segments` (the 70+ pre-built bundle function) is untouched.
- No DB migrations; `usage_limits` table and RLS stay as-is. Increment bypasses RLS via service role, which is correct for an authenticated server-side counter.

## Out of scope
- Re-prompting strategy for non-product qualifiers (location, tag, custom property). Current heuristic only enforces product-token presence; broader heuristics can come later if needed.
