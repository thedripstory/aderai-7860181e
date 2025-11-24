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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Users, Shield, Key, Building2, Mail, AlertCircle, 
  TrendingUp, LogOut, Search, RefreshCw, UserCog, FileText, Download
} from "lucide-react";
import { AdminBulkActions } from "@/components/AdminBulkActions";
import { AdminAnalyticsCharts } from "@/components/AdminAnalyticsCharts";
import { AdminTableFilters } from "@/components/AdminTableFilters";
import { AdminAuditTab } from "./AdminDashboard_AuditTab";
import { AdminSystemHealth } from "@/components/AdminSystemHealth";
import { AdminUserSessions } from "@/components/AdminUserSessions";
import { AdminAPIMonitoring } from "@/components/AdminAPIMonitoring";
import { AdminErrorTracking } from "@/components/AdminErrorTracking";
import { AdminUsageTracking } from "@/components/AdminUsageTracking";
import { AdminFeatureUsage } from "@/components/AdminFeatureUsage";
import { AdminNotificationCenter } from "@/components/AdminNotificationCenter";
import { AdminUserJourneyAnalytics } from "@/components/AdminUserJourneyAnalytics";
import { AdminEmailMonitoring } from "@/components/AdminEmailMonitoring";
import { AdminCohortAnalysis } from "@/components/AdminCohortAnalysis";
import { AdminSegmentAnalytics } from "@/components/AdminSegmentAnalytics";
import { AdminUserHealth } from "@/components/AdminUserHealth";
import { AdminAdvancedFeatureUsage } from "@/components/AdminAdvancedFeatureUsage";
import { AdminSystemHealthMetrics } from "@/components/AdminSystemHealthMetrics";
import { exportUsersToCSV, exportFeedbackToCSV } from "@/lib/csvExport";
import { AdminDateRangeFilter, DateRange } from "@/components/AdminDateRangeFilter";
import { useSystemHealthMonitor } from "@/hooks/useSystemHealthMonitor";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [klaviyoKeys, setKlaviyoKeys] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [segmentErrors, setSegmentErrors] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  // Enable system health monitoring
  useSystemHealthMonitor();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Use RPC function to check admin role (security definer)
      const { data: isAdminUser, error: roleError } = await supabase.rpc("is_admin");

      if (roleError || !isAdminUser) {
        toast.error("Access denied. Admin privileges required.");
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadAllData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      await supabase.auth.signOut();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadKlaviyoKeys(),
      loadEmailLogs(),
      loadSegmentErrors(),
      loadUserRoles(),
      loadAuditLogs()
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

  const loadAuditLogs = async () => {
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (!error && data) setAuditLogs(data);
  };

  const logAuditAction = async (actionType: string, targetTable?: string, targetId?: string, oldValues?: any, newValues?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_audit_log").insert([{
        admin_user_id: user?.id,
        action_type: actionType,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues
      }]);
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const updateUserRole = async (userId: string, role: "admin" | "user") => {
    try {
      // First, check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      const oldRole = existingRole?.role;
      
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

      // Log audit action
      await logAuditAction("role_update", "user_roles", userId, { role: oldRole }, { role });

      toast.success(`Role updated to ${role} successfully`);
      loadUserRoles();
      loadAuditLogs();
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  const revokeUserRole = async (userId: string) => {
    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!existingRole) {
        toast.error("No role to revoke");
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Log audit action
      await logAuditAction("role_revoke", "user_roles", userId, { role: existingRole.role }, null);

      toast.success("Role revoked successfully");
      loadUserRoles();
      loadAuditLogs();
    } catch (error: any) {
      toast.error("Failed to revoke role: " + error.message);
    }
  };

  const toggleUserEmailVerification = async (userId: string, currentVerified: boolean) => {
    const newVerified = !currentVerified;
    const { error } = await supabase
      .from("users")
      .update({ email_verified: newVerified })
      .eq("id", userId);

    if (!error) {
      await logAuditAction("user_email_verification_update", "users", userId, { email_verified: currentVerified }, { email_verified: newVerified });
    }

    if (error) {
      toast.error("Failed to update user verification status");
    } else {
      toast.success("User verification status updated");
      loadUsers();
      loadAuditLogs();
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

  const applyFilters = (data: any[], filterConfig: any) => {
    let filtered = [...data];

    if (filterConfig.search) {
      const term = filterConfig.search.toLowerCase();
      filtered = filtered.filter((item: any) => 
        JSON.stringify(item).toLowerCase().includes(term)
      );
    }

    if (filterConfig.dateFrom) {
      filtered = filtered.filter((item: any) => 
        new Date(item.created_at || item.sent_at) >= filterConfig.dateFrom
      );
    }

    if (filterConfig.dateTo) {
      filtered = filtered.filter((item: any) => 
        new Date(item.created_at || item.sent_at) <= filterConfig.dateTo
      );
    }

    if (filterConfig.status && filterConfig.status.length > 0) {
      filtered = filtered.filter((item: any) => 
        filterConfig.status.includes(item.status)
      );
    }

    return filtered;
  };

  const filteredUsers = applyFilters(users, filters).filter(user => 
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
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
              <AdminNotificationCenter />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 xl:grid-cols-14 w-full mb-8 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="userhealth">User Health</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="systemhealth">System</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="klaviyo">Klaviyo</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-end">
              <AdminDateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>
            
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
                  <CardTitle className="text-sm font-medium">Email Logs</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailLogs.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {emailLogs.filter(e => e.status === 'sent').length} sent successfully
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditLogs.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 100 actions
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cohort Analysis Tab */}
          <TabsContent value="cohorts">
            <AdminCohortAnalysis />
          </TabsContent>

          {/* Segment Analytics Tab */}
          <TabsContent value="segments">
            <AdminSegmentAnalytics />
          </TabsContent>

          {/* User Health Tab */}
          <TabsContent value="userhealth">
            <AdminUserHealth />
          </TabsContent>

          {/* Feature Usage Tab */}
          <TabsContent value="features">
            <AdminAdvancedFeatureUsage />
          </TabsContent>

          {/* System Health Metrics Tab */}
          <TabsContent value="systemhealth">
            <AdminSystemHealthMetrics />
          </TabsContent>

          {/* User Journey Tab */}
          <TabsContent value="journey">
            <AdminUserJourneyAnalytics />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <AdminSystemHealth />
          </TabsContent>

          {/* User Sessions Tab */}
          <TabsContent value="sessions">
            <AdminUserSessions />
          </TabsContent>

          {/* API Monitoring Tab */}
          <TabsContent value="api">
            <AdminAPIMonitoring />
          </TabsContent>

          {/* Error Tracking Tab */}
          <TabsContent value="errors">
            <AdminErrorTracking />
          </TabsContent>

          {/* Usage Tracking Tab - removed, merged into Features tab */}

          {/* Email Monitoring Tab */}
          <TabsContent value="emails">
            <AdminEmailMonitoring />
          </TabsContent>

          {/* Analytics Tab - removed, split into dedicated tabs */}

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <AdminTableFilters
                config={{
                  search: true,
                  dateRange: true,
                  status: ["active", "inactive"],
                  accountType: ["brand", "agency"]
                }}
                onFilterChange={setFilters}
              />
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Users</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => exportUsersToCSV(filteredUsers)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
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
                  <div className="mt-4">
                    <AdminBulkActions
                      selectedIds={selectedUserIds}
                      onSelectionChange={setSelectedUserIds}
                      items={users}
                      type="users"
                      onActionComplete={() => {
                        loadUsers();
                        loadAuditLogs();
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={() => {
                              if (selectedUserIds.length === filteredUsers.length) {
                                setSelectedUserIds([]);
                              } else {
                                setSelectedUserIds(filteredUsers.map(u => u.id));
                              }
                            }}
                          />
                        </TableHead>
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
                          <TableCell>
                            <Checkbox
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={() => {
                                if (selectedUserIds.includes(user.id)) {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                                } else {
                                  setSelectedUserIds([...selectedUserIds, user.id]);
                                }
                              }}
                            />
                          </TableCell>
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
                            onClick={() => toggleUserEmailVerification(user.id, user.email_verified)}
                          >
                            Toggle Verification
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>User Roles Management</CardTitle>
                <CardDescription>Assign and manage admin privileges with full audit trail</CardDescription>
                <div className="mt-4">
                  <AdminBulkActions
                    selectedIds={selectedRoleIds}
                    onSelectionChange={setSelectedRoleIds}
                    items={users}
                    type="roles"
                    onActionComplete={() => {
                      loadUserRoles();
                      loadAuditLogs();
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Role Management</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use the dropdown to assign roles or click "Revoke" to remove all privileges. All actions are logged in the Audit tab.
                      </p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRoleIds.length === users.length && users.length > 0}
                          onCheckedChange={() => {
                            if (selectedRoleIds.length === users.length) {
                              setSelectedRoleIds([]);
                            } else {
                              setSelectedRoleIds(users.map(u => u.id));
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User Email</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Account Type</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userRole = userRoles.find(r => r.user_id === user.id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRoleIds.includes(user.id)}
                                onCheckedChange={() => {
                                  if (selectedRoleIds.includes(user.id)) {
                                    setSelectedRoleIds(selectedRoleIds.filter(id => id !== user.id));
                                  } else {
                                    setSelectedRoleIds([...selectedRoleIds, user.id]);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.account_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.account_type}</Badge>
                            </TableCell>
                          <TableCell>
                            {userRole ? (
                              <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                                {userRole.role}
                              </Badge>
                            ) : (
                              <Badge variant="outline">No role</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {userRole ? new Date(userRole.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                              {userRole && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Revoke role for ${user.email}?`)) {
                                      revokeUserRole(user.id);
                                    }
                                  }}
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
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

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <AdminAuditTab auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
