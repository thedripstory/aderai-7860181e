import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Key, DollarSign, Users, TrendingUp, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { cn } from "@/lib/utils";
import { AderaiLogo } from "@/components/AderaiLogo";

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

const KlaviyoSetup = () => {
  useInactivityLogout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form fields
  const [apiKey, setApiKey] = useState("");
  const [clientName, setClientName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [aov, setAov] = useState("100");
  const [vipThreshold, setVipThreshold] = useState("1000");
  const [highValueThreshold, setHighValueThreshold] = useState("500");
  const [newCustomerDays, setNewCustomerDays] = useState("60");
  const [lapsedDays, setLapsedDays] = useState("90");
  const [churnedDays, setChurnedDays] = useState("180");
  
  // Validation state
  const [validationState, setValidationState] = useState<{
    apiKey: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
  }>({ apiKey: 'idle' });

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/signup");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/signup");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
      JPY: "¥",
      INR: "₹",
    };
    setCurrencySymbol(symbols[value] || "$");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Klaviyo API key",
        variant: "destructive",
      });
      return;
    }

    // Validate API key format (Klaviyo private keys start with "pk_")
    if (!apiKey.startsWith("pk_")) {
      toast({
        title: "Invalid API Key Format",
        description: "Klaviyo Private API keys should start with 'pk_'. Please check your key.",
        variant: "destructive",
      });
      return;
    }

    if (apiKey.length < 20) {
      toast({
        title: "Invalid API Key",
        description: "The API key appears to be too short. Please verify you copied the complete key.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (!user) {
        navigate("/signup");
        return;
      }

      // Validate the Klaviyo API key first
      toast({
        title: "Validating API key...",
        description: "Please wait while we verify your Klaviyo credentials.",
      });

      const { data: validationData, error: validationError } = await supabase.functions.invoke(
        "klaviyo-validate-key",
        {
          body: { apiKey },
        }
      );

      if (validationError) {
        console.error("Validation error:", validationError);
        toast({
          title: "Validation Failed",
          description: "Unable to validate API key. Please check your internet connection and try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      if (!validationData?.valid) {
        toast({
          title: "Invalid API Key",
          description: validationData?.error || "The API key you entered is not valid. Please check and try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Use the encrypted key returned from validation
      const encryptedKey = validationData.encryptedKey || apiKey;

      // Deactivate any existing keys for this user first
      await supabase
        .from("klaviyo_keys")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Save Klaviyo configuration
      const { error: klaviyoError } = await supabase
        .from("klaviyo_keys")
        .insert({
          user_id: user.id,
          klaviyo_api_key_hash: encryptedKey,
          client_name: clientName || "My Business",
          currency,
          currency_symbol: currencySymbol,
          aov: parseFloat(aov),
          vip_threshold: parseFloat(vipThreshold),
          high_value_threshold: parseFloat(highValueThreshold),
          new_customer_days: parseInt(newCustomerDays),
          lapsed_days: parseInt(lapsedDays),
          churned_days: parseInt(churnedDays),
          is_active: true,
        });

      if (klaviyoError) {
        console.error("Error saving Klaviyo key:", klaviyoError);
        toast({
          title: "Error",
          description: "Failed to save Klaviyo configuration. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Mark klaviyo setup and onboarding as completed
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          klaviyo_setup_completed: true,
          onboarding_completed: true
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user:", updateError);
      }

      // Send Klaviyo connected confirmation email
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('account_name')
          .eq('id', user.id)
          .single();

        await supabase.functions.invoke('send-notification-email', {
          body: {
            userId: user.id,
            email: user.email,
            notificationType: 'klaviyo_connected',
            data: {
              title: 'Klaviyo Connected Successfully!',
              message: 'Your Klaviyo account has been connected.',
              accountName: userData?.account_name || clientName || 'there',
            },
          },
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't block flow on email error
      }

      toast({
        title: "Success!",
        description: "Your Klaviyo integration is ready. Welcome to your dashboard!",
      });

      // Award "First Steps" achievement
      try {
        const { data: achievements } = await supabase
          .from('achievements')
          .select('id')
          .eq('criteria_type', 'klaviyo_connected')
          .single();

        if (achievements) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievements.id
            });
        }
      } catch (achievementError) {
        console.error('Error awarding achievement:', achievementError);
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving Klaviyo setup:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Klaviyo Setup">
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <a href="/dashboard" className="group flex items-center gap-3">
                <AderaiLogo size="lg" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Official Klaviyo Partner
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Connect Your{" "}
              <img src={klaviyoLogo} alt="Klaviyo" className="h-[1em] inline-block align-baseline" />{" "}
              Account
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Let's integrate your email marketing platform to unlock powerful segmentation
            </p>
          </div>

          {/* Setup Form */}
          <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* API Key Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">API Configuration</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Klaviyo Private API Key *</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="pk_..."
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          if (validationState.apiKey !== 'idle') {
                            setValidationState({ apiKey: 'idle' });
                          }
                        }}
                        onBlur={async (e) => {
                          const value = e.target.value;
                          if (!value || value.length < 10) {
                            setValidationState({
                              apiKey: 'invalid',
                              message: 'API key is too short',
                            });
                            return;
                          }

                          if (!value.startsWith("pk_")) {
                            setValidationState({
                              apiKey: 'invalid',
                              message: 'API key must start with "pk_"',
                            });
                            return;
                          }

                          setValidationState({ apiKey: 'validating' });

                          try {
                            const { data, error } = await supabase.functions.invoke('klaviyo-validate-key', {
                              body: { apiKey: value },
                            });

                            if (error || !data?.valid) {
                              setValidationState({
                                apiKey: 'invalid',
                                message: data?.error || 'Invalid API key',
                              });
                            } else {
                              setValidationState({
                                apiKey: 'valid',
                                message: 'API key is valid!',
                              });
                            }
                          } catch (error) {
                            setValidationState({
                              apiKey: 'invalid',
                              message: 'Failed to validate API key',
                            });
                          }
                        }}
                        className={cn(
                          "h-12 pr-10",
                          validationState.apiKey === 'valid' && "border-green-500",
                          validationState.apiKey === 'invalid' && "border-red-500"
                        )}
                        required
                      />
                      {validationState.apiKey === 'validating' && (
                        <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" />
                      )}
                      {validationState.apiKey === 'valid' && (
                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                      )}
                      {validationState.apiKey === 'invalid' && (
                        <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {validationState.message && (
                      <p className={cn(
                        "text-sm mt-1",
                        validationState.apiKey === 'valid' ? "text-green-600" : "text-red-600"
                      )}>
                        {validationState.message}
                      </p>
                    )}
                    {!validationState.message && (
                      <p className="text-sm text-muted-foreground">
                        Find your API key in Klaviyo → Settings → API Keys
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientName">Business Name (Optional)</Label>
                    <Input
                      id="clientName"
                      type="text"
                      placeholder="My Business"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Currency Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Currency Settings</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                          <SelectItem value="AUD">AUD (A$)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aov">Average Order Value</Label>
                      <Input
                        id="aov"
                        type="number"
                        value={aov}
                        onChange={(e) => setAov(e.target.value)}
                        className="h-12"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Thresholds */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Customer Value Thresholds</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vipThreshold">VIP Threshold ({currencySymbol})</Label>
                      <Input
                        id="vipThreshold"
                        type="number"
                        value={vipThreshold}
                        onChange={(e) => setVipThreshold(e.target.value)}
                        className="h-12"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="highValueThreshold">High Value Threshold ({currencySymbol})</Label>
                      <Input
                        id="highValueThreshold"
                        type="number"
                        value={highValueThreshold}
                        onChange={(e) => setHighValueThreshold(e.target.value)}
                        className="h-12"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Lifecycle Parameters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Customer Lifecycle (Days)</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCustomerDays">New Customer</Label>
                      <Input
                        id="newCustomerDays"
                        type="number"
                        value={newCustomerDays}
                        onChange={(e) => setNewCustomerDays(e.target.value)}
                        className="h-12"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lapsedDays">Lapsed</Label>
                      <Input
                        id="lapsedDays"
                        type="number"
                        value={lapsedDays}
                        onChange={(e) => setLapsedDays(e.target.value)}
                        className="h-12"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="churnedDays">Churned</Label>
                      <Input
                        id="churnedDays"
                        type="number"
                        value={churnedDays}
                        onChange={(e) => setChurnedDays(e.target.value)}
                        className="h-12"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Klaviyo & Continue"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={async () => {
                      try {
                        await supabase.from("users").update({ 
                          onboarding_completed: true 
                        }).eq("id", user.id);
                        navigate("/dashboard");
                      } catch (error) {
                        console.error("Error skipping setup:", error);
                        navigate("/dashboard");
                      }
                    }}
                  >
                    Skip for now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help finding your API key?{" "}
              <a href="/help" className="text-primary hover:underline">
                Read our guide
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
    </PageErrorBoundary>
  );
};

export default KlaviyoSetup;
