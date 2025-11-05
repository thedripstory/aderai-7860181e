import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  const checkKlaviyoHealth = async () => {
    setStatus('checking');
    
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          keyId: klaviyoKeyId,
          endpoint: 'https://a.klaviyo.com/api/accounts/',
          method: 'GET',
        },
      });

      if (error || !data) {
        setStatus('error');
      } else {
        setStatus('connected');
      }
      setLastChecked(new Date());
    } catch (error) {
      console.error('Klaviyo health check failed:', error);
      setStatus('error');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkKlaviyoHealth();

    // Check every 5 minutes
    const interval = setInterval(checkKlaviyoHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [klaviyoKeyId]);

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
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'checking':
        return <Loader className="w-4 h-4 animate-spin" />;
      default:
        return <Activity className="w-4 h-4" />;
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
    </div>
  );
};
