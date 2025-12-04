import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

// This function checks for jobs waiting to be retried and processes them
// Should be called by a cron job every minute

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('[retry-segment-jobs] Checking for jobs to retry...');

    // Find jobs that are waiting for retry and enough time has passed (5+ minutes since last attempt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: jobsToRetry, error } = await supabase
      .from('segment_creation_jobs')
      .select('id')
      .eq('status', 'waiting_retry')
      .lt('updated_at', fiveMinutesAgo)
      .limit(5); // Process max 5 jobs per run to avoid overload

    if (error) {
      console.error('[retry-segment-jobs] Error fetching jobs:', error);
      throw error;
    }

    if (!jobsToRetry || jobsToRetry.length === 0) {
      console.log('[retry-segment-jobs] No jobs to retry');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[retry-segment-jobs] Found ${jobsToRetry.length} jobs to retry`);

    // Process each job
    const results = await Promise.all(
      jobsToRetry.map(async (job) => {
        try {
          await supabase.functions.invoke('process-segment-queue', {
            body: { jobId: job.id },
          });
          return { jobId: job.id, success: true };
        } catch (err: any) {
          console.error(`[retry-segment-jobs] Failed to process job ${job.id}:`, err);
          return { jobId: job.id, success: false, error: err.message };
        }
      })
    );

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[retry-segment-jobs] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
