import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingUp, TrendingDown, Minus, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

interface SegmentTrend {
  segmentId: string;
  segmentName: string;
  currentCount: number;
  previousCount: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: { date: string; count: number }[];
}

interface SegmentHistoricalTrendsProps {
  klaviyoKeyId: string;
}

export const SegmentHistoricalTrends: React.FC<SegmentHistoricalTrendsProps> = ({ klaviyoKeyId }) => {
  const [trends, setTrends] = useState<SegmentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = subDays(new Date(), timeRange);
      
      const { data: historicalData, error } = await supabase
        .from('segment_historical_data')
        .select('*')
        .eq('klaviyo_key_id', klaviyoKeyId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // Group by segment and calculate trends
      const segmentMap = new Map<string, { name: string; data: { date: string; count: number }[] }>();
      
      historicalData?.forEach((record: any) => {
        if (!segmentMap.has(record.segment_klaviyo_id)) {
          segmentMap.set(record.segment_klaviyo_id, {
            name: record.segment_name,
            data: [],
          });
        }
        segmentMap.get(record.segment_klaviyo_id)?.data.push({
          date: format(new Date(record.recorded_at), 'MMM dd'),
          count: record.profile_count,
        });
      });

      // Calculate trends
      const calculatedTrends: SegmentTrend[] = [];
      segmentMap.forEach((value, key) => {
        const data = value.data;
        if (data.length >= 2) {
          const currentCount = data[data.length - 1].count;
          const previousCount = data[0].count;
          const changePercent = previousCount > 0 
            ? ((currentCount - previousCount) / previousCount) * 100 
            : 0;

          calculatedTrends.push({
            segmentId: key,
            segmentName: value.name,
            currentCount,
            previousCount,
            changePercent,
            trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
            historicalData: data,
          });
        }
      });

      // Sort by absolute change
      calculatedTrends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      setTrends(calculatedTrends.slice(0, 10));

      // Prepare chart data - aggregate by date
      const dateMap = new Map<string, number>();
      historicalData?.forEach((record: any) => {
        const date = format(new Date(record.recorded_at), 'MMM dd');
        dateMap.set(date, (dateMap.get(date) || 0) + record.profile_count);
      });

      const aggregatedChartData = Array.from(dateMap.entries()).map(([date, total]) => ({
        date,
        totalProfiles: total,
      }));

      setChartData(aggregatedChartData);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [klaviyoKeyId, timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'down':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="border-2 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-primary" />
              Historical Trends
            </CardTitle>
            <CardDescription className="mt-1">
              Track segment growth and decline over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(days as 7 | 30 | 90)}
                className="rounded-full"
              >
                {days}d
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchTrends}
              className="rounded-full"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate Chart */}
        {chartData.length > 0 && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalProfiles" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Total Profiles"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Movers */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Movers ({timeRange} days)
          </h4>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : trends.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No historical data yet"
              description="Segment trends will appear as data is tracked over time. Check back in a few days to see how your segments are growing."
            />
          ) : (
            <div className="space-y-2">
              {trends.map((trend) => (
                <div
                  key={trend.segmentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTrendIcon(trend.trend)}
                    <div>
                      <p className="font-medium text-sm">{trend.segmentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {trend.currentCount.toLocaleString()} profiles
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getTrendColor(trend.trend)}
                  >
                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};