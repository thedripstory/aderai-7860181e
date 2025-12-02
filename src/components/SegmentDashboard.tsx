import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Package, HelpCircle } from 'lucide-react';
import { SegmentPreviewModal } from './SegmentPreviewModal';
import { SegmentFilters } from './segments/SegmentFilters';
import { FavoritesSection } from './segments/FavoritesSection';
import { BundlesSection } from './segments/BundlesSection';
import { SegmentCategories } from './segments/SegmentCategories';
import { SEGMENTS } from '@/lib/segmentData';
import { toast } from 'sonner';

interface SegmentDashboardProps {
  selectedSegments: string[];
  onToggleSegment: (segmentId: string) => void;
  onSelectBundle: (bundleId: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  segmentLimit?: number;
  currentTier?: string;
}

export const SegmentDashboard: React.FC<SegmentDashboardProps> = ({
  selectedSegments,
  onToggleSegment,
  onSelectBundle,
  onSelectAll,
  onClearAll,
  segmentLimit = 999,
  currentTier = 'professional',
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('segment-favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [previewSegment, setPreviewSegment] = useState<typeof SEGMENTS[0] | null>(null);
  const [showShortcutsHint, setShowShortcutsHint] = useState(true);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('segment-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (onSelectAll) {
          onSelectAll();
          toast.success('All segments selected', { duration: 2000 });
        }
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        if (previewSegment) {
          setPreviewSegment(null);
        } else if (onClearAll && selectedSegments.length > 0) {
          onClearAll();
          toast.info('Selection cleared', { duration: 2000 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAll, onClearAll, selectedSegments.length, previewSegment]);

  const toggleFavorite = useCallback((segmentId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId];
      toast.success(
        prev.includes(segmentId) ? 'Removed from favorites' : 'Added to favorites',
        { duration: 2000 }
      );
      return newFavorites;
    });
  }, []);

  const filteredSegments = SEGMENTS.filter(segment => 
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteSegments = SEGMENTS.filter(s => favorites.includes(s.id));
  const selectedCount = selectedSegments.length;

  return (
    <div className="animate-fade-in">
      {/* Preview Modal */}
      <SegmentPreviewModal
        segment={previewSegment}
        isOpen={!!previewSegment}
        onClose={() => setPreviewSegment(null)}
        onSelect={onToggleSegment}
        onToggleFavorite={toggleFavorite}
        isSelected={previewSegment ? selectedSegments.includes(previewSegment.id) : false}
        isFavorite={previewSegment ? favorites.includes(previewSegment.id) : false}
      />

      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Create Segments</h2>
            <p className="text-muted-foreground flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              {SEGMENTS.length} professional segments at your fingertips
            </p>
          </div>
          
          {/* Selection Counter */}
          <div className="flex flex-col items-end gap-3">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold text-primary">{selectedCount}</div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </div>
            
            {onSelectAll && onClearAll && (
              <div className="flex gap-2">
                <button
                  onClick={onSelectAll}
                  className="px-4 py-2 text-sm font-medium border-2 border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={onClearAll}
                  className="px-4 py-2 text-sm font-medium border-2 border-border rounded-lg hover:bg-muted transition-all"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              Select individual segments or choose a pre-built bundle to get started quickly
            </span>
            <a 
              href="/help?article=getting-started" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 ml-auto font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Learn more</span>
            </a>
          </p>
        </div>

        {/* Search and Filters */}
        <SegmentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredCount={filteredSegments.length}
          showShortcutsHint={showShortcutsHint}
          onDismissHint={() => setShowShortcutsHint(false)}
        />
      </div>

      {/* Favorites Section */}
      {!searchQuery && (
        <FavoritesSection
          favorites={favoriteSegments}
          selectedSegments={selectedSegments}
          onToggleSegment={onToggleSegment}
          onPreviewSegment={setPreviewSegment}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Bundles Section */}
      {!searchQuery && (
        <BundlesSection
          selectedSegments={selectedSegments}
          onSelectBundle={onSelectBundle}
        />
      )}

      {/* Segments by Category */}
      <SegmentCategories
        searchQuery={searchQuery}
        selectedSegments={selectedSegments}
        favorites={favorites}
        onToggleSegment={onToggleSegment}
        onPreviewSegment={setPreviewSegment}
        onToggleFavorite={toggleFavorite}
        onClearSearch={() => setSearchQuery('')}
      />
    </div>
  );
};
