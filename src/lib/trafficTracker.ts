// Fire-and-forget traffic tracking. Never throws, never blocks UX.
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-traffic`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SESSION_KEY = "aderai_traffic_sid";
const UTM_KEY = "aderai_utm";

type EventType = "page_view" | "cta_click" | "signup" | "checkout_started" | "purchase";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "no-session";
  }
}

export function captureUtmFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_term: params.get("utm_term"),
      utm_content: params.get("utm_content"),
    };
    if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch {}
}

function getStoredUtm() {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function trackTraffic(event_type: EventType, extra: Record<string, any> = {}) {
  try {
    const payload = {
      event_type,
      session_id: getSessionId(),
      path: window.location.pathname,
      referrer: document.referrer || null,
      ...getStoredUtm(),
      ...extra,
    };
    fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
