import { memo, useState } from 'react';
import { CheckCircle2, Eye, Star, Info, ExternalLink, Sparkles, MapPin, TrendingUp } from 'lucide-react';
import type { Segment } from '@/lib/segmentData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Predictive analytics segment IDs
const PREDICTIVE_ANALYTICS_SEGMENTS = ['high-churn-risk', 'likely-purchase-soon', 'predicted-vips', 'high-churn-risk-exclude'];

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onToggleFavorite: () => void;
  index: number;
  customInputValue?: string;
  onCustomInputChange?: (value: string) => void;
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

const PredictiveAnalyticsSetupDialog = ({ open, onOpenChange, segmentName }: { open: boolean; onOpenChange: (open: boolean) => void; segmentName: string }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          Predictive Analytics Setup Guide
        </DialogTitle>
        <DialogDescription>
          Unlock {segmentName} with Klaviyo's Predictive Analytics
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-2">
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Why Predictive Analytics?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klaviyo's AI predicts customer behavior including churn risk, expected order date, and lifetime value. Target the right customers at the right time!
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> Predictive Analytics requires a Klaviyo paid plan with sufficient customer data (typically 180+ days of order history).
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">How to Check & Enable:</h4>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
            <div>
              <p className="font-medium text-sm">Check Your Klaviyo Plan</p>
              <p className="text-xs text-muted-foreground">Go to Klaviyo → Settings → Billing to verify you have access to Predictive Analytics</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
            <div>
              <p className="font-medium text-sm">Verify Data Requirements</p>
              <p className="text-xs text-muted-foreground">You need 180+ days of order history and 500+ customers for accurate predictions</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
            <div>
              <p className="font-medium text-sm">Create Segment in Klaviyo</p>
              <p className="text-xs text-muted-foreground">Once enabled, create a segment using "Predictive Analytics" conditions in Klaviyo's segment builder</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open('https://help.klaviyo.com/hc/en-us/articles/360057055772-Guide-to-Predictive-Analytics-in-Klaviyo', '_blank')}
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

const LocationInputDialog = ({
  open, 
  onOpenChange, 
  segment,
  value,
  onValueChange,
  onConfirm
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  segment: Segment;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
}) => {
  const inputConfig = segment.requiresInput;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{segment.icon}</span>
            {segment.name}
          </DialogTitle>
          <DialogDescription>
            Customize this segment for your target location
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Location-Based Targeting</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the country name exactly as it appears in your Klaviyo profile data for accurate segmentation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-input">{inputConfig?.label || 'Location'}</Label>
            <Input
              id="location-input"
              placeholder={inputConfig?.placeholder || 'Enter location...'}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Common values: United States, United Kingdom, Canada, Australia, Germany, France
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              disabled={!value.trim()}
            >
              Add Segment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProximitySetupDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          Proximity Segment Setup Guide
        </DialogTitle>
        <DialogDescription>
          Target customers within a specific radius of a location
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-2">
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Why Proximity Segments?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Perfect for local promotions, store events, and geo-targeted campaigns. Reach customers near your physical locations!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Setup Steps in Klaviyo:</h4>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
            <div>
              <p className="font-medium text-sm">Go to Lists & Segments</p>
              <p className="text-xs text-muted-foreground">Navigate to Audience → Lists & Segments in Klaviyo</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
            <div>
              <p className="font-medium text-sm">Create New Segment</p>
              <p className="text-xs text-muted-foreground">Click "Create Segment" and select location-based condition</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
            <div>
              <p className="font-medium text-sm">Set Location & Radius</p>
              <p className="text-xs text-muted-foreground">Enter your target address/coordinates and set the radius in miles or kilometers</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open('https://help.klaviyo.com/hc/en-us/articles/115005080407-Create-a-Segment-in-Klaviyo', '_blank')}
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
  customInputValue,
  onCustomInputChange,
}: SegmentCardProps) {
  const [showBirthdayGuide, setShowBirthdayGuide] = useState(false);
  const [showProximityGuide, setShowProximityGuide] = useState(false);
  const [showPredictiveGuide, setShowPredictiveGuide] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tempLocationValue, setTempLocationValue] = useState(
    customInputValue || segment.requiresInput?.defaultValue || ''
  );
  
  const isUnavailable = segment.unavailable;
  const requiresInput = segment.requiresInput && !isUnavailable;
  const isPredictiveSegment = PREDICTIVE_ANALYTICS_SEGMENTS.includes(segment.id);

  const handleClick = () => {
    if (segment.id === 'birthday-month') {
      setShowBirthdayGuide(true);
    } else if (segment.id === 'location-proximity') {
      setShowProximityGuide(true);
    } else if (isPredictiveSegment) {
      setShowPredictiveGuide(true);
    } else if (requiresInput && !isSelected) {
      // Show input dialog for segments that require custom input
      setTempLocationValue(customInputValue || segment.requiresInput?.defaultValue || '');
      setShowLocationInput(true);
    } else if (!isUnavailable) {
      onToggle();
    }
  };

  const handleLocationConfirm = () => {
    if (onCustomInputChange && tempLocationValue.trim()) {
      onCustomInputChange(tempLocationValue.trim());
    }
    onToggle();
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

        {/* Custom input badge for segments requiring input */}
        {requiresInput && !isUnavailable && (
          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            CUSTOMIZABLE
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
                ? `Click to learn how to set up this segment in Klaviyo`
                : segment.description}
            </p>
            <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
              isUnavailable 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                : isSelected && requiresInput && customInputValue
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-muted/50 border-border'
            }`}>
              <span className="font-mono text-muted-foreground">
                {isUnavailable 
                  ? 'Click for setup guide →' 
                  : isSelected && requiresInput && customInputValue
                  ? `Country = ${customInputValue}`
                  : segment.definition}
              </span>
            </div>
          </div>
        </div>
      </div>

      {segment.id === 'birthday-month' && (
        <BirthdaySetupDialog open={showBirthdayGuide} onOpenChange={setShowBirthdayGuide} />
      )}
      
      {segment.id === 'location-proximity' && (
        <ProximitySetupDialog open={showProximityGuide} onOpenChange={setShowProximityGuide} />
      )}

      {isPredictiveSegment && (
        <PredictiveAnalyticsSetupDialog 
          open={showPredictiveGuide} 
          onOpenChange={setShowPredictiveGuide}
          segmentName={segment.name}
        />
      )}

      {requiresInput && (
        <LocationInputDialog 
          open={showLocationInput} 
          onOpenChange={setShowLocationInput}
          segment={segment}
          value={tempLocationValue}
          onValueChange={setTempLocationValue}
          onConfirm={handleLocationConfirm}
        />
      )}
    </>
  );
});
