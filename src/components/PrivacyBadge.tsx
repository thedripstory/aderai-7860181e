import { Shield, Lock, Eye, Server } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  variant?: 'full' | 'compact';
}

export function PrivacyBadge({ variant = 'full' }: PrivacyBadgeProps) {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 cursor-help">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Privacy Protected</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">Your Data is Secure</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" /> API keys are encrypted
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="h-3 w-3" /> We never read your customer data
                </li>
                <li className="flex items-center gap-2">
                  <Server className="h-3 w-3" /> No customer data is stored
                </li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant for footer - Aderai branded
  return (
    <div className="bg-gradient-to-br from-foreground to-foreground/95 rounded-xl p-6 text-background">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Your Data Privacy, Guaranteed</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background/10 flex-shrink-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">No Customer Data Stored</p>
            <p className="text-xs text-background/60 mt-0.5">
              Your customer information never touches our servers
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background/10 flex-shrink-0">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">No Data Reading</p>
            <p className="text-xs text-background/60 mt-0.5">
              We only create segments, never read your profiles
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background/10 flex-shrink-0">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Encrypted API Keys</p>
            <p className="text-xs text-background/60 mt-0.5">
              Your Klaviyo credentials are encrypted at rest
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-background/50 text-center border-t border-background/10 pt-4">
        Aderai only communicates with Klaviyo to create segment definitions. We never access, store, or process your customer data.
      </p>
    </div>
  );
}
