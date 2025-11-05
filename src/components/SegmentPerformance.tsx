import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("segment_performance" as any)
        .select("*")
        .eq("klaviyo_key_id", klaviyoKeyId)
        .order("revenue", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPerformance((data as any) || []);
    } catch (error) {
      console.error("Error loading performance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-segment-performance", {
        body: {
          klaviyoKeyId,
          apiKey,
        },
      });

      if (error) throw error;

      toast.success("Performance data updated");
      loadPerformance();
    } catch (error: any) {
      console.error("Error refreshing performance:", error);
      toast.error(error.message || "Failed to refresh performance data");
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Segment Performance
            </CardTitle>
            <CardDescription>
              Top revenue-generating segments
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
                  {item.revenue_change_percent !== undefined && (
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
                    <p className="text-muted-foreground mb-1">Revenue</p>
                    <p className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Orders</p>
                    <p className="font-semibold">{item.total_orders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">AOV</p>
                    <p className="font-semibold">{formatCurrency(item.average_order_value)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Conv. Rate</p>
                    <p className="font-semibold">{formatPercent(item.conversion_rate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
