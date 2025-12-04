import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLogger } from '@/lib/errorLogger';

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
  status: "success" | "error" | "skipped";
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
  estimatedTimeRemaining: number; // in seconds
}

export const useKlaviyoSegments = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  const createSegments = async (
    selectedSegments: string[],
    activeKey: KlaviyoKey,
    segmentsList: any[],
    jobId?: string,
    customInputs?: Record<string, string>
  ) => {
    if (selectedSegments.length === 0) {
      throw new Error('Please select at least one segment to create');
    }

    // Expand any bundle IDs into their component segments
    let expandedSegmentIds = [...selectedSegments];
    selectedSegments.forEach(id => {
      if (SEGMENT_BUNDLES[id]) {
        // Remove the bundle ID and add its component segments
        expandedSegmentIds = expandedSegmentIds.filter(s => s !== id);
        expandedSegmentIds.push(...SEGMENT_BUNDLES[id]);
      }
    });
    // Remove duplicates
    expandedSegmentIds = [...new Set(expandedSegmentIds)];
    
    // Filter out unavailable segments (like birthday-month)
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
    
    // Calculate batch progress info for UI feedback
    const BATCH_SIZE = 4;
    const BATCH_DELAY_SECONDS = 3;
    const INTRA_BATCH_DELAY_SECONDS = 0.5;
    const totalBatches = Math.ceil(availableSegmentIds.length / BATCH_SIZE);
    const estimatedTimePerBatch = (BATCH_SIZE * INTRA_BATCH_DELAY_SECONDS) + BATCH_DELAY_SECONDS + 2; // +2s for API calls
    
    setBatchProgress({
      currentBatch: 1,
      totalBatches,
      segmentsProcessed: 0,
      totalSegments: availableSegmentIds.length,
      estimatedTimeRemaining: totalBatches * estimatedTimePerBatch
    });
    
    // Simulate batch progress updates for better UX
    let batchInterval: NodeJS.Timeout | null = null;
    if (totalBatches > 1) {
      let currentBatch = 1;
      batchInterval = setInterval(() => {
        currentBatch = Math.min(currentBatch + 1, totalBatches);
        const segmentsProcessed = Math.min(currentBatch * BATCH_SIZE, availableSegmentIds.length);
        const remainingBatches = totalBatches - currentBatch;
        setBatchProgress({
          currentBatch,
          totalBatches,
          segmentsProcessed,
          totalSegments: availableSegmentIds.length,
          estimatedTimeRemaining: remainingBatches * estimatedTimePerBatch
        });
      }, estimatedTimePerBatch * 1000);
    }

    try {
      const currencySymbol = activeKey.currency_symbol || '$';
      
      // CRITICAL: Settings keys must match edge function expectations exactly
      const settings = {
        aov: activeKey.aov || 100,
        vipThreshold: activeKey.vip_threshold || 1000,
        highValueThreshold: activeKey.high_value_threshold || 500,
        newCustomerDays: activeKey.new_customer_days || 60,
        lapsedDays: activeKey.lapsed_days || 90,
        churnedDays: activeKey.churned_days || 180,
      };

      // Save progress if jobId provided
      if (jobId) {
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'in_progress',
            segments_processed: 0,
            total_segments: availableSegmentIds.length
          })
          .eq('id', jobId);
      }

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
        await ErrorLogger.logError(error, {
          context: 'Supabase function error in segment creation',
        });
        throw error;
      }

      if (!response) {
        const err = new Error('No response from segment creation service');
        await ErrorLogger.logError(err, {
          context: 'Empty response from klaviyo-create-segments',
        });
        throw err;
      }

      // Handle case where response doesn't have results array
      const resultsArray = response.results || [];

      // Log metrics availability for debugging
      if (response.missingMetrics && response.missingMetrics.length > 0) {
        await ErrorLogger.logWarning('Missing Klaviyo metrics detected', {
          missingMetrics: response.missingMetrics,
          note: response.metricsNote,
        });
      }

      // Notify user about missing metrics
      if (response.missingMetrics && response.missingMetrics.length > 0 && response.summary?.skipped > 0) {
        console.info(`Note: ${response.summary.skipped} segments were skipped. ${response.metricsNote}`);
      }

      // Create a map of results by segmentId for reliable lookup
      const resultsMap = new Map<string, any>();
      resultsArray.forEach((result: any) => {
        if (result && result.segmentId) {
          resultsMap.set(result.segmentId, result);
        }
      });

      const newResults: SegmentResult[] = availableSegmentIds.map((segmentId) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        const segmentName = segment?.name || segmentId;
        const result = resultsMap.get(segmentId);

        if (!result) {
          return {
            segmentId,
            status: "error" as const,
            message: `Failed to create "${segmentName}": No response from server`,
          };
        }

        const resultStatus = result.status;

        if (resultStatus === 'created') {
          // Log the operation for audit trail
          logSegmentOperation(segmentId, segmentName, 'created', 'success', activeKey.id, result.klaviyoId);
          return {
            segmentId,
            status: "success" as const,
            message: `Successfully created "${segmentName}"`,
            klaviyoId: result.data?.data?.id || result.klaviyoId,
          };
        } else if (resultStatus === 'exists') {
          return {
            segmentId,
            status: "skipped" as const,
            message: `"${segmentName}" already exists`,
          };
        } else if (resultStatus === 'skipped' || resultStatus === 'missing_metrics') {
          return {
            segmentId,
            status: "skipped" as const,
            message: `"${segmentName}" skipped: Required metrics not available in your Klaviyo account`,
          };
        } else {
          // Log failed operations
          logSegmentOperation(segmentId, segmentName, 'created', 'failed', activeKey.id, undefined, result.error);
          return {
            segmentId,
            status: "error" as const,
            message: `Failed to create "${segmentName}": ${result.error || 'Unknown error'}`,
          };
        }
      });

      setResults(newResults);

      // Track successful segment creation event
      const successCount = newResults.filter(r => r.status === 'success').length;
      if (successCount > 0) {
        await trackAnalyticsEvent('create_segments', {
          segments_created: successCount,
          segments_skipped: newResults.filter(r => r.status === 'skipped').length,
          segments_failed: newResults.filter(r => r.status === 'error').length,
          total_attempted: availableSegmentIds.length,
        });
      }

      // Update job completion
      if (jobId) {
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'completed',
            segments_processed: availableSegmentIds.length,
            completed_at: new Date().toISOString(),
            success_count: successCount,
            error_count: newResults.filter(r => r.status === 'error').length
          })
          .eq('id', jobId);
      }

      return newResults;
    } catch (error: any) {
      await ErrorLogger.logSegmentError(error, 'create_segments', {
        segmentCount: availableSegmentIds.length,
      });
      
      // Log error to database for production monitoring
      await ErrorLogger.logSegmentError(
        `Batch creation (${availableSegmentIds.length} segments)`,
        error,
        { 
          availableSegmentIds, 
          activeKeyId: activeKey.id,
          jobId 
        }
      );
      
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
          message: `Failed to create "${segment?.name || segmentId}": ${error.message || 'Unknown error'}`,
        };
      });
      
      setResults(errorResults);
      throw error;
    } finally {
      if (batchInterval) {
        clearInterval(batchInterval);
      }
      setBatchProgress(null);
      setLoading(false);
    }
  };

  return {
    loading,
    results,
    progress,
    batchProgress,
    createSegments,
    setResults,
  };
};

// Helper function to log segment operations for audit trail
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
