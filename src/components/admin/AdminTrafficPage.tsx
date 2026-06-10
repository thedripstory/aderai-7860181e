import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Eye, MousePointerClick, UserPlus, CreditCard, DollarSign, Download,
  Users as UsersIcon, TrendingUp, Globe, Smartphone, Monitor, Tablet,
} from "lucide-react";
import { AdminDateRangeFilter, DateRange } from "@/components/AdminDateRangeFilter";

type TrafficEvent = {
  id: string;
  event_type: string;
  session_id: string | null;
  user_id: string | null;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  user_agent: string | null;
  value_usd: number | null;
  created_at: string;
};

const rangeToDays: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, all: 3650 };

const DONUT_COLORS = ["hsl(var(--primary))", "hsl(24 95% 53%)", "hsl(199 89% 48%)", "hsl(142 71% 45%)", "hsl(280 65% 60%)", "hsl(45 93% 47%)", "hsl(0 84% 60%)"];

// --- tiny UA parser (no dep) ---
function parseUA(ua: string | null) {
  const s = (ua || "").toLowerCase();
  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (/ipad|tablet/.test(s)) device = "tablet";
  else if (/mobi|iphone|android(?!.*tablet)/.test(s)) device = "mobile";
  let browser = "Other";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/chrome|crios/.test(s)) browser = "Chrome";
  else if (/firefox|fxios/.test(s)) browser = "Firefox";
  else if (/safari/.test(s)) browser = "Safari";
  let os = "Other";
  if (/iphone|ipad|ipod/.test(s)) os = "iOS";
  else if (/android/.test(s)) os = "Android";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/windows/.test(s)) os = "Windows";
  else if (/linux/.test(s)) os = "Linux";
  return { device, browser, os };
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", IN: "India", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", ES: "Spain", IT: "Italy", NL: "Netherlands",
  IE: "Ireland", PL: "Poland", BR: "Brazil", MX: "Mexico", JP: "Japan",
  SG: "Singapore", AE: "UAE", SE: "Sweden", NO: "Norway", DK: "Denmark",
};
const flag = (cc: string) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1f1a5 + c.charCodeAt(0)))
    : "🌐";

