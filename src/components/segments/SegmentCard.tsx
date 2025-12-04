import { memo, useState } from 'react';
import { CheckCircle2, Eye, Star, Info, ExternalLink, Sparkles } from 'lucide-react';
import type { Segment } from '@/lib/segmentData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onToggleFavorite: () => void;
  index: number;
}

const BirthdaySetupDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">🎂</span>
          Birthday Segment Setup Guide
        </DialogTitle>
        <DialogDescription>
          Unlock powerful birthday marketing with this quick setup
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-2">
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Why Birthday Segments?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Birthday emails have 481% higher transaction rates than promotional emails. Don't miss this opportunity!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Setup Steps:</h4>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
            <div>
              <p className="font-medium text-sm">Add Birthday Property to Klaviyo</p>
              <p className="text-xs text-muted-foreground">Go to Klaviyo → Lists & Segments → Create a new custom property called "birthday" (date type)</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
            <div>
              <p className="font-medium text-sm">Collect Birthday Data</p>
              <p className="text-xs text-muted-foreground">Add a birthday field to your signup forms, or import birthdays from your existing customer data</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
            <div>
              <p className="font-medium text-sm">Create the Segment in Klaviyo</p>
              <p className="text-xs text-muted-foreground">In Klaviyo, create a segment with condition: "Birthday is in this month"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">4</div>
            <div>
              <p className="font-medium text-sm">Set Up Birthday Flow</p>
              <p className="text-xs text-muted-foreground">Create an automated flow triggered by the birthday segment for personalized birthday offers</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open('https://help.klaviyo.com/hc/en-us/articles/115005078747-Guide-to-Collecting-Birthday-Information', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Klaviyo Guide
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Got it!
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export const SegmentCard = memo(function SegmentCard({
  segment,
  isSelected,
  isFavorite,
  onToggle,
  onPreview,
  onToggleFavorite,
  index,
}: SegmentCardProps) {
  const [showBirthdayGuide, setShowBirthdayGuide] = useState(false);
  const isUnavailable = segment.unavailable;

  const handleClick = () => {
    if (isUnavailable && segment.id === 'birthday-month') {
      setShowBirthdayGuide(true);
    } else if (!isUnavailable) {
      onToggle();
    }
  };

  return (
    <>
      <div
        className={`group relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer animate-fade-in ${
          isUnavailable
            ? "border-dashed border-amber-500/50 bg-amber-500/5 hover:border-amber-500/70"
            : isSelected
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border hover:border-primary/50 hover:shadow-sm bg-card"
        }`}
        style={{ animationDelay: `${index * 30}ms` }}
        onClick={handleClick}
      >
        {/* Manual setup badge for unavailable segments */}
        {isUnavailable && (
          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Info className="w-3 h-3" />
            SETUP GUIDE
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {!isUnavailable && (
            <>
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
            </>
          )}
          {isSelected && !isUnavailable && (
            <div className="p-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex items-start gap-4">
          <div className={`text-3xl mt-1 group-hover:scale-110 transition-transform ${isUnavailable ? 'grayscale-0' : ''}`}>
            {segment.icon}
          </div>
          <div className="flex-1 pr-20">
            <h4 className={`font-bold text-base mb-2 transition-colors ${isUnavailable ? 'text-amber-600 dark:text-amber-400 group-hover:text-amber-500' : 'group-hover:text-primary'}`}>
              {segment.name.replace(' (Manual Only)', '')}
            </h4>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {isUnavailable 
                ? "Click to learn how to set up birthday marketing in Klaviyo" 
                : segment.description}
            </p>
            <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
              isUnavailable 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                : 'bg-muted/50 border-border'
            }`}>
              <span className="font-mono text-muted-foreground">
                {isUnavailable ? 'Click for setup guide →' : segment.definition}
              </span>
            </div>
          </div>
        </div>
      </div>

      {segment.id === 'birthday-month' && (
        <BirthdaySetupDialog open={showBirthdayGuide} onOpenChange={setShowBirthdayGuide} />
      )}
    </>
  );
});
