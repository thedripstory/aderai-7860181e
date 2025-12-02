import { CheckCircle2, Eye, Star } from 'lucide-react';
import type { Segment } from '@/lib/segmentData';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onToggleFavorite: () => void;
  index: number;
}

export function SegmentCard({
  segment,
  isSelected,
  isFavorite,
  onToggle,
  onPreview,
  onToggleFavorite,
  index,
}: SegmentCardProps) {
  return (
    <div
      className={`group relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer animate-fade-in ${
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border hover:border-primary/50 hover:shadow-sm bg-card"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onToggle}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="p-1.5 rounded-lg bg-background/80 border border-border hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
          title="Preview segment"
        >
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            isFavorite 
              ? 'bg-yellow-500/10 border-yellow-500/30' 
              : 'bg-background/80 border-border opacity-0 group-hover:opacity-100 hover:bg-muted'
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
        </button>
        {isSelected && (
          <div className="p-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-4">
        <div className="text-3xl mt-1 group-hover:scale-110 transition-transform">
          {segment.icon}
        </div>
        <div className="flex-1 pr-20">
          <h4 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
            {segment.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {segment.description}
          </p>
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border">
            <span className="font-mono text-muted-foreground">
              {segment.definition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
