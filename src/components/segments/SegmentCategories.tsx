import { Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { CategorySection } from './CategorySection';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/segmentData';
import type { Segment } from '@/lib/segmentData';
import type { SegmentCustomInputs } from '@/components/SegmentDashboard';

interface KlaviyoSegmentInfo {
  id: string;
  name: string;
  createdAt: string;
}

interface SegmentCategoriesProps {
  searchQuery: string;
  selectedSegments: string[];
  favorites: string[];
  onToggleSegment: (id: string) => void;
  onPreviewSegment: (segment: Segment) => void;
  onToggleFavorite: (id: string) => void;
  onClearSearch: () => void;
  segments: Segment[];
  customInputs?: SegmentCustomInputs;
  onCustomInputChange?: (segmentId: string, value: string) => void;
  isSegmentCreated?: (segmentName: string) => boolean;
  getSegmentInfo?: (segmentName: string) => KlaviyoSegmentInfo | undefined;
}

export function SegmentCategories({
  searchQuery,
  selectedSegments,
  favorites,
  onToggleSegment,
  onPreviewSegment,
  onToggleFavorite,
  onClearSearch,
  segments,
  customInputs = {},
  onCustomInputChange,
  isSegmentCreated,
  getSegmentInfo,
}: SegmentCategoriesProps) {
  const filteredSegments = segments.filter(segment => 
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectAllInCategory = (category: string) => {
    const categorySegmentIds = filteredSegments
      .filter(s => s.category === category && !s.unavailable && !s.requiresInput)
      .map(s => s.id);
    
    categorySegmentIds.forEach(id => {
      if (!selectedSegments.includes(id)) {
        onToggleSegment(id);
      }
    });
  };

  const clearAllInCategory = (category: string) => {
    const categorySegmentIds = filteredSegments
      .filter(s => s.category === category)
      .map(s => s.id);
    
    categorySegmentIds.forEach(id => {
      if (selectedSegments.includes(id)) {
        onToggleSegment(id);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Browse by Category</h3>
        <p className="text-sm text-muted-foreground">
          {CATEGORIES.length} categories • {filteredSegments.length} segments
        </p>
      </div>

      {CATEGORIES.map((category, categoryIndex) => {
        const categorySegments = filteredSegments.filter((s) => s.category === category);

        if (categorySegments.length === 0 && searchQuery) return null;

        return (
          <CategorySection
            key={category}
            category={category}
            icon={CATEGORY_ICONS[category]}
            segments={categorySegments}
            selectedSegments={selectedSegments}
            favorites={favorites}
            onToggleSegment={onToggleSegment}
            onPreviewSegment={onPreviewSegment}
            onToggleFavorite={onToggleFavorite}
            onSelectAllInCategory={() => selectAllInCategory(category)}
            onClearAllInCategory={() => clearAllInCategory(category)}
            index={categoryIndex}
            defaultExpanded={category === "Engagement & Activity"}
            customInputs={customInputs}
            onCustomInputChange={onCustomInputChange}
            isSegmentCreated={isSegmentCreated}
            getSegmentInfo={getSegmentInfo}
          />
        );
      })}

      {/* Empty State for Search */}
      {searchQuery && filteredSegments.length === 0 && (
        <EmptyState
          icon={Search}
          title="No segments match your search"
          description="Try adjusting your search term or browse segments by category above"
          actionLabel="Clear Search"
          onAction={onClearSearch}
          secondaryActionLabel="View All Segments"
          onSecondaryAction={onClearSearch}
        />
      )}
    </div>
  );
}
