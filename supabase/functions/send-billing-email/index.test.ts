// Deno tests for the billing email template.
// Validates that the rendered HTML reflects the real Stripe amount + currency
// for both new $39 customers and grandfathered $9 customers.

import { assert, assertStringIncludes, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import React from "https://esm.sh/react@18.3.1";
import { BillingEmail, formatAmount } from "./_templates/billing.tsx";

function renderConfirmed(amount: number | string | undefined, currency: string | undefined) {
  return renderAsync(
    React.createElement(BillingEmail, {
      accountName: "Test",
      emailType: "subscription_confirmed",
      dashboardUrl: "https://aderai.io",
      planName: "Pro",
      amount,
      currency,
      nextBillingDate: "January 1, 2026",
    }),
  );
}

Deno.test("formatAmount: number + USD → $39", () => {
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

Deno.test("formatAmount: legacy string passthrough", () => {
  assertEquals(formatAmount("$9", "USD"), "$9");
});

Deno.test("formatAmount: missing → empty string", () => {
  assertEquals(formatAmount(undefined, undefined), "");
  assertEquals(formatAmount(undefined, "USD"), "");
});

Deno.test("template: new $39 USD subscriber renders $39/month", async () => {
  const html = await renderConfirmed(39, "USD");
  assertStringIncludes(html, "$39");
  assertStringIncludes(html, "/month");
});

Deno.test("template: grandfathered $9 USD subscriber renders $9 (not $39)", async () => {
  const html = await renderConfirmed(9, "USD");
  assertStringIncludes(html, "$9");
  assert(!html.includes("$39"), "Grandfathered email must not contain $39");
});

Deno.test("template: £39 GBP subscriber renders £39", async () => {
  const html = await renderConfirmed(39, "GBP");
  assertStringIncludes(html, "£39");
});

Deno.test("template: A$59 AUD subscriber renders A$59", async () => {
  const html = await renderConfirmed(59, "AUD");
  assertStringIncludes(html, "A$59");
});

Deno.test("template: C$59 CAD subscriber renders C$59", async () => {
  const html = await renderConfirmed(59, "CAD");
  assertStringIncludes(html, "C$59");
});

Deno.test("template: missing amount/currency renders without fabricated price", async () => {
  const html = await renderConfirmed(undefined, undefined);
  // Must not invent a price line.
  assert(!html.includes("$39"), "Missing-amount email must not invent $39");
  assert(!html.includes("$9"),  "Missing-amount email must not invent $9");
  // Should still render the subscription confirmation copy.
  assertStringIncludes(html, "Subscription Confirmed");
});
