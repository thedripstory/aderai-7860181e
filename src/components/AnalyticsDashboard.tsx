import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, Activity, Search, Download, ArrowUp, ArrowDown, HelpCircle, Key, Sparkles, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsDashboardSkeleton } from '@/components/ui/skeleton-loader';
import { SegmentDetailModal } from '@/components/SegmentDetailModal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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

const CHART_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

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

  // Calculate segment size distribution for pie chart
  const sizeDistribution = React.useMemo(() => {
    const ranges = [
      { name: '0-100', min: 0, max: 100, count: 0 },
      { name: '100-500', min: 100, max: 500, count: 0 },
      { name: '500-1K', min: 500, max: 1000, count: 0 },
      { name: '1K-5K', min: 1000, max: 5000, count: 0 },
      { name: '5K+', min: 5000, max: Infinity, count: 0 },
    ];
    
    Object.values(segmentStats).forEach(stat => {
      const range = ranges.find(r => stat.profileCount >= r.min && stat.profileCount < r.max);
      if (range) range.count++;
    });
    
    return ranges.filter(r => r.count > 0);
  }, [segmentStats]);

  useEffect(() => {
    if (allSegments.length > 0 && Object.keys(segmentStats).length > 0) {
      const topSegments = sortedSegments.slice(0, 10);
      const data = topSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name?.substring(0, 15) || 'Unknown',
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

  const totalProfiles = Object.values(segmentStats).reduce((sum, s) => sum + s.profileCount, 0);
  const avgSegmentSize = Math.round(totalProfiles / (Object.keys(segmentStats).length || 1));
  const largestSegment = Object.values(segmentStats).reduce((max, s) => s.profileCount > max.profileCount ? s : max, { profileCount: 0, name: '' });

  return (
    <>
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="group bg-gradient-to-br from-primary/10 via-card to-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Total Segments</div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{allSegments.length}</div>
          <p className="text-xs text-muted-foreground mt-2">Active in your Klaviyo account</p>
        </div>

        <div className="group bg-gradient-to-br from-green-500/10 via-card to-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Total Profiles</div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Users className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="text-4xl font-bold">{totalProfiles.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2">Across all segments</p>
        </div>

        <div className="group bg-gradient-to-br from-blue-500/10 via-card to-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Avg. Segment Size</div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-4xl font-bold">{avgSegmentSize.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2">Profiles per segment</p>
        </div>

        <div className="group bg-gradient-to-br from-purple-500/10 via-card to-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
             onClick={onShowHealthScore}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Largest Segment</div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="text-4xl font-bold">{largestSegment.profileCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2 truncate" title={largestSegment.name}>{largestSegment.name || 'N/A'}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Top Segments by Size</h3>
                <p className="text-sm text-muted-foreground">Your largest audience segments</p>
              </div>
            </div>
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

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar 
                dataKey="size" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                name="Profiles"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Size Distribution</h3>
              <p className="text-sm text-muted-foreground">Segments by profile count</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sizeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
              >
                {sizeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [`${value} segments`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {sizeDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">All Segments</h3>
            <Badge variant="secondary" className="font-normal">
              {filteredSegments.length} of {allSegments.length}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search segments..."
                className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="change">Sort by Change</option>
            </select>
            <button
              onClick={exportData}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sortedSegments.map((segment, index) => {
            const stats = segmentStats[segment.id];
            const isAderai = stats?.name?.includes('Aderai');
            return (
              <div
                key={segment.id}
                onClick={() => setSelectedSegment({
                  id: segment.id,
                  name: stats?.name || 'Unknown',
                  profileCount: stats?.profileCount || 0,
                  description: segment.attributes?.description,
                })}
                className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium group-hover:text-primary transition-colors truncate">
                        {stats?.name || 'Unknown'}
                      </span>
                      {isAderai && (
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                          Aderai
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.profileCount?.toLocaleString() || 0} profiles
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {stats?.changePercent !== undefined && stats.changePercent !== 0 && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          stats.changePercent > 0 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {stats.changePercent > 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs(stats.changePercent)}%
                      </div>
                    )}
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((stats?.profileCount || 0) / (largestSegment.profileCount || 1) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSegments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No segments found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        )}
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
