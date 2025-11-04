import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Lock, AlertCircle, CheckCircle, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  // Notification preferences
  const [emailOnSegmentCreation, setEmailOnSegmentCreation] = useState(true);
  const [emailOnClientAdded, setEmailOnClientAdded] = useState(true);
  const [emailOnApiKeyAdded, setEmailOnApiKeyAdded] = useState(true);
  const [emailOnSettingsUpdated, setEmailOnSettingsUpdated] = useState(false);

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
        .select("account_name, email")
        .eq("id", user.id)
        .single();

      if (userData) {
        setAccountName(userData.account_name);
        setEmail(userData.email);
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
        setEmailOnSettingsUpdated(notifPrefs.email_on_settings_updated ?? false);
      }
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
          email_on_settings_updated: emailOnSettingsUpdated,
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/app")}
              className="p-2 rounded-lg border-2 border-border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="bg-card rounded-lg border-2 border-border shadow-lg overflow-hidden">
          <div className="flex border-b-2 border-border">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "account"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab("thresholds")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "thresholds"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <SettingsIcon className="w-5 h-5 inline mr-2" />
              Thresholds
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "security"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Lock className="w-5 h-5 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <AlertCircle className="w-5 h-5 inline mr-2" />
              Notifications
            </button>
          </div>

          <div className="p-8">
            {activeTab === "account" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
                </div>

                <button
                  onClick={handleSaveAccount}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "thresholds" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Average Order Value</label>
                    <input
                      type="number"
                      value={aov}
                      onChange={(e) => setAov(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">VIP Threshold</label>
                    <input
                      type="number"
                      value={vipThreshold}
                      onChange={(e) => setVipThreshold(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">High-Value Threshold</label>
                  <input
                    type="number"
                    value={highValueThreshold}
                    onChange={(e) => setHighValueThreshold(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Customer Days</label>
                    <input
                      type="number"
                      value={newCustomerDays}
                      onChange={(e) => setNewCustomerDays(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lapsed Days</label>
                    <input
                      type="number"
                      value={lapsedDays}
                      onChange={(e) => setLapsedDays(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Churned Days</label>
                    <input
                      type="number"
                      value={churnedDays}
                      onChange={(e) => setChurnedDays(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveThresholds}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-1">Password Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• At least 8 characters</li>
                        <li>• Mix of letters and numbers recommended</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>

                <div className="pt-6 border-t-2 border-border">
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">API Key Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Your Klaviyo API keys are encrypted and stored securely. They are never exposed in the client-side code.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-2">Email Notification Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose which email notifications you'd like to receive. You can update these preferences at any time.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Segment Creation</div>
                      <div className="text-sm text-muted-foreground">Get notified when segments are successfully created in Klaviyo</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailOnSegmentCreation}
                      onChange={(e) => setEmailOnSegmentCreation(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Client Management</div>
                      <div className="text-sm text-muted-foreground">Receive notifications when new clients are added (agencies only)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailOnClientAdded}
                      onChange={(e) => setEmailOnClientAdded(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">API Key Changes</div>
                      <div className="text-sm text-muted-foreground">Get notified when Klaviyo API keys are added or updated</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailOnApiKeyAdded}
                      onChange={(e) => setEmailOnApiKeyAdded(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">Settings Updates</div>
                      <div className="text-sm text-muted-foreground">Receive confirmations when account or threshold settings are updated</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailOnSettingsUpdated}
                      onChange={(e) => setEmailOnSettingsUpdated(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </button>

                <div className="pt-6 border-t-2 border-border">
                  <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1">Email Delivery</h4>
                        <p className="text-sm text-muted-foreground">
                          All emails are sent from <strong>onboarding@resend.dev</strong>. Make sure to whitelist this sender to ensure you receive notifications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
