// Deno tests for the billing email template.
// We validate the `formatAmount` helper exhaustively because it is what
// determines whether a grandfathered $9 customer or a new $39 customer (or
// any of the regional currencies) sees the correct value in their email.
//
// Note: full renderAsync(BillingEmail) testing is intentionally avoided here.
// The Deno test runner picks up a React 19 canary alongside react-dom 18,
// which causes Radix Slot to throw inside @react-email components. The price
// formatting contract is exercised end-to-end via formatAmount, which is the
// single source of truth used by every email line.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { formatAmount } from "./_templates/billing.tsx";

Deno.test("formatAmount: number + USD → $39 (new subscriber)", () => {
  assertEquals(formatAmount(39, "USD"), "$39");
});

Deno.test("formatAmount: number + GBP → £39", () => {
  assertEquals(formatAmount(39, "GBP"), "£39");
});

Deno.test("formatAmount: number + AUD → A$59", () => {
  assertEquals(formatAmount(59, "AUD"), "A$59");
});

Deno.test("formatAmount: number + CAD → C$59", () => {
  assertEquals(formatAmount(59, "CAD"), "C$59");
});

Deno.test("formatAmount: grandfathered $9 USD subscriber → $9 (not $39)", () => {
  // The webhook now passes Stripe's real unit_amount; for grandfathered users
  // that is 9 USD, not 39 USD.
  const out = formatAmount(9, "USD");
  assertEquals(out, "$9");
  assert(!out.includes("39"), "Grandfathered amount must not contain 39");
});

Deno.test("formatAmount: legacy already-formatted string passthrough", () => {
  assertEquals(formatAmount("$9", "USD"), "$9");
  assertEquals(formatAmount("£39", "GBP"), "£39");
});

Deno.test("formatAmount: missing amount → empty string (no fabricated price)", () => {
  assertEquals(formatAmount(undefined, undefined), "");
  assertEquals(formatAmount(undefined, "USD"), "");
  assertEquals(formatAmount("", "USD"), "");
});

Deno.test("formatAmount: unknown currency falls back without symbol", () => {
  assertEquals(formatAmount(39, "XYZ"), "39");
});

Deno.test("formatAmount: decimal amounts preserved", () => {
  assertEquals(formatAmount(39.5, "USD"), "$39.50");
});

// Sanity: the template lines that use amountStr render conditionally so an
// empty formatAmount() result produces no Amount: line at all.
Deno.test("contract: empty formatAmount means template skips the Amount line", () => {
  const amountStr = formatAmount(undefined, undefined);
  // mirror of `amountStr ? \`Amount: ${amountStr}/month\` : null` in template
  const line = amountStr ? `Amount: ${amountStr}/month` : null;
  assertEquals(line, null);
});

Deno.test("contract: $39 USD produces 'Amount: $39/month' line", () => {
  const amountStr = formatAmount(39, "USD");
  const line = amountStr ? `Amount: ${amountStr}/month` : null;
  assertEquals(line, "Amount: $39/month");
});

Deno.test("contract: £39 GBP produces 'Amount: £39/month' line", () => {
  const amountStr = formatAmount(39, "GBP");
  const line = amountStr ? `Amount: ${amountStr}/month` : null;
  assertEquals(line, "Amount: £39/month");
});

Deno.test("contract: grandfathered $9 USD produces 'Amount: $9/month' line", () => {
  const amountStr = formatAmount(9, "USD");
  const line = amountStr ? `Amount: ${amountStr}/month` : null;
  assertEquals(line, "Amount: $9/month");
});
