import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, TrendingUp, Download, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SegmentStats {
  topSegments: { name: string; count: number }[];
  successRate: number;
  avgPerUser: number;
  medianPerUser: number;
  totalSegments: number;
  totalUsers: number;
}

export const AdminSegmentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SegmentStats>({
    topSegments: [],
    successRate: 0,
    avgPerUser: 0,
    medianPerUser: 0,
    totalSegments: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadSegmentAnalytics();
  }, []);

  const loadSegmentAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all AI suggestions (segments)
      const { data: segments, error: segmentsError } = await supabase
        .from("ai_suggestions")
        .select("user_id, suggested_segments, created_segments");

      if (segmentsError) throw segmentsError;

      if (!segments || segments.length === 0) {
        setLoading(false);
        return;
      }

      // Count segment names
      const segmentCounts = new Map<string, number>();
      let totalCreated = 0;
      let totalSuggested = 0;

      segments.forEach(suggestion => {
        const suggested = suggestion.suggested_segments as any[];
        const created = suggestion.created_segments as any[];

        totalSuggested += suggested?.length || 0;
        totalCreated += created?.length || 0;

        // Count created segment names
        created?.forEach(seg => {
          const name = seg.name || "Unknown";
          segmentCounts.set(name, (segmentCounts.get(name) || 0) + 1);
        });
      });

      // Get top 10 segments
      const topSegments = Array.from(segmentCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate success rate
      const successRate = totalSuggested > 0 ? (totalCreated / totalSuggested) * 100 : 0;

      // Calculate segments per user
      const userSegmentCounts = new Map<string, number>();
      segments.forEach(suggestion => {
        const created = (suggestion.created_segments as any[]) || [];
        const count = userSegmentCounts.get(suggestion.user_id) || 0;
        userSegmentCounts.set(suggestion.user_id, count + created.length);
      });

      const counts = Array.from(userSegmentCounts.values()).sort((a, b) => a - b);
      const avgPerUser = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
      const medianPerUser = counts.length > 0 ? counts[Math.floor(counts.length / 2)] : 0;

      setStats({
        topSegments,
        successRate,
        avgPerUser,
        medianPerUser,
        totalSegments: totalCreated,
        totalUsers: userSegmentCounts.size,
      });
    } catch (error) {
      console.error("Error loading segment analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportSegmentData = () => {
    const csv = [
      ["Segment Name", "Count"],
      ...stats.topSegments.map(s => [s.name, s.count.toString()]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSegments}</div>
            <p className="text-xs text-muted-foreground mt-1">Created by {stats.totalUsers} users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Suggestions converted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerUser.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average segments created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Median per User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medianPerUser}</div>
            <p className="text-xs text-muted-foreground mt-1">Median segments created</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Segments Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Most Created Segments</CardTitle>
              <CardDescription>Top 10 segments by creation count</CardDescription>
            </div>
            <Button onClick={exportSegmentData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.topSegments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No segment data available yet</p>
            </div>
          ) : (
            <>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topSegments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-2">
                {stats.topSegments.map((segment, index) => (
                  <div key={segment.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{segment.name}</span>
                    </div>
                    <Badge variant="outline">{segment.count} created</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
