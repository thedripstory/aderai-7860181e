import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Lock, AlertCircle, Bell, CreditCard, ExternalLink, Calendar, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { sanitizeString, sanitizeEmail, sanitizeNumber, validatePassword } from "@/lib/inputSanitization";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent } from '@/lib/analytics';

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export default function Settings() {
  useInactivityLogout();
  const [activeTab, setActiveTab] = useState<"account" | "thresholds" | "security" | "notifications" | "billing">("account");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeKey, setActiveKey] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Notification preferences
  const [emailOnSegmentCreation, setEmailOnSegmentCreation] = useState(true);
  const [emailOnClientAdded, setEmailOnClientAdded] = useState(true);
  const [emailOnApiKeyAdded, setEmailOnApiKeyAdded] = useState(true);
  const [emailOnApiKeyChanges, setEmailOnApiKeyChanges] = useState(true);
  const [emailOnSettingsUpdated, setEmailOnSettingsUpdated] = useState(false);
  const [emailOnPasswordReset, setEmailOnPasswordReset] = useState(true);
  const [emailOnClientInvitation, setEmailOnClientInvitation] = useState(true);
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);

  // Account settings
  const [accountName, setAccountName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  // Threshold settings
  const [currency, setCurrency] = useState("USD");
  const [aov, setAov] = useState("100");
  const [vipThreshold, setVipThreshold] = useState("500");
  const [highValueThreshold, setHighValueThreshold] = useState("300");
  const [newCustomerDays, setNewCustomerDays] = useState("30");
  const [lapsedDays, setLapsedDays] = useState("60");
  const [churnedDays, setChurnedDays] = useState("180");

  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Subscription/Billing state
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      const { data: userData } = await supabase
        .from("users")
        .select("account_name, first_name, email, email_verified")
        .eq("id", user.id)
        .single();

      if (userData) {
        setAccountName(userData.account_name);
        setFirstName(userData.first_name || "");
        setEmail(userData.email);
        setEmailVerified(userData.email_verified || false);
      }

      const { data: keyData } = await supabase
        .from("klaviyo_keys")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (keyData) {
        setActiveKey(keyData);
        setCurrency(keyData.currency);
        setAov(keyData.aov.toString());
        setVipThreshold(keyData.vip_threshold.toString());
        setHighValueThreshold(keyData.high_value_threshold.toString());
        setNewCustomerDays(keyData.new_customer_days.toString());
        setLapsedDays(keyData.lapsed_days.toString());
        setChurnedDays(keyData.churned_days.toString());
      }

      // Load notification preferences
      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (notifPrefs) {
        setEmailOnSegmentCreation(notifPrefs.email_on_segment_creation ?? true);
        setEmailOnClientAdded(notifPrefs.email_on_client_added ?? true);
        setEmailOnApiKeyAdded(notifPrefs.email_on_api_key_added ?? true);
        setEmailOnApiKeyChanges(notifPrefs.email_on_api_key_changes ?? true);
        setEmailOnSettingsUpdated(notifPrefs.email_on_settings_updated ?? false);
        setEmailOnPasswordReset(notifPrefs.email_on_password_reset ?? true);
        setEmailOnClientInvitation(notifPrefs.email_on_client_invitation ?? true);
        setEmailWeeklySummary(notifPrefs.email_weekly_summary ?? true);
        setEmailMarketing(notifPrefs.email_marketing ?? false);
      }

    };

    loadSettings();
  }, [navigate]);

  // Load subscription when billing tab is selected
  useEffect(() => {
    if (activeTab === 'billing' && currentUser) {
      loadSubscriptionDetails();
    }
  }, [activeTab, currentUser]);

  // Check URL params for tab on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'billing') {
      setActiveTab('billing');
    }
  }, []);

  const loadSubscriptionDetails = async () => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-get-subscription-details');
      
      if (error) throw error;
      
      setSubscriptionDetails(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Error loading subscription",
        description: "Could not load your subscription details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!accountName.trim()) {
      toast({
        title: "Account name required",
        description: "Please enter your account name.",
        variant: "destructive",
      });
      return;
    }

    if (!firstName.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Sanitize inputs before saving
      const sanitizedAccountName = sanitizeString(accountName);
      const sanitizedFirstName = sanitizeString(firstName);
      
      const { error } = await supabase
        .from("users")
        .update({ 
          account_name: sanitizedAccountName,
          first_name: sanitizedFirstName
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Your account settings have been saved.",
      });

      // Track with PostHog
      trackEvent('Settings Updated', { section: 'account' });

      // Track settings updated event in Supabase
      try {
        await supabase.from('analytics_events').insert({
          user_id: currentUser.id,
          event_name: 'settings_updated',
          event_metadata: { section: 'account' },
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (trackError) {
        console.error('Failed to track settings update:', trackError);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThresholds = async () => {
    // Sanitize numeric inputs
    const sanitizedAov = sanitizeNumber(aov, '100');
    const sanitizedVipThreshold = sanitizeNumber(vipThreshold, '500');
    const sanitizedHighValueThreshold = sanitizeNumber(highValueThreshold, '300');
    const sanitizedNewCustomerDays = sanitizeNumber(newCustomerDays, '30');
    const sanitizedLapsedDays = sanitizeNumber(lapsedDays, '60');
    const sanitizedChurnedDays = sanitizeNumber(churnedDays, '180');
    
    const numericValidation = {
      aov: parseFloat(sanitizedAov),
      vipThreshold: parseFloat(sanitizedVipThreshold),
      highValueThreshold: parseFloat(sanitizedHighValueThreshold),
      newCustomerDays: parseInt(sanitizedNewCustomerDays),
      lapsedDays: parseInt(sanitizedLapsedDays),
      churnedDays: parseInt(sanitizedChurnedDays),
    };

    if (Object.values(numericValidation).some((v) => isNaN(v) || v <= 0)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid positive numbers for all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!activeKey) {
      toast({
        title: "No active client",
        description: "Please set up a Klaviyo client first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("klaviyo_keys")
        .update({
          currency,
          currency_symbol: CURRENCIES.find((c) => c.code === currency)?.symbol || "$",
          aov: numericValidation.aov,
          vip_threshold: numericValidation.vipThreshold,
          high_value_threshold: numericValidation.highValueThreshold,
          new_customer_days: numericValidation.newCustomerDays,
          lapsed_days: numericValidation.lapsedDays,
          churned_days: numericValidation.churnedDays,
        })
        .eq("id", activeKey.id);

      if (error) throw error;

      toast({
        title: "Thresholds updated",
        description: "Your segmentation settings have been saved.",
      });

      // Track with PostHog
      trackEvent('Settings Updated', { section: 'thresholds', currency });

      // Track settings updated event in Supabase
      try {
        await supabase.from('analytics_events').insert({
          user_id: currentUser.id,
          event_name: 'settings_updated',
          event_metadata: { section: 'thresholds' },
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (trackError) {
        console.error('Failed to track settings update:', trackError);
      }
    } catch (error) {
      console.error("Error updating thresholds:", error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid password",
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      // Track with PostHog
      trackEvent('Password Changed');

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Password change failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update({
          email_on_segment_creation: emailOnSegmentCreation,
          email_on_client_added: emailOnClientAdded,
          email_on_api_key_added: emailOnApiKeyAdded,
          email_on_api_key_changes: emailOnApiKeyChanges,
          email_on_settings_updated: emailOnSettingsUpdated,
          email_on_password_reset: emailOnPasswordReset,
          email_on_client_invitation: emailOnClientInvitation,
          email_weekly_summary: emailWeeklySummary,
          email_marketing: emailMarketing,
        })
        .eq("user_id", currentUser.id);

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: "Your notification settings have been saved.",
      });

      // Track with PostHog
      trackEvent('Settings Updated', { section: 'notifications' });

      // Track settings updated event in Supabase
      try {
        await supabase.from('analytics_events').insert({
          user_id: currentUser.id,
          event_name: 'settings_updated',
          event_metadata: { section: 'notifications' },
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (trackError) {
        console.error('Failed to track settings update:', trackError);
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-portal-session', {
        body: { origin: window.location.origin },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        trackEvent('Billing Portal Opened');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast({
        title: "Error",
        description: "Could not open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-cancel-subscription', {
        body: { cancelImmediately: false }, // Cancel at end of period
      });
      
      if (error) throw error;
      
      toast({
        title: "Subscription canceled",
        description: `Your subscription will remain active until ${new Date(data.currentPeriodEnd).toLocaleDateString()}.`,
      });
      
      setShowCancelConfirm(false);
      loadSubscriptionDetails();
      
      // Track with PostHog
      trackEvent('Subscription Canceled', { cancelAt: 'period_end' });
      
      // Track cancellation in Supabase
      await supabase.from('analytics_events').insert({
        user_id: currentUser.id,
        event_name: 'subscription_canceled',
        event_metadata: { cancel_at_period_end: true },
        page_url: window.location.href,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Could not cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-resume-subscription');
      
      if (error) throw error;
      
      toast({
        title: "Subscription resumed!",
        description: "Your subscription is now active again.",
      });
      
      loadSubscriptionDetails();
      
      // Track with PostHog
      trackEvent('Subscription Resumed');
      
      // Track resumption in Supabase
      await supabase.from('analytics_events').insert({
        user_id: currentUser.id,
        event_name: 'subscription_resumed',
        page_url: window.location.href,
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: "Could not resume subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { origin: window.location.origin },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Track resubscribe attempt
        await supabase.from('analytics_events').insert({
          user_id: currentUser.id,
          event_name: 'resubscribe_initiated',
          page_url: window.location.href,
        });
        
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error initiating resubscription:', error);
      toast({
        title: "Error",
        description: "Could not start resubscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageErrorBoundary pageName="Settings">
    <div className="min-h-screen bg-background">
      <DashboardHeader showSettings={false} showBackButton={true} />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid grid-cols-5 bg-card border border-border">
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="thresholds" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Thresholds</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">This is how we'll greet you in the dashboard</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name / Brand Name</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                    {!emailVerified && (
                      <span className="ml-2 text-xs text-muted-foreground">(Unverified)</span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="max-w-md bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                </div>

                <Button onClick={handleSaveAccount} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thresholds Tab */}
          <TabsContent value="thresholds">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Segmentation Thresholds</CardTitle>
                <CardDescription>Configure your customer value and lifecycle parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aov">Average Order Value</Label>
                    <Input
                      id="aov"
                      type="number"
                      value={aov}
                      onChange={(e) => setAov(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vipThreshold">VIP Threshold</Label>
                    <Input
                      id="vipThreshold"
                      type="number"
                      value={vipThreshold}
                      onChange={(e) => setVipThreshold(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highValueThreshold">High-Value Threshold</Label>
                    <Input
                      id="highValueThreshold"
                      type="number"
                      value={highValueThreshold}
                      onChange={(e) => setHighValueThreshold(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-4">Customer Lifecycle (Days)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCustomerDays">New Customer</Label>
                      <Input
                        id="newCustomerDays"
                        type="number"
                        value={newCustomerDays}
                        onChange={(e) => setNewCustomerDays(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lapsedDays">Lapsed</Label>
                      <Input
                        id="lapsedDays"
                        type="number"
                        value={lapsedDays}
                        onChange={(e) => setLapsedDays(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="churnedDays">Churned</Label>
                      <Input
                        id="churnedDays"
                        type="number"
                        value={churnedDays}
                        onChange={(e) => setChurnedDays(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveThresholds} disabled={loading}>
                  {loading ? "Saving..." : "Save Thresholds"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="max-w-md"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="max-w-md"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button onClick={handleChangePassword} disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Segment creation</p>
                      <p className="text-sm text-muted-foreground">Get notified when segments are created</p>
                    </div>
                    <Switch checked={emailOnSegmentCreation} onCheckedChange={setEmailOnSegmentCreation} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API key changes</p>
                      <p className="text-sm text-muted-foreground">Get notified when API keys are added or changed</p>
                    </div>
                    <Switch checked={emailOnApiKeyChanges} onCheckedChange={setEmailOnApiKeyChanges} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly summary</p>
                      <p className="text-sm text-muted-foreground">Receive a weekly digest of your activity</p>
                    </div>
                    <Switch checked={emailWeeklySummary} onCheckedChange={setEmailWeeklySummary} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password reset</p>
                      <p className="text-sm text-muted-foreground">Get notified when password is reset</p>
                    </div>
                    <Switch checked={emailOnPasswordReset} onCheckedChange={setEmailOnPasswordReset} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing emails</p>
                      <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                    </div>
                    <Switch checked={emailMarketing} onCheckedChange={setEmailMarketing} />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Subscription Status Card */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </CardTitle>
                  <CardDescription>Manage your Aderai subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : subscriptionDetails ? (
                    <div className="space-y-6">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2">
                          {subscriptionDetails.status === 'active' && !subscriptionDetails.cancelAtPeriodEnd && (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                            </>
                          )}
                          {subscriptionDetails.status === 'active' && subscriptionDetails.cancelAtPeriodEnd && (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-amber-600 dark:text-amber-400">Canceling</span>
                            </>
                          )}
                          {subscriptionDetails.status === 'past_due' && (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-red-600 dark:text-red-400">Past Due</span>
                            </>
                          )}
                          {subscriptionDetails.status === 'canceled' && (
                            <>
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">Canceled</span>
                            </>
                          )}
                          {!subscriptionDetails.hasSubscription && (
                            <>
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">No Subscription</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Plan Details */}
                      {subscriptionDetails.hasSubscription && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Plan</span>
                            <span className="font-medium">
                              Aderai Monthly - ${subscriptionDetails.amount || 9}/{subscriptionDetails.interval || 'month'}
                            </span>
                          </div>

                          {/* Next Billing Date */}
                          {subscriptionDetails.status === 'active' && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {subscriptionDetails.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
                              </span>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Payment Method */}
                          {subscriptionDetails.paymentMethod && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Payment Method</span>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium capitalize">
                                  {subscriptionDetails.paymentMethod.brand} •••• {subscriptionDetails.paymentMethod.last4}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Cancellation Notice */}
                      {subscriptionDetails.cancelAtPeriodEnd && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-200">
                                Your subscription is set to cancel
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                You'll have access until {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString()}. 
                                After that, you won't be able to access Aderai features.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                onClick={handleResumeSubscription}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Resuming...
                                  </>
                                ) : (
                                  'Resume Subscription'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Past Due Notice */}
                      {subscriptionDetails.status === 'past_due' && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-200">
                                Payment failed
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                Please update your payment method to continue using Aderai.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Canceled Subscription Notice */}
                      {(subscriptionDetails.status === 'canceled' || !subscriptionDetails.hasSubscription) && (
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                {subscriptionDetails.status === 'canceled' ? 'Your subscription has been canceled' : 'No active subscription'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Resubscribe to regain access to all Aderai features including 70+ expert segments and AI-powered suggestions.
                              </p>
                              <Button
                                size="sm"
                                className="mt-3"
                                onClick={handleResubscribe}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Resubscribe - $9/month
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                        {subscriptionDetails.hasSubscription && subscriptionDetails.status !== 'canceled' ? (
                          <>
                            <Button
                              onClick={handleOpenPortal}
                              disabled={portalLoading}
                              className="flex-1"
                            >
                              {portalLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Opening...
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Manage in Stripe
                                </>
                              )}
                            </Button>

                            {subscriptionDetails.status === 'active' && 
                             !subscriptionDetails.cancelAtPeriodEnd && (
                              <Button
                                variant="outline"
                                onClick={() => setShowCancelConfirm(true)}
                                className="text-muted-foreground hover:text-destructive hover:border-destructive"
                              >
                                Cancel Subscription
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            onClick={handleResubscribe}
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Subscribe Now - $9/month
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No subscription information available</p>
                      <Button onClick={loadSubscriptionDetails}>
                        Retry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing History Card */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Billing History & Invoices</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access your complete billing history, download invoices, and manage your payment methods through the Stripe portal.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleOpenPortal}
                    disabled={portalLoading || !subscriptionDetails?.hasSubscription}
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Billing History
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                  <CardDescription>Contact us for billing support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    For billing questions or issues, please contact us at{' '}
                    <a href="mailto:akshat@aderai.io" className="text-primary hover:underline font-medium">
                      akshat@aderai.io
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
                  onClick={() => setShowCancelConfirm(false)} 
                />
                <div className="relative bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-2xl">
                  <h3 className="text-xl font-bold mb-2">Cancel Subscription?</h3>
                  <p className="text-muted-foreground mb-6">
                    Your subscription will remain active until the end of your current billing period. 
                    After that, you'll lose access to Aderai features.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        'Yes, Cancel'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </PageErrorBoundary>
  );
}
