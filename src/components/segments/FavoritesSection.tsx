import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SegmentCard } from './SegmentCard';
import type { Segment } from '@/lib/segmentData';

interface FavoritesSectionProps {
  favorites: Segment[];
  selectedSegments: string[];
  onToggleSegment: (id: string) => void;
  onPreviewSegment: (segment: Segment) => void;
  onToggleFavorite: (id: string) => void;
}

export function FavoritesSection({
  favorites,
  selectedSegments,
  onToggleSegment,
  onPreviewSegment,
  onToggleFavorite,
}: FavoritesSectionProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-2xl font-bold">Favorites</h3>
        <Badge variant="secondary" className="ml-2">{favorites.length}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            isSelected={selectedSegments.includes(segment.id)}
            isFavorite={true}
            onToggle={() => onToggleSegment(segment.id)}
            onPreview={() => onPreviewSegment(segment)}
            onToggleFavorite={() => onToggleFavorite(segment.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
