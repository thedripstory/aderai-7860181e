import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AILimitStatus {
  allowed: boolean;
  remaining: number;
  total_used: number;
  daily_limit: number;
  total_lifetime: number;
  loading: boolean;
  error: string | null;
}

export function useAILimits() {
  const [limitStatus, setLimitStatus] = useState<AILimitStatus>({
    allowed: true,
    remaining: 10,
    total_used: 0,
    daily_limit: 10,
    total_lifetime: 0,
    loading: true,
    error: null,
  });

  const checkLimit = async () => {
    setLimitStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.functions.invoke('check-ai-limit');
      
      if (error) throw error;

      setLimitStatus({
        allowed: data.allowed,
        remaining: data.remaining,
        total_used: data.total_used,
        daily_limit: data.daily_limit,
        total_lifetime: data.total_lifetime,
        loading: false,
        error: null,
      });

      return data.allowed;
    } catch (error) {
      console.error('Error checking AI limit:', error);
      setLimitStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check limit',
      }));
      return false;
    }
  };

  const incrementUsage = async () => {
    try {
      const { error } = await supabase.functions.invoke('increment-ai-usage');
      if (error) throw error;
      
      // Refresh the limit status after incrementing
      await checkLimit();
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
    }
  };

  useEffect(() => {
    checkLimit();
  }, []);

  return {
    ...limitStatus,
    checkLimit,
    incrementUsage,
  };
}