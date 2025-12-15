import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { ActiveJobsList } from './ActiveJobsList';

export interface ActiveJob {
  id: string;
  status: string;
  total_segments: number;
  segments_processed: number | null;
  pending_segment_ids: unknown;
  completed_segment_ids: unknown;
  failed_segment_ids: unknown;
  retry_after: string | null;
  rate_limit_type: string | null;
  created_at: string;
  completed_at: string | null;
  klaviyo_key_id: string;
  client_name?: string;
}

export function ActiveJobsButton() {
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<ActiveJob[]>([]);

  useEffect(() => {
    fetchJobs();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('segment-jobs-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'segment_creation_jobs',
      }, (payload) => {
        console.log('[ActiveJobs] Real-time update:', payload);
        fetchJobs();
        
        // If a job just completed, show it briefly in "recently completed"
        if (payload.new && (payload.new as any).status === 'completed' && 
            payload.old && (payload.old as any).status !== 'completed') {
          setRecentlyCompleted(prev => [...prev, payload.new as ActiveJob]);
          // Remove from recently completed after 30 seconds
          setTimeout(() => {
            setRecentlyCompleted(prev => prev.filter(j => j.id !== (payload.new as any).id));
          }, 30000);
        }
      })
      .subscribe();

    // Poll every 30 seconds as backup
    const pollInterval = setInterval(fetchJobs, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  async function fetchJobs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch active jobs
    const { data: active } = await supabase
      .from('segment_creation_jobs')
      .select(`
        *,
        klaviyo_keys(client_name)
      `)
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress', 'waiting_retry'])
      .order('created_at', { ascending: false });

    // Fetch recently completed (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: completed } = await supabase
      .from('segment_creation_jobs')
      .select(`
        *,
        klaviyo_keys(client_name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', fiveMinutesAgo)
      .order('completed_at', { ascending: false })
      .limit(3);

    setActiveJobs((active || []).map(job => ({
      ...job,
      client_name: (job.klaviyo_keys as any)?.client_name
    })));
    
    setRecentlyCompleted((completed || []).map(job => ({
      ...job,
      client_name: (job.klaviyo_keys as any)?.client_name
    })));
  }

  const totalActive = activeJobs.length;
  const hasActivity = totalActive > 0 || recentlyCompleted.length > 0;

  if (!hasActivity) return null;

  // Calculate overall progress across all active jobs
  const totalSegments = activeJobs.reduce((sum, j) => sum + j.total_segments, 0);
  const totalProcessed = activeJobs.reduce((sum, j) => sum + (j.segments_processed || 0), 0);
  const overallProgress = totalSegments > 0 ? Math.round((totalProcessed / totalSegments) * 100) : 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`
            relative gap-2 font-medium
            ${totalActive > 0 
              ? 'border-blue-400 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:border-blue-600 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-200' 
              : 'border-green-400 bg-green-100 hover:bg-green-200 text-green-800 dark:border-green-600 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-200'
            }
          `}
        >
          {totalActive > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">
                {totalActive} Active Job{totalActive > 1 ? 's' : ''}
              </span>
              <span className="sm:hidden">{totalActive}</span>
              <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                {overallProgress}%
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs Complete</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
          
          {/* Pulse indicator for active jobs */}
          {totalActive > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <ActiveJobsList 
          activeJobs={activeJobs} 
          recentlyCompleted={recentlyCompleted}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
