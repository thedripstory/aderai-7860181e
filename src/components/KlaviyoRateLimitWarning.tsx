import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'klaviyo-rate-limit-warning-seen';

interface KlaviyoRateLimitWarningProps {
  onClose?: () => void;
}

export const KlaviyoRateLimitWarning: React.FC<KlaviyoRateLimitWarningProps> = ({ onClose }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenWarning) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Important: Klaviyo Rate Limits
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Please read before creating segments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Create 15-20 segments at a time</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klaviyo has API rate limits. To avoid hitting them, we recommend creating segments in smaller batches.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Wait 2-3 hours between batches</p>
              <p className="text-sm text-muted-foreground mt-1">
                After creating a batch of segments, wait a few hours before creating more to let the rate limit reset.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm text-destructive">If limits are hit</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klaviyo will <span className="font-semibold text-foreground">block automatic segment creation for 24 hours</span>. You'll need to wait before creating any new segments.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleClose} className="w-full" size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            I understand, let's go
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This message won't be shown again
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
