# Fix segment definitions in `klaviyo-create-segments`

## Issue 1 — AOV/CLV segments using wrong filter type

Four segments are currently built with `type: 'profile-property'` against `properties['Average Order Value']` / `properties['Historic Customer Lifetime Value']`. Klaviyo stores these as **predictive analytics dimensions**, not custom profile properties — so the segments either match zero people or have to be manually re-pointed (as you did in screenshot 2).

Switch all four to `type: 'profile-predictive-analytics'` with the correct `dimension`:

| Segment | Current (wrong) | Fix |
|---|---|---|
| Low AOV Customers (#32) | profile-property `Average Order Value` | predictive dimension `average_order_value`, `less-than` |
| High AOV Customers (#31) | profile-property `Average Order Value` | predictive dimension `average_order_value`, `greater-than` |
| Bargain Shoppers (#27) | profile-property `Historic Customer Lifetime Value` | predictive dimension `historic_clv`, `less-than` |
| Big Spenders (#26) | profile-property `Historic Customer Lifetime Value` | predictive dimension `historic_clv`, `greater-than` |

Filter shape mirrors the existing working `predicted-vips` block:
```ts
{
  type: 'profile-predictive-analytics',
  dimension: 'average_order_value',
  filter: { type: 'numeric', operator: 'less-than', value: aov }
}
```

## Issue 2 — Coupon Users & Full-Price Buyers fail with "An invalid field type was passed in"

Both segments use `metric_filters` with `operator: 'is-not-empty'` / `'is-empty'` on a string filter. Klaviyo's segment API does not accept those operators in this context — confirmed by the `segment_operations` error log showing both segments failing with this exact message.

Fix:
- **Coupon Users**: change filter to `{ type: 'string', operator: 'is-set' }`
- **Full-Price Buyers**: change filter to `{ type: 'string', operator: 'is-not-set' }`

Keep the property name `Discount Codes` (Klaviyo's Placed Order standard event property). If after deploy the segments come back with 0 matches, the follow-up is to also try `Discount Code` (singular) — but the immediate "invalid field type" error is the operator.

## Files touched

- `supabase/functions/klaviyo-create-segments/index.ts` — edits at lines ~533–656 (4 segment blocks) and lines ~793–831 (2 metric_filter operators).

No DB migrations, no frontend changes, no other functions affected. After deploy, recreate the 6 segments to verify.
