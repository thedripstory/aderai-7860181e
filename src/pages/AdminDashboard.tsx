import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, Shield, Key, Building2, Mail, AlertCircle, 
  TrendingUp, LogOut, Search, RefreshCw, UserCog 
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [klaviyoKeys, setKlaviyoKeys] = useState<any[]>([]);
  const [agencyClients, setAgencyClients] = useState<any[]>([]);
  const [affiliateStats, setAffiliateStats] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [segmentErrors, setSegmentErrors] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/brand-login");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      loadAllData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/brand-login");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadKlaviyoKeys(),
      loadAgencyClients(),
      loadAffiliateStats(),
      loadEmailLogs(),
      loadSegmentErrors(),
      loadUserRoles()
    ]);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setUsers(data);
  };

  const loadKlaviyoKeys = async () => {
    const { data, error } = await supabase
      .from("klaviyo_keys")
      .select("*, users(email, account_name)")
      .order("created_at", { ascending: false });
    
    if (!error && data) setKlaviyoKeys(data);
  };

  const loadAgencyClients = async () => {
    const { data, error } = await supabase
      .from("agency_clients")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setAgencyClients(data);
  };

  const loadAffiliateStats = async () => {
    const { data, error } = await supabase
      .from("affiliate_stats")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setAffiliateStats(data);
  };

  const loadEmailLogs = async () => {
    const { data, error } = await supabase
      .from("email_audit_log")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100);
    
    if (!error && data) setEmailLogs(data);
  };

  const loadSegmentErrors = async () => {
    const { data, error } = await supabase
      .from("segment_creation_errors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (!error && data) setSegmentErrors(data);
  };

  const loadUserRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*, users(email, account_name)")
      .order("created_at", { ascending: false });
    
    if (!error && data) setUserRoles(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/brand-login");
  };

  const updateUserRole = async (userId: string, role: "admin" | "user") => {
    try {
      // First, check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role, created_by: user?.id }]);

        if (error) throw error;
      }

      toast.success("Role updated successfully");
      loadUserRoles();
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("users")
      .update({ subscription_status: newStatus })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user status");
    } else {
      toast.success("User status updated");
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Management & Analytics</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="klaviyo">Klaviyo Keys</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="emails">Email Logs</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users.filter(u => u.email_verified).length} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Klaviyo Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{klaviyoKeys.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {klaviyoKeys.filter(k => k.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Agency Clients</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agencyClients.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agencyClients.filter(c => c.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Segment Errors</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{segmentErrors.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {segmentErrors.filter(e => !e.resolved_at).length} unresolved
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={loadUsers}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.account_name}</TableCell>
                        <TableCell>
                          <Badge variant={user.account_type === 'agency' ? 'default' : 'secondary'}>
                            {user.account_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.subscription_status === 'active' ? 'default' : 'outline'}>
                            {user.subscription_status || 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.email_verified ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="destructive">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.subscription_status)}
                          >
                            Toggle Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>User Roles Management</CardTitle>
                <CardDescription>Assign and manage admin privileges</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const userRole = userRoles.find(r => r.user_id === user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.account_name}</TableCell>
                          <TableCell>
                            {userRole ? (
                              <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                                {userRole.role}
                              </Badge>
                            ) : (
                              <Badge variant="outline">No role</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {userRole ? new Date(userRole.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userRole?.role || 'user'}
                              onValueChange={(value) => updateUserRole(user.id, value as "admin" | "user")}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Klaviyo Keys Tab */}
          <TabsContent value="klaviyo">
            <Card>
              <CardHeader>
                <CardTitle>Klaviyo API Keys</CardTitle>
                <CardDescription>Monitor all connected Klaviyo accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>AOV</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {klaviyoKeys.map((key: any) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.client_name || 'N/A'}</TableCell>
                        <TableCell>{key.users?.email}</TableCell>
                        <TableCell>
                          <Badge variant={key.is_active ? 'default' : 'destructive'}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.currency}</TableCell>
                        <TableCell>{key.currency_symbol}{key.aov}</TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agencies Tab */}
          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <CardTitle>Agency-Client Relationships</CardTitle>
                <CardDescription>View all agency client connections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Agency ID</TableHead>
                      <TableHead>Brand ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencyClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.client_name}</TableCell>
                        <TableCell className="font-mono text-xs">{client.agency_user_id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{client.brand_user_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'default' : 'outline'}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{client.notes || '-'}</TableCell>
                        <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Logs Tab */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Audit Log</CardTitle>
                <CardDescription>Recent email activity (last 100)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.recipient_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.email_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(log.sent_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Segment Creation Errors</CardTitle>
                <CardDescription>Track and monitor segment creation failures</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment Name</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Retry Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segmentErrors.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell className="font-medium">{error.segment_name}</TableCell>
                        <TableCell className="max-w-md truncate">{error.error_message}</TableCell>
                        <TableCell>{error.retry_count}</TableCell>
                        <TableCell>
                          {error.resolved_at ? (
                            <Badge variant="default">Resolved</Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(error.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
