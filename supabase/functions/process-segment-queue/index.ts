import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 10;
const MAX_JOBS_PER_RUN = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[process-segment-queue] Starting queue processing...');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Find jobs ready for retry
    const { data: readyJobs, error } = await supabase
      .from('segment_creation_jobs')
      .select('*')
      .eq('status', 'waiting_retry')
      .lte('retry_after', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(MAX_JOBS_PER_RUN);

    if (error) {
      console.error('[process-segment-queue] Error fetching jobs:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!readyJobs?.length) {
      console.log('[process-segment-queue] No jobs ready for processing');
      return new Response(JSON.stringify({ processed: 0, message: 'No jobs ready' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[process-segment-queue] Found ${readyJobs.length} jobs ready for processing`);

    const results = [];

    for (const job of readyJobs) {
      console.log(`[process-segment-queue] Processing job ${job.id}...`);

      // Re-fetch job to check if it was cancelled while we were processing
      const { data: freshJob } = await supabase
        .from('segment_creation_jobs')
        .select('status')
        .eq('id', job.id)
        .single();
      
      // Skip if job was cancelled
      if (freshJob?.status === 'cancelled') {
        console.log(`[process-segment-queue] Job ${job.id} was cancelled, skipping`);
        continue;
      }

      // Update status to in_progress
      await supabase
        .from('segment_creation_jobs')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', job.id);

      // Get the user's Klaviyo key
      const { data: klaviyoKey, error: keyError } = await supabase
        .from('klaviyo_keys')
        .select('*')
        .eq('id', job.klaviyo_key_id)
        .single();

      if (keyError || !klaviyoKey) {
        console.error(`[process-segment-queue] Klaviyo key not found for job ${job.id}`);
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'failed',
            error_message: 'Klaviyo key not found or deleted',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
        continue;
      }

      // Decrypt API key if needed
      let apiKey = klaviyoKey.klaviyo_api_key_hash;
      if (isEncrypted(apiKey)) {
        apiKey = await decryptApiKey(apiKey);
      }

      // Get pending segments
      const pendingIds: string[] = job.pending_segment_ids || [];
      const completedIds: string[] = job.completed_segment_ids || [];
      const failedIds: string[] = job.failed_segment_ids || [];

      if (pendingIds.length === 0) {
        // Job is complete
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            segments_processed: completedIds.length
          })
          .eq('id', job.id);

        // Send completion email
        await sendCompletionEmail(supabase, job, completedIds);
        continue;
      }

      // Process a batch of pending segments
      const batchToProcess = pendingIds.slice(0, BATCH_SIZE);
      console.log(`[process-segment-queue] Processing batch of ${batchToProcess.length} segments for job ${job.id}`);

      // Call the segment creation function
      const { data: createResult, error: createError } = await supabase.functions.invoke(
        'klaviyo-create-segments',
        {
          body: {
            apiKey: klaviyoKey.klaviyo_api_key_hash, // Send encrypted, it will decrypt
            segmentIds: batchToProcess,
            currencySymbol: klaviyoKey.currency_symbol || '$',
            settings: {
              aov: klaviyoKey.aov,
              vipThreshold: klaviyoKey.vip_threshold,
              highValueThreshold: klaviyoKey.high_value_threshold,
              newCustomerDays: klaviyoKey.new_customer_days,
              lapsedDays: klaviyoKey.lapsed_days,
              churnedDays: klaviyoKey.churned_days,
            },
            customInputs: job.custom_inputs || {}
          }
        }
      );

      if (createError) {
        console.error(`[process-segment-queue] Error invoking segment creation for job ${job.id}:`, createError);
        
        // Schedule retry in 5 minutes
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'waiting_retry',
            retry_after: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            retry_count: (job.retry_count || 0) + 1,
            last_klaviyo_error: createError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
        continue;
      }

      // Process results
      const batchResults = createResult?.results || [];
      const newCompletedIds = [...completedIds];
      const newFailedIds = [...failedIds];

      for (const result of batchResults) {
        if (result.status === 'created' || result.status === 'exists') {
          newCompletedIds.push(result.segmentId);
        } else if (result.status === 'error' && !result.error?.includes('Rate limit')) {
          newFailedIds.push(result.segmentId);
        }
        // Rate-limited segments stay in pending
      }

      // Remove successfully processed from pending
      const processedIds = new Set([...newCompletedIds, ...newFailedIds]);
      const remainingPendingIds = pendingIds.filter(id => !processedIds.has(id));

      // Determine if we hit rate limits
      const hasRateLimit = batchResults.some((r: any) => 
        r.status === 'error' && r.error?.toLowerCase().includes('rate limit')
      );

      // Calculate next retry time
      let retryAfter: string;
      let rateLimitType: string | null = null;
      let rateLimitMessage: string | null = null;

      if (hasRateLimit) {
        // Check for daily limit vs per-minute limit
        const dailyLimitHit = batchResults.some((r: any) => 
          r.error?.includes('Expected available in') && 
          parseInt(r.error.match(/(\d+) second/)?.[1] || '0') > 3600
        );

        if (dailyLimitHit) {
          // Daily limit - retry tomorrow at midnight UTC
          const tomorrow = new Date();
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(0, 10, 0, 0); // 00:10 UTC
          retryAfter = tomorrow.toISOString();
          rateLimitType = 'daily';
          rateLimitMessage = "Klaviyo's daily limit reached (100 segments/day). Automatic retry scheduled for tomorrow.";
        } else {
          // Per-minute limit - retry in 2 minutes
          retryAfter = new Date(Date.now() + 2 * 60 * 1000).toISOString();
          rateLimitType = 'steady';
          rateLimitMessage = "Klaviyo's per-minute limit reached. Automatic retry in 2 minutes.";
        }
      } else {
        // No rate limit - continue immediately (10 seconds)
        retryAfter = new Date(Date.now() + 10 * 1000).toISOString();
      }

      const isComplete = remainingPendingIds.length === 0;

      // Update job
      await supabase
        .from('segment_creation_jobs')
        .update({
          status: isComplete ? 'completed' : 'waiting_retry',
          completed_segment_ids: newCompletedIds,
          pending_segment_ids: remainingPendingIds,
          failed_segment_ids: newFailedIds,
          segments_processed: newCompletedIds.length,
          success_count: newCompletedIds.length,
          error_count: newFailedIds.length,
          retry_after: isComplete ? null : retryAfter,
          rate_limit_type: rateLimitType,
          last_klaviyo_error: rateLimitMessage,
          completed_at: isComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Send progress email at milestones
      if (newCompletedIds.length > completedIds.length) {
        const progressMilestone = Math.floor(newCompletedIds.length / 10) * 10;
        const previousMilestone = Math.floor(completedIds.length / 10) * 10;
        
        if (progressMilestone > previousMilestone && progressMilestone > 0) {
          await sendProgressEmail(supabase, job, newCompletedIds.length, remainingPendingIds.length);
        }
      }

      // Send completion email if done
      if (isComplete) {
        await sendCompletionEmail(supabase, job, newCompletedIds);
      } else if (rateLimitType === 'daily') {
        await sendDailyLimitEmail(supabase, job, newCompletedIds.length, remainingPendingIds.length);
      } else if (rateLimitType === 'steady' && remainingPendingIds.length > 0) {
        // Only send rate limit email if this is the first time we're queueing segments
        await sendRateLimitEmail(supabase, job, newCompletedIds.length, remainingPendingIds.length);
      }

      results.push({
        jobId: job.id,
        processed: batchToProcess.length,
        completed: newCompletedIds.length,
        remaining: remainingPendingIds.length,
        status: isComplete ? 'completed' : 'waiting_retry'
      });
    }

    console.log(`[process-segment-queue] Finished processing ${results.length} jobs`);

    return new Response(JSON.stringify({ 
      processed: results.length, 
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[process-segment-queue] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions for emails
async function sendProgressEmail(supabase: any, job: any, completed: number, remaining: number) {
  const notificationsSent = job.email_notifications_sent || [];
  const progressKey = `progress_${Math.floor(completed / 10) * 10}`;

  if (notificationsSent.includes(progressKey)) return;

  const total = completed + remaining;
  const estimatedMinutes = Math.ceil(remaining / 12 * 5);

  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        userId: job.user_id,
        email: job.user_email,
        notificationType: 'segment_progress',
        data: {
          title: `Segment creation in progress (${completed} of ${total} done)`,
          message: `We've created ${completed} segments so far. ${remaining} remaining - estimated ${estimatedMinutes} minutes left. We'll email you when complete!`,
          completed,
          remaining,
          total,
          estimatedTimeRemaining: `${estimatedMinutes} minutes`
        }
      }
    });

    // Record that we sent this notification
    await supabase
      .from('segment_creation_jobs')
      .update({
        email_notifications_sent: [...notificationsSent, progressKey]
      })
      .eq('id', job.id);
  } catch (err) {
    console.error('[process-segment-queue] Failed to send progress email:', err);
  }
}

async function sendCompletionEmail(supabase: any, job: any, completedIds: string[]) {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        userId: job.user_id,
        email: job.user_email,
        notificationType: 'segment_complete',
        data: {
          title: `✅ All ${completedIds.length} segments are ready!`,
          message: `Great news! All your segments have been created in Klaviyo. They're now ready to use in your campaigns and flows!`,
          segmentCount: completedIds.length,
          actionUrl: 'https://www.klaviyo.com/lists-segments',
          actionLabel: 'View in Klaviyo'
        }
      }
    });
  } catch (err) {
    console.error('[process-segment-queue] Failed to send completion email:', err);
  }
}

