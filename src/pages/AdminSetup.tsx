import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2, 
  CreditCard, Mail, Database, Key, ExternalLink, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

interface SetupStatus {
  timestamp: string;
  environment: {
    configured: Record<string, boolean>;
    missing: string[];
  };
  stripe: {
    connected: boolean;
    mode?: string;
    priceValid?: boolean;
    priceAmount?: number;
    priceCurrency?: string;
    priceInterval?: string;
    webhookSecretSet?: boolean;
    error?: string;
  };
  email: {
    connected: boolean;
    error?: string;
  };
  database: {
    tables: Record<string, { exists: boolean; count?: number }>;
  };
  overall: {
    ready: boolean;
    issues: string[];
    issueCount: number;
  };
}

export default function AdminSetup() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSetup();
  }, []);

  async function checkSetup() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('check-setup-status', {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      
      if (error) {
        if (error.message.includes('403') || error.message.includes('Admin')) {
          toast.error('Admin access required');
          navigate('/admin');
          return;
        }
        throw error;
      }
      
      setStatus(data);
    } catch (error: any) {
      toast.error('Failed to check setup status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  }

  function StatusIcon({ ok }: { ok: boolean }) {
    return ok ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  }

  const webhookUrl = `https://kfsvgcijligxschxyuyb.supabase.co/functions/v1/stripe-webhook`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">System Setup Status</h1>
            <p className="text-muted-foreground">Verify all integrations are configured correctly</p>
          </div>
          <Button onClick={checkSetup} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading && !status ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : status ? (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card className={status.overall.ready ? 'border-green-500' : 'border-amber-500'}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {status.overall.ready ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  )}
                  <div>
                    <CardTitle>
                      {status.overall.ready ? 'All Systems Ready!' : `${status.overall.issueCount} Issue(s) Found`}
                    </CardTitle>
                    <CardDescription>
                      Last checked: {new Date(status.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {status.overall.issues.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {status.overall.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Stripe */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle className="text-lg">Stripe Payments</CardTitle>
                  </div>
                  <StatusIcon ok={status.stripe.connected && status.stripe.priceValid === true} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">API Connected</span>
                    <Badge variant={status.stripe.connected ? "default" : "destructive"}>
                      {status.stripe.connected ? (status.stripe.mode === 'live' ? 'Live' : 'Test') : 'Not Connected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Price Valid</span>
                    <Badge variant={status.stripe.priceValid ? "default" : "destructive"}>
                      {status.stripe.priceValid ? `$${status.stripe.priceAmount}/${status.stripe.priceInterval}` : 'Not Found'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Webhook Secret</span>
                    <Badge variant={status.stripe.webhookSecretSet ? "default" : "secondary"}>
                      {status.stripe.webhookSecretSet ? 'Configured' : 'Not Set'}
                    </Badge>
                  </div>
                </div>

                {/* Setup Instructions */}
                {(!status.stripe.connected || !status.stripe.priceValid) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Setup Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>
                        Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → API Keys</a>
                      </li>
                      <li>Copy your <strong>Secret key</strong> (starts with sk_)</li>
                      <li>Add it as <code className="bg-blue-100 px-1 rounded">STRIPE_SECRET_KEY</code> in Supabase Edge Function Secrets</li>
                      <li>
                        Go to <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Products</a>
                      </li>
                      <li>Create a product with a <strong>$9/month recurring price</strong></li>
                      <li>Copy the Price ID (starts with price_)</li>
                      <li>Add it as <code className="bg-blue-100 px-1 rounded">STRIPE_PRICE_ID</code> in Supabase</li>
                    </ol>
                  </div>
                )}

                {/* Webhook Setup */}
                {status.stripe.connected && !status.stripe.webhookSecretSet && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-3">Webhook Setup Required:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                      <li>
                        Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Webhooks</a>
                      </li>
                      <li>Click "Add endpoint"</li>
                      <li>
                        <div className="flex items-center gap-2 mt-1">
                          <span>Endpoint URL:</span>
                          <code className="bg-amber-100 px-2 py-1 rounded text-xs flex-1 truncate">{webhookUrl}</code>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                          >
                            {copied === 'webhook' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </li>
                      <li>Select events: <code className="bg-amber-100 px-1 rounded">checkout.session.completed</code>, <code className="bg-amber-100 px-1 rounded">customer.subscription.updated</code>, <code className="bg-amber-100 px-1 rounded">customer.subscription.deleted</code>, <code className="bg-amber-100 px-1 rounded">invoice.payment_failed</code></li>
                      <li>Copy the Signing secret (starts with whsec_)</li>
                      <li>Add it as <code className="bg-amber-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> in Supabase</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <CardTitle className="text-lg">Email (Resend)</CardTitle>
                  </div>
                  <StatusIcon ok={status.email.connected} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">API Connected</span>
                  <Badge variant={status.email.connected ? "default" : "destructive"}>
                    {status.email.connected ? 'Connected' : status.email.error || 'Not Connected'}
                  </Badge>
                </div>

                {!status.email.connected && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Setup Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">Resend Dashboard → API Keys</a></li>
                      <li>Create a new API key</li>
                      <li>Add it as <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> in Supabase</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5" />
                    <CardTitle className="text-lg">Database Tables</CardTitle>
                  </div>
                  <StatusIcon ok={Object.values(status.database.tables).every(t => t.exists)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(status.database.tables).map(([table, info]) => (
                    <div key={table} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-mono">{table}</span>
                      <Badge variant={info.exists ? "default" : "destructive"}>
                        {info.exists ? `${info.count || 0} rows` : 'Missing'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5" />
                    <CardTitle className="text-lg">Environment Variables</CardTitle>
                  </div>
                  <StatusIcon ok={status.environment.missing.length === 0} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(status.environment.configured).map(([key, configured]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-xs font-mono">{key}</span>
                      {configured ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                {status.environment.missing.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">Missing Variables:</h4>
                    <p className="text-sm text-red-800">
                      Add these in <strong>Supabase Dashboard → Edge Functions → Secrets</strong>:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {status.environment.missing.map(v => (
                        <li key={v} className="text-sm font-mono text-red-700">• {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild>
                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Stripe Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Resend Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      OpenAI Dashboard
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Failed to load setup status. Please try again.</p>
              <Button onClick={checkSetup} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
