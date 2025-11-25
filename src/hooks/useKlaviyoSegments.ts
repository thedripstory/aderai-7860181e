import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLogger } from '@/lib/errorLogger';

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

export const useKlaviyoSegments = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SegmentResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const createSegments = async (
    selectedSegments: string[],
    activeKey: KlaviyoKey,
    segmentsList: any[],
    jobId?: string
  ) => {
    if (selectedSegments.length === 0) {
      throw new Error('Please select at least one segment to create');
    }

    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: selectedSegments.length });

    try {
      const currencySymbol = activeKey.currency_symbol;
      
      const settings = {
        highValue: activeKey.vip_threshold,
        mediumValue: activeKey.high_value_threshold,
        lowValue: activeKey.aov,
        atRiskDays: activeKey.lapsed_days,
        lostDays: activeKey.churned_days,
        recentDays: activeKey.new_customer_days,
        activeDays: 90,
        vipThreshold: activeKey.vip_threshold,
        highValueThreshold: activeKey.high_value_threshold,
        aov: activeKey.aov,
      };

      // Pass segment IDs directly - they match the backend definitions
      const segmentIds = selectedSegments;

      // Save progress if jobId provided
      if (jobId) {
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'in_progress',
            segments_processed: 0,
            total_segments: selectedSegments.length
          })
          .eq('id', jobId);
      }

      console.log('Creating segments:', segmentIds);

      const { data: response, error } = await supabase.functions.invoke('klaviyo-create-segments', {
        body: {
          apiKey: activeKey.klaviyo_api_key_hash,
          segmentIds: segmentIds,
          currencySymbol,
          settings,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!response || !response.results) {
        console.error('Invalid response from edge function:', response);
        throw new Error('Invalid response from segment creation service');
      }

      console.log('Segment creation response:', response);

      // Create a map of results by segmentId for reliable lookup
      const resultsMap = new Map<string, any>();
      response.results.forEach((result: any) => {
        if (result && result.segmentId) {
          resultsMap.set(result.segmentId, result);
        }
      });

      const newResults: SegmentResult[] = selectedSegments.map((segmentId) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        const result = resultsMap.get(segmentId);

        if (!result) {
          return {
            segmentId,
            status: "error",
            message: `Failed to create "${segment?.name || segmentId}": No response from server`,
          };
        }

        if (result.status === 'created') {
          // Log the operation for audit trail
          logSegmentOperation(segmentId, segment?.name, 'create', 'success', activeKey.id, result.klaviyoId);
          return {
            segmentId,
            status: "success",
            message: `Successfully created "${segment?.name || segmentId}"`,
            klaviyoId: result.data?.data?.id || result.klaviyoId,
          };
        } else if (result.status === 'exists') {
          return {
            segmentId,
            status: "skipped",
            message: `"${segment?.name || segmentId}" already exists`,
          };
        } else if (result.status === 'missing_metrics') {
          return {
            segmentId,
            status: "error",
            message: `Cannot create "${segment?.name || segmentId}": Required metrics not available in your Klaviyo account`,
          };
        } else {
          // Log failed operations
          logSegmentOperation(segmentId, segment?.name, 'create', 'failed', activeKey.id, undefined, result.error);
          return {
            segmentId,
            status: "error",
            message: `Failed to create "${segment?.name || segmentId}": ${result.error || 'Unknown error'}`,
          };
        }
      });

      setResults(newResults);

      // Update job completion
      if (jobId) {
        const successCount = newResults.filter(r => r.status === 'success').length;
        await supabase
          .from('segment_creation_jobs')
          .update({
            status: 'completed',
            segments_processed: selectedSegments.length,
            completed_at: new Date().toISOString(),
            success_count: successCount,
            error_count: newResults.filter(r => r.status === 'error').length
          })
          .eq('id', jobId);
      }

      return newResults;
    } catch (error: any) {
      console.error('Segment creation error:', error);
      
      // Log error to database for production monitoring
      await ErrorLogger.logSegmentError(
        `Batch creation (${selectedSegments.length} segments)`,
        error,
        { 
          selectedSegments, 
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

      const errorResults: SegmentResult[] = selectedSegments.map((segmentId) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        return {
          segmentId,
          status: "error",
          message: `Failed to create "${segment?.name || segmentId}": ${error.message || 'Unknown error'}`,
        };
      });
      
      setResults(errorResults);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    results,
    progress,
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
    console.error('Failed to log segment operation:', err);
  }
}
