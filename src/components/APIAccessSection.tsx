import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Key, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const APIAccessSection = () => {
  const { isGrowth } = useSubscription();
  const [copied, setCopied] = useState(false);
  
  // Mock API key - in production this would be generated and stored
  const apiKey = isGrowth ? 'ak_live_example_growth_tier_key_12345' : '';

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isGrowth) {
    return (
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <CardTitle>API Access</CardTitle>
            <Badge variant="secondary">Growth Tier Only</Badge>
          </div>
          <CardDescription>
            Unlock programmatic access to create and manage segments via REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Key className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="font-semibold mb-2">Upgrade to Growth for API Access</p>
              <p className="text-sm text-muted-foreground">
                Growth tier includes full REST API access for automating segment creation, 
                management, and analytics retrieval.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/subscription'} variant="default">
              Upgrade to Growth
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <CardTitle>API Access</CardTitle>
          <Badge variant="default">Active</Badge>
        </div>
        <CardDescription>
          Your API credentials for programmatic access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Section */}
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              value={apiKey}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep your API key secure. Never share it publicly.
          </p>
        </div>

        {/* API Documentation */}
        <div className="rounded-lg bg-muted p-4 space-y-3">
          <h4 className="font-semibold text-sm">Quick Start</h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium mb-1">Endpoint:</p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                https://api.aderai.com/v1/segments
              </code>
            </div>
            <div>
              <p className="font-medium mb-1">Authentication:</p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                Authorization: Bearer {'{'}your-api-key{'}'}
              </code>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="rounded-lg border border-border p-4">
          <h4 className="font-semibold text-sm mb-2">Rate Limits</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• 1,000 requests per hour</p>
            <p>• 100 segment creations per day</p>
            <p>• Burst: 50 requests per minute</p>
          </div>
        </div>

        {/* Documentation Link */}
        <Button variant="outline" className="w-full" asChild>
          <a href="https://docs.aderai.com/api" target="_blank" rel="noopener noreferrer">
            View Full API Documentation
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
