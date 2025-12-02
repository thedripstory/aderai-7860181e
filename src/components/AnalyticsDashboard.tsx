import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, BarChart3, Activity, Search, Download, ArrowUp, ArrowDown, HelpCircle, Target, Zap, Filter, Calendar, Sparkles, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from '@/components/ui/empty-state';
import { AnalyticsDashboardSkeleton } from '@/components/ui/skeleton-loader';
import { SegmentDetailModal } from '@/components/SegmentDetailModal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface SegmentStats {
  profileCount: number;
  name: string;
  created?: string;
  updated?: string;
  membersAdded?: number;
  membersRemoved?: number;
  netChange?: number;
  changePercent?: number;
  tags?: string[];
  isAderai?: boolean;
  isStarred?: boolean;
  isActive?: boolean;
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

type SortOption = 'name' | 'size' | 'created' | 'updated';
type FilterOption = 'all' | 'aderai';

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
  const [sortBy, setSortBy] = useState<SortOption>('size');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<{
    id: string;
    name: string;
    profileCount: number;
    description?: string;
    created?: string;
    updated?: string;
    isAderai?: boolean;
    tags?: string[];
  } | null>(null);

  // Check if segment is Aderai-created (from stats isAderai flag, or fallback to name check)
  const isAderaiSegment = (segment: any, stats?: any): boolean => {
    // Use isAderai flag from stats if available (set by UnifiedDashboard from tag detection)
    if (stats?.isAderai !== undefined) {
      return stats.isAderai;
    }
    // Fallback to name-based detection
    const name = stats?.name || segment?.attributes?.name || '';
    return name.includes('| Aderai') || name.toLowerCase().includes('aderai');
  };

  // Filter segments
  const filteredSegments = useMemo(() => {
    return allSegments.filter((segment) => {
      const stats = segmentStats[segment.id];
      const name = stats?.name || segment.attributes?.name || '';
      
      // Search filter
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Aderai filter
      const matchesFilter = filterBy === 'all' || (filterBy === 'aderai' && isAderaiSegment(segment, stats));
      
      return matchesSearch && matchesFilter;
    });
  }, [allSegments, segmentStats, searchQuery, filterBy]);

  // Sort segments
  const sortedSegments = useMemo(() => {
    return [...filteredSegments].sort((a, b) => {
      const statsA = segmentStats[a.id];
      const statsB = segmentStats[b.id];
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (statsA?.name || '').localeCompare(statsB?.name || '');
          break;
        case 'size':
          comparison = (statsA?.profileCount || 0) - (statsB?.profileCount || 0);
          break;
        case 'created':
          const createdA = statsA?.created ? new Date(statsA.created).getTime() : 0;
          const createdB = statsB?.created ? new Date(statsB.created).getTime() : 0;
          comparison = createdA - createdB;
          break;
        case 'updated':
          const updatedA = statsA?.updated ? new Date(statsA.updated).getTime() : 0;
          const updatedB = statsB?.updated ? new Date(statsB.updated).getTime() : 0;
          comparison = updatedA - updatedB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredSegments, segmentStats, sortBy, sortOrder]);

  // Calculate stats
  const aderaiSegmentCount = useMemo(() => {
    return allSegments.filter(segment => isAderaiSegment(segment, segmentStats[segment.id])).length;
  }, [allSegments, segmentStats]);

  // Calculate segment size distribution for pie chart
  const sizeDistribution = useMemo(() => {
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
    if (sortedSegments.length > 0 && Object.keys(segmentStats).length > 0) {
      const topSegments = sortedSegments.slice(0, 10);
      const data = topSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name?.substring(0, 20) || 'Unknown',
          size: stats?.profileCount || 0,
        };
      });
      setChartData(data);
    }
  }, [sortedSegments, segmentStats]);

  const exportData = async () => {
    setExportLoading(true);

    try {
      const exportRows = sortedSegments.map((segment) => {
        const stats = segmentStats[segment.id];
        return {
          name: stats?.name || 'Unknown',
          size: stats?.profileCount || 0,
          created: stats?.created ? format(new Date(stats.created), 'yyyy-MM-dd HH:mm') : '',
          updated: stats?.updated ? format(new Date(stats.updated), 'yyyy-MM-dd HH:mm') : '',
          isAderai: isAderaiSegment(segment, stats) ? 'Yes' : 'No',
        };
      });

      const csv = [
        ['Name', 'Profiles', 'Created', 'Updated', 'Aderai Segment'].join(','),
        ...exportRows.map((row) => [
          `"${row.name}"`,
          row.size,
          row.created,
          row.updated,
          row.isAderai
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aderai-segments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      toast.success('Analytics exported successfully', {
        description: `Downloaded ${sortedSegments.length} segments to CSV`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  if (loadingAnalytics) {
    return <AnalyticsDashboardSkeleton />;
  }

  if (allSegments.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No segments found"
        description="Connect your Klaviyo account to start viewing segment analytics. Once connected, your segments will appear here with detailed performance metrics."
        actionLabel="Go to Settings"
        onAction={() => window.location.href = '/settings'}
        secondaryActionLabel="Learn More"
        onSecondaryAction={() => window.open('/help?article=klaviyo-setup', '_blank')}
      />
    );
  }

  if (Object.keys(segmentStats).length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Analytics loading"
        description="We're preparing your analytics dashboard. This may take a moment as we fetch all your segment data from Klaviyo."
      />
    );
  }

  const segmentsWithCounts = Object.values(segmentStats).filter(s => s.profileCount != null);
  const totalProfiles = segmentsWithCounts.reduce((sum, s) => sum + (s.profileCount || 0), 0);
  const avgSegmentSize = segmentsWithCounts.length > 0 ? Math.round(totalProfiles / segmentsWithCounts.length) : 0;
  const largestSegment = segmentsWithCounts.length > 0 
    ? segmentsWithCounts.reduce((max, s) => (s.profileCount || 0) > (max.profileCount || 0) ? s : max, { profileCount: 0, name: '' })
    : { profileCount: 0, name: 'N/A' };

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
          <div className="text-4xl font-bold">{allSegments.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {aderaiSegmentCount} created by Aderai
          </p>
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

        <div className="group bg-gradient-to-br from-purple-500/10 via-card to-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-purple-500/30 transition-all duration-300">
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
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
              <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Profiles']}
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
        <div className="flex flex-col gap-4 mb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">All Segments</h3>
              <Badge variant="secondary" className="font-normal">
                {filteredSegments.length} of {allSegments.length}
              </Badge>
            </div>
            <button
              onClick={exportData}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search segments..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center border border-input rounded-lg overflow-hidden">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filterBy === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted text-foreground'
                }`}
              >
                All Segments
              </button>
              <button
                onClick={() => setFilterBy('aderai')}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterBy === 'aderai' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Aderai Only
                <Badge variant="secondary" className="ml-1 text-xs">
                  {aderaiSegmentCount}
                </Badge>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="size">Sort by Profile Count</option>
              <option value="name">Sort by Name</option>
              <option value="created">Sort by Created Date</option>
              <option value="updated">Sort by Updated Date</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="w-4 h-4" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Segment List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {sortedSegments.map((segment, index) => {
            const stats = segmentStats[segment.id];
            const isAderai = isAderaiSegment(segment, stats);
            
            return (
              <div
                key={segment.id}
                onClick={() => setSelectedSegment({
                  id: segment.id,
                  name: stats?.name || 'Unknown',
                  profileCount: stats?.profileCount || 0,
                  description: segment.attributes?.description,
                  created: stats?.created,
                  updated: stats?.updated,
                  isAderai,
                  tags: stats?.tags,
                })}
                className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 15, 300)}ms` }}
              >
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {stats?.name || 'Unknown Segment'}
                      </span>
                      {isAderai && (
                        <Badge className="text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Aderai
                        </Badge>
                      )}
                      {/* Show tags */}
                      {stats?.tags && stats.tags.length > 0 && !isAderai && (
                        <div className="flex items-center gap-1">
                          {stats.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {stats.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{stats.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {stats?.profileCount != null ? `${stats.profileCount.toLocaleString()} profiles` : 'N/A'}
                      </span>
                      {stats?.created && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {formatDate(stats.created)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Profile count bar */}
                    <div className="flex-1 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
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
          <EmptyState
            icon={Search}
            title={filterBy === 'aderai' ? "No Aderai segments found" : "No segments match your search"}
            description={
              filterBy === 'aderai'
                ? "You haven't created any segments with Aderai yet. Head to the Segments tab to create your first segment!"
                : "Try adjusting your search query or filters to find what you're looking for."
            }
            actionLabel={filterBy === 'aderai' ? "Create Segments" : "Clear Filters"}
            onAction={() => {
              if (filterBy === 'aderai') {
                window.location.href = '/dashboard?tab=segments';
              } else {
                setSearchQuery('');
                setFilterBy('all');
              }
            }}
          />
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
