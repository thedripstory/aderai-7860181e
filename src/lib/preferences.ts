/**
 * Client-side user preferences stored in localStorage.
 * These do not need to sync across devices.
 */

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

export function setConfettiEnabled(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONFETTI_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}
