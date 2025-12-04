import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import { useActiveJobs } from '@/hooks/useActiveJobs';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const ActiveJobsIndicator: React.FC = () => {
  const { jobs, hasActiveJobs, loading, refreshJobs } = useActiveJobs();
  const [open, setOpen] = useState(false);

  if (loading || !hasActiveJobs) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'in_progress':
      case 'retrying':
        return (
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          </div>
        );
      case 'waiting_retry':
        return <RefreshCw className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusText = (job: typeof jobs[0]) => {
    const progress = job.total_segments > 0 
      ? Math.round((job.segments_processed / job.total_segments) * 100)
      : 0;
    
    switch (job.status) {
      case 'pending':
        return 'Queued...';
      case 'in_progress':
        return `Creating segments (${progress}%)`;
      case 'retrying':
        return `Retrying failed segments...`;
      case 'waiting_retry':
        return `Waiting to retry (${job.error_count} failed)`;
      case 'completed':
        return `Completed (${job.success_count} created)`;
      case 'failed':
        return `Failed: ${job.error_message || 'Unknown error'}`;
      default:
        return job.status;
    }
  };

  const activeCount = jobs.filter(j => 
    ['pending', 'in_progress', 'retrying', 'waiting_retry'].includes(j.status)
  ).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 relative",
            activeCount > 0 && "border-primary/50 bg-primary/5"
          )}
        >
          {/* Aggressive rotating loader */}
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-0.5 border border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>
          </div>
          <span className="hidden sm:inline">Active Jobs</span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
            {activeCount}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50"
        align="end"
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Segment Creation Jobs</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => refreshJobs()}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Aderai automatically retries failed segments
          </p>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {jobs.map((job) => {
            const progress = job.total_segments > 0 
              ? (job.segments_processed / job.total_segments) * 100
              : 0;
            
            return (
              <div 
                key={job.id} 
                className="p-3 border-b border-border/30 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getStatusText(job)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {job.segments_processed}/{job.total_segments}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {job.success_count > 0 && (
                        <span className="text-green-500">✓ {job.success_count}</span>
                      )}
                      {job.error_count > 0 && (
                        <span className="text-amber-500">⟳ {job.error_count} retrying</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {jobs.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No active jobs
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
