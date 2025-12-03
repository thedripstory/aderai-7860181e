import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  RefreshCw, 
  Send, 
  Eye, 
  MousePointer, 
  Calendar,
  Search,
  ArrowUpDown,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  Ban
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PerformanceLoadingState } from '@/components/PerformanceLoadingState';
import { ErrorLogger } from '@/lib/errorLogger';
import { format } from 'date-fns';

interface CampaignMetrics {
  recipients: number;
  opens: number;
  unique_opens: number;
  open_rate: number;
  clicks: number;
  unique_clicks: number;
  click_rate: number;
  bounces: number;
  bounce_rate: number;
  unsubscribes: number;
  unsubscribe_rate: number;
  spam_complaints: number;
  revenue: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  send_time: string | null;
  created_at: string;
  updated_at: string;
  metrics: CampaignMetrics | null;
}

interface CampaignPerformanceProps {
  klaviyoKeyId: string;
  apiKey: string;
  onStatsUpdate?: (count: number) => void;
}

export const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({ 
  klaviyoKeyId, 
  apiKey,
  onStatsUpdate 
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'open_rate' | 'click_rate' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCampaigns();
  }, [klaviyoKeyId]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to view campaigns');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('performance-campaigns-secure', {
        body: { keyId: klaviyoKeyId },
      });

      if (error) throw error;

      if (data?.errors) {
        throw new Error(data.errors[0]?.detail || 'Klaviyo API error');
      }

      const campaignData = data?.data || [];
      const formattedCampaigns: Campaign[] = campaignData.map((c: any) => ({
        id: c.id,
        name: c.attributes?.name || 'Unnamed Campaign',
        status: c.attributes?.status || 'draft',
        send_time: c.attributes?.send_time || null,
        created_at: c.attributes?.created_at || c.attributes?.created,
        updated_at: c.attributes?.updated_at || c.attributes?.updated,
        metrics: c.metrics || null,
      }));

      setCampaigns(formattedCampaigns);
      onStatsUpdate?.(formattedCampaigns.length);
      
      toast.success(`Loaded ${formattedCampaigns.length} campaigns`);
    } catch (error: any) {
      ErrorLogger.logError(error, { context: 'fetch_campaigns' });
      toast.error('Failed to load campaigns', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      sent: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="w-3 h-3" /> },
      scheduled: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
      draft: { color: 'bg-muted text-muted-foreground border-border', icon: <AlertCircle className="w-3 h-3" /> },
      cancelled: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <Ban className="w-3 h-3" /> },
    };
    const config = statusConfig[status.toLowerCase()] || statusConfig.draft;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (value: number) => value.toLocaleString();

  const filteredCampaigns = campaigns
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.send_time || a.created_at).getTime();
        const dateB = new Date(b.send_time || b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'open_rate') {
        const rateA = a.metrics?.open_rate || 0;
        const rateB = b.metrics?.open_rate || 0;
        return sortOrder === 'desc' ? rateB - rateA : rateA - rateB;
      } else if (sortBy === 'click_rate') {
        const rateA = a.metrics?.click_rate || 0;
        const rateB = b.metrics?.click_rate || 0;
        return sortOrder === 'desc' ? rateB - rateA : rateA - rateB;
      } else if (sortBy === 'revenue') {
        const revA = a.metrics?.revenue || 0;
        const revB = b.metrics?.revenue || 0;
        return sortOrder === 'desc' ? revB - revA : revA - revB;
      }
      return 0;
    });

  // Calculate aggregate stats
  const sentCampaigns = campaigns.filter(c => c.status.toLowerCase() === 'sent' && c.metrics);
  const totalRevenue = sentCampaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
  const avgOpenRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((sum, c) => sum + (c.metrics?.open_rate || 0), 0) / sentCampaigns.length 
    : 0;
  const avgClickRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((sum, c) => sum + (c.metrics?.click_rate || 0), 0) / sentCampaigns.length 
    : 0;
  const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.metrics?.recipients || 0), 0);

  if (loading) {
    return <PerformanceLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-card border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatPercent(avgOpenRate)}</p>
              <p className="text-xs text-muted-foreground">Avg Open Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-card border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MousePointer className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatPercent(avgClickRate)}</p>
              <p className="text-xs text-muted-foreground">Avg Click Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/5 to-card border-orange-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatNumber(totalRecipients)}</p>
              <p className="text-xs text-muted-foreground">Total Recipients</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Campaign Performance
              </CardTitle>
              <CardDescription>
                {sentCampaigns.length} sent campaigns with performance data
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCampaigns}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="open_rate">Open Rate</SelectItem>
                <SelectItem value="click_rate">Click Rate</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Campaign List */}
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">No campaigns found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first campaign in Klaviyo'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{campaign.name}</h4>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {campaign.send_time 
                            ? format(new Date(campaign.send_time), 'MMM d, yyyy h:mm a')
                            : format(new Date(campaign.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(`https://www.klaviyo.com/campaign/${campaign.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Metrics Row */}
                    {campaign.metrics ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-xs text-muted-foreground">Recipients</p>
                          <p className="font-semibold">{formatNumber(campaign.metrics.recipients)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Open Rate</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-500" />
                            {formatPercent(campaign.metrics.open_rate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Click Rate</p>
                          <p className="font-semibold flex items-center gap-1">
                            <MousePointer className="w-3 h-3 text-purple-500" />
                            {formatPercent(campaign.metrics.click_rate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Unsubscribes</p>
                          <p className="font-semibold">{formatNumber(campaign.metrics.unsubscribes)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-semibold flex items-center gap-1 text-emerald-600">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(campaign.metrics.revenue).replace('$', '')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-sm text-muted-foreground">
                          {campaign.status.toLowerCase() === 'sent' 
                            ? 'Metrics loading...' 
                            : 'Metrics available after sending'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
