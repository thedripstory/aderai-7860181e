import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Key, DollarSign, Users, TrendingUp, Loader2 } from "lucide-react";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { supabase } from "@/lib/supabase";

const KlaviyoSetup = () => {
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

      // Save Klaviyo configuration
      const { error: klaviyoError } = await supabase
        .from("klaviyo_keys")
        .insert({
          user_id: user.id,
          klaviyo_api_key_hash: apiKey,
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

      toast({
        title: "Success!",
        description: "Your Klaviyo integration is ready. Welcome to your dashboard!",
      });

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          </div>
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Connect Your Klaviyo Account
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's integrate your email marketing platform to unlock powerful automation
            </p>
          </div>

          {/* Setup Form */}
          <Card className="backdrop-blur-sm bg-card/50 border-primary/20 shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* API Key Section */}
                <div className="space-y-4 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">API Configuration</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Klaviyo Private API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="pk_..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-background/50"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Find your API key in Klaviyo → Settings → API Keys
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientName">Business Name (Optional)</Label>
                    <Input
                      id="clientName"
                      type="text"
                      placeholder="My Business"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                {/* Currency Settings */}
                <div className="space-y-4 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Currency Settings</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                          <SelectItem value="AUD">AUD (A$)</SelectItem>
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
                        className="bg-background/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Thresholds */}
                <div className="space-y-4 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
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
                        className="bg-background/50"
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
                        className="bg-background/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Lifecycle Parameters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
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
                        className="bg-background/50"
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
                        className="bg-background/50"
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
                        className="bg-background/50"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white font-semibold py-6"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Klaviyo & Continue"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      if (!user) return;
                      
                      // Don't mark as completed - just navigate
                      toast({
                        title: "Skipped for now",
                        description: "You'll see a reminder to connect Klaviyo on your dashboard.",
                      });
                      
                      navigate("/dashboard");
                    }}
                    className="w-full text-muted-foreground"
                    disabled={isSaving}
                  >
                    Skip for now, I'll add this later
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help finding your API key?{" "}
              <a
                href="https://help.klaviyo.com/hc/en-us/articles/115005062267"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Klaviyo's guide
              </a>
            </p>
          </div>
        </div>
      </div>

      <PoweredByBadge />
    </div>
  );
};

export default KlaviyoSetup;
