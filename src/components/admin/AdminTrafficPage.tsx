import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Eye, MousePointerClick, UserPlus, CreditCard, DollarSign, Download } from "lucide-react";
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
  value_usd: number | null;
  created_at: string;
};

const rangeToDays: Record<DateRange, number> = {
  "24h": 1, "7d": 7, "30d": 30, "90d": 90, all: 3650,
};

export const AdminTrafficPage = () => {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("30d");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeToDays[range] * 86400_000).toISOString();
      const { data, error } = await supabase
        .from("traffic_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (!error && data) setEvents(data as TrafficEvent[]);
      setLoading(false);
    };
    load();
  }, [range]);

  const funnel = useMemo(() => {
    const visits = new Set(events.filter(e => e.event_type === "page_view").map(e => e.session_id || e.id)).size;
    const clicks = events.filter(e => e.event_type === "cta_click").length;
    const signups = events.filter(e => e.event_type === "signup").length;
    const checkouts = events.filter(e => e.event_type === "checkout_started").length;
    const purchases = events.filter(e => e.event_type === "purchase");
    const revenue = purchases.reduce((s, e) => s + Number(e.value_usd || 0), 0);
    return { visits, clicks, signups, checkouts, purchases: purchases.length, revenue };
  }, [events]);

  const visitsOverTime = useMemo(() => {
    const map = new Map<string, number>();
    events.filter(e => e.event_type === "page_view").forEach(e => {
      const d = new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, visits]) => ({ date, visits })).reverse();
  }, [events]);

  const topSources = useMemo(() => {
    const map = new Map<string, number>();
    events.filter(e => e.event_type === "page_view").forEach(e => {
      const src = e.utm_source || (e.referrer ? new URL(e.referrer.startsWith("http") ? e.referrer : "https://x").hostname : "direct");
      map.set(src, (map.get(src) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count }));
  }, [events]);

  const topCampaigns = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach(e => {
      if (!e.utm_campaign) return;
      map.set(e.utm_campaign, (map.get(e.utm_campaign) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([campaign, count]) => ({ campaign, count }));
  }, [events]);

  const exportCSV = () => {
    const headers = ["created_at","event_type","session_id","path","referrer","utm_source","utm_medium","utm_campaign","country","value_usd"];
    const rows = events.map(e => headers.map(h => JSON.stringify((e as any)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `traffic-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const stat = (label: string, value: string | number, sub: string, Icon: any, color: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );

  const conv = (a: number, b: number) => b > 0 ? `${((a/b)*100).toFixed(1)}% conv.` : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Traffic & Funnel</h2>
          <p className="text-sm text-muted-foreground">Visits, clicks, signups, checkouts and purchases — with UTM attribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminDateRangeFilter value={range} onChange={setRange} />
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stat("Visits", funnel.visits, "unique sessions", Eye, "text-blue-500")}
        {stat("CTA Clicks", funnel.clicks, conv(funnel.clicks, funnel.visits), MousePointerClick, "text-purple-500")}
        {stat("Signups", funnel.signups, conv(funnel.signups, funnel.visits), UserPlus, "text-emerald-500")}
        {stat("Checkouts", funnel.checkouts, conv(funnel.checkouts, funnel.signups), CreditCard, "text-orange-500")}
        {stat("Purchases", funnel.purchases, conv(funnel.purchases, funnel.checkouts), DollarSign, "text-green-500")}
        {stat("Revenue", `$${funnel.revenue.toFixed(2)}`, "from tracked purchases", DollarSign, "text-green-500")}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visits Over Time</CardTitle>
          <CardDescription>Daily unique page views</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={visitsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
            <CardDescription>UTM source or referring domain</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topSources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="source" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top UTM Campaigns</CardTitle>
            <CardDescription>Events grouped by campaign tag</CardDescription>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No UTM campaigns tracked yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCampaigns} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="campaign" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${events.length} events in window`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 100).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{e.event_type}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate text-xs">{e.path}</TableCell>
                    <TableCell className="text-xs">{e.utm_source || e.referrer || "direct"}</TableCell>
                    <TableCell className="text-xs">{e.utm_campaign || "—"}</TableCell>
                    <TableCell className="text-xs">{e.country || "—"}</TableCell>
                    <TableCell className="text-right text-xs">{e.value_usd ? `$${Number(e.value_usd).toFixed(2)}` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTrafficPage;
