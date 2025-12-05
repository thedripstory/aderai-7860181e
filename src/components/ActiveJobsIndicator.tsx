import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ActiveJob {
  id: string;
  status: string;
  total_segments: number;
  segments_processed: number;
  success_count: number;
  error_count: number;
  rate_limit_type: string | null;
  last_klaviyo_error: string | null;
  retry_after: string | null;
  created_at: string;
}

export const ActiveJobsIndicator: React.FC = () => {
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [previousStatuses, setPreviousStatuses] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveJobs();

    // Subscribe to job changes
    const channel = supabase
      .channel('active-jobs-indicator')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'segment_creation_jobs'
        },
        (payload) => {
          const newJob = payload.new as ActiveJob;
          const oldStatus = previousStatuses[newJob?.id];

          // Show toast when job completes
          if (newJob?.status === 'completed' && oldStatus !== 'completed') {
            toast({
              title: "✅ All segments created!",
              description: `Successfully created ${newJob.success_count || newJob.segments_processed} segments in Klaviyo.`,
            });
          } else if (newJob?.status === 'failed' && oldStatus !== 'failed') {
            toast({
              title: "Segment creation failed",
              description: "Some segments couldn't be created. Check your Klaviyo connection.",
              variant: "destructive",
            });
          }

          // Update previous statuses
          if (newJob?.id) {
            setPreviousStatuses(prev => ({ ...prev, [newJob.id]: newJob.status }));
          }

          fetchActiveJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [previousStatuses]);

  async function fetchActiveJobs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('segment_creation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['in_progress', 'waiting_retry', 'pending'])
        .order('created_at', { ascending: false });

      setActiveJobs(data || []);

      // Initialize previous statuses
      if (data) {
        const statuses: Record<string, string> = {};
        data.forEach(job => {
          statuses[job.id] = job.status;
        });
        setPreviousStatuses(prev => ({ ...prev, ...statuses }));
      }
    } catch (err) {
      console.error('Failed to fetch active jobs:', err);
    }
  }

  if (activeJobs.length === 0) return null;

  const primaryJob = activeJobs[0];
  const progress = primaryJob.total_segments > 0 
    ? Math.round((primaryJob.segments_processed / primaryJob.total_segments) * 100)
    : 0;

  const getStatusInfo = () => {
    if (primaryJob.status === 'waiting_retry' && primaryJob.rate_limit_type === 'daily') {
      return {
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        text: 'Paused - Klaviyo daily limit',
        color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
      };
    }
    if (primaryJob.status === 'waiting_retry') {
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        text: 'Queued - Auto-retry soon',
        color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
      };
    }
    return {
      icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
      text: 'Creating segments',
      color: 'bg-primary/5 border-primary/20'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${statusInfo.color} cursor-help transition-colors`}>
            {statusInfo.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {statusInfo.text}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {primaryJob.segments_processed}/{primaryJob.total_segments}
                </Badge>
              </div>
              <Progress value={progress} className="h-1.5 mt-1.5" />
            </div>
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">Segment Creation Progress</p>
            <div className="text-sm space-y-1">
              <p>✅ Created: {primaryJob.success_count || primaryJob.segments_processed}</p>
              {primaryJob.error_count > 0 && (
                <p>❌ Failed: {primaryJob.error_count}</p>
              )}
              <p>⏳ Remaining: {primaryJob.total_segments - primaryJob.segments_processed}</p>
            </div>
            {primaryJob.last_klaviyo_error && (
              <p className="text-xs text-muted-foreground mt-2">
                {primaryJob.last_klaviyo_error}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              We'll email you when complete. You can safely leave this page.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};