export const AdminTrafficPage = () => {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("30d");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeToDays[range] * 86400_000).toISOString();
      const { data } = await supabase
        .from("traffic_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      setEvents((data || []) as TrafficEvent[]);
      setLoading(false);
    })();
  }, [range]);

  const pageViews = useMemo(() => events.filter(e => e.event_type === "page_view"), [events]);

  const funnel = useMemo(() => {
    const visits = pageViews.length;
    const unique = new Set(pageViews.map(e => e.session_id || e.id)).size;
    const clicks = events.filter(e => e.event_type === "cta_click").length;
    const signups = events.filter(e => e.event_type === "signup").length;
    const checkouts = events.filter(e => e.event_type === "checkout_started").length;
    const purchases = events.filter(e => e.event_type === "purchase");
    const revenue = purchases.reduce((s, e) => s + Number(e.value_usd || 0), 0);
    return { visits, unique, clicks, signups, checkouts, purchases: purchases.length, revenue };
  }, [events, pageViews]);

  const visitsOverTime = useMemo(() => {
    const map = new Map<string, number>();
    pageViews.forEach(e => {
      const d = new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, visits]) => ({ date, visits })).reverse();
  }, [pageViews]);

  const countries = useMemo(() => {
    const map = new Map<string, number>();
    pageViews.forEach(e => {
      const c = (e.country || "??").toUpperCase();
      map.set(c, (map.get(c) || 0) + 1);
    });
    const total = pageViews.length || 1;
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, count]) => ({ code, name: COUNTRY_NAMES[code] || code, count, pct: (count / total) * 100 }));
  }, [pageViews]);

  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    pageViews.forEach(e => map.set(e.path || "/", (map.get(e.path || "/") || 0) + 1));
    const total = pageViews.length || 1;
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([path, count]) => ({ path, count, pct: (count / total) * 100 }));
  }, [pageViews]);

  const topReferrers = useMemo(() => {
    const map = new Map<string, number>();
    pageViews.forEach(e => {
      if (!e.referrer) return;
      try {
        const host = new URL(e.referrer.startsWith("http") ? e.referrer : `https://${e.referrer}`).hostname;
        if (!host) return;
        map.set(host, (map.get(host) || 0) + 1);
      } catch {}
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([host, count]) => ({ host, count }));
  }, [pageViews]);

  // unified UTM: stacked bar source × medium, with campaign tooltip
  const utmBreakdown = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    const mediums = new Set<string>();
    events.forEach(e => {
      const src = e.utm_source || "direct";
      const med = e.utm_medium || "(none)";
      mediums.add(med);
      const row = map.get(src) || {};
      row[med] = (row[med] || 0) + 1;
      map.set(src, row);
    });
    const rows = Array.from(map.entries())
      .map(([source, mediums]) => ({ source, ...mediums, total: Object.values(mediums).reduce((a, b) => a + b, 0) }))
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 8);
    return { rows, mediums: Array.from(mediums) };
  }, [events]);

  const ua = useMemo(() => {
    const devices = new Map<string, number>();
    const browsers = new Map<string, number>();
    const oses = new Map<string, number>();
    pageViews.forEach(e => {
      const p = parseUA(e.user_agent);
      devices.set(p.device, (devices.get(p.device) || 0) + 1);
      browsers.set(p.browser, (browsers.get(p.browser) || 0) + 1);
      oses.set(p.os, (oses.get(p.os) || 0) + 1);
    });
    const toArr = (m: Map<string, number>) =>
      Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { devices: toArr(devices), browsers: toArr(browsers), oses: toArr(oses) };
  }, [pageViews]);

  const recentPurchases = useMemo(
    () => events.filter(e => e.event_type === "purchase").slice(0, 12),
    [events]
  );

  const exportCSV = () => {
    const headers = ["created_at","event_type","session_id","path","referrer","utm_source","utm_medium","utm_campaign","country","value_usd"];
    const rows = events.map(e => headers.map(h => JSON.stringify((e as any)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `traffic-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const conv = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "—");
  const overallConv = funnel.unique > 0 ? (funnel.purchases / funnel.unique) * 100 : 0;

  const Kpi = ({ label, value, sub, Icon, tint }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <Icon className={`h-4 w-4 ${tint}`} />
        </div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      </CardContent>
    </Card>
  );

  const DeviceIcon = ({ name }: { name: string }) =>
    name === "mobile" ? <Smartphone className="h-3.5 w-3.5" /> :
    name === "tablet" ? <Tablet className="h-3.5 w-3.5" /> :
    <Monitor className="h-3.5 w-3.5" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Traffic & Funnel</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${events.length.toLocaleString()} events · ${funnel.unique.toLocaleString()} unique visitors`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminDateRangeFilter value={range} onChange={setRange} />
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Visits" value={funnel.visits.toLocaleString()} sub={`${funnel.unique} unique`} Icon={Eye} tint="text-blue-500" />
        <Kpi label="Unique" value={funnel.unique.toLocaleString()} sub="sessions" Icon={UsersIcon} tint="text-cyan-500" />
        <Kpi label="CTA Clicks" value={funnel.clicks.toLocaleString()} sub={conv(funnel.clicks, funnel.unique) + " of visitors"} Icon={MousePointerClick} tint="text-purple-500" />
        <Kpi label="Signups" value={funnel.signups.toLocaleString()} sub={conv(funnel.signups, funnel.unique)} Icon={UserPlus} tint="text-emerald-500" />
        <Kpi label="Checkouts" value={funnel.checkouts.toLocaleString()} sub={conv(funnel.checkouts, funnel.signups) + " of signups"} Icon={CreditCard} tint="text-orange-500" />
        <Kpi label="Purchases" value={funnel.purchases.toLocaleString()} sub={conv(funnel.purchases, funnel.checkouts) + " of checkouts"} Icon={DollarSign} tint="text-green-500" />
        <Kpi label="Revenue" value={`$${funnel.revenue.toFixed(0)}`} sub="tracked" Icon={DollarSign} tint="text-green-500" />
        <Kpi label="Conversion" value={`${overallConv.toFixed(2)}%`} sub="visit → buy" Icon={TrendingUp} tint="text-primary" />
      </div>

      {/* Visits over time — full width compact */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Visits Over Time</CardTitle>
              <CardDescription>Daily page views in window</CardDescription>
            </div>
            <Badge variant="outline">{funnel.visits.toLocaleString()} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={visitsOverTime} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row: Countries + UTM unified chart */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Top Countries</CardTitle>
            <CardDescription>By page views</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {countries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No geo data yet.</p>
            ) : countries.map(c => (
              <div key={c.code} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{flag(c.code)}</span>
                    <span className="font-medium">{c.name}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums text-xs">
                    {c.count} · {c.pct.toFixed(1)}%
                  </span>
                </div>
                <Progress value={c.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">UTM Attribution</CardTitle>
                <CardDescription>Source × medium (stacked)</CardDescription>
              </div>
              <Badge variant="outline">{utmBreakdown.rows.length} sources</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {utmBreakdown.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No UTM data yet — add ?utm_source=… to your ad links.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={utmBreakdown.rows} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="source" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {utmBreakdown.mediums.map((m, i) => (
                    <Bar key={m} dataKey={m} stackId="a" fill={DONUT_COLORS[i % DONUT_COLORS.length]} radius={i === utmBreakdown.mediums.length - 1 ? [0, 4, 4, 0] : 0} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Devices / Browsers / OS */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Devices", data: ua.devices, Icon: Smartphone },
          { title: "Browsers", data: ua.browsers, Icon: Monitor },
          { title: "Operating Systems", data: ua.oses, Icon: Monitor },
        ].map(({ title, data, Icon }) => {
          const total = data.reduce((a, b) => a + b.value, 0) || 1;
          return (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" /> {title}</CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width="50%" height={140}>
                      <PieChart>
                        <Pie data={data} dataKey="value" innerRadius={32} outerRadius={56} paddingAngle={2}>
                          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {data.slice(0, 5).map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 capitalize">
                            <span className="h-2 w-2 rounded-sm" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            {title === "Devices" && <DeviceIcon name={d.name} />}
                            {d.name}
                          </span>
                          <span className="text-muted-foreground tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row: Top pages + Top referrers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Pages</CardTitle>
            <CardDescription>Most-viewed paths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No pageviews yet.</p>
            ) : topPages.map(p => (
              <div key={p.path} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[70%]">{p.path}</code>
                  <span className="text-muted-foreground tabular-nums text-xs">{p.count} · {p.pct.toFixed(0)}%</span>
                </div>
                <Progress value={p.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Referrers</CardTitle>
            <CardDescription>External traffic sources</CardDescription>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No external referrers yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topReferrers.map(r => (
                    <TableRow key={r.host}>
                      <TableCell className="font-medium text-sm">{r.host}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{r.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases (replaces Recent Events) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" /> Recent Purchases
          </CardTitle>
          <CardDescription>Latest tracked conversions with attribution</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No purchases tracked yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPurchases.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">
                      <span className="mr-1">{flag(p.country || "")}</span>
                      {COUNTRY_NAMES[(p.country || "").toUpperCase()] || p.country || "—"}
                    </TableCell>
                    <TableCell className="text-xs">{p.utm_source || (p.referrer ? "referral" : "direct")}</TableCell>
                    <TableCell className="text-xs">{p.utm_campaign || "—"}</TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums">
                      {p.value_usd ? `$${Number(p.value_usd).toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTrafficPage;
