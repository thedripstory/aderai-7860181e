import { memo, useState } from 'react';
import { CheckCircle2, Eye, Star, Info, Sparkles, MapPin, TrendingUp, MessageSquareWarning, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// Category-based segment IDs
const CATEGORY_SEGMENTS = ['cross-sell', 'category-buyers', 'multi-category'];

interface KlaviyoSegmentInfo {
  id: string;
  name: string;
  createdAt: string;
}

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
  isCreatedInKlaviyo?: boolean;
  klaviyoInfo?: KlaviyoSegmentInfo;
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

        <div className="pt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Got it!
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const getPredictiveContent = (segmentId: string) => {
  switch (segmentId) {
    case 'high-churn-risk':
    case 'high-churn-risk-exclude':
      return {
        icon: '⚠️',
        title: 'High Churn Risk Setup Guide',
        subtitle: 'Identify customers likely to stop buying before it\'s too late',
        whyTitle: 'Why Churn Risk Segments?',
        whyText: 'Proactively reaching out to at-risk customers can reduce churn by up to 25%. Target them with win-back campaigns before they leave!',
        steps: [
          {
            title: 'Check Predictive Analytics Access',
            description: 'Go to Klaviyo → Settings → Billing. Predictive Analytics requires 500+ customers and 180+ days of order data.'
          },
          {
            title: 'Navigate to Segments',
            description: 'Go to Audience → Lists & Segments → Create Segment'
          },
          {
            title: 'Add Predictive Condition',
            description: 'Select "Predictive Analytics" → "Churn Risk Prediction" → "equals" → "HIGH"'
          },
          {
            title: 'Name Your Segment',
            description: 'Name it "High Churn Risk" and save. Use this to trigger win-back flows or special retention offers.'
          }
        ],
        proTip: 'Create an automated flow for this segment offering exclusive discounts, loyalty rewards, or asking for feedback to understand why they\'re disengaging.'
      };
    
    case 'likely-purchase-soon':
      return {
        icon: '🎯',
        title: 'Likely to Purchase Soon Setup Guide',
        subtitle: 'Target customers predicted to buy within the next 14 days',
        whyTitle: 'Why Expected Order Date Segments?',
        whyText: 'Klaviyo\'s AI predicts when customers are ready to buy. Reaching them at the right moment increases conversion rates by up to 40%!',
        steps: [
          {
            title: 'Check Predictive Analytics Access',
            description: 'Go to Klaviyo → Settings → Billing. Requires 500+ customers with repeat purchase history.'
          },
          {
            title: 'Navigate to Segments',
            description: 'Go to Audience → Lists & Segments → Create Segment'
          },
          {
            title: 'Add Predictive Condition',
            description: 'Select "Predictive Analytics" → "Expected Date of Next Order" → "is in the next" → "14 days"'
          },
          {
            title: 'Name Your Segment',
            description: 'Name it "Likely to Purchase Soon" and save. Perfect for timely product recommendations!'
          }
        ],
        proTip: 'Send personalized product recommendations or time-limited offers to this segment. They\'re already primed to buy—give them a reason to choose you!'
      };
    
    case 'predicted-vips':
      return {
        icon: '⭐',
        title: 'Predicted VIPs Setup Guide',
        subtitle: 'Find future high-value customers before they become VIPs',
        whyTitle: 'Why Predicted CLV Segments?',
        whyText: 'Identifying potential VIPs early lets you nurture them into loyal customers. Treat them like VIPs today, and they\'ll become your best customers tomorrow!',
        steps: [
          {
            title: 'Check Predictive Analytics Access',
            description: 'Go to Klaviyo → Settings → Billing. Requires substantial order history for accurate CLV predictions.'
          },
          {
            title: 'Navigate to Segments',
            description: 'Go to Audience → Lists & Segments → Create Segment'
          },
          {
            title: 'Add Predictive Condition',
            description: 'Select "Predictive Analytics" → "Predicted Customer Lifetime Value" → "is greater than" → [your VIP threshold, e.g., $500]'
          },
          {
            title: 'Name Your Segment',
            description: 'Name it "Predicted VIPs" and save. Use for exclusive early access, loyalty programs, or VIP treatment!'
          }
        ],
        proTip: 'Give predicted VIPs early access to new products, exclusive discounts, or invite them to a loyalty program. Building relationships early pays off long-term!'
      };
    
    default:
      return {
        icon: '🔮',
        title: 'Predictive Analytics Setup Guide',
        subtitle: 'Unlock AI-powered customer predictions',
        whyTitle: 'Why Predictive Analytics?',
        whyText: 'Klaviyo\'s AI predicts customer behavior including churn risk, expected order date, and lifetime value. Target the right customers at the right time!',
        steps: [
          {
            title: 'Check Your Klaviyo Plan',
            description: 'Go to Klaviyo → Settings → Billing to verify you have access to Predictive Analytics'
          },
          {
            title: 'Verify Data Requirements',
            description: 'You need 180+ days of order history and 500+ customers for accurate predictions'
          },
          {
            title: 'Create Segment in Klaviyo',
            description: 'Once enabled, create a segment using "Predictive Analytics" conditions in Klaviyo\'s segment builder'
          }
        ],
        proTip: 'Start with High Churn Risk to retain customers, then explore Expected Order Date to boost conversions!'
      };
  }
};

const PredictiveAnalyticsSetupDialog = ({ open, onOpenChange, segmentId, segmentName }: { open: boolean; onOpenChange: (open: boolean) => void; segmentId: string; segmentName: string }) => {
  const content = getPredictiveContent(segmentId);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{content.icon}</span>
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.subtitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{content.whyTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {content.whyText}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> Predictive Analytics requires a Klaviyo paid plan with sufficient customer data (typically 180+ days of order history and 500+ customers).
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Setup Steps:</h4>
            
            {content.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>💡 Pro Tip:</strong> {content.proTip}
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

        <div className="pt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Got it!
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const NegativeFeedbackSetupDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">😞</span>
          Negative Feedback Segment Setup Guide
        </DialogTitle>
        <DialogDescription>
          Protect your sender reputation by excluding unhappy customers
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-2">
        <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <MessageSquareWarning className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Why This Segment Matters</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sending promotional emails to customers who left negative feedback can damage your brand reputation and increase unsubscribes. This exclusion segment keeps them out of campaigns while you work to resolve their issues.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>What counts as negative feedback?</strong> Low review ratings (1-2 stars), support ticket complaints, refund requests with negative reasons, or survey responses indicating dissatisfaction.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Setup Steps in Klaviyo:</h4>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
            <div>
              <p className="font-medium text-sm">Set Up Feedback Tracking</p>
              <p className="text-xs text-muted-foreground">Connect your review platform (Yotpo, Judge.me, Stamped, etc.) to Klaviyo, or create a custom property like "feedback_rating" or "customer_sentiment"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
            <div>
              <p className="font-medium text-sm">Create Segment in Klaviyo</p>
              <p className="text-xs text-muted-foreground">Go to Audience → Segments → Create Segment</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
            <div>
              <p className="font-medium text-sm">Add Condition</p>
              <p className="text-xs text-muted-foreground">Select: "Properties about someone → [feedback_rating] is less than 3" OR "Has left a review → where Rating is less than 3"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">4</div>
            <div>
              <p className="font-medium text-sm">Use as Exclusion</p>
              <p className="text-xs text-muted-foreground">Add this segment to campaign exclusions to automatically skip unhappy customers from promotional emails</p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-700 dark:text-green-400">
            <strong>💡 Pro Tip:</strong> Create a separate re-engagement flow for this segment offering special care, apologies, or exclusive discounts to win them back!
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Got it!
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const CategorySetupDialog = ({ open, onOpenChange, segmentId, segmentName }: { open: boolean; onOpenChange: (open: boolean) => void; segmentId: string; segmentName: string }) => {
  const getGuideContent = () => {
    switch (segmentId) {
      case 'cross-sell':
        return {
          icon: '🔀',
          title: 'Cross-Sell Segment Setup Guide',
          subtitle: 'Target customers who bought X but not Y for perfect upselling',
          whyTitle: 'Why Cross-Sell Segments?',
          whyText: 'Cross-sell segments can increase revenue by 10-30%. Target customers who bought complementary products to drive additional purchases!',
          steps: [
            {
              title: 'Identify Product Relationships',
              description: 'List products that pair well together (e.g., camera → lens, phone → case, skincare → moisturizer)'
            },
            {
              title: 'Create Segment in Klaviyo',
              description: 'Go to Audience → Segments → Create Segment'
            },
            {
              title: 'Add "Purchased Product" Condition',
              description: 'Select: "What someone has done → Placed Order → where Item Name contains [Product A]"'
            },
            {
              title: 'Add Exclusion Condition',
              description: 'Add AND condition: "Placed Order → where Item Name contains [Product B] → zero times"'
            }
          ],
          proTip: 'Create multiple cross-sell segments for your top product pairings and set up automated flows for each!'
        };
      case 'category-buyers':
        return {
          icon: '📦',
          title: 'Category Buyers Segment Setup Guide',
          subtitle: 'Target customers who purchased from specific product categories',
          whyTitle: 'Why Category Segments?',
          whyText: 'Category-based targeting lets you send highly relevant content. Customers who bought skincare want skincare updates, not electronics!',
          steps: [
            {
              title: 'Identify Your Categories',
              description: 'List your main product categories (e.g., Skincare, Electronics, Apparel, Home Goods)'
            },
            {
              title: 'Create Segment in Klaviyo',
              description: 'Go to Audience → Segments → Create Segment'
            },
            {
              title: 'Add Category Condition',
              description: 'Select: "What someone has done → Placed Order → where Product Category equals [Your Category]"'
            },
            {
              title: 'Set Time Frame (Optional)',
              description: 'Add "in the last X days" to target recent buyers, or leave open for all-time buyers'
            }
          ],
          proTip: 'Create a segment for each major category and personalize your campaigns accordingly!'
        };
      case 'multi-category':
        return {
          icon: '🎯',
          title: 'Multi-Category Shoppers Setup Guide',
          subtitle: 'Identify your most engaged customers who shop across categories',
          whyTitle: 'Why Multi-Category Segments?',
          whyText: 'Multi-category shoppers have 3x higher lifetime value. These are your most engaged customers - treat them like VIPs!',
          steps: [
            {
              title: 'Create First Category Condition',
              description: 'In Segment Builder: "Placed Order → where Product Category equals [Category A] → at least once"'
            },
            {
              title: 'Add Second Category Condition',
              description: 'Add AND: "Placed Order → where Product Category equals [Category B] → at least once"'
            },
            {
              title: 'Add More Categories (Optional)',
              description: 'Continue adding AND conditions for each category you want to include'
            },
            {
              title: 'Refine Time Frame',
              description: 'Optionally add "in the last 365 days" to focus on recent multi-category shoppers'
            }
          ],
          proTip: 'Segment by 2+ categories for "engaged" and 3+ categories for "highly engaged" customers!'
        };
      default:
        return null;
    }
  };

  const content = getGuideContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{content.icon}</span>
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.subtitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{content.whyTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {content.whyText}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Setup Steps in Klaviyo:</h4>
            
            {content.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>💡 Pro Tip:</strong> {content.proTip}
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  isCreatedInKlaviyo = false,
  klaviyoInfo,
}: SegmentCardProps) {
  const [showBirthdayGuide, setShowBirthdayGuide] = useState(false);
  const [showProximityGuide, setShowProximityGuide] = useState(false);
  const [showPredictiveGuide, setShowPredictiveGuide] = useState(false);
  const [showCategoryGuide, setShowCategoryGuide] = useState(false);
  const [showNegativeFeedbackGuide, setShowNegativeFeedbackGuide] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tempLocationValue, setTempLocationValue] = useState(
    customInputValue || segment.requiresInput?.defaultValue || ''
  );
  
  const isUnavailable = segment.unavailable;
  const requiresInput = segment.requiresInput && !isUnavailable;
  const isPredictiveSegment = PREDICTIVE_ANALYTICS_SEGMENTS.includes(segment.id);
  const isCategorySegment = CATEGORY_SEGMENTS.includes(segment.id);

  const handleClick = () => {
    if (segment.id === 'birthday-month') {
      setShowBirthdayGuide(true);
    } else if (segment.id === 'location-proximity') {
      setShowProximityGuide(true);
    } else if (segment.id === 'negative-feedback') {
      setShowNegativeFeedbackGuide(true);
    } else if (isPredictiveSegment) {
      setShowPredictiveGuide(true);
    } else if (isCategorySegment) {
      setShowCategoryGuide(true);
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
        className={`group relative p-5 rounded-xl border-2 transition-all duration-300 animate-fade-in ${
          isCreatedInKlaviyo
            ? "border-green-300 bg-green-50 dark:bg-green-950/20 cursor-default opacity-75"
            : isUnavailable
            ? "border-dashed border-amber-500/50 bg-amber-500/5 hover:border-amber-500/70 cursor-pointer"
            : isSelected
            ? "border-primary bg-primary/10 shadow-md cursor-pointer"
            : "border-border hover:border-primary/50 hover:shadow-sm bg-card cursor-pointer"
        }`}
        style={{ animationDelay: `${index * 30}ms` }}
        onClick={isCreatedInKlaviyo ? undefined : handleClick}
      >
        {/* Created in Klaviyo badge */}
        {isCreatedInKlaviyo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Created</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">Already in Klaviyo ✓</p>
                  {klaviyoInfo?.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(klaviyoInfo.createdAt), 'MMM d, yyyy')}
                    </p>
                  )}
                  <a 
                    href="https://www.klaviyo.com/lists-segments" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View in Klaviyo <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Manual setup badge for unavailable segments */}
        {isUnavailable && !isCreatedInKlaviyo && (
          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Info className="w-3 h-3" />
            SETUP GUIDE
          </div>
        )}

        {/* Custom input badge for segments requiring input */}
        {requiresInput && !isUnavailable && !isCreatedInKlaviyo && (
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
          segmentId={segment.id}
          segmentName={segment.name}
        />
      )}

      {isCategorySegment && (
        <CategorySetupDialog 
          open={showCategoryGuide} 
          onOpenChange={setShowCategoryGuide}
          segmentId={segment.id}
          segmentName={segment.name}
        />
      )}

      {segment.id === 'negative-feedback' && (
        <NegativeFeedbackSetupDialog open={showNegativeFeedbackGuide} onOpenChange={setShowNegativeFeedbackGuide} />
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
