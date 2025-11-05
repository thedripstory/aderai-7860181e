import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Key } from "lucide-react";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function BrandWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [klaviyoKeys, setKlaviyoKeys] = useState<any[]>([]);

  useEffect(() => {
    loadClientWorkspace();
  }, [clientId]);

  const loadClientWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/agency-login");
        return;
      }

      // Verify this agency manages this client
      const { data: clientData, error: clientError } = await supabase
        .from("agency_clients")
        .select(`
          *,
          brand:users!agency_clients_brand_user_id_fkey(email, account_name)
        `)
        .eq("agency_user_id", user.id)
        .eq("brand_user_id", clientId)
        .single();

      if (clientError || !clientData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage this client.",
          variant: "destructive",
        });
        navigate("/agency-dashboard");
        return;
      }

      setClient(clientData);

      // Load client's Klaviyo keys
      const { data: keys } = await supabase
        .from("klaviyo_keys")
        .select("*")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false });

      setKlaviyoKeys(keys || []);
    } catch (error) {
      console.error("Error loading client workspace:", error);
      toast({
        title: "Error",
        description: "Failed to load client workspace",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/agency-dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{client.client_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Client Workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Client Info */}
        <div className="bg-card rounded-lg border-2 border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.brand?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  client.status === "active"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}
              >
                {client.status}
              </span>
            </div>
            {client.notes && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Klaviyo Keys */}
        <div className="bg-card rounded-lg border-2 border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Klaviyo Integrations
            </h2>
          </div>

          {klaviyoKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                This client hasn't set up any Klaviyo integrations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {klaviyoKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-muted rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {key.client_name || "Klaviyo Integration"}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          key.is_active
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {key.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Currency</p>
                        <p className="font-medium">{key.currency}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AOV</p>
                        <p className="font-medium">
                          {key.currency_symbol}
                          {key.aov}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
