import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, Activity, Search, Download, ArrowUp, ArrowDown, HelpCircle, Key } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsDashboardSkeleton } from '@/components/ui/skeleton-loader';
import { SegmentDetailModal } from '@/components/SegmentDetailModal';
import { toast } from 'sonner';

interface SegmentStats {
  profileCount: number;
  name: string;
  created?: string;
  updated?: string;
  membersAdded?: number;
  membersRemoved?: number;
  netChange?: number;
  changePercent?: number;
}

interface AnalyticsDashboardProps {
  allSegments: any[];
  segmentStats: Record<string, SegmentStats>;
  loadingAnalytics: boolean;
  analyticsProgress: { current: number; total: number };
  onShowHealthScore: () => void;
  calculateHealthScore: () => number;
  klaviyoKeyId?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  allSegments,
  segmentStats,
  loadingAnalytics,
  analyticsProgress,
  onShowHealthScore,
  calculateHealthScore,
  klaviyoKeyId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'change'>('size');
  const [selectedMetric, setSelectedMetric] = useState<'size' | 'growth'>('size');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartData, setChartData] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<{
    id: string;
    name: string;
    profileCount: number;
    description?: string;
  } | null>(null);

  const filteredSegments = allSegments.filter((segment) => {
    const name = segment.attributes?.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    const statsA = segmentStats[a.id];
    const statsB = segmentStats[b.id];

    if (sortBy === 'name') {
      return (statsA?.name || '').localeCompare(statsB?.name || '');
    } else if (sortBy === 'size') {
      return (statsB?.profileCount || 0) - (statsA?.profileCount || 0);
    } else if (sortBy === 'change') {
      return (statsB?.changePercent || 0) - (statsA?.changePercent || 0);
    }
    return 0;
  });

  useEffect(() => {
    if (allSegments.length > 0 && Object.keys(segmentStats).length > 0) {
      const topSegments = sortedSegments.slice(0, 10);
      const data = topSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name?.substring(0, 20) || 'Unknown',
          size: stats?.profileCount || 0,
          growth: stats?.changePercent || 0,
        };
      });
      setChartData(data);
    }
  }, [allSegments, segmentStats, sortBy]);

  const exportData = async () => {
    setExportLoading(true);

    try {
      const exportData = sortedSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name || 'Unknown',
          size: stats?.profileCount || 0,
          created: stats?.created || '',
          updated: stats?.updated || '',
          change: stats?.changePercent || 0,
        };
      });

      const csv = [
        ['Name', 'Size', 'Created', 'Updated', 'Change %'].join(','),
        ...exportData.map((row) => [row.name, row.size, row.created, row.updated, row.change].join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aderai-segments-${Date.now()}.csv`;
      a.click();
      
      toast.success('Analytics exported successfully', {
        description: `Downloaded ${sortedSegments.length} segments to CSV`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics', {
        description: 'Unable to export data. Need help troubleshooting?',
        action: {
          label: 'Get Help',
          onClick: () => window.open('/help?article=troubleshooting', '_blank'),
        },
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loadingAnalytics) {
    return <AnalyticsDashboardSkeleton />;
  }

  // Don't show anything when no segments loaded - parent component handles this case
  if (allSegments.length === 0) {
    return null;
  }

  if (Object.keys(segmentStats).length === 0) {
    return (
      <EmptyState
        icon={Key}
        title="Analytics loading"
        description="We're preparing your analytics dashboard. This may take a moment as we fetch all your segment data from Klaviyo."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Segments</div>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{allSegments.length}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Total Profiles</div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">
            {Object.values(segmentStats)
              .reduce((sum, s) => sum + s.profileCount, 0)
              .toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Avg. Segment Size</div>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">
            {Math.round(
              Object.values(segmentStats).reduce((sum, s) => sum + s.profileCount, 0) /
                (Object.keys(segmentStats).length || 1)
            ).toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
             onClick={onShowHealthScore}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Health Score</div>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{calculateHealthScore()}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Segment Performance</h3>
            <a 
              href="/help?article=analytics" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Learn about analytics"
            >
              <HelpCircle className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="size">Size</option>
              <option value="growth">Growth</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">All Segments</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search segments..."
                className="pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="change">Change</option>
            </select>
            <button
              onClick={exportData}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {sortedSegments.map((segment) => {
            const stats = segmentStats[segment.id];
            return (
              <div
                key={segment.id}
                onClick={() => setSelectedSegment({
                  id: segment.id,
                  name: stats?.name || 'Unknown',
                  profileCount: stats?.profileCount || 0,
                  description: segment.attributes?.description,
                })}
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium mb-1 hover:text-primary transition-colors">
                      {stats?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.profileCount?.toLocaleString() || 0} profiles
                    </div>
                  </div>
                  {stats?.changePercent !== undefined && (
                    <div
                      className={`flex items-center gap-1 ${
                        stats.changePercent > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stats.changePercent > 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{Math.abs(stats.changePercent)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segment Detail Modal */}
      {klaviyoKeyId && (
        <SegmentDetailModal
          isOpen={!!selectedSegment}
          onClose={() => setSelectedSegment(null)}
          segment={selectedSegment}
          klaviyoKeyId={klaviyoKeyId}
        />
      )}
    </>
  );
};
