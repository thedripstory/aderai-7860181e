import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  segments: number;
  totalRevenue: number;
  emailsSent: number;
  engagementRate: number;
  revenueGrowth: number;
  activeSegments: number;
  lastSync: string;
  topSegments: Array<{
    name: string;
    profiles: number;
    revenue: number;
    engagement: number;
  }>;
}

export const useClientPerformanceMetrics = (timeframe: string = "30days") => {
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateDateRange = (timeframe: string) => {
    const today = new Date();
    const startDate = new Date(today);
    
    switch (timeframe) {
      case "7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(today.getDate() - 90);
        break;
      case "12months":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }
    
    return startDate.toISOString().split('T')[0];
  };

  const fetchClientMetrics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const startDate = calculateDateRange(timeframe);

      // Fetch agency clients
      const { data: agencyClients, error: clientsError } = await supabase
        .from("agency_clients")
        .select("id, client_name, brand_user_id, status")
        .eq("agency_user_id", user.id)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      if (!agencyClients || agencyClients.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Fetch metrics for each client
      const clientMetrics = await Promise.all(
        agencyClients.map(async (client) => {
          // Get performance metrics
          const { data: metrics, error: metricsError } = await supabase
            .from("client_performance_metrics")
            .select("*")
            .eq("client_id", client.id)
            .gte("metric_date", startDate)
            .order("metric_date", { ascending: false });

          if (metricsError) throw metricsError;

          // Get segment performance for top segments
          const { data: segments, error: segmentsError } = await supabase
            .from("segment_performance")
            .select("segment_name, profile_count, revenue, engagement_rate")
            .eq("client_id", client.id)
            .gte("metric_date", startDate)
            .order("revenue", { ascending: false })
            .limit(5);

          if (segmentsError) throw segmentsError;

          // Aggregate metrics
          const totalRevenue = metrics?.reduce((sum, m) => sum + Number(m.total_revenue), 0) || 0;
          const totalEmails = metrics?.reduce((sum, m) => sum + Number(m.emails_sent), 0) || 0;
          const avgEngagement = metrics?.length 
            ? metrics.reduce((sum, m) => sum + Number(m.engagement_rate), 0) / metrics.length 
            : 0;
          
          const totalSegments = metrics?.[0]?.segments_total || 0;
          const activeSegments = metrics?.[0]?.segments_active || 0;
          
          // Calculate revenue growth (comparing latest to earliest in range)
          const revenueGrowth = metrics && metrics.length > 1
            ? ((Number(metrics[0].total_revenue) - Number(metrics[metrics.length - 1].total_revenue)) / 
               Number(metrics[metrics.length - 1].total_revenue)) * 100
            : 0;

          const topSegments = segments?.map(seg => ({
            name: seg.segment_name,
            profiles: seg.profile_count,
            revenue: Number(seg.revenue),
            engagement: Number(seg.engagement_rate)
          })) || [];

          return {
            clientId: client.id,
            clientName: client.client_name,
            segments: totalSegments,
            totalRevenue,
            emailsSent: totalEmails,
            engagementRate: avgEngagement,
            revenueGrowth,
            activeSegments,
            lastSync: metrics?.[0]?.updated_at || new Date().toISOString(),
            topSegments
          };
        })
      );

      setClients(clientMetrics);
    } catch (error: any) {
      console.error("Error fetching client metrics:", error);
      toast({
        title: "Error Loading Metrics",
        description: error.message || "Failed to load client performance data",
        variant: "destructive"
      });
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientMetrics();
  }, [timeframe]);

  return { clients, loading, refetch: fetchClientMetrics };
};
