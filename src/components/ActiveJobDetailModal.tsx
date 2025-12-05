import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle2, Clock, Loader2, 
  ExternalLink, AlertTriangle,
  Package
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveJob } from './ActiveJobsButton';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { SEGMENTS } from '@/lib/segmentData';

interface ActiveJobDetailModalProps {
  job: ActiveJob;
  onClose: () => void;
}

export function ActiveJobDetailModal({ job, onClose }: ActiveJobDetailModalProps) {
  const [liveJob, setLiveJob] = useState<ActiveJob>(job);
  
  // Subscribe to real-time updates for this specific job
  useEffect(() => {
    const channel = supabase
      .channel(`job-detail-${job.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'segment_creation_jobs',
        filter: `id=eq.${job.id}`
      }, (payload) => {
        setLiveJob(payload.new as ActiveJob);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job.id]);

  const progress = Math.round(((liveJob.segments_processed || 0) / liveJob.total_segments) * 100);
  const isWaiting = liveJob.status === 'waiting_retry';
  const isComplete = liveJob.status === 'completed';
  const isPending = liveJob.status === 'pending';

  // Get segment names for display
  const completedSegments = ((liveJob.completed_segment_ids || []) as string[]).map(id => {
    const segment = SEGMENTS.find(s => s.id === id);
    return { id, name: segment?.name || id, status: 'completed' };
  });
  
  const pendingSegments = ((liveJob.pending_segment_ids || []) as string[]).map(id => {
    const segment = SEGMENTS.find(s => s.id === id);
    return { id, name: segment?.name || id, status: 'pending' };
  });

  const failedSegments = ((liveJob.failed_segment_ids || []) as string[]).map(id => {
    const segment = SEGMENTS.find(s => s.id === id);
    return { id, name: segment?.name || id, status: 'failed' };
  });

  // Time calculations
  const retryTime = liveJob.retry_after ? new Date(liveJob.retry_after) : null;
  const now = new Date();
  const waitMinutes = retryTime ? Math.max(0, Math.ceil((retryTime.getTime() - now.getTime()) / 60000)) : 0;
  const remainingSegments = liveJob.total_segments - (liveJob.segments_processed || 0);
  const estimatedMinutes = Math.ceil(remainingSegments / 12 * 5);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : isWaiting ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : isPending ? (
              <Clock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            {liveJob.client_name || 'Segment Creation'} Job
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Status Banner */}
          <div className={`p-3 rounded-lg mb-4 ${
            isComplete 
              ? 'bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-800' 
              : isWaiting 
                ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                : 'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${
                isComplete ? 'text-green-800 dark:text-green-200' : isWaiting ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'
              }`}>
                {isComplete 
                  ? '✅ All segments created!' 
                  : isWaiting 
                    ? `⏸️ Paused - Resumes in ${waitMinutes} minutes`
                    : isPending 
                      ? '⏳ Queued - Starting soon...'
                      : `🔄 Creating segments... (~${estimatedMinutes} min left)`
                }
              </span>
              <Badge variant="outline">
                {progress}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{liveJob.segments_processed || 0} completed</span>
              <span>{remainingSegments} remaining</span>
            </div>
          </div>

          {/* Klaviyo Rate Limit Explanation */}
          {isWaiting && (
            <div className="p-3 bg-muted/50 rounded-lg mb-4 border">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Why is this paused?</p>
                  <p className="text-muted-foreground mt-1">
                    {liveJob.rate_limit_type === 'daily' 
                      ? "Klaviyo limits segment creation to 100 per day per account. This is a Klaviyo platform restriction, not an Aderai limitation."
                      : "Klaviyo limits segment creation to 15 per minute. We're automatically waiting to stay within their limits."
                    }
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    ⚡ Don't worry - we'll automatically resume and email you when done.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Segment Lists */}
          <Tabs defaultValue="completed" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="completed" className="flex-1 gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed ({completedSegments.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 gap-1">
                <Clock className="h-3.5 w-3.5" />
                Pending ({pendingSegments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="completed" className="flex-1 overflow-hidden mt-2">
              <ScrollArea className="h-[200px] rounded border">
                {completedSegments.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No segments completed yet
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {completedSegments.map((segment) => (
                      <div key={segment.id} className="px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm truncate">{segment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="pending" className="flex-1 overflow-hidden mt-2">
              <ScrollArea className="h-[200px] rounded border">
                {pendingSegments.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    All segments have been created! 🎉
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {pendingSegments.map((segment) => (
                      <div key={segment.id} className="px-3 py-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{segment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              <span>Started {formatDistanceToNow(new Date(liveJob.created_at), { addSuffix: true })}</span>
            </div>
            {isComplete && liveJob.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed {formatDistanceToNow(new Date(liveJob.completed_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isComplete && (
            <Button 
              className="w-full mt-4 gap-2"
              onClick={() => window.open('https://www.klaviyo.com/lists-segments', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View Segments in Klaviyo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