async function sendDailyLimitEmail(supabase: any, job: any, completed: number, remaining: number) {
  const notificationsSent = job.email_notifications_sent || [];
  const dailyKey = `daily_limit_${new Date().toISOString().split('T')[0]}`;

  if (notificationsSent.includes(dailyKey)) return;

  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        userId: job.user_id,
        email: job.user_email,
        notificationType: 'segment_daily_limit',
        data: {
          title: `⏸️ Segment creation paused until tomorrow`,
          message: `We've hit Klaviyo's daily limit of 100 segments. Created today: ${completed}. Remaining (will auto-resume tomorrow): ${remaining}. You don't need to do anything!`,
          completedToday: completed,
          remaining,
          jobId: job.id
        }
      }
    });

    await supabase
      .from('segment_creation_jobs')
      .update({
        email_notifications_sent: [...notificationsSent, dailyKey]
      })
      .eq('id', job.id);
  } catch (err) {
    console.error('[process-segment-queue] Failed to send daily limit email:', err);
  }
}

async function sendRateLimitEmail(supabase: any, job: any, completed: number, remaining: number) {
  const notificationsSent = job.email_notifications_sent || [];
  const rateLimitKey = 'rate_limit_initial';

  // Only send this email once per job
  if (notificationsSent.includes(rateLimitKey)) return;

  const estimatedMinutes = Math.ceil(remaining / 12 * 5);

  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        userId: job.user_id,
        email: job.user_email,
        notificationType: 'segment_rate_limit',
        data: {
          title: `⏱️ Segments queued - processing in background`,
          message: `Your segments are being created in the background. ${completed} done, ${remaining} remaining.`,
          completed,
          remaining,
          total: completed + remaining,
          estimatedTimeRemaining: `${estimatedMinutes} minutes`,
          jobId: job.id
        }
      }
    });

    await supabase
      .from('segment_creation_jobs')
      .update({
        email_notifications_sent: [...notificationsSent, rateLimitKey]
      })
      .eq('id', job.id);
  } catch (err) {
    console.error('[process-segment-queue] Failed to send rate limit email:', err);
  }
}