import { Search, Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SegmentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  showShortcutsHint: boolean;
  onDismissHint: () => void;
}

export function SegmentFilters({
  searchQuery,
  onSearchChange,
  filteredCount,
  showShortcutsHint,
  onDismissHint,
}: SegmentFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Keyboard Shortcuts Hint */}
      {showShortcutsHint && (
        <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Keyboard className="w-4 h-4" />
            <span>
              <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono mr-1">Ctrl+A</kbd>
              Select all
              <span className="mx-2">•</span>
              <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono mr-1">Esc</kbd>
              Clear selection
            </span>
          </div>
          <button 
            onClick={onDismissHint}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search segments by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {searchQuery && (
          <Badge variant="secondary" className="absolute right-4 top-1/2 -translate-y-1/2">
            {filteredCount} results
          </Badge>
        )}
      </div>
    </div>
  );
}
