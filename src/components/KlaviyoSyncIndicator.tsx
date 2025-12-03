import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface KlaviyoSyncIndicatorProps {
  klaviyoKeyId: string;
  apiKey: string;
}

export const KlaviyoSyncIndicator: React.FC<KlaviyoSyncIndicatorProps> = ({
  klaviyoKeyId,
  apiKey,
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkKlaviyoHealth = useCallback(async () => {
    if (!klaviyoKeyId || !apiKey) {
      setStatus('error');
      return;
    }

    setStatus('checking');
    
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          keyId: klaviyoKeyId,
          endpoint: 'https://a.klaviyo.com/api/accounts/',
          method: 'GET',
        },
      });

      // Check if we got actual error data or rate limiting
      if (error) {
        // Network or function error
        setStatus('error');
      } else if (data?.errors) {
        // Klaviyo returned errors - check if it's just rate limiting
        const isRateLimited = data.errors.some((e: any) => e.status === 429 || e.code === 'throttled');
        if (isRateLimited) {
          // Rate limited means we're connected, just throttled temporarily
          setStatus('connected');
        } else {
          // Actual API error (auth, etc)
          setStatus('error');
        }
      } else if (data?.data || data) {
        // Successful response
        setStatus('connected');
      } else {
        setStatus('error');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Klaviyo health check failed:', error);
      setStatus('error');
      setLastChecked(new Date());
    }
  }, [klaviyoKeyId, apiKey]);

  useEffect(() => {
    // Initial check
    checkKlaviyoHealth();

    // Check every 5 minutes
    const interval = setInterval(checkKlaviyoHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkKlaviyoHealth]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Loader className="w-4 h-4 animate-spin text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
      <div className="flex items-center gap-1 text-sm">
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      {lastChecked && (
        <span className="text-xs text-muted-foreground">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-1"
        onClick={checkKlaviyoHealth}
        disabled={status === 'checking'}
      >
        <RefreshCw className={`h-3 w-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
