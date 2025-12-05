import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLogger } from '@/lib/errorLogger';
import { useToast } from '@/hooks/use-toast';

// Helper to track analytics events
async function trackAnalyticsEvent(eventName: string, metadata?: Record<string, any>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: eventName,
      event_metadata: metadata || {},
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Bundle definitions - each bundle expands to multiple segment IDs
const SEGMENT_BUNDLES: Record<string, string[]> = {
  'core-essentials': [
    'engaged-30-days',
    'repeat-customers', 
    'cart-abandoners',
    'vip-customers',
    'recent-purchasers-30'
  ],
  'engagement-maximizer': [
    'highly-engaged',
    'email-openers-30',
    'email-clickers-30',
    'recent-clickers-90',
    'active-site-30'
  ],
  'lifecycle-manager': [
    'new-subscribers',
    'first-time-buyers',
    'repeat-customers',
    'at-risk-customers',
    'churned-customers',
    'vip-customers'
  ],
  'shopping-behavior': [
    'cart-abandoners',
    'browse-abandoners',
    'product-viewers',
    'checkout-starters',
    'frequent-browsers'
  ],
  'smart-exclusions': [
    'recent-purchasers-exclusion',
    'unengaged-exclusion',
    'never-engaged-exclusion',
    'bounced-emails'
  ]
};

export interface SegmentResult {
  segmentId: string;
  status: "success" | "error" | "skipped" | "queued";
  message: string;
  klaviyoId?: string;
}

export interface KlaviyoKey {
  id: string;
  client_name: string;
  klaviyo_api_key_hash: string;
  currency: string;
  currency_symbol: string;
  aov: number;
  vip_threshold: number;
  high_value_threshold: number;
  new_customer_days: number;
  lapsed_days: number;
  churned_days: number;
  is_active: boolean;
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  segmentsProcessed: number;
  totalSegments: number;
  estimatedTimeRemaining: number;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'waiting_retry' | 'completed' | 'failed';
  totalSegments: number;
  segmentsProcessed: number;
  successCount: number;
  errorCount: number;
  rateLimitType?: string;
  rateLimitMessage?: string;
}

export const useKlaviyoSegments = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const { toast } = useToast();

  // Subscribe to job updates for real-time progress
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'segment_creation_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          const job = payload.new as any;
          
          setProgress({
            current: job.segments_processed || 0,
            total: job.total_segments || 0
          });

          setJobStatus({
            id: job.id,
            status: job.status,
            totalSegments: job.total_segments,
            segmentsProcessed: job.segments_processed || 0,
            successCount: job.success_count || 0,
            errorCount: job.error_count || 0,
            rateLimitType: job.rate_limit_type,
            rateLimitMessage: job.last_klaviyo_error
          });

          if (job.status === 'completed') {
            toast({
              title: "✅ All segments created!",
              description: `Successfully created ${job.success_count || job.segments_processed} segments.`,
            });
            setLoading(false);
          } else if (job.status === 'waiting_retry' && job.rate_limit_type) {
            // Show rate limit toast
            const message = job.rate_limit_type === 'daily'
              ? "Klaviyo's daily limit reached. We'll automatically continue tomorrow and email you when complete."
              : "Klaviyo's rate limit reached. We'll automatically retry in a few minutes.";
            
            toast({
              title: "⏸️ Segment creation paused",
              description: message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, toast]);

  const createSegments = async (
    selectedSegments: string[],
    activeKey: KlaviyoKey,
    segmentsList: any[],
    existingJobId?: string,
    customInputs?: Record<string, string>,
    userEmail?: string
  ) => {
    if (selectedSegments.length === 0) {
      throw new Error('Please select at least one segment to create');
    }

    // Expand any bundle IDs into their component segments
    let expandedSegmentIds = [...selectedSegments];
    selectedSegments.forEach(id => {
      if (SEGMENT_BUNDLES[id]) {
        expandedSegmentIds = expandedSegmentIds.filter(s => s !== id);
        expandedSegmentIds.push(...SEGMENT_BUNDLES[id]);
      }
    });
    expandedSegmentIds = [...new Set(expandedSegmentIds)];
    
    // Filter out unavailable segments
    const availableSegmentIds = expandedSegmentIds.filter(id => {
      const segment = segmentsList.find((s: any) => s.id === id);
      return segment && !segment.unavailable;
    });

    if (availableSegmentIds.length === 0) {
      throw new Error('No available segments to create. Some segments require manual setup in Klaviyo.');
    }

    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: availableSegmentIds.length });
    
    // Calculate batch progress info
    const BATCH_SIZE = 4;
    const BATCH_DELAY_SECONDS = 3;
    const INTRA_BATCH_DELAY_SECONDS = 0.5;
    const totalBatches = Math.ceil(availableSegmentIds.length / BATCH_SIZE);
    const estimatedTimePerBatch = (BATCH_SIZE * INTRA_BATCH_DELAY_SECONDS) + BATCH_DELAY_SECONDS + 2;
    
    setBatchProgress({
      currentBatch: 1,
      totalBatches,
      segmentsProcessed: 0,
      totalSegments: availableSegmentIds.length,
      estimatedTimeRemaining: totalBatches * estimatedTimePerBatch
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user email if not provided
      let email = userEmail;
      if (!email) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', user.id)
          .single();
        email = userData?.email;
      }

      // Create or update job record
      let jobRecordId = existingJobId;
      
      if (!jobRecordId) {
        console.log('[useKlaviyoSegments] Creating new job record for', availableSegmentIds.length, 'segments');
        const { data: job, error: jobError } = await supabase
          .from('segment_creation_jobs')
          .insert({
            user_id: user.id,
            klaviyo_key_id: activeKey.id,
            status: 'in_progress',
            segments_to_create: availableSegmentIds,
            pending_segment_ids: availableSegmentIds,
            completed_segment_ids: [],
            failed_segment_ids: [],
            total_segments: availableSegmentIds.length,
            user_email: email,
            custom_inputs: customInputs || {}
          })
          .select()
          .single();

        if (jobError) {
          console.error('[useKlaviyoSegments] Failed to create job:', jobError.message, jobError.details);
          toast({
            title: "Failed to create job",
            description: `Database error: ${jobError.message}. Please try again.`,
            variant: "destructive"
          });
          throw jobError;
        }
        
        console.log('[useKlaviyoSegments] Job created successfully with ID:', job.id);
        jobRecordId = job.id;
      } else {
        console.log('[useKlaviyoSegments] Updating existing job:', existingJobId);
        const { error: updateError } = await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'in_progress',
            segments_processed: 0,
            total_segments: availableSegmentIds.length,
            pending_segment_ids: availableSegmentIds,
            completed_segment_ids: [],
            failed_segment_ids: []
          })
          .eq('id', existingJobId);
          
        if (updateError) {
          console.error('[useKlaviyoSegments] Failed to update job:', updateError.message);
        }
      }

      setJobId(jobRecordId);

      const currencySymbol = activeKey.currency_symbol || '$';
      const settings = {
        aov: activeKey.aov || 100,
        vipThreshold: activeKey.vip_threshold || 1000,
        highValueThreshold: activeKey.high_value_threshold || 500,
        newCustomerDays: activeKey.new_customer_days || 60,
        lapsedDays: activeKey.lapsed_days || 90,
        churnedDays: activeKey.churned_days || 180,
      };

      const requestBody = {
        apiKey: activeKey.klaviyo_api_key_hash,
        segmentIds: availableSegmentIds,
        currencySymbol,
        settings,
        customInputs: customInputs || {},
      };

      const { data: response, error } = await supabase.functions.invoke('klaviyo-create-segments', {
        body: requestBody,
      });

      if (error) {
        await ErrorLogger.logError(error, { context: 'Supabase function error in segment creation' });
        throw error;
      }

      if (!response) {
        throw new Error('No response from segment creation service');
      }

      const resultsArray = response.results || [];
      const resultsMap = new Map<string, any>();
      resultsArray.forEach((result: any) => {
        if (result && result.segmentId) {
          resultsMap.set(result.segmentId, result);
        }
      });

      // Determine if job needs to be queued for background processing
      const hasRateLimitErrors = resultsArray.some((r: any) => 
        r.status === 'error' && r.error?.toLowerCase().includes('rate limit')
      );
      
      const completedIds = resultsArray
        .filter((r: any) => r.status === 'created' || r.status === 'exists')
        .map((r: any) => r.segmentId);
      
      const failedIds = resultsArray
        .filter((r: any) => r.status === 'error' && !r.error?.toLowerCase().includes('rate limit'))
        .map((r: any) => r.segmentId);
      
      const pendingIds = availableSegmentIds.filter(
        id => !completedIds.includes(id) && !failedIds.includes(id)
      );

      // Update job with results
      if (pendingIds.length > 0 && hasRateLimitErrors) {
        // Queue remaining segments for background processing
        const retryAfter = new Date(Date.now() + 2 * 60 * 1000).toISOString();
        
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'waiting_retry',
            completed_segment_ids: completedIds,
            pending_segment_ids: pendingIds,
            failed_segment_ids: failedIds,
            segments_processed: completedIds.length,
            success_count: completedIds.length,
            error_count: failedIds.length,
            retry_after: retryAfter,
            rate_limit_type: 'steady',
            last_klaviyo_error: "Klaviyo's rate limit reached. Automatic retry scheduled."
          })
          .eq('id', jobRecordId);

        setJobStatus({
          id: jobRecordId,
          status: 'waiting_retry',
          totalSegments: availableSegmentIds.length,
          segmentsProcessed: completedIds.length,
          successCount: completedIds.length,
          errorCount: failedIds.length,
          rateLimitType: 'steady',
          rateLimitMessage: "Klaviyo's rate limit reached. Automatic retry scheduled."
        });

        toast({
          title: "Segments being created in background",
          description: `Created ${completedIds.length} segments. ${pendingIds.length} remaining will be processed automatically. We'll email you when complete.`,
          duration: 10000,
        });
      } else {
        // All done or no rate limits
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: failedIds.length === availableSegmentIds.length ? 'failed' : 'completed',
            completed_segment_ids: completedIds,
            pending_segment_ids: [],
            failed_segment_ids: failedIds,
            segments_processed: completedIds.length,
            success_count: completedIds.length,
            error_count: failedIds.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', jobRecordId);
      }

      // Build results for UI
      const newResults: SegmentResult[] = availableSegmentIds.map((segmentId) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        const segmentName = segment?.name || segmentId;
        const result = resultsMap.get(segmentId);

        if (!result) {
          if (pendingIds.includes(segmentId)) {
            return {
              segmentId,
              status: "queued" as const,
              message: `"${segmentName}" queued for background processing`,
            };
          }
          return {
            segmentId,
            status: "error" as const,
            message: `Failed to create "${segmentName}": No response from server`,
          };
        }

        if (result.status === 'created') {
          logSegmentOperation(segmentId, segmentName, 'created', 'success', activeKey.id, result.klaviyoId);
          return {
            segmentId,
            status: "success" as const,
            message: `Successfully created "${segmentName}"`,
            klaviyoId: result.data?.data?.id || result.klaviyoId,
          };
        } else if (result.status === 'exists') {
          return {
            segmentId,
            status: "skipped" as const,
            message: `"${segmentName}" already exists`,
          };
        } else if (result.status === 'skipped' || result.status === 'missing_metrics') {
          return {
            segmentId,
            status: "skipped" as const,
            message: `"${segmentName}" skipped: Required metrics not available`,
          };
        } else {
          const isRateLimit = result.error?.toLowerCase().includes('rate limit');
          if (isRateLimit) {
            return {
              segmentId,
              status: "queued" as const,
              message: `"${segmentName}" queued - Klaviyo rate limit reached`,
            };
          }
          logSegmentOperation(segmentId, segmentName, 'created', 'failed', activeKey.id, undefined, result.error);
          return {
            segmentId,
            status: "error" as const,
            message: `Failed: ${result.error || 'Unknown error'}`,
          };
        }
      });

      setResults(newResults);

      // Track analytics
      const successCount = newResults.filter(r => r.status === 'success').length;
      if (successCount > 0) {
        await trackAnalyticsEvent('create_segments', {
          segments_created: successCount,
          segments_queued: newResults.filter(r => r.status === 'queued').length,
          segments_skipped: newResults.filter(r => r.status === 'skipped').length,
          segments_failed: newResults.filter(r => r.status === 'error').length,
          total_attempted: availableSegmentIds.length,
        });
      }

      return newResults;
    } catch (error: any) {
      await ErrorLogger.logSegmentError(error, 'create_segments', {
        segmentCount: availableSegmentIds.length,
      });
      
      if (jobId) {
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', jobId);
      }

      const errorResults: SegmentResult[] = availableSegmentIds.map((segmentId) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        return {
          segmentId,
          status: "error" as const,
          message: `Failed: ${error.message || 'Unknown error'}`,
        };
      });
      
      setResults(errorResults);
      throw error;
    } finally {
      setBatchProgress(null);
      // Don't set loading to false if job is queued for background
      if (!jobStatus || jobStatus.status === 'completed' || jobStatus.status === 'failed') {
        setLoading(false);
      }
    }
  };

  return {
    loading,
    results,
    progress,
    batchProgress,
    jobId,
    jobStatus,
    createSegments,
    setResults,
  };
};

// Helper function to log segment operations
async function logSegmentOperation(
  segmentId: string,
  segmentName: string | undefined,
  operationType: string,
  status: string,
  klaviyoKeyId: string,
  klaviyoSegmentId?: string,
  errorMessage?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('segment_operations').insert({
      user_id: user.id,
      klaviyo_key_id: klaviyoKeyId,
      segment_name: segmentName || segmentId,
      segment_klaviyo_id: klaviyoSegmentId,
      operation_type: operationType,
      operation_status: status,
      error_message: errorMessage,
      metadata: { segmentId },
    });
  } catch (err) {
    await ErrorLogger.logError(err as Error, {
      context: 'Failed to log segment operation',
    });
  }
}