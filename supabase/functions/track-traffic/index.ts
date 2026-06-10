import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED = new Set(["page_view", "cta_click", "signup", "checkout_started", "purchase"]);

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "::aderai");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const event_type = String(body.event_type || "");
    if (!ALLOWED.has(event_type)) {
      return new Response(JSON.stringify({ error: "invalid event_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "0.0.0.0";
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("traffic_events").insert({
      event_type,
      session_id: body.session_id ?? null,
      user_id: body.user_id ?? null,
      path: body.path ?? null,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_term: body.utm_term ?? null,
      utm_content: body.utm_content ?? null,
      country,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      ip_hash: await hashIp(ip),
      value_usd: typeof body.value_usd === "number" ? body.value_usd : null,
      metadata: body.metadata ?? {},
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-traffic error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200, // fire-and-forget - never block client
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
