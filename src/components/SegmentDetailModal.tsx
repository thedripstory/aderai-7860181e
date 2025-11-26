import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Users, Mail, MousePointer, DollarSign, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface SegmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: {
    id: string;
    name: string;
    profileCount: number;
    description?: string;
  } | null;
  klaviyoKeyId: string;
}

interface TimePeriodMetrics {
  period: string;
  days: number;
  profileChange: number;
  changePercent: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  revenue?: number;
}

interface HistoricalDataPoint {
  date: string;
  profileCount: number;
}

export const SegmentDetailModal: React.FC<SegmentDetailModalProps> = ({
  isOpen,
  onClose,
  segment,
  klaviyoKeyId,
}) => {
  const [loading, setLoading] = useState(false);
  const [timePeriodMetrics, setTimePeriodMetrics] = useState<TimePeriodMetrics[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    if (isOpen && segment) {
      fetchSegmentDetails();
    }
  }, [isOpen, segment]);

  const fetchSegmentDetails = async () => {
    if (!segment) return;
    
    setLoading(true);
    try {
      // Fetch historical data from database
      const { data: historicalRecords } = await supabase
        .from('segment_historical_data')
        .select('profile_count, recorded_at')
        .eq('segment_klaviyo_id', segment.id)
        .eq('klaviyo_key_id', klaviyoKeyId)
        .order('recorded_at', { ascending: true })
        .limit(365);

      if (historicalRecords && historicalRecords.length > 0) {
        const chartData = historicalRecords.map(record => ({
          date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profileCount: record.profile_count,
        }));
        setHistoricalData(chartData);

        // Calculate metrics for each time period
        const periods = [
          { period: 'Last 30 days', days: 30 },
          { period: 'Last 60 days', days: 60 },
          { period: 'Last 90 days', days: 90 },
          { period: 'Last 120 days', days: 120 },
          { period: 'Last 180 days', days: 180 },
          { period: 'Last 365 days', days: 365 },
        ];

        const currentCount = segment.profileCount;
        const metrics: TimePeriodMetrics[] = periods.map(p => {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - p.days);
          
          const recordsInPeriod = historicalRecords.filter(
            r => new Date(r.recorded_at) >= cutoffDate
          );
          
          const oldestInPeriod = recordsInPeriod[0]?.profile_count || currentCount;
          const profileChange = currentCount - oldestInPeriod;
          const changePercent = oldestInPeriod > 0 
            ? ((profileChange / oldestInPeriod) * 100) 
            : 0;

          return {
            period: p.period,
            days: p.days,
            profileChange,
            changePercent: Math.round(changePercent * 10) / 10,
          };
        });

        setTimePeriodMetrics(metrics);
      } else {
        // No historical data - show current state only
        setHistoricalData([{
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profileCount: segment.profileCount,
        }]);
        
        setTimePeriodMetrics([
          { period: 'Last 30 days', days: 30, profileChange: 0, changePercent: 0 },
          { period: 'Last 60 days', days: 60, profileChange: 0, changePercent: 0 },
          { period: 'Last 90 days', days: 90, profileChange: 0, changePercent: 0 },
          { period: 'Last 120 days', days: 120, profileChange: 0, changePercent: 0 },
          { period: 'Last 180 days', days: 180, profileChange: 0, changePercent: 0 },
          { period: 'Last 365 days', days: 365, profileChange: 0, changePercent: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching segment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!segment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{segment.name}</DialogTitle>
          {segment.description && (
            <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Profile Count */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Profile Count</p>
                  <p className="text-3xl font-bold">{segment.profileCount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Performance by Time Period</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Profile Change</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timePeriodMetrics.map((metric, index) => (
                      <tr key={metric.period} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="px-4 py-3 text-sm">{metric.period}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`flex items-center justify-end gap-1 ${
                            metric.profileChange > 0 ? 'text-green-500' : 
                            metric.profileChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            {metric.profileChange > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : metric.profileChange < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : null}
                            {metric.profileChange > 0 ? '+' : ''}{metric.profileChange.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            metric.changePercent > 0 ? 'text-green-500' : 
                            metric.changePercent < 0 ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile Count Trend Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Profile Count Trend</h3>
              <div className="bg-card border border-border rounded-lg p-4">
                {historicalData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Profiles']}
                      />
                      <Line
                        type="monotone"
                        dataKey="profileCount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">Not enough historical data to show trends</p>
                    <p className="text-xs mt-1">Data will accumulate over time</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Metrics Placeholder */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                Email metrics (open rate, click rate, conversions) will be available when historical campaign data is tracked.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
