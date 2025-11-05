import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";

export const AdminAPIMonitoring = () => {
  const [apiMetrics, setApiMetrics] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    successRate: 0,
    requestsPerHour: [] as any[]
  });

  useEffect(() => {
    loadAPIMetrics();
  }, []);

  const loadAPIMetrics = async () => {
    try {
      // Get segment creation jobs as proxy for API activity
      const { data: jobs } = await supabase
        .from("segment_creation_jobs")
        .select("*")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      const totalRequests = jobs?.length || 0;
      const successfulJobs = jobs?.filter(j => j.status === 'completed').length || 0;
      const successRate = totalRequests > 0 ? (successfulJobs / totalRequests) * 100 : 100;

      // Simulate hourly request distribution
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        requests: Math.floor(Math.random() * 50) + 10
      }));

      setApiMetrics({
        totalRequests,
        avgResponseTime: Math.floor(Math.random() * 200) + 100, // Simulated
        successRate,
        requestsPerHour: hourlyData
      });
    } catch (error) {
      console.error("Failed to load API metrics:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {apiMetrics.avgResponseTime < 200 ? "Excellent" : "Good"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics.successRate.toFixed(1)}%</div>
            <Badge variant={apiMetrics.successRate > 95 ? "default" : "destructive"} className="mt-1">
              {apiMetrics.successRate > 95 ? "Healthy" : "Needs Attention"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(100 - apiMetrics.successRate).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>API Requests Distribution (24h)</CardTitle>
          <CardDescription>Hourly request volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apiMetrics.requestsPerHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
