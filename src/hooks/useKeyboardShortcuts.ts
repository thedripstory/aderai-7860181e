import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    // Allow shortcuts in inputs only for Escape key
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      if (event.key !== 'Escape') return;
    }

    for (const shortcut of shortcuts) {
      const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
      const ctrlMetaMatch = ctrlOrMeta ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && ctrlMetaMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export type { ShortcutConfig };
