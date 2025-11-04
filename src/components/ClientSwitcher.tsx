import React, { useState } from "react";
import { ChevronDown, Plus, X, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KlaviyoKey {
  id: string;
  client_name: string;
  klaviyo_api_key_hash: string;
  currency: string;
  currency_symbol: string;
  aov: number;
  vip_threshold: number;
  high_value_threshold: number;
  new_customer_days: number;
  lapsed_days: number;
  churned_days: number;
  is_active: boolean;
}

interface ClientSwitcherProps {
  klaviyoKeys: KlaviyoKey[];
  activeKeyIndex: number;
  onSelectClient: (index: number) => void;
  onAddClient: () => void;
}

export const ClientSwitcher: React.FC<ClientSwitcherProps> = ({
  klaviyoKeys,
  activeKeyIndex,
  onSelectClient,
  onAddClient,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (klaviyoKeys.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border bg-card hover:bg-muted transition-colors"
      >
        <span className="font-medium">{klaviyoKeys[activeKeyIndex]?.client_name || "Select Client"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-64 bg-card border-2 border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium px-2">SELECT CLIENT</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {klaviyoKeys.map((key, index) => (
                <button
                  key={key.id}
                  onClick={() => {
                    onSelectClient(index);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                    index === activeKeyIndex ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                >
                  <div className="font-medium">{key.client_name}</div>
                  <div className="text-xs text-muted-foreground">{key.currency_symbol} {key.currency}</div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-border">
              <button
                onClick={() => {
                  onAddClient();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Client
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSuccess, userId }) => {
  const [clientName, setClientName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const validateApiKey = async (key: string) => {
    if (!key || !key.startsWith("pk_")) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("klaviyo-validate-key", {
        body: { apiKey: key },
      });

      if (error || !data?.valid) {
        setIsValid(false);
        toast({
          title: "Invalid API Key",
          description: data?.error || "Please check your Klaviyo private API key.",
          variant: "destructive",
        });
        return false;
      }

      setIsValid(true);
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleAdd = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Client name required",
        description: "Please enter a name for this client.",
        variant: "destructive",
      });
      return;
    }

    const valid = await validateApiKey(apiKey);
    if (!valid) return;

    try {
      const { error } = await supabase.from("klaviyo_keys").insert({
        user_id: userId,
        client_name: clientName,
        klaviyo_api_key_hash: apiKey,
        currency: "USD",
        currency_symbol: "$",
        aov: 100,
        vip_threshold: 500,
        high_value_threshold: 300,
        new_customer_days: 30,
        lapsed_days: 60,
        churned_days: 180,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Client added successfully",
        description: `${clientName} has been added to your account.`,
      });

      setClientName("");
      setApiKey("");
      setIsValid(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Failed to add client",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full border-2 border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Client</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Acme Store"
              className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Klaviyo Private API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(null);
              }}
              onBlur={() => apiKey && validateApiKey(apiKey)}
              placeholder="pk_..."
              className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
            />
            {isValidating && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                Validating...
              </p>
            )}
            {isValid === true && (
              <p className="text-xs text-green-500 mt-1">✓ Valid API key</p>
            )}
            {isValid === false && (
              <p className="text-xs text-red-500 mt-1">✗ Invalid API key</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isValidating || !clientName.trim() || !apiKey}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
};
