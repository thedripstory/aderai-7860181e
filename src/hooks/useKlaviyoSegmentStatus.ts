import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KlaviyoSegmentInfo {
  id: string;
  name: string;
  createdAt: string;
}

interface CachedData {
  segments: [string, KlaviyoSegmentInfo][];
  timestamp: string;
}

export function useKlaviyoSegmentStatus(klaviyoKeyId: string | null) {
  const [createdSegments, setCreatedSegments] = useState<Map<string, KlaviyoSegmentInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Normalize segment name for comparison
  const normalizeSegmentName = (name: string): string => {
    return name
      .replace(' | Aderai', '')
      .replace(' (Exclusion)', '')
      .trim()
      .toLowerCase();
  };

  const syncSegmentStatus = useCallback(async () => {
    if (!klaviyoKeyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('klaviyo-get-aderai-segments', {
        body: { klaviyoKeyId }
      });

      if (fetchError) throw fetchError;

      const segmentMap = new Map<string, KlaviyoSegmentInfo>();
      
      (data.segments || []).forEach((seg: any) => {
        // Store by normalized base name for easy lookup
        const baseName = normalizeSegmentName(seg.name);
        segmentMap.set(baseName, {
          id: seg.id,
          name: seg.name,
          createdAt: seg.created
        });
      });

      setCreatedSegments(segmentMap);
      setLastSynced(new Date());
      
      // Cache to localStorage
      const cacheData: CachedData = {
        segments: Array.from(segmentMap.entries()),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`aderai_segments_${klaviyoKeyId}`, JSON.stringify(cacheData));
      
    } catch (err: any) {
      console.error('Error syncing segment status:', err);
      setError(err.message || 'Failed to sync segment status');
    } finally {
      setLoading(false);
    }
  }, [klaviyoKeyId]);

  // Load from cache on mount, then sync
  useEffect(() => {
    if (!klaviyoKeyId) return;

    // Try to load from cache first
    const cached = localStorage.getItem(`aderai_segments_${klaviyoKeyId}`);
    if (cached) {
      try {
        const { segments, timestamp }: CachedData = JSON.parse(cached);
        setCreatedSegments(new Map(segments));
        setLastSynced(new Date(timestamp));
      } catch (e) {
        console.error('Error parsing cached segment status:', e);
      }
    }

    // Then sync fresh data
    syncSegmentStatus();
  }, [klaviyoKeyId, syncSegmentStatus]);

  const isSegmentCreated = useCallback((segmentName: string): boolean => {
    const normalized = normalizeSegmentName(segmentName);
    return createdSegments.has(normalized);
  }, [createdSegments]);

  const getSegmentInfo = useCallback((segmentName: string): KlaviyoSegmentInfo | undefined => {
    const normalized = normalizeSegmentName(segmentName);
    return createdSegments.get(normalized);
  }, [createdSegments]);

  return {
    createdSegments,
    loading,
    lastSynced,
    error,
    syncSegmentStatus,
    isSegmentCreated,
    getSegmentInfo,
    createdCount: createdSegments.size
  };
}
