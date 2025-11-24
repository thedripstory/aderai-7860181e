import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export const AdminFeatureUsage = () => {
  const [loading, setLoading] = useState(true);
  const [featureData, setFeatureData] = useState<any[]>([]);

  useEffect(() => {
    loadFeatureUsage();
  }, []);

  const loadFeatureUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_name, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Aggregate feature usage
      const featureMap = new Map<string, number>();
      
      data?.forEach(event => {
        const feature = event.event_name;
        featureMap.set(feature, (featureMap.get(feature) || 0) + 1);
      });

      // Convert to array and sort by usage
      const chartData = Array.from(featureMap.entries())
        .map(([name, count]) => ({
          feature: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          uses: count
        }))
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 10); // Top 10 features

      setFeatureData(chartData);
    } catch (error) {
      console.error('Error loading feature usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most used features across all users</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Usage</CardTitle>
        <CardDescription>Top 10 most used features (last 1000 events)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={featureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="feature" 
              angle={-45} 
              textAnchor="end" 
              height={120}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uses" fill="hsl(var(--primary))" name="Usage Count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
