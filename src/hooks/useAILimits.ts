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
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLimitStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Not authenticated',
        }));
        return false;
      }

      // Let supabase client handle auth headers automatically
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
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('Not authenticated');
        return;
      }

      // Let supabase client handle auth headers automatically
      const { data, error } = await supabase.functions.invoke('increment-ai-usage');
      if (error) throw error;

      // Optimistically update local counter from the server-returned value so the UI moves immediately
      if (data && typeof data.new_count === 'number') {
        setLimitStatus(prev => ({
          ...prev,
          total_used: data.new_count,
          total_lifetime: typeof data.total === 'number' ? data.total : prev.total_lifetime,
          remaining: Math.max(0, prev.daily_limit - data.new_count),
          allowed: data.new_count < prev.daily_limit,
        }));
      }

      // Refresh the limit status from server in the background to stay in sync
      checkLimit().catch(() => {});
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
    }
  };

  useEffect(() => {
    // Wait for auth session to be established before checking limits
    const initLimits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkLimit();
      } else {
        setLimitStatus(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    initLimits();
  }, []);

  return {
    ...limitStatus,
    checkLimit,
    incrementUsage,
  };
}