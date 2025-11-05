import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

/**
 * Hook to monitor session timeout and warn users
 */
export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessionExpiresAt(null);
        return;
      }

      const expiresAt = new Date(session.expires_at! * 1000);
      setSessionExpiresAt(expiresAt);

      const timeUntilExpiry = expiresAt.getTime() - Date.now();

      // Show warning if session expires soon
      if (timeUntilExpiry > 0 && timeUntilExpiry <= SESSION_WARNING_TIME && !showWarning) {
        setShowWarning(true);
      }

      // Session has expired
      if (timeUntilExpiry <= 0) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }, [showWarning, toast]);

  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      setShowWarning(false);
      toast({
        title: "Session Refreshed",
        description: "Your session has been extended.",
      });
    } catch (error) {
      console.error('Failed to refresh session:', error);
      toast({
        title: "Refresh Failed",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    // Initial check
    checkSession();

    // Set up periodic checks
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkSession]);

  return {
    showWarning,
    sessionExpiresAt,
    refreshSession,
    dismissWarning,
  };
}
