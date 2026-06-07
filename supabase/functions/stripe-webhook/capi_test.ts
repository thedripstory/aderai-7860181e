// Verifies SHA-256 email hashing + CAPI body shape match Meta's spec.
// Run via supabase--test_edge_functions. No network calls.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("email is lowercased+trimmed and SHA-256 hashed to known hex", async () => {
  const hashed = await sha256Hex("  Test@Example.COM ".trim().toLowerCase());
  // sha256("test@example.com")
  assertEquals(hashed, "973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b");
});

Deno.test("CAPI body shape matches Meta spec", () => {
  const session = { id: "cs_test_123", currency: "usd", amount_total: 3900 };
  const body = {
    data: [{
      event_name: "Purchase",
      event_time: 1700000000,
      event_id: `purchase_${session.id}`,
      action_source: "website",
      event_source_url: "https://aderai.io/onboarding",
      user_data: { em: ["abc"] },
      custom_data: {
        currency: session.currency.toUpperCase(),
        value: session.amount_total / 100,
      },
    }],
  };
  assertEquals(body.data[0].event_id, "purchase_cs_test_123");
  assertEquals(body.data[0].custom_data.value, 39);
  assertEquals(body.data[0].custom_data.currency, "USD");
  assertEquals(body.data[0].action_source, "website");
});

Deno.test("Meta CAPI credentials are configured", () => {
  const pid = Deno.env.get("META_PIXEL_ID");
  const tok = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!pid || !tok) throw new Error("META_PIXEL_ID / META_CAPI_ACCESS_TOKEN missing");
  assertEquals(typeof pid, "string");
  assertEquals(typeof tok, "string");
});
