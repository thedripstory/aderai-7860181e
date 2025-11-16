import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CrossClientMetric {
  metric: string;
  bestClient: string;
  bestValue: number | string;
  worstClient: string;
  worstValue: number | string;
  averageValue: number | string;
  recommendation: string;
}

export interface ClientComparison {
  name: string;
  revenue: number;
  engagement: number;
  segments: number;
  growth: number;
  status: "excellent" | "good" | "needs-attention";
}

export interface PortfolioMetrics {
  totalClients: number;
  totalRevenue: number;
  avgRevenuePerClient: number;
  totalSegments: number;
  activeSegments: number;
  avgEngagement: number;
}

export const useCrossClientInsights = (timeframe: string = "30days") => {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalClients: 0,
    totalRevenue: 0,
    avgRevenuePerClient: 0,
    totalSegments: 0,
    activeSegments: 0,
    avgEngagement: 0
  });
  const [crossClientData, setCrossClientData] = useState<CrossClientMetric[]>([]);
  const [clientComparison, setClientComparison] = useState<ClientComparison[]>([]);
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

  const determineStatus = (engagement: number, growth: number): "excellent" | "good" | "needs-attention" => {
    if (engagement >= 30 && growth >= 35) return "excellent";
    if (engagement >= 25 && growth >= 20) return "good";
    return "needs-attention";
  };

  const fetchCrossClientInsights = async () => {
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
        .select("id, client_name")
        .eq("agency_user_id", user.id)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      if (!agencyClients || agencyClients.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch metrics for all clients
      const { data: allMetrics, error: metricsError } = await supabase
        .from("client_performance_metrics")
        .select("*")
        .in("client_id", agencyClients.map(c => c.id))
        .gte("metric_date", startDate);

      if (metricsError) throw metricsError;

      // Fetch best practices data
      const { data: bestPractices, error: bpError } = await supabase
        .from("cross_client_best_practices")
        .select("*")
        .eq("agency_user_id", user.id)
        .gte("analysis_date", startDate)
        .order("analysis_date", { ascending: false });

      if (bpError) throw bpError;

      // Calculate portfolio metrics
      const clientMetricsMap = new Map();
      agencyClients.forEach(client => {
        const clientMetrics = allMetrics?.filter(m => m.client_id === client.id) || [];
        const totalRevenue = clientMetrics.reduce((sum, m) => sum + Number(m.total_revenue), 0);
        const totalEmails = clientMetrics.reduce((sum, m) => sum + Number(m.emails_sent), 0);
        const avgEngagement = clientMetrics.length 
          ? clientMetrics.reduce((sum, m) => sum + Number(m.engagement_rate), 0) / clientMetrics.length 
          : 0;
        const totalSegments = clientMetrics[0]?.segments_total || 0;
        const activeSegments = clientMetrics[0]?.segments_active || 0;
        
        const revenueGrowth = clientMetrics.length > 1
          ? ((Number(clientMetrics[0].total_revenue) - Number(clientMetrics[clientMetrics.length - 1].total_revenue)) / 
             Number(clientMetrics[clientMetrics.length - 1].total_revenue)) * 100
          : 0;

        clientMetricsMap.set(client.id, {
          name: client.client_name,
          revenue: totalRevenue,
          engagement: avgEngagement,
          segments: totalSegments,
          activeSegments,
          growth: revenueGrowth
        });
      });

      const allClientMetrics = Array.from(clientMetricsMap.values());
      const totalRevenue = allClientMetrics.reduce((sum, c) => sum + c.revenue, 0);
      const totalSegments = allClientMetrics.reduce((sum, c) => sum + c.segments, 0);
      const totalActiveSegments = allClientMetrics.reduce((sum, c) => sum + c.activeSegments, 0);
      const avgEngagement = allClientMetrics.length 
        ? allClientMetrics.reduce((sum, c) => sum + c.engagement, 0) / allClientMetrics.length 
        : 0;

      setPortfolioMetrics({
        totalClients: agencyClients.length,
        totalRevenue,
        avgRevenuePerClient: totalRevenue / agencyClients.length,
        totalSegments,
        activeSegments: totalActiveSegments,
        avgEngagement
      });

      // Format best practices data
      const crossClientMetrics = bestPractices?.map(bp => {
        const bestClient = agencyClients.find(c => c.id === bp.best_performing_client_id);
        const worstClient = agencyClients.find(c => c.id === bp.worst_performing_client_id);
        
        return {
          metric: bp.metric_name,
          bestClient: bestClient?.client_name || "Unknown",
          bestValue: bp.best_value,
          worstClient: worstClient?.client_name || "Unknown",
          worstValue: bp.worst_value,
          averageValue: bp.average_value,
          recommendation: bp.recommendation
        };
      }) || [];

      setCrossClientData(crossClientMetrics);

      // Format client comparison data
      const comparison = allClientMetrics
        .map(c => ({
          ...c,
          status: determineStatus(c.engagement, c.growth)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setClientComparison(comparison);

    } catch (error: any) {
      console.error("Error fetching cross-client insights:", error);
      toast({
        title: "Error Loading Insights",
        description: error.message || "Failed to load cross-client insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrossClientInsights();
  }, [timeframe]);

  return { 
    portfolioMetrics, 
    crossClientData, 
    clientComparison, 
    loading, 
    refetch: fetchCrossClientInsights 
  };
};
