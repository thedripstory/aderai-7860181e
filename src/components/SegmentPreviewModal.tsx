import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Clock, CheckCircle2, Star, Eye, Zap } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  definition: string;
}

interface SegmentPreviewModalProps {
  segment: Segment | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (segmentId: string) => void;
  onToggleFavorite: (segmentId: string) => void;
  isSelected: boolean;
  isFavorite: boolean;
}

// Simulated audience estimations based on segment type
const getEstimatedAudience = (segmentId: string): { min: number; max: number; confidence: string } => {
  const estimates: Record<string, { min: number; max: number; confidence: string }> = {
    'engaged-30-days': { min: 15000, max: 25000, confidence: 'High' },
    'engaged-60-days': { min: 20000, max: 35000, confidence: 'High' },
    'engaged-90-days': { min: 25000, max: 45000, confidence: 'High' },
    'highly-engaged': { min: 2000, max: 5000, confidence: 'Medium' },
    'vip-customers': { min: 500, max: 2000, confidence: 'High' },
    'repeat-customers': { min: 3000, max: 8000, confidence: 'High' },
    'abandoned-cart': { min: 1000, max: 3000, confidence: 'Medium' },
    'new-subscribers': { min: 5000, max: 12000, confidence: 'Medium' },
    'churned-customers': { min: 2000, max: 6000, confidence: 'Low' },
  };
  
  return estimates[segmentId] || { 
    min: Math.floor(Math.random() * 5000) + 1000, 
    max: Math.floor(Math.random() * 10000) + 5000, 
    confidence: 'Medium' 
  };
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Engagement & Activity': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Demographics': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Customer Lifecycle & Value': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Shopping Behavior & Purchase History': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Exclusion Segments': 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const SegmentPreviewModal: React.FC<SegmentPreviewModalProps> = ({
  segment,
  isOpen,
  onClose,
  onSelect,
  onToggleFavorite,
  isSelected,
  isFavorite,
}) => {
  if (!segment) return null;

  const audience = getEstimatedAudience(segment.id);
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{segment.icon}</span>
              <div>
                <DialogTitle className="text-xl">{segment.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  Preview how this segment will appear in Klaviyo
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(segment.id)}
              className={isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-yellow-500'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getCategoryColor(segment.category)}>
              {segment.category}
            </Badge>
            {isSelected && (
              <Badge variant="default" className="bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Segment Definition
            </h4>
            <p className="text-sm text-muted-foreground">{segment.description}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-background border border-border">
              <span className="font-mono text-muted-foreground">{segment.definition}</span>
            </div>
          </div>

          {/* Estimated Audience */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Estimated Audience Size
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">
                  {formatNumber(audience.min)} - {formatNumber(audience.max)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  profiles (estimate based on typical account data)
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={`${
                  audience.confidence === 'High' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : audience.confidence === 'Medium'
                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }`}
              >
                {audience.confidence} confidence
              </Badge>
            </div>
          </div>

          {/* Klaviyo Preview */}
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Klaviyo Preview
            </h4>
            <div className="bg-[#0D1117] rounded-lg p-4 text-white font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-green-400">✓</span>
                <span>Segment: <span className="text-white">{segment.name.replace(/^\S+\s/, '')}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-blue-400">→</span>
                <span>Definition: <span className="text-cyan-300">{segment.definition}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-purple-400">⚡</span>
                <span>Type: <span className="text-yellow-300">Dynamic Segment</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Updates: <span className="text-emerald-300">Real-time</span></span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={() => {
                onSelect(segment.id);
                onClose();
              }}
              className="flex-1"
              variant={isSelected ? "outline" : "default"}
            >
              {isSelected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Remove from Selection
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Add to Selection
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
