import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BundleCard } from './BundleCard';
import { BUNDLES } from '@/lib/segmentData';

interface BundlesSectionProps {
  selectedSegments: string[];
  onSelectBundle: (bundleId: string) => void;
}

export function BundlesSection({ selectedSegments, onSelectBundle }: BundlesSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-2xl font-bold">Quick Start Bundles</h3>
        <Badge variant="secondary" className="ml-2">Popular</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BUNDLES.map((bundle, index) => {
          const selectedFromBundle = bundle.segments.filter(id => selectedSegments.includes(id)).length;
          
          return (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              selectedFromBundle={selectedFromBundle}
              onSelect={() => onSelectBundle(bundle.id)}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
