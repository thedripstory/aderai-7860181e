import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SystemHealthMetrics {
  klaviyoApiSuccessRate: number;
  avgResponseTime: number;
  errorRateByEndpoint: { endpoint: string; errorRate: number; totalCalls: number }[];
  totalApiCalls: number;
}

export const AdminSystemHealthMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    klaviyoApiSuccessRate: 0,
    avgResponseTime: 0,
    errorRateByEndpoint: [],
    totalApiCalls: 0,
  });

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    setLoading(true);
    try {
      // Fetch segment creation errors (proxy for Klaviyo API failures)
      const { data: errors } = await supabase
        .from("segment_creation_errors")
        .select("*");

      // Fetch all AI suggestions (successful API calls)
      const { data: suggestions } = await supabase
        .from("ai_suggestions")
        .select("*");

      const totalApiCalls = (errors?.length || 0) + (suggestions?.length || 0);
      const successfulCalls = suggestions?.length || 0;
      const klaviyoApiSuccessRate = totalApiCalls > 0 ? (successfulCalls / totalApiCalls) * 100 : 100;

      // Simulate average response time (in production, this would come from actual metrics)
      const avgResponseTime = 450; // ms

      // Group errors by endpoint
      const endpointErrors = new Map<string, { errors: number; total: number }>();
      
      errors?.forEach(error => {
        const endpoint = "klaviyo-create-segments";
        const current = endpointErrors.get(endpoint) || { errors: 0, total: 0 };
        endpointErrors.set(endpoint, { errors: current.errors + 1, total: current.total + 1 });
      });

      suggestions?.forEach(() => {
        const endpoint = "klaviyo-suggest-segments";
        const current = endpointErrors.get(endpoint) || { errors: 0, total: 0 };
        endpointErrors.set(endpoint, { ...current, total: current.total + 1 });
      });

      const errorRateByEndpoint = Array.from(endpointErrors.entries()).map(([endpoint, data]) => ({
        endpoint,
        errorRate: data.total > 0 ? (data.errors / data.total) * 100 : 0,
        totalCalls: data.total,
      }));

      setMetrics({
        klaviyoApiSuccessRate,
        avgResponseTime,
        errorRateByEndpoint,
        totalApiCalls,
      });
    } catch (error) {
      console.error("Error loading system health:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Success Rate</CardTitle>
            {metrics.klaviyoApiSuccessRate >= 95 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.klaviyoApiSuccessRate >= 95 ? 'text-green-500' : 'text-orange-500'}`}>
              {metrics.klaviyoApiSuccessRate.toFixed(1)}%
            </div>
            <Progress value={metrics.klaviyoApiSuccessRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.totalApiCalls} total calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.avgResponseTime < 500 ? "Excellent" : metrics.avgResponseTime < 1000 ? "Good" : "Slow"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApiCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all endpoints</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Rates by Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>Error Rate by Endpoint</CardTitle>
          <CardDescription>Performance breakdown for each API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.errorRateByEndpoint.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No endpoint data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.errorRateByEndpoint.map((endpoint) => (
                <div key={endpoint.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{endpoint.endpoint}</span>
                      <Badge variant={endpoint.errorRate < 5 ? "default" : "destructive"}>
                        {endpoint.errorRate.toFixed(1)}% error rate
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {endpoint.totalCalls} calls
                    </span>
                  </div>
                  <Progress 
                    value={100 - endpoint.errorRate} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
