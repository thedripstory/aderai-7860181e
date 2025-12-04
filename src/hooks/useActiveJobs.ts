import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActiveJob {
  id: string;
  status: string;
  total_segments: number;
  segments_processed: number;
  success_count: number;
  error_count: number;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  segments_to_create: any;
  klaviyo_key_id: string;
}

export const useActiveJobs = () => {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch jobs from last 24 hours that are pending, in_progress, or retrying
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('segment_creation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', oneDayAgo)
        .in('status', ['pending', 'in_progress', 'retrying', 'waiting_retry'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as ActiveJob[]);
    } catch (error) {
      console.error('Failed to fetch active jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('segment_creation_jobs')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          error_message: 'Cancelled by user'
        })
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success('Job cancelled');
      fetchJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast.error('Failed to cancel job');
    }
  }, [fetchJobs]);

  // Poll for job updates every 5 seconds
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('segment-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'segment_creation_jobs',
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const hasActiveJobs = jobs.length > 0;
  const totalProgress = jobs.reduce((acc, job) => {
    if (job.total_segments > 0) {
      return acc + (job.segments_processed / job.total_segments);
    }
    return acc;
  }, 0) / Math.max(jobs.length, 1);

  return {
    jobs,
    loading,
    hasActiveJobs,
    totalProgress,
    refreshJobs: fetchJobs,
    cancelJob,
  };
};
