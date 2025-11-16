import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription, PRODUCTS } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
} from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  amount_due: number;
  status: string;
  created: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

const PRICE_IDS = {
  MONTHLY: 'price_1SU61e0lE1soQQfxwKcXj7M5',
  ANNUAL: 'price_1SU67J0lE1soQQfxEXDs4KYi',
};

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, loading: subLoading, product_id, subscription_end, checkSubscription, isMonthly, isAnnual } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'monthly' | 'annual' | null>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/brand-login');
      return;
    }

    setLoading(false);
    loadInvoices();
  };

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('stripe-list-invoices', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      setInvoices(data?.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error Loading Invoices",
        description: "Could not load billing history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleManagePaymentMethod = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Could not open payment management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async () => {
    if (!targetPlan) return;
    
    setChangingPlan(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newPriceId = targetPlan === 'monthly' ? PRICE_IDS.MONTHLY : PRICE_IDS.ANNUAL;

      const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
        body: { newPriceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Plan Updated Successfully",
        description: `You've been switched to the ${targetPlan === 'monthly' ? 'Monthly' : 'Annual'} plan.`,
      });

      // Refresh subscription data
      await checkSubscription();
      setShowChangePlanDialog(false);
      setTargetPlan(null);
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error Changing Plan",
        description: "Could not update your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelAtPeriodEnd: true },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Subscription Canceled",
        description: "Your subscription will remain active until the end of the billing period.",
      });

      // Refresh subscription data
      await checkSubscription();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error Canceling Subscription",
        description: "Could not cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelingSubscription(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              No Active Subscription
            </CardTitle>
            <CardDescription>
              You don't have an active subscription. Subscribe to access all premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/pricing-choice')} className="w-full">
              View Pricing Plans
            </Button>
            <Button onClick={() => navigate('/brand-dashboard')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = isMonthly ? 'Monthly' : isAnnual ? 'Annual' : 'Unknown';
  const currentPrice = isMonthly ? '$49/month' : isAnnual ? '$490/year' : 'N/A';
  const nextBillingDate = subscription_end ? formatDate(new Date(subscription_end).getTime() / 1000) : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/settings')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage your plan, billing, and payment methods
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Current Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Plan Type</span>
                </div>
                <p className="text-2xl font-bold">{currentPlan}</p>
                <p className="text-sm text-muted-foreground">{currentPrice}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Next Billing Date</span>
                </div>
                <p className="text-lg font-semibold">{nextBillingDate}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Total Saved</span>
                </div>
                <p className="text-lg font-semibold">
                  {isAnnual ? '$98' : '$0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAnnual ? 'vs Monthly Plan' : 'Upgrade to save'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleManagePaymentMethod} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>

              <Button
                onClick={() => checkSubscription()}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>

              {isMonthly && (
                <Button
                  onClick={() => {
                    setTargetPlan('annual');
                    setShowChangePlanDialog(true);
                  }}
                  variant="default"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Upgrade to Annual (Save $98)
                </Button>
              )}

              {isAnnual && (
                <Button
                  onClick={() => {
                    setTargetPlan('monthly');
                    setShowChangePlanDialog(true);
                  }}
                  variant="outline"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Switch to Monthly
                </Button>
              )}

              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Billing History</CardTitle>
                <CardDescription>View and download your past invoices</CardDescription>
              </div>
              <Button onClick={loadInvoices} variant="outline" size="sm" disabled={loadingInvoices}>
                {loadingInvoices ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No billing history available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{invoice.number || invoice.id}</p>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(invoice.amount_paid)}</p>
                        {invoice.amount_due !== invoice.amount_paid && (
                          <p className="text-xs text-muted-foreground">
                            Due: {formatCurrency(invoice.amount_due)}
                          </p>
                        )}
                      </div>
                      
                      {invoice.hosted_invoice_url && (
                        <Button
                          onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          View
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      
                      {invoice.invoice_pdf && (
                        <Button
                          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Change Dialog */}
        <AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {targetPlan === 'annual' ? 'Upgrade to Annual Plan?' : 'Switch to Monthly Plan?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {targetPlan === 'annual' ? (
                  <>
                    You'll be upgraded to the Annual plan ($490/year) and save $98 compared to monthly billing.
                    You'll be charged a prorated amount for the remainder of your current billing period.
                  </>
                ) : (
                  <>
                    You'll be switched to the Monthly plan ($49/month). 
                    You'll be credited for the unused portion of your annual subscription.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={changingPlan}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleChangePlan} disabled={changingPlan}>
                {changingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Subscription Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Cancel Subscription?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your subscription will remain active until {nextBillingDate}. After that, you'll lose access to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All 70+ premium Klaviyo segments</li>
                  <li>Real-time performance tracking</li>
                  <li>AI-powered analytics</li>
                  <li>ROI tracking tools</li>
                  <li>Priority support</li>
                </ul>
                <p className="mt-3 font-semibold">You can resubscribe anytime.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelingSubscription}>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelSubscription} 
                disabled={cancelingSubscription}
                className="bg-destructive hover:bg-destructive/90"
              >
                {cancelingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
