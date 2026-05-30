/**
 * User preferences. Persisted to the backend (notification_preferences table)
 * so they sync across devices, with a localStorage cache for instant
 * synchronous reads (used by animations/effects).
 */
import { supabase } from '@/integrations/supabase/client';

const CONFETTI_KEY = 'aderai:confetti_enabled';

export function getConfettiEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const v = window.localStorage.getItem(CONFETTI_KEY);
    if (v === null) return true; // default ON
    return v === 'true';
  } catch {
    return true;
  }
}

function writeLocalConfetti(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONFETTI_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

export function setConfettiEnabled(value: boolean): void {
  writeLocalConfetti(value);
}

/**
 * Load confetti preference from the server and refresh the local cache.
 * Safe to call on mount; silently no-ops if user is not authenticated.
 */
export async function syncConfettiFromServer(): Promise<boolean | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('confetti_enabled')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return null;
    const v = (data as any).confetti_enabled;
    if (typeof v === 'boolean') {
      writeLocalConfetti(v);
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persist confetti preference to the server (and update local cache).
 */
export async function saveConfettiEnabled(value: boolean): Promise<void> {
  writeLocalConfetti(value);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // upsert in case the row doesn't exist yet
    await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, confetti_enabled: value },
        { onConflict: 'user_id' }
      );
  } catch {
    /* ignore — local cache still applied */
  }
}
