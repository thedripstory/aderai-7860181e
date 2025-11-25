import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Lock, AlertCircle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TwoFactorSetup, TwoFactorDisable } from "@/components/TwoFactorSetup";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<"account" | "thresholds" | "security" | "notifications">("account");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeKey, setActiveKey] = useState<any>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
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
        .select("account_name, email, email_verified")
        .eq("id", user.id)
        .single();

      if (userData) {
        setAccountName(userData.account_name);
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

      // Load 2FA status
      const { data: twoFactorData } = await supabase
        .from("two_factor_auth")
        .select("enabled")
        .eq("user_id", user.id)
        .single();

      setTwoFactorEnabled(twoFactorData?.enabled ?? false);
    };

    loadSettings();
  }, [navigate]);

  const handleSaveAccount = async () => {
    if (!accountName.trim()) {
      toast({
        title: "Account name required",
        description: "Please enter your account name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ account_name: accountName })
        .eq("id", currentUser.id);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Your account settings have been saved.",
      });
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
    const numericValidation = {
      aov: parseFloat(aov),
      vipThreshold: parseFloat(vipThreshold),
      highValueThreshold: parseFloat(highValueThreshold),
      newCustomerDays: parseInt(newCustomerDays),
      lapsedDays: parseInt(lapsedDays),
      churnedDays: parseInt(churnedDays),
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
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader showSettings={false} />
      
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
          <TabsList className="grid grid-cols-4 bg-card border border-border">
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
                  <Label htmlFor="accountName">Account Name</Label>
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

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled
                          ? "Your account is protected with two-factor authentication"
                          : "Enable 2FA for enhanced security"}
                      </p>
                    </div>
                    <Button
                      variant={twoFactorEnabled ? "destructive" : "default"}
                      onClick={() => twoFactorEnabled ? setShowTwoFactorDisable(true) : setShowTwoFactorSetup(true)}
                    >
                      {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
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
        </Tabs>
      </main>

      {/* 2FA Modals */}
      {showTwoFactorSetup && currentUser && (
        <TwoFactorSetup
          userId={currentUser.id}
          userEmail={email}
          onSetupComplete={() => {
            setShowTwoFactorSetup(false);
            setTwoFactorEnabled(true);
            toast({
              title: "2FA enabled",
              description: "Two-factor authentication is now active",
            });
          }}
        />
      )}

      {showTwoFactorDisable && currentUser && (
        <TwoFactorDisable
          userId={currentUser.id}
          onDisabled={() => {
            setShowTwoFactorDisable(false);
            setTwoFactorEnabled(false);
            toast({
              title: "2FA disabled",
              description: "Two-factor authentication has been disabled",
            });
          }}
        />
      )}
    </div>
  );
}
