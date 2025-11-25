import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Shield, Mail, Calendar, CheckCircle2, XCircle, 
  UserCog, RefreshCw, AlertTriangle, Filter
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  account_name: string;
  email_verified: boolean;
  created_at: string;
  onboarding_completed: boolean;
  klaviyo_setup_completed: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadUserRoles()]);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const loadUserRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setUserRoles(data);
    }
  };

  const logAuditAction = async (actionType: string, targetId: string, oldValues?: any, newValues?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_audit_log").insert([{
        admin_user_id: user?.id,
        action_type: actionType,
        target_table: "user_roles",
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues
      }]);
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  const assignRole = async (userId: string, role: "admin" | "user") => {
    setProcessingUserId(userId);
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);

        if (error) throw error;
        
        await logAuditAction("role_update", userId, { role: existingRole.role }, { role });
        toast.success(`Role updated to ${role} successfully`);
      } else {
        // Create new role
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role, created_by: currentUser?.id }]);

        if (error) throw error;
        
        await logAuditAction("role_assign", userId, null, { role });
        toast.success(`${role} role assigned successfully`);
      }

      await loadUserRoles();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role: " + error.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const revokeRole = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);
      
      if (!existingRole) {
        toast.error("No role to revoke");
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      
      await logAuditAction("role_revoke", userId, { role: existingRole.role }, null);
      toast.success("Role revoked successfully");
      await loadUserRoles();
    } catch (error: any) {
      console.error("Error revoking role:", error);
      toast.error("Failed to revoke role: " + error.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = userRoles.find(r => r.user_id === user.id);
    const matchesRole = 
      roleFilter === "all" ||
      (roleFilter === "admin" && userRole?.role === "admin") ||
      (roleFilter === "user" && (!userRole || userRole?.role === "user")) ||
      (roleFilter === "none" && !userRole);
    
    const matchesVerified = 
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && user.email_verified) ||
      (verifiedFilter === "unverified" && !user.email_verified);

    return matchesSearch && matchesRole && matchesVerified;
  });

  const getRoleBadgeVariant = (role?: "admin" | "user") => {
    if (role === "admin") return "default";
    return "secondary";
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage all users, search, filter, and assign admin roles
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or account name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="none">No Role</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-primary">
              {userRoles.filter(r => r.role === "admin").length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.email_verified).length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Filtered</p>
            <p className="text-2xl font-bold">{filteredUsers.length}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredUsers.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No users found matching your filters. Try adjusting your search criteria.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Klaviyo</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userRole = getUserRole(user.id);
                  const isProcessing = processingUserId === user.id;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <span className="text-sm text-muted-foreground ml-6">
                            {user.account_name}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.email_verified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {userRole ? (
                          <Badge variant={getRoleBadgeVariant(userRole)} className="gap-1">
                            <Shield className="h-3 w-3" />
                            {userRole}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No role</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {user.onboarding_completed ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {user.klaviyo_setup_completed ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not connected</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={userRole || "none"}
                            onValueChange={(value) => {
                              if (value === "none") {
                                revokeRole(user.id);
                              } else {
                                assignRole(user.id, value as "admin" | "user");
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="none">No Role</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
