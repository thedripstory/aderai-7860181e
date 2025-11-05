import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const segmentIdMapping: Record<string, string> = {
    'vip': 'vip-customers',
    'high-value': 'high-value-customers',
    'new-customers': 'recent-customers',
    'repeat-customers': 'repeat-customers',
    'one-time-buyers': 'browsers',
    'active-customers': 'active-customers',
    'lapsed-customers': 'at-risk-customers',
    'churned-customers': 'lost-customers',
    'high-frequency': 'loyal-customers',
    'engaged-subscribers': 'engaged-subscribers',
    'unengaged-subscribers': 'highly-engaged',
    'cart-abandoners': 'cart-abandoners',
    'browse-abandoners': 'checkout-abandoners',
  };

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
      };

      const mappedSegmentIds = selectedSegments
        .map(id => segmentIdMapping[id])
        .filter(Boolean);

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

      const { data: response, error } = await supabase.functions.invoke('klaviyo-create-segments', {
        body: {
          apiKey: activeKey.klaviyo_api_key_hash,
          segmentIds: mappedSegmentIds,
          currencySymbol,
          settings,
        },
      });

      if (error) throw error;

      const newResults: SegmentResult[] = selectedSegments.map((segmentId, index) => {
        const segment = segmentsList.find((s: any) => s.id === segmentId);
        const result = response.results[index];

        if (result.status === 'created') {
          return {
            segmentId,
            status: "success",
            message: `Successfully created "${segment?.name}"`,
            klaviyoId: result.data?.data?.id,
          };
        } else if (result.status === 'exists') {
          return {
            segmentId,
            status: "skipped",
            message: `"${segment?.name}" already exists`,
          };
        } else if (result.status === 'missing_metrics') {
          return {
            segmentId,
            status: "error",
            message: `Cannot create "${segment?.name}": Required metrics not available`,
          };
        } else {
          return {
            segmentId,
            status: "error",
            message: `Failed to create "${segment?.name}": ${result.error || 'Unknown error'}`,
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
          message: `Failed to create "${segment?.name}": ${error.message || 'Unknown error'}`,
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
