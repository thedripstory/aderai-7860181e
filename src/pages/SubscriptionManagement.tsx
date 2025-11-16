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
  Star,
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
  STARTER_MONTHLY: 'price_1SU6QZ0lE1soQQfxlPVL4Y4o',
  STARTER_ANNUAL: 'price_1SU6Qa0lE1soQQfxmnrUkvRq',
  PROFESSIONAL_MONTHLY: 'price_1SU6Qc0lE1soQQfxhAc7VuLn',
  PROFESSIONAL_ANNUAL: 'price_1SU6Qd0lE1soQQfxReyLn2ka',
  GROWTH_MONTHLY: 'price_1SU6Qe0lE1soQQfx0v5Q3jka',
  GROWTH_ANNUAL: 'price_1SU6Qf0lE1soQQfxhhpZP4nq',
};

const PLAN_DETAILS = {
  starter: { name: 'Starter', monthlyPrice: 29, annualPrice: 290 },
  professional: { name: 'Professional', monthlyPrice: 79, annualPrice: 790 },
  growth: { name: 'Growth', monthlyPrice: 149, annualPrice: 1490 },
};

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    subscribed, 
    loading: subLoading, 
    subscription_end, 
    checkSubscription, 
    isMonthly, 
    isAnnual,
    isStarter,
    isProfessional,
    isGrowth,
  } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [targetPriceId, setTargetPriceId] = useState<string | null>(null);
  const [targetPlanName, setTargetPlanName] = useState<string>('');

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
        description: "Could not open payment management.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async () => {
    if (!targetPriceId) return;
    
    setChangingPlan(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
        body: { newPriceId: targetPriceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Plan Updated Successfully",
        description: `You've been switched to ${targetPlanName}.`,
      });

      await checkSubscription();
      setShowChangePlanDialog(false);
      setTargetPriceId(null);
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error Changing Plan",
        description: "Could not update your subscription.",
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

      await checkSubscription();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Could not cancel subscription.",
        variant: "destructive",
      });
    } finally {
      setCancelingSubscription(false);
    }
  };

  const initiatePlanChange = (priceId: string, planName: string) => {
    setTargetPriceId(priceId);
    setTargetPlanName(planName);
    setShowChangePlanDialog(true);
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
          <div className="relative w-8 h-8 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
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
              Subscribe to access all premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/pricing-choice')} className="w-full">
              View Pricing Plans
            </Button>
            <Button onClick={() => navigate('/brand-dashboard')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTier = isStarter ? 'starter' : isProfessional ? 'professional' : isGrowth ? 'growth' : 'unknown';
  const currentPlanDetails = PLAN_DETAILS[currentTier as keyof typeof PLAN_DETAILS];
  const currentPlan = currentPlanDetails ? `${currentPlanDetails.name} (${isMonthly ? 'Monthly' : 'Annual'})` : 'Unknown';
  const currentPrice = currentPlanDetails 
    ? `$${isMonthly ? currentPlanDetails.monthlyPrice : currentPlanDetails.annualPrice}/${isMonthly ? 'month' : 'year'}`
    : 'N/A';
  const nextBillingDate = subscription_end ? formatDate(new Date(subscription_end).getTime() / 1000) : 'N/A';

  const availablePlanChanges = [];

  // Billing cycle toggle
  if (isMonthly) {
    if (isStarter) availablePlanChanges.push({ priceId: PRICE_IDS.STARTER_ANNUAL, name: 'Starter Annual', type: 'billing' });
    if (isProfessional) availablePlanChanges.push({ priceId: PRICE_IDS.PROFESSIONAL_ANNUAL, name: 'Professional Annual', type: 'billing' });
    if (isGrowth) availablePlanChanges.push({ priceId: PRICE_IDS.GROWTH_ANNUAL, name: 'Growth Annual', type: 'billing' });
  } else {
    if (isStarter) availablePlanChanges.push({ priceId: PRICE_IDS.STARTER_MONTHLY, name: 'Starter Monthly', type: 'billing' });
    if (isProfessional) availablePlanChanges.push({ priceId: PRICE_IDS.PROFESSIONAL_MONTHLY, name: 'Professional Monthly', type: 'billing' });
    if (isGrowth) availablePlanChanges.push({ priceId: PRICE_IDS.GROWTH_MONTHLY, name: 'Growth Monthly', type: 'billing' });
  }

  // Tier changes
  if (isStarter) {
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.PROFESSIONAL_MONTHLY : PRICE_IDS.PROFESSIONAL_ANNUAL, name: `Professional ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'upgrade' });
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.GROWTH_MONTHLY : PRICE_IDS.GROWTH_ANNUAL, name: `Growth ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'upgrade' });
  }

  if (isProfessional) {
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.STARTER_MONTHLY : PRICE_IDS.STARTER_ANNUAL, name: `Starter ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'downgrade' });
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.GROWTH_MONTHLY : PRICE_IDS.GROWTH_ANNUAL, name: `Growth ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'upgrade' });
  }

  if (isGrowth) {
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.STARTER_MONTHLY : PRICE_IDS.STARTER_ANNUAL, name: `Starter ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'downgrade' });
    availablePlanChanges.push({ priceId: isMonthly ? PRICE_IDS.PROFESSIONAL_MONTHLY : PRICE_IDS.PROFESSIONAL_ANNUAL, name: `Professional ${isMonthly ? 'Monthly' : 'Annual'}`, type: 'downgrade' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button onClick={() => navigate('/settings')} variant="ghost" className="mb-4">
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
                <CardDescription>Your active subscription</CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2 bg-green-500 hover:bg-green-500">
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
                  <span className="text-sm">Plan</span>
                </div>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {currentPlan}
                  {isProfessional && <Star className="w-5 h-5 text-orange-500 fill-orange-500" />}
                </p>
                <p className="text-sm text-muted-foreground">{currentPrice}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Next Billing</span>
                </div>
                <p className="text-lg font-semibold">{nextBillingDate}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Annual Savings</span>
                </div>
                <p className="text-lg font-semibold">
                  {isAnnual && currentPlanDetails ? `$${(currentPlanDetails.monthlyPrice * 12) - currentPlanDetails.annualPrice}` : '$0'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleManagePaymentMethod} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>

              <Button onClick={() => checkSubscription()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <Button onClick={() => setShowCancelDialog(true)} variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan Change Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl mb-2">Change Your Plan</CardTitle>
            <CardDescription>Upgrade, downgrade, or switch billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlanChanges.map((plan) => (
                <Button
                  key={plan.priceId}
                  onClick={() => initiatePlanChange(plan.priceId, plan.name)}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary"
                >
                  {plan.type === 'upgrade' && <ArrowUpCircle className="w-5 h-5 text-green-500" />}
                  {plan.type === 'downgrade' && <ArrowDownCircle className="w-5 h-5 text-orange-500" />}
                  {plan.type === 'billing' && <RefreshCw className="w-5 h-5 text-blue-500" />}
                  <div className="text-left">
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{plan.type}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Billing History</CardTitle>
                <CardDescription>Your past invoices</CardDescription>
              </div>
              <Button onClick={loadInvoices} variant="outline" size="sm" disabled={loadingInvoices}>
                {loadingInvoices ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No billing history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{invoice.number || invoice.id}</p>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(invoice.created)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg">{formatCurrency(invoice.amount_paid)}</p>
                      {invoice.hosted_invoice_url && (
                        <Button onClick={() => window.open(invoice.hosted_invoice_url, '_blank')} variant="outline" size="sm">
                          View <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change to {targetPlanName}?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll be switched immediately. Any difference will be prorated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={changingPlan}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleChangePlan} disabled={changingPlan}>
                {changingPlan ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Cancel Subscription?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Active until {nextBillingDate}. You'll lose access to all premium features after.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelingSubscription}>Keep</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelSubscription} disabled={cancelingSubscription} className="bg-destructive hover:bg-destructive/90">
                {cancelingSubscription ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Canceling...</> : 'Cancel Subscription'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
