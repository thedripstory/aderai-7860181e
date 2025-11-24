import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';

const DISMISS_KEY = 'klaviyo_banner_dismissed_at';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface KlaviyoSetupBannerProps {
  hasKlaviyoKeys: boolean;
}

export const KlaviyoSetupBanner: React.FC<KlaviyoSetupBannerProps> = ({ hasKlaviyoKeys }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { trackAction } = useFeatureTracking('klaviyo_setup_banner');

  useEffect(() => {
    // Don't show if user already has Klaviyo keys
    if (hasKlaviyoKeys) {
      setIsVisible(false);
      return;
    }

    // Check if banner was dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      
      if (now - dismissedTime < DISMISS_DURATION) {
        // Still within 24 hour dismissal period
        setIsVisible(false);
        return;
      } else {
        // Dismissal expired, clear it
        localStorage.removeItem(DISMISS_KEY);
      }
    }

    // Show banner and track analytics
    setIsVisible(true);
    trackAction('banner_shown');
  }, [hasKlaviyoKeys, trackAction]);

  const handleConnectNow = () => {
    trackAction('banner_clicked', { action: 'connect_now' });
    navigate('/klaviyo-setup');
  };

  const handleDismiss = () => {
    trackAction('banner_dismissed');
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-warning/10 border-b border-warning/20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Connect your Klaviyo account to start creating segments
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set up your API key and preferences to unlock all features
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleConnectNow}
              size="sm"
              className="bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              Connect Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Remind me later
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
