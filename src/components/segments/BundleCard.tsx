import { memo } from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Bundle } from '@/lib/segmentData';

interface BundleCardProps {
  bundle: Bundle;
  selectedFromBundle: number;
  onSelect: () => void;
  index: number;
}

export const BundleCard = memo(function BundleCard({ bundle, selectedFromBundle, onSelect, index }: BundleCardProps) {
  const bundleSelected = selectedFromBundle === bundle.segments.length;
  const partiallySelected = selectedFromBundle > 0 && selectedFromBundle < bundle.segments.length;
  const progressPercent = (selectedFromBundle / bundle.segments.length) * 100;
  
  return (
    <div
      className={`group relative bg-gradient-to-br from-card to-card/50 border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in ${
        bundleSelected 
          ? 'border-primary bg-primary/5' 
          : partiallySelected 
            ? 'border-primary/50' 
            : 'border-border hover:border-primary'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onSelect}
    >
      {/* Progress bar for partial selection */}
      {(partiallySelected || bundleSelected) && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {bundle.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={bundleSelected ? "default" : partiallySelected ? "outline" : "secondary"} className="text-xs">
              {bundle.segments.length} segments
            </Badge>
            {(partiallySelected || bundleSelected) && (
              <span className="text-xs text-primary font-medium">
                {selectedFromBundle}/{bundle.segments.length} selected
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {bundle.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
          {bundle.description}
        </p>
        
        <button className={`w-full py-2.5 rounded-lg font-semibold transition-all group-hover:shadow-md flex items-center justify-center gap-2 ${
          bundleSelected 
            ? 'bg-primary/20 text-primary border-2 border-primary' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}>
          {bundleSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Bundle Complete</span>
            </>
          ) : partiallySelected ? (
            <>
              <Package className="w-4 h-4" />
              <span>Add Remaining ({bundle.segments.length - selectedFromBundle})</span>
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              <span>Add Bundle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});
