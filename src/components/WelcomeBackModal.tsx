import { useState, useEffect } from 'react';
import { PartyPopper, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface CompletedJob {
  id: string;
  clientName: string;
  segmentCount: number;
  completedAt: string;
}

export function WelcomeBackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [totalSegments, setTotalSegments] = useState(0);

  useEffect(() => {
    checkForCompletedJobs();
  }, []);

  async function checkForCompletedJobs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get last active timestamp
      const lastActiveKey = `aderai_last_active_${user.id}`;
      const acknowledgedKey = `aderai_acknowledged_jobs_${user.id}`;
      
      const lastActive = localStorage.getItem(lastActiveKey);
      const acknowledgedJobsStr = localStorage.getItem(acknowledgedKey);
      const acknowledgedJobs: string[] = acknowledgedJobsStr ? JSON.parse(acknowledgedJobsStr) : [];

      // Update last active to now
      localStorage.setItem(lastActiveKey, new Date().toISOString());

      // If no last active, this is first visit - don't show modal
      if (!lastActive) return;

      // Query for jobs completed after last active
      const { data: jobs, error } = await supabase
        .from('segment_creation_jobs')
        .select(`
          id,
          success_count,
          completed_at,
          klaviyo_keys(client_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gt('completed_at', lastActive)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed jobs:', error);
        return;
      }

      // Filter out already acknowledged jobs
      const unacknowledgedJobs = (jobs || []).filter(
        job => !acknowledgedJobs.includes(job.id)
      );

      if (unacknowledgedJobs.length === 0) return;

      // Transform jobs for display
      const formattedJobs: CompletedJob[] = unacknowledgedJobs.map(job => ({
        id: job.id,
        clientName: (job.klaviyo_keys as any)?.client_name || 'Your Account',
        segmentCount: job.success_count || 0,
        completedAt: job.completed_at
      }));

      const total = formattedJobs.reduce((sum, job) => sum + job.segmentCount, 0);

      setCompletedJobs(formattedJobs);
      setTotalSegments(total);
      setIsOpen(true);

      // Trigger confetti!
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);

    } catch (err) {
      console.error('Error in WelcomeBackModal:', err);
    }
  }

  function handleDismiss() {
    // Mark jobs as acknowledged
    const acknowledgedKey = `aderai_acknowledged_jobs_${completedJobs[0]?.id ? supabase.auth.getUser().then(u => u.data.user?.id) : 'unknown'}`;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const key = `aderai_acknowledged_jobs_${user.id}`;
        const existing = localStorage.getItem(key);
        const acknowledgedJobs: string[] = existing ? JSON.parse(existing) : [];
        
        completedJobs.forEach(job => {
          if (!acknowledgedJobs.includes(job.id)) {
            acknowledgedJobs.push(job.id);
          }
        });
        
        localStorage.setItem(key, JSON.stringify(acknowledgedJobs));
      }
    });

    setIsOpen(false);
  }

  if (!isOpen || completedJobs.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <PartyPopper className="h-6 w-6 text-white" />
            </div>
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-base">
            Great news while you were away!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Total Segments Created */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Segments Created</span>
            </div>
            <p className="text-4xl font-bold text-green-600">{totalSegments}</p>
          </div>

          {/* Job List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed Jobs:</p>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {completedJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                  >
                    <div>
                      <p className="font-medium text-sm">{job.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{job.segmentCount}</p>
                      <p className="text-xs text-muted-foreground">segments</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={handleDismiss}
            >
              Awesome, Got It! 🎉
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
