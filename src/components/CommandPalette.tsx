import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Target,
  History,
  Settings,
  ExternalLink,
  Keyboard,
  HelpCircle,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Listen for custom event
    const handleCustomOpen = () => setOpen(true);
    window.addEventListener('open-command-palette', handleCustomOpen);
    document.addEventListener('keydown', down);
    
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘H</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard?tab=segments'))}>
            <Target className="mr-2 h-4 w-4" />
            <span>Segments</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘⇧S</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/jobs'))}>
            <History className="mr-2 h-4 w-4" />
            <span>Job History</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘J</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘,</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard?tab=segments'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Segments</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard?tab=ai'))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI Suggestions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings#danger-zone'))}>
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">Cleanup Segments</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.open('https://www.klaviyo.com/lists-segments', '_blank'))}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Open Klaviyo</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem onSelect={() => runCommand(() => window.dispatchEvent(new CustomEvent('open-shortcuts-help')))}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <span className="ml-auto text-xs text-muted-foreground">?</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/help'))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help Center</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
