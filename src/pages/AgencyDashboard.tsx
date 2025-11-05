import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Building2,
  ArrowLeft,
  Settings as SettingsIcon,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Key,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgencyTeamManager } from "@/components/AgencyTeamManager";

interface Client {
  id: string;
  client_name: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  brand_user_id: string;
  klaviyo_keys?: any[];
}

export default function AgencyDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "paused">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/agency-login");
        return;
      }

      // Verify onboarding completion
      const { data: userData } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!userData?.onboarding_completed) {
        navigate("/onboarding/agency");
        return;
      }

      setCurrentUser(user);

      // Load agency clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("agency_clients")
        .select(`
          *,
          brand:users!agency_clients_brand_user_id_fkey(email, account_name)
        `)
        .eq("agency_user_id", user.id)
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      // Load Klaviyo keys for each client
      if (clientsData) {
        const clientsWithKeys = await Promise.all(
          clientsData.map(async (client) => {
            const { data: keys } = await supabase
              .from("klaviyo_keys")
              .select("id, client_name, is_active, created_at")
              .eq("user_id", client.brand_user_id);
            
            return { ...client, klaviyo_keys: keys || [] };
          })
        );
        setClients(clientsWithKeys);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error loading clients",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowAddModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to remove this client? This will not delete their account.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("agency_clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Client removed",
        description: "The client has been removed from your management.",
      });

      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to remove client",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
    totalKeys: clients.reduce((sum, c) => sum + (c.klaviyo_keys?.length || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            {/* Aggressive rotating loader */}
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
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-2xl font-bold">Agency Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your brand clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/login");
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </div>
          
          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.inactive}</span>
            </div>
            <p className="text-sm text-muted-foreground">Inactive Clients</p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <Key className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">{stats.totalKeys}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Klaviyo Keys</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-card rounded-lg border-2 border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>

              <Button onClick={handleAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="bg-card rounded-lg border-2 border-border p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first client"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={handleAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-card rounded-lg border-2 border-border p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{client.client_name}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          client.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{client.notes}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Klaviyo Keys:</span>
                    <span className="font-medium">{client.klaviyo_keys?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Added:</span>
                    <span className="font-medium">
                      {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/brand-workspace/${client.brand_user_id}`)}
                  className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Manage Client
                </button>
              </div>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="team">
            <AgencyTeamManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <AddEditClientModal
          client={editingClient}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingClient(null);
            loadClients();
          }}
          agencyUserId={currentUser?.id}
        />
      )}
    </div>
  );
}

interface AddEditClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  agencyUserId: string;
}

function AddEditClientModal({ client, onClose, onSuccess, agencyUserId }: AddEditClientModalProps) {
  const [brandEmail, setBrandEmail] = useState("");
  const [clientName, setClientName] = useState(client?.client_name || "");
  const [status, setStatus] = useState(client?.status || "active");
  const [notes, setNotes] = useState(client?.notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("agency_clients")
          .update({
            client_name: clientName,
            status,
            notes,
          })
          .eq("id", client.id);

        if (error) throw error;

        toast({
          title: "Client updated",
          description: "Client information has been updated successfully.",
        });
      } else {
        // Add new client
        // First, find the brand user by email
        const { data: brandUser, error: brandError } = await supabase
          .from("users")
          .select("id, account_type")
          .eq("email", brandEmail.toLowerCase())
          .single();

        if (brandError || !brandUser) {
          toast({
            title: "Brand not found",
            description: "No brand account found with that email address.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (brandUser.account_type !== "brand") {
          toast({
            title: "Invalid account",
            description: "That email belongs to an agency account, not a brand.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if already managing this client
        const { data: existing } = await supabase
          .from("agency_clients")
          .select("id")
          .eq("agency_user_id", agencyUserId)
          .eq("brand_user_id", brandUser.id)
          .single();

        if (existing) {
          toast({
            title: "Already managing",
            description: "You're already managing this brand.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Add the client
        const { error: insertError } = await supabase.from("agency_clients").insert({
          agency_user_id: agencyUserId,
          brand_user_id: brandUser.id,
          client_name: clientName,
          status,
          notes,
        });

        if (insertError) throw insertError;

        // Send notification email
        try {
          await supabase.functions.invoke("send-notification-email", {
            body: {
              userId: agencyUserId,
              email: brandEmail,
              notificationType: "client_added",
              data: {
                title: "New Client Added",
                message: `You've successfully added ${clientName} to your client roster.`,
              },
            },
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
        }

        toast({
          title: "Client added",
          description: "New client has been added successfully.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Failed to save client information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">
          {client ? "Edit Client" : "Add New Client"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!client && (
            <div>
              <label className="block text-sm font-medium mb-2">Brand Email</label>
              <input
                type="email"
                value={brandEmail}
                onChange={(e) => setBrandEmail(e.target.value)}
                required
                placeholder="brand@example.com"
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the email of the brand you want to manage
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Client display name"
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this client..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : client ? "Update" : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
