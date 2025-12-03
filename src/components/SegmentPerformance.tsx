import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PerformanceLoadingState } from "@/components/PerformanceLoadingState";
import { ErrorLogger } from "@/lib/errorLogger";

interface PerformanceData {
  segment_id: string;
  segment_name: string;
  revenue: number;
  conversion_rate: number;
  average_order_value: number;
  total_orders: number;
  active_profiles: number;
  revenue_change_percent?: number;
  calculated_at: string;
}

interface SegmentPerformanceProps {
  klaviyoKeyId: string;
  apiKey: string;
}

export const SegmentPerformance = ({ klaviyoKeyId, apiKey }: SegmentPerformanceProps) => {
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformance();
  }, [klaviyoKeyId]);

  const loadPerformance = async () => {
    try {
      // Try to load cached performance data
      const { data, error } = await supabase
        .from("segment_historical_data")
        .select("*")
        .eq("klaviyo_key_id", klaviyoKeyId)
        .order("profile_count", { ascending: false })
        .limit(50); // Fetch more to filter

      if (error) {
        // Table might not exist or other error - just show empty state
        ErrorLogger.logError(error as any, { context: 'load_performance_data' });
      }
      
      // Transform historical data to performance format
      // Filter out exclude/suppression segments - they don't represent active audiences
      if (data && data.length > 0) {
        const excludeKeywords = ['exclude', 'exclusion', 'suppress', 'sunset', 'unsubscribe', 'bounced', 'spam'];
        
        const filteredData = data.filter((item: any) => {
          const nameLower = (item.segment_name || '').toLowerCase();
          return !excludeKeywords.some(keyword => nameLower.includes(keyword));
        });
        
        // Get unique segments (latest record per segment) and take top 10
        const uniqueSegments = new Map<string, any>();
        filteredData.forEach((item: any) => {
          if (!uniqueSegments.has(item.segment_klaviyo_id)) {
            uniqueSegments.set(item.segment_klaviyo_id, item);
          }
        });
        
        const performanceData: PerformanceData[] = Array.from(uniqueSegments.values())
          .slice(0, 10)
          .map((item: any) => ({
            segment_id: item.segment_klaviyo_id,
            segment_name: item.segment_name,
            revenue: 0, // Not available from historical data
            conversion_rate: 0,
            average_order_value: 0,
            total_orders: 0,
            active_profiles: item.profile_count || 0,
            calculated_at: item.recorded_at,
          }));
        setPerformance(performanceData);
      }
    } catch (error) {
      ErrorLogger.logError(error as Error, { context: 'load_performance' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Get auth session for JWT
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to refresh performance data");
        return;
      }

      const { data, error } = await supabase.functions.invoke("calculate-segment-performance", {
        body: {
          klaviyoKeyId,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Performance data updated");
      await loadPerformance();
    } catch (error: any) {
      ErrorLogger.logError(error, { context: 'refresh_performance' });
      toast.error("Failed to refresh performance data", {
        description: "This feature requires additional setup. Please try again later.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return <PerformanceLoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Segments by Audience Size
            </CardTitle>
            <CardDescription>
              Your largest segments by profile count
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {performance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No performance data yet</p>
            <p className="text-sm mt-1">Click refresh to fetch data from Klaviyo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {performance.map((item, index) => (
              <div
                key={item.segment_id}
                className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{item.segment_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.active_profiles.toLocaleString()} active profiles
                      </p>
                    </div>
                  </div>
                  {item.revenue_change_percent !== undefined && item.revenue_change_percent !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${
                      item.revenue_change_percent >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {item.revenue_change_percent >= 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(item.revenue_change_percent).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Profiles</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {item.active_profiles.toLocaleString()}
                    </p>
                  </div>
                  {item.revenue > 0 && (
                    <>
                      <div>
                        <p className="text-muted-foreground mb-1">Revenue</p>
                        <p className="font-semibold flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">AOV</p>
                        <p className="font-semibold">{formatCurrency(item.average_order_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Conv. Rate</p>
                        <p className="font-semibold">{formatPercent(item.conversion_rate)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
