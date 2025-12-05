import { useState } from 'react';
import { 
  Loader2, CheckCircle2, PauseCircle, Clock, 
  ChevronRight, Mail, AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ActiveJob } from './ActiveJobsButton';
import { ActiveJobDetailModal } from './ActiveJobDetailModal';
import { formatDistanceToNow } from 'date-fns';

interface ActiveJobsListProps {
  activeJobs: ActiveJob[];
  recentlyCompleted: ActiveJob[];
  onClose: () => void;
}

export function ActiveJobsList({ activeJobs, recentlyCompleted, onClose }: ActiveJobsListProps) {
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);

  return (
    <>
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold text-foreground">Segment Creation Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time progress of your Klaviyo segments
        </p>
      </div>

      <ScrollArea className="max-h-[400px]">
        {activeJobs.length === 0 && recentlyCompleted.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All jobs complete!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Active Jobs */}
            {activeJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onViewDetails={() => setSelectedJob(job)}
              />
            ))}
            
            {/* Recently Completed */}
            {recentlyCompleted.length > 0 && (
              <>
                {activeJobs.length > 0 && (
                  <div className="px-4 py-2 bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Recently Completed
                    </span>
                  </div>
                )}
                {recentlyCompleted.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onViewDetails={() => setSelectedJob(job)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>You'll receive an email when jobs complete</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <ActiveJobDetailModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}

interface JobCardProps {
  job: ActiveJob;
  onViewDetails: () => void;
}

function JobCard({ job, onViewDetails }: JobCardProps) {
  const progress = Math.round(((job.segments_processed || 0) / job.total_segments) * 100);
  const isWaiting = job.status === 'waiting_retry';
  const isComplete = job.status === 'completed';
  const isPending = job.status === 'pending';
  
  // Calculate time until retry
  const retryTime = job.retry_after ? new Date(job.retry_after) : null;
  const now = new Date();
  const waitMinutes = retryTime ? Math.max(0, Math.ceil((retryTime.getTime() - now.getTime()) / 60000)) : 0;
  
  // Estimate remaining time for in-progress jobs
  const remainingSegments = job.total_segments - (job.segments_processed || 0);
  const estimatedMinutes = Math.ceil(remainingSegments / 12 * 5); // ~12 segments per 5 min

  return (
    <div 
      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
        isComplete ? 'bg-green-50/50 dark:bg-green-950/20' : ''
      }`}
      onClick={onViewDetails}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : isWaiting ? (
            <PauseCircle className="h-5 w-5 text-amber-500" />
          ) : isPending ? (
            <Clock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          )}
          <div>
            <p className="font-medium text-sm text-foreground">
              {job.client_name || 'Segment Creation'}
            </p>
            <p className="text-xs text-muted-foreground">
              Started {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <Progress 
          value={progress} 
          className={`h-2 ${isComplete ? '[&>div]:bg-green-500' : isWaiting ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${
          isComplete ? 'text-green-700 dark:text-green-400' : isWaiting ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
        }`}>
          {job.segments_processed || 0} / {job.total_segments} segments
        </span>
        
        {isComplete ? (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950">
            Complete
          </Badge>
        ) : isWaiting ? (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Resumes in {waitMinutes}m
          </span>
        ) : isPending ? (
          <span className="text-muted-foreground">Queued</span>
        ) : (
          <span className="text-muted-foreground">
            ~{estimatedMinutes} min remaining
          </span>
        )}
      </div>

      {/* Rate Limit Info */}
      {isWaiting && job.rate_limit_type && (
        <div className="mt-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-950/50 rounded text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            {job.rate_limit_type === 'daily' 
              ? "Klaviyo's daily limit (100/day) reached. Auto-resuming tomorrow."
              : "Klaviyo's rate limit reached. Auto-resuming shortly."
            }
          </span>
        </div>
      )}
    </div>
  );
}
