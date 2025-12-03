import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SegmentCard } from './SegmentCard';
import type { Segment } from '@/lib/segmentData';

interface CategorySectionProps {
  category: string;
  icon: string;
  segments: Segment[];
  selectedSegments: string[];
  favorites: string[];
  onToggleSegment: (id: string) => void;
  onPreviewSegment: (segment: Segment) => void;
  onToggleFavorite: (id: string) => void;
  onSelectAllInCategory: () => void;
  onClearAllInCategory: () => void;
  index: number;
  defaultExpanded?: boolean;
}

export function CategorySection({
  category,
  icon,
  segments,
  selectedSegments,
  favorites,
  onToggleSegment,
  onPreviewSegment,
  onToggleFavorite,
  onSelectAllInCategory,
  onClearAllInCategory,
  index,
  defaultExpanded = false,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const categorySelectedCount = segments.filter(s => selectedSegments.includes(s.id)).length;

  return (
    <div 
      className="bg-card border-2 border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all animate-slide-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {category}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">
                {segments.length} segments
              </p>
              {categorySelectedCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {categorySelectedCount} selected
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAllInCategory();
            }}
            className="px-4 py-2 text-sm font-medium border-2 border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-all"
          >
            Select All
          </button>
          {categorySelectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAllInCategory();
              }}
              className="px-4 py-2 text-sm font-medium border-2 border-destructive/50 text-destructive rounded-lg hover:bg-destructive/10 transition-all"
            >
              Clear All
            </button>
          )}
          <div className={`p-2 rounded-lg bg-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div className="border-t-2 border-border bg-gradient-to-b from-background to-muted/20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {segments.map((segment, segmentIndex) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                isSelected={selectedSegments.includes(segment.id)}
                isFavorite={favorites.includes(segment.id)}
                onToggle={() => onToggleSegment(segment.id)}
                onPreview={() => onPreviewSegment(segment)}
                onToggleFavorite={() => onToggleFavorite(segment.id)}
                index={segmentIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
