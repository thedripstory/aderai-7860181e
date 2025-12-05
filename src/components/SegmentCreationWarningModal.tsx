import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Info, Mail, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SegmentCreationWarningModalProps {
  isOpen: boolean;
  segmentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function calculateEstimatedTime(count: number): string {
  if (count <= 10) return "About 1-2 minutes";
  if (count <= 15) return "About 2-3 minutes";
  if (count <= 30) return "About 10-15 minutes";
  if (count <= 60) return "About 20-30 minutes";
  if (count <= 100) return "About 45-60 minutes";
  return `About ${Math.ceil(count / 100)} day(s) (Klaviyo's daily limit is 100 segments)`;
}

function getTimeEstimateColor(count: number): string {
  if (count <= 15) return "text-green-600";
  if (count <= 30) return "text-amber-600";
  return "text-orange-600";
}

export const SegmentCreationWarningModal: React.FC<SegmentCreationWarningModalProps> = ({
  isOpen,
  segmentCount,
  onConfirm,
  onCancel,
}) => {
  const estimatedTime = calculateEstimatedTime(segmentCount);
  const timeColor = getTimeEstimateColor(segmentCount);
  const needsQueueing = segmentCount > 15;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Quick heads up about Klaviyo's limits
          </DialogTitle>
          <DialogDescription>
            Please read before proceeding with segment creation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Klaviyo Limit Explanation Card */}
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Why does this take time?
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Klaviyo limits how quickly segments can be created via their API 
                    (15 per minute, 100 per day). This is a <strong>Klaviyo platform restriction</strong> that 
                    applies to all integrations, not just Aderai.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Estimate */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Creating {segmentCount} segment{segmentCount > 1 ? 's' : ''}
                </p>
                <p className={`text-sm ${timeColor} font-medium mt-1`}>
                  Estimated time: {estimatedTime}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">About creation speed</p>
                    <p className="text-sm mt-1">
                      Klaviyo's API allows 15 segments/minute and 100/day. 
                      We automatically pace creation to stay within these limits.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Automation Promise */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                We'll handle everything automatically
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {needsQueueing 
                  ? "You can close this page. We'll email you progress updates and notify you when all segments are ready."
                  : "Sit back and relax! We'll show you the progress and notify you when complete."}
              </p>
            </div>
          </div>

          {/* Large batch warning */}
          {segmentCount > 100 && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Multi-day creation
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Due to Klaviyo's daily limit of 100 segments, this will take multiple days. 
                  We'll automatically continue each day and email you progress updates.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Mail className="h-4 w-4" />
            Start & Notify Me
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Export the info tooltip component for use near buttons
export const KlaviyoLimitsTooltip: React.FC = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium">About creation speed</p>
        <p className="text-sm mt-1">
          Klaviyo's API allows 15 segments/minute and 100/day. 
          We automatically pace creation to stay within these limits.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);