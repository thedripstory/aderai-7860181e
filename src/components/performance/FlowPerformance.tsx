import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  RefreshCw, 
  Play, 
  Pause, 
  Search,
  ArrowUpDown,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PerformanceLoadingState } from '@/components/PerformanceLoadingState';
import { ErrorLogger } from '@/lib/errorLogger';
import { format } from 'date-fns';

interface Flow {
  id: string;
  name: string;
  status: string;
  trigger_type: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

interface FlowPerformanceProps {
  klaviyoKeyId: string;
  apiKey: string;
  onStatsUpdate?: (count: number) => void;
}

export const FlowPerformance: React.FC<FlowPerformanceProps> = ({ 
  klaviyoKeyId, 
  apiKey,
  onStatsUpdate 
}) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchFlows();
  }, [klaviyoKeyId]);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to view flows');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('performance-flows-secure', {
        body: { keyId: klaviyoKeyId },
      });

      if (error) throw error;

      if (data?.errors) {
        throw new Error(data.errors[0]?.detail || 'Klaviyo API error');
      }

      const flowData = data?.data || [];
      const formattedFlows: Flow[] = flowData.map((f: any) => ({
        id: f.id,
        name: f.attributes?.name || 'Unnamed Flow',
        status: f.attributes?.status || 'draft',
        trigger_type: f.attributes?.trigger_type || 'unknown',
        created_at: f.attributes?.created || f.attributes?.created_at,
        updated_at: f.attributes?.updated || f.attributes?.updated_at,
        archived: f.attributes?.archived || false,
      }));

      setFlows(formattedFlows);
      const activeCount = formattedFlows.filter(f => f.status.toLowerCase() === 'live').length;
      onStatsUpdate?.(activeCount);
      
      toast.success(`Loaded ${formattedFlows.length} flows`);
    } catch (error: any) {
      ErrorLogger.logError(error, { context: 'fetch_flows' });
      toast.error('Failed to load flows', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      live: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <Play className="w-3 h-3" /> },
      draft: { color: 'bg-muted text-muted-foreground border-border', icon: <FileText className="w-3 h-3" /> },
      manual: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Pause className="w-3 h-3" /> },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.draft;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getTriggerBadge = (triggerType: string) => {
    const triggers: Record<string, string> = {
      'list': 'List Trigger',
      'segment': 'Segment Trigger',
      'metric': 'Metric Trigger',
      'price-drop': 'Price Drop',
      'date-property': 'Date Property',
      'low-inventory': 'Low Inventory',
    };

    return (
      <Badge variant="secondary" className="text-xs">
        {triggers[triggerType] || triggerType}
      </Badge>
    );
  };

  const filteredFlows = flows
    .filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus && !f.archived;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const liveCount = flows.filter(f => f.status.toLowerCase() === 'live' && !f.archived).length;
  const draftCount = flows.filter(f => f.status.toLowerCase() === 'draft' && !f.archived).length;
  const manualCount = flows.filter(f => f.status.toLowerCase() === 'manual' && !f.archived).length;

  if (loading) {
    return <PerformanceLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Flow Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Play className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{liveCount}</p>
              <p className="text-sm text-muted-foreground">Live</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-card border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Pause className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{manualCount}</p>
              <p className="text-sm text-muted-foreground">Manual</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted/20 to-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{draftCount}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Automated Flows
              </CardTitle>
              <CardDescription>
                {flows.filter(f => !f.archived).length} flows in your account
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchFlows}>
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
                placeholder="Search flows..."
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
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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

          {/* Flow List */}
          {filteredFlows.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">No flows found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first flow in Klaviyo'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold truncate">{flow.name}</h4>
                        {getStatusBadge(flow.status)}
                        {getTriggerBadge(flow.trigger_type)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {format(new Date(flow.updated_at || flow.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          {flow.trigger_type}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(`https://www.klaviyo.com/flow/${flow.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
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
