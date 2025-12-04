import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, ChevronDown, RefreshCw, Inbox, X } from 'lucide-react';
import { useActiveJobs, ActiveJob } from '@/hooks/useActiveJobs';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const ActiveJobsIndicator: React.FC = () => {
  const { jobs, hasActiveJobs, loading, refreshJobs, cancelJob } = useActiveJobs();
  const [open, setOpen] = useState(false);
  const previousJobsRef = useRef<Map<string, ActiveJob>>(new Map());

  // Track job status changes and show toasts
  useEffect(() => {
    const previousJobs = previousJobsRef.current;
    
    jobs.forEach((job) => {
      const prevJob = previousJobs.get(job.id);
      
      // Only show toast if status changed
      if (prevJob && prevJob.status !== job.status) {
        if (job.status === 'completed') {
          toast.success('Segments Created Successfully', {
            description: `${job.success_count} segments created${job.error_count > 0 ? `, ${job.error_count} skipped` : ''}`,
            duration: 5000,
          });
        } else if (job.status === 'failed') {
          toast.error('Segment Creation Failed', {
            description: job.error_message || 'Some segments could not be created',
            duration: Infinity,
          });
        }
      }
    });

    // Update ref with current jobs
    const newMap = new Map<string, ActiveJob>();
    jobs.forEach((job) => newMap.set(job.id, job));
    previousJobsRef.current = newMap;
  }, [jobs]);

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

  const getStatusText = (job: ActiveJob) => {
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
            hasActiveJobs && "border-primary/50 bg-primary/5"
          )}
        >
          {hasActiveJobs ? (
            /* Aggressive rotating loader when jobs active */
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              <div className="absolute inset-0.5 border border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
            </div>
          ) : (
            <Inbox className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">Active Jobs</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
              {activeCount}
            </span>
          )}
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
          {jobs.length > 0 ? (
            jobs.map((job) => {
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
                      {/* Cancel button */}
                      {['pending', 'in_progress', 'retrying', 'waiting_retry'].includes(job.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => cancelJob(job.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel Job
                        </Button>
                      )}
                    </div>
                  );
                })
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active jobs</p>
              <p className="text-xs mt-1">Jobs from the last 24 hours appear here</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};