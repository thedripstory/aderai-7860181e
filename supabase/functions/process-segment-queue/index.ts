import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MAX_RETRIES = 10;
const RETRY_DELAY_MINUTES = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { jobId } = await req.json();
    
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-segment-queue] Processing job ${jobId}`);

    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('segment_creation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error(`[process-segment-queue] Job not found: ${jobId}`);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Klaviyo key
    const { data: klaviyoKey, error: keyError } = await supabase
      .from('klaviyo_keys')
      .select('*')
      .eq('id', job.klaviyo_key_id)
      .single();

    if (keyError || !klaviyoKey) {
      console.error(`[process-segment-queue] Klaviyo key not found`);
      await updateJobStatus(supabase, jobId, 'failed', 'Klaviyo connection not found');
      return new Response(
        JSON.stringify({ error: 'Klaviyo key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get segments to create (either initial list or failed segments from previous attempt)
    const segmentsToCreate = job.segments_to_create as string[];
    const failedSegments = (job as any).failed_segments as string[] || [];
    const retryCount = (job as any).retry_count || 0;

    // Determine which segments to process
    const segmentsToProcess = failedSegments.length > 0 ? failedSegments : segmentsToCreate;

    if (segmentsToProcess.length === 0) {
      console.log(`[process-segment-queue] No segments to process for job ${jobId}`);
      await updateJobStatus(supabase, jobId, 'completed');
      return new Response(
        JSON.stringify({ success: true, message: 'No segments to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job status to in_progress
    await supabase
      .from('segment_creation_jobs')
      .update({ 
        status: retryCount > 0 ? 'retrying' : 'in_progress',
        segments_processed: job.segments_processed || 0 
      })
      .eq('id', jobId);

    console.log(`[process-segment-queue] Calling klaviyo-create-segments with ${segmentsToProcess.length} segments`);

    // Call the segment creation function
    const { data: response, error: createError } = await supabase.functions.invoke('klaviyo-create-segments', {
      body: {
        apiKey: klaviyoKey.klaviyo_api_key_hash,
        segmentIds: segmentsToProcess,
        currencySymbol: klaviyoKey.currency_symbol || '$',
        settings: {
          aov: klaviyoKey.aov || 100,
          vipThreshold: klaviyoKey.vip_threshold || 1000,
          highValueThreshold: klaviyoKey.high_value_threshold || 500,
          newCustomerDays: klaviyoKey.new_customer_days || 60,
          lapsedDays: klaviyoKey.lapsed_days || 90,
          churnedDays: klaviyoKey.churned_days || 180,
        },
        customInputs: (job as any).custom_inputs || {},
      },
    });

    if (createError) {
      console.error(`[process-segment-queue] Creation error:`, createError);
      await handleRetry(supabase, job, [], segmentsToProcess, retryCount, createError.message);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = response?.results || [];
    
    // Analyze results
    const successful = results.filter((r: any) => r.status === 'created' || r.status === 'exists');
    const failed = results.filter((r: any) => r.status === 'error');
    const skipped = results.filter((r: any) => r.status === 'skipped' || r.status === 'missing_metrics');

    const newSuccessCount = (job.success_count || 0) + successful.length;
    const newProcessed = (job.segments_processed || 0) + successful.length + skipped.length;

    console.log(`[process-segment-queue] Results - Success: ${successful.length}, Failed: ${failed.length}, Skipped: ${skipped.length}`);

    // If there are failed segments, schedule a retry
    if (failed.length > 0) {
      const failedIds = failed.map((r: any) => r.segmentId);
      await handleRetry(supabase, job, successful, failedIds, retryCount);
    } else {
      // All segments processed successfully!
      await supabase
        .from('segment_creation_jobs')
        .update({
          status: 'completed',
          segments_processed: job.total_segments,
          success_count: newSuccessCount,
          error_count: 0,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Send completion email
      await sendCompletionEmail(supabase, job.user_id, newSuccessCount, segmentsToCreate);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        successCount: successful.length,
        failedCount: failed.length,
        skippedCount: skipped.length,
        willRetry: failed.length > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[process-segment-queue] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleRetry(
  supabase: any, 
  job: any, 
  successful: any[], 
  failedIds: string[], 
  currentRetryCount: number,
  errorMessage?: string
) {
  const newRetryCount = currentRetryCount + 1;
  const newSuccessCount = (job.success_count || 0) + successful.length;

  if (newRetryCount >= MAX_RETRIES) {
    // Max retries reached - mark as completed with errors
    await supabase
      .from('segment_creation_jobs')
      .update({
        status: 'completed_with_errors',
        success_count: newSuccessCount,
        error_count: failedIds.length,
        error_message: `${failedIds.length} segments failed after ${MAX_RETRIES} retries`,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    // Send partial completion email
    await sendCompletionEmail(supabase, job.user_id, newSuccessCount, job.segments_to_create, failedIds);
    return;
  }

  // Schedule retry - store next_retry_at timestamp
  const retryAt = new Date(Date.now() + RETRY_DELAY_MINUTES * 60 * 1000);
  
  await supabase
    .from('segment_creation_jobs')
    .update({
      status: 'waiting_retry',
      success_count: newSuccessCount,
      error_count: failedIds.length,
      segments_processed: (job.segments_processed || 0) + successful.length,
      error_message: errorMessage || `${failedIds.length} segments failed - auto-retrying in ${RETRY_DELAY_MINUTES} minutes (attempt ${newRetryCount}/${MAX_RETRIES})`,
    })
    .eq('id', job.id);

  // Store retry info in a separate update to handle any custom columns
  try {
    await supabase.rpc('update_job_retry_info', {
      p_job_id: job.id,
      p_retry_count: newRetryCount,
      p_failed_segments: failedIds,
      p_next_retry_at: retryAt.toISOString(),
    });
  } catch (rpcError) {
    // If RPC doesn't exist, we'll rely on the cron job to pick up waiting_retry jobs
    console.log(`[process-segment-queue] RPC not available, job ${job.id} marked for retry by cron`);
  }

  console.log(`[process-segment-queue] Scheduled retry ${newRetryCount}/${MAX_RETRIES} at ${retryAt.toISOString()}`);
}

async function updateJobStatus(supabase: any, jobId: string, status: string, errorMessage?: string) {
  await supabase
    .from('segment_creation_jobs')
    .update({ 
      status, 
      error_message: errorMessage,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
    })
    .eq('id', jobId);
}

async function sendCompletionEmail(
  supabase: any, 
  userId: string, 
  successCount: number, 
  allSegments: string[],
  failedSegments?: string[]
) {
  try {
    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', userId)
      .single();

    if (!user?.email) {
      console.error('[process-segment-queue] User email not found');
      return;
    }

    // Build segment list for email
    const segmentNames = allSegments.map((id: string) => {
      // Convert kebab-case to title case
      return id.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });

    const failedNames = failedSegments?.map((id: string) => {
      return id.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }) || [];

    // Use send-notification-email for segment completion
    await supabase.functions.invoke('send-notification-email', {
      body: {
        to: user.email,
        userId,
        templateType: 'segment_completion',
        templateData: {
          firstName: user.first_name || 'there',
          successCount,
          totalCount: allSegments.length,
          segmentNames: segmentNames.slice(0, 20),
          hasMore: segmentNames.length > 20,
          failedCount: failedSegments?.length || 0,
          failedNames: failedNames.slice(0, 10),
        },
      },
    });

    console.log(`[process-segment-queue] Completion email sent to ${user.email}`);
  } catch (error) {
    console.error('[process-segment-queue] Failed to send completion email:', error);
  }
}
