import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const REMINDER_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const LOGOUT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useInactivityLogout() {
  const navigate = useNavigate();
  const reminderTimer = useRef<NodeJS.Timeout | null>(null);
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);
  const hasShownReminder = useRef(false);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.info('You have been logged out due to inactivity');
    navigate('/auth');
  }, [navigate]);

  const showReminder = useCallback(() => {
    if (!hasShownReminder.current) {
      hasShownReminder.current = true;
      toast('Still there?', {
        description: 'You\'ve been inactive for a while. Activity will keep you logged in.',
        duration: 8000,
      });
    }
  }, []);

  const resetTimers = useCallback(() => {
    hasShownReminder.current = false;
    
    if (reminderTimer.current) clearTimeout(reminderTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    
    reminderTimer.current = setTimeout(showReminder, REMINDER_TIMEOUT);
    logoutTimer.current = setTimeout(handleLogout, LOGOUT_TIMEOUT);
  }, [showReminder, handleLogout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Throttle activity detection
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 1000) { // Only reset if more than 1 second has passed
        lastActivity = now;
        resetTimers();
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    
    // Start initial timers
    resetTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (reminderTimer.current) clearTimeout(reminderTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [resetTimers]);
}
