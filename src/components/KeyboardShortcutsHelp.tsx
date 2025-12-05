import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', 'H'], description: 'Go to dashboard' },
      { keys: ['⌘', '⇧', 'S'], description: 'Go to segments' },
      { keys: ['⌘', 'J'], description: 'Go to job history' },
      { keys: ['⌘', ','], description: 'Go to settings' },
    ],
  },
  {
    title: 'Segments Page',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all available segments' },
      { keys: ['⌘', '⇧', 'A'], description: 'Deselect all segments' },
      { keys: ['⌘', '↵'], description: 'Create selected segments' },
      { keys: ['/'], description: 'Focus search input' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['Esc'], description: 'Close modals and dialogs' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    const handleCustomOpen = () => setOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-shortcuts-help', handleCustomOpen);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-shortcuts-help', handleCustomOpen);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Use <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘</kbd> on Mac or{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd> on Windows
        </p>
      </DialogContent>
    </Dialog>
  );
}
