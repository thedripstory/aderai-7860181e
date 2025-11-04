import { Building2, Plus, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface KlaviyoKey {
  id: string;
  client_name: string;
  klaviyo_api_key_hash: string;
  currency: string;
  aov: number;
  vip_threshold: number;
  high_value_threshold: number;
  new_customer_days: number;
  lapsed_days: number;
  churned_days: number;
}

interface ClientSwitcherProps {
  klaviyoKeys: KlaviyoKey[];
  activeKeyIndex: number;
  onSwitchClient: (index: number) => void;
  onClientAdded: () => void;
  currentUserId: string;
}

export const ClientSwitcher = ({
  klaviyoKeys,
  activeKeyIndex,
  onSwitchClient,
  onClientAdded,
  currentUserId,
}: ClientSwitcherProps) => {
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const handleAddClient = async () => {
    if (!clientName.trim() || !apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      // Validate API key
      const { data: validationData, error: validationError } = await supabase.functions.invoke(
        "klaviyo-validate-key",
        { body: { apiKey } }
      );

      if (validationError || !validationData?.valid) {
        toast({
          title: "Invalid API Key",
          description: validationData?.error || "Please check your API key and try again.",
          variant: "destructive",
        });
        setAdding(false);
        return;
      }

      // Add new client
      const { error: insertError } = await supabase
        .from("klaviyo_keys")
        .insert({
          user_id: currentUserId,
          klaviyo_api_key_hash: apiKey,
          client_name: clientName,
          currency: "USD",
          currency_symbol: "$",
          aov: 100,
          vip_threshold: 1000,
          high_value_threshold: 500,
          new_customer_days: 60,
          lapsed_days: 90,
          churned_days: 180,
          is_active: true,
        });

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to add client. Please try again.",
          variant: "destructive",
        });
        setAdding(false);
        return;
      }

      toast({
        title: "Success!",
        description: "Client added successfully",
      });

      setShowModal(false);
      setClientName("");
      setApiKey("");
      onClientAdded();
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  if (klaviyoKeys.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 ml-6 pl-6 border-l border-border">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <select
          value={activeKeyIndex}
          onChange={(e) => onSwitchClient(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm min-w-[150px]"
        >
          {klaviyoKeys.map((key, index) => (
            <option key={key.id} value={index}>
              {key.client_name || `Client ${index + 1}`}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Client</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setClientName("");
                  setApiKey("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g., ACME Corp"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Klaviyo API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="pk_..."
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find in Klaviyo → Settings → API Keys
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setClientName("");
                    setApiKey("");
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={adding || !clientName.trim() || !apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? "Adding..." : "Add Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
