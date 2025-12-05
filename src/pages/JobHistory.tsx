import { useEffect, useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Loader2, 
  ChevronRight, Filter, Search, RotateCcw,
  AlertTriangle, Package, MoreHorizontal, Eye, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';

// Helper to calculate time until midnight UTC
function getTimeUntilMidnightUTC(): string {
  const now = new Date();
  const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const hoursRemaining = differenceInHours(midnightUTC, now);
  const minutesRemaining = differenceInMinutes(midnightUTC, now) % 60;
  
  if (hoursRemaining > 0) {
    return `${hoursRemaining}h ${minutesRemaining}m`;
  }
  return `${minutesRemaining}m`;
}
import { ActiveJobDetailModal } from '@/components/ActiveJobDetailModal';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ActiveJob } from '@/components/ActiveJobsButton';

export default function JobHistory() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalSegmentsCreated: 0,
    successRate: 0,
    activeJobs: 0
  });

  useEffect(() => {
    fetchJobs();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('job-history-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'segment_creation_jobs',
      }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  async function fetchJobs() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('segment_creation_jobs')
      .select(`
        *,
        klaviyo_keys(client_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        query = query.in('status', ['in_progress', 'waiting_retry', 'pending']);
      } else {
        query = query.eq('status', statusFilter);
      }
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
      return;
    }

    setJobs(data || []);
    
    // Calculate stats
    const allJobs = data || [];
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const totalSegments = completedJobs.reduce((sum, j) => sum + (j.success_count || 0), 0);
    const totalAttempted = allJobs.reduce((sum, j) => sum + j.total_segments, 0);
    const totalSucceeded = allJobs.reduce((sum, j) => sum + (j.success_count || 0), 0);
    
    setStats({
      totalJobs: allJobs.length,
      totalSegmentsCreated: totalSegments,
      successRate: totalAttempted > 0 ? Math.round((totalSucceeded / totalAttempted) * 100) : 0,
      activeJobs: allJobs.filter(j => ['in_progress', 'waiting_retry', 'pending'].includes(j.status)).length
    });
    
    setLoading(false);
  }

  function getStatusBadge(status: string, rateLimitType?: string | null) {
    const variants: Record<string, { className: string; label: string }> = {
      completed: { className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' },
      in_progress: { className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress' },
      waiting_retry: { className: 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', label: rateLimitType === 'daily' ? 'Resuming tomorrow' : 'Retrying soon' },
      failed: { className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400', label: 'Failed' },
      cancelled: { className: 'bg-muted text-muted-foreground hover:bg-muted', label: 'Cancelled' },
      pending: { className: 'bg-muted text-muted-foreground hover:bg-muted', label: 'Pending' },
    };
    
    const config = variants[status] || { className: 'bg-muted text-muted-foreground', label: status };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'waiting_retry':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  }

  // Filter by search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const clientName = job.klaviyo_keys?.client_name || '';
    return clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleSelectJob(job: any) {
    setSelectedJob({
      ...job,
      client_name: job.klaviyo_keys?.client_name
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader showBackButton />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Job History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your segment creation jobs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Segments Created</p>
                  <p className="text-2xl font-bold">{stats.totalSegmentsCreated}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
                <Loader2 className={`h-8 w-8 text-blue-300 ${stats.activeJobs > 0 ? 'animate-spin' : ''}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Limit Warning Banner */}
        {jobs.some(j => j.status === 'waiting_retry' && j.rate_limit_type === 'daily') && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Klaviyo's daily segment limit reached
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You've hit Klaviyo's 100 segments/day limit. Your queued segments will automatically resume at midnight UTC (~{getTimeUntilMidnightUTC()}).
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchJobs} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No jobs found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusFilter !== 'all' 
                    ? 'Try changing the filter' 
                    : 'Create your first segments to see job history'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Client / Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const progress = Math.round(((job.segments_processed || 0) / job.total_segments) * 100);
                    const startTime = new Date(job.created_at);
                    const endTime = job.completed_at ? new Date(job.completed_at) : new Date();
                    const durationMs = endTime.getTime() - startTime.getTime();
                    const durationMinutes = Math.round(durationMs / 60000);
                    const duration = job.completed_at || job.status === 'failed' || job.status === 'cancelled'
                      ? durationMinutes < 1 ? '< 1 min' : `${durationMinutes} min`
                      : '-';
                    
                    return (
                      <TableRow 
                        key={job.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSelectJob(job)}
                      >
                        <TableCell>
                          {getStatusIcon(job.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {job.klaviyo_keys?.client_name || 'Unknown Client'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {job.total_segments} segments
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status, job.rate_limit_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  job.status === 'completed' ? 'bg-green-500' :
                                  job.status === 'failed' ? 'bg-red-500' :
                                  job.status === 'cancelled' ? 'bg-muted-foreground' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(new Date(job.created_at), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(job.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {['completed', 'failed', 'cancelled'].includes(job.status)
                              ? duration
                              : <span className="text-blue-600">In progress</span>
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSelectJob(job); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              
                              {job.status === 'completed' && (
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); window.open('https://www.klaviyo.com/lists-segments', '_blank'); }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View in Klaviyo
                                </DropdownMenuItem>
                              )}
                              
                              {['in_progress', 'waiting_retry', 'pending'].includes(job.status) && (
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleSelectJob(job); }}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Job
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Klaviyo Attribution Footer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Why do some jobs take time?</strong> Klaviyo limits segment creation to 
            15/minute and 100/day. Aderai automatically works within these limits to keep your 
            account in good standing.
          </p>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedJob && (
        <ActiveJobDetailModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
