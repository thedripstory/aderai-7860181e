import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MousePointerClick, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays } from "date-fns";

interface EmailMetric {
  email_type: string;
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  open_rate: number;
  click_rate: number;
}

interface DailyMetric {
  date: string;
  opens: number;
  clicks: number;
}

export function AdminEmailTracking() {
  const [metrics, setMetrics] = useState<EmailMetric[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailMetrics();
  }, []);

  const fetchEmailMetrics = async () => {
    try {
      setLoading(true);

      // Get email type metrics
      const { data: emailLogs, error: logsError } = await supabase
        .from("email_audit_log")
        .select("id, email_type, email_log_id")
        .eq("status", "sent")
        .not("email_log_id", "is", null);

      if (logsError) throw logsError;

      // Get tracking events
      const { data: trackingEvents, error: trackingError } = await supabase
        .from("email_tracking")
        .select("email_log_id, event_type");

      if (trackingError) throw trackingError;

      // Build metrics by email type
      const metricsByType: Record<string, EmailMetric> = {};

      emailLogs?.forEach((log) => {
        if (!metricsByType[log.email_type]) {
          metricsByType[log.email_type] = {
            email_type: log.email_type,
            total_sent: 0,
            total_opens: 0,
            total_clicks: 0,
            open_rate: 0,
            click_rate: 0,
          };
        }

        metricsByType[log.email_type].total_sent += 1;

        const opens = trackingEvents?.filter(
          (e) => e.email_log_id === log.email_log_id && e.event_type === "open"
        ).length || 0;

        const clicks = trackingEvents?.filter(
          (e) => e.email_log_id === log.email_log_id && e.event_type === "click"
        ).length || 0;

        if (opens > 0) metricsByType[log.email_type].total_opens += 1;
        if (clicks > 0) metricsByType[log.email_type].total_clicks += 1;
      });

      // Calculate rates
      const metricsArray = Object.values(metricsByType).map((metric) => ({
        ...metric,
        open_rate: metric.total_sent > 0 ? (metric.total_opens / metric.total_sent) * 100 : 0,
        click_rate: metric.total_sent > 0 ? (metric.total_clicks / metric.total_sent) * 100 : 0,
      }));

      setMetrics(metricsArray);

      // Get daily metrics for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: dailyTracking, error: dailyError } = await supabase
        .from("email_tracking")
        .select("event_type, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (dailyError) throw dailyError;

      // Group by date
      const dailyData: Record<string, DailyMetric> = {};
      
      dailyTracking?.forEach((event) => {
        const date = format(new Date(event.created_at), "MMM dd");
        
        if (!dailyData[date]) {
          dailyData[date] = { date, opens: 0, clicks: 0 };
        }

        if (event.event_type === "open") dailyData[date].opens += 1;
        if (event.event_type === "click") dailyData[date].clicks += 1;
      });

      setDailyMetrics(Object.values(dailyData));
    } catch (error) {
      console.error("Error fetching email metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Tracking</CardTitle>
          <CardDescription>Loading email performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSent = metrics.reduce((sum, m) => sum + m.total_sent, 0);
  const totalOpens = metrics.reduce((sum, m) => sum + m.total_opens, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.total_clicks, 0);
  const overallOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const overallClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📧 Email Tracking Analytics</CardTitle>
        <CardDescription>Monitor email opens, clicks, and engagement rates</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-type">By Email Type</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                      <p className="text-2xl font-bold">{totalSent}</p>
                    </div>
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                      <p className="text-2xl font-bold">{overallOpenRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                      <p className="text-2xl font-bold">{overallClickRate.toFixed(1)}%</p>
                    </div>
                    <MousePointerClick className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                      <p className="text-2xl font-bold">{totalClicks}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="by-type" className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Performance by Email Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="email_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="open_rate" fill="#10b981" name="Open Rate %" />
                    <Bar dataKey="click_rate" fill="#3b82f6" name="Click Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border-t p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Email Type</th>
                      <th className="text-right p-2">Sent</th>
                      <th className="text-right p-2">Opens</th>
                      <th className="text-right p-2">Open Rate</th>
                      <th className="text-right p-2">Clicks</th>
                      <th className="text-right p-2">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.email_type} className="border-b">
                        <td className="p-2 font-medium capitalize">{metric.email_type.replace('_', ' ')}</td>
                        <td className="text-right p-2">{metric.total_sent}</td>
                        <td className="text-right p-2">{metric.total_opens}</td>
                        <td className="text-right p-2">{metric.open_rate.toFixed(1)}%</td>
                        <td className="text-right p-2">{metric.total_clicks}</td>
                        <td className="text-right p-2">{metric.click_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="font-semibold mb-4">Last 30 Days Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="opens" stroke="#10b981" name="Opens" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Clicks" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
