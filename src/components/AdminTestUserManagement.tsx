import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  UserPlus, Users, Mail, Clock, CheckCircle2, AlertCircle, 
  Copy, RefreshCw, Eye, EyeOff, Trash2, Send
} from "lucide-react";
import { format } from "date-fns";

interface TestUser {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  brand_name: string | null;
  temp_password: string | null;
  status: string;
  invitation_sent_at: string | null;
  first_login_at: string | null;
  notes: string | null;
  subscription_bypassed: boolean;
  created_at: string;
}

export const AdminTestUserManagement = () => {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    brandName: "",
    notes: "",
    sendEmail: true
  });

  useEffect(() => {
    loadTestUsers();
  }, []);

  const loadTestUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("test_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestUsers(data || []);
    } catch (error: any) {
      console.error("Error loading test users:", error);
      toast.error("Failed to load test users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    if (!formData.email || !formData.firstName || !formData.brandName) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setCreating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const response = await supabase.functions.invoke("create-test-user", {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          brandName: formData.brandName,
          notes: formData.notes,
          sendEmail: formData.sendEmail
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create test user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(response.data?.message || "Test user created successfully");
      
      // Reset form and close dialog
      setFormData({
        email: "",
        firstName: "",
        brandName: "",
        notes: "",
        sendEmail: true
      });
      setDialogOpen(false);
      
      // Reload test users list
      loadTestUsers();

    } catch (error: any) {
      console.error("Error creating test user:", error);
      toast.error(error.message || "Failed to create test user");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resendInvitation = async (testUser: TestUser) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      // For resending, we'd need a separate endpoint or reuse create-test-user logic
      // For now, show a message
      toast.info("Resend functionality coming soon. Please create a new test user for now.");
    } catch (error: any) {
      toast.error("Failed to resend invitation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "invited":
        return <Badge variant="default" className="bg-blue-500">Invited</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "created":
        return <Badge variant="secondary">Created</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: testUsers.length,
    invited: testUsers.filter(u => u.status === "invited").length,
    active: testUsers.filter(u => u.first_login_at).length,
    pending: testUsers.filter(u => !u.first_login_at).length
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test User Management</h2>
          <p className="text-muted-foreground">Create and manage beta test accounts for clients</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create Test User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Test User</DialogTitle>
              <DialogDescription>
                Create a fully functional test account for a client to try Aderai.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand/Company Name *</Label>
                <Input
                  id="brandName"
                  placeholder="Acme Corp"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any notes about this test user..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, sendEmail: checked as boolean }))
                  }
                />
                <Label htmlFor="sendEmail" className="text-sm font-normal">
                  Send invitation email with login credentials
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTestUser} disabled={creating}>
                {creating ? (
                  <>
                    <div className="relative w-4 h-4 mr-2">
                      <div className="absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin" />
                    </div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Test User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Test Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invited</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invited}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active (Logged In)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Login</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Users</CardTitle>
              <CardDescription>All beta test accounts created by admin</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadTestUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              </div>
            </div>
          ) : testUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No test users created yet</p>
              <p className="text-sm">Click "Create Test User" to get started</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credentials</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>First Login</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name || "—"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.brand_name || "—"}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.temp_password ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showPasswords[user.id] ? user.temp_password : "••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePasswordVisibility(user.id)}
                            >
                              {showPasswords[user.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(user.temp_password!, "Password")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(user.created_at), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.first_login_at ? (
                          <div>
                            <div className="text-sm">
                              {format(new Date(user.first_login_at), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(user.first_login_at), "h:mm a")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-[150px] truncate block">
                          {user.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(user.email, "Email")}
                            title="Copy email"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {user.status === "invited" && !user.first_login_at && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => resendInvitation(user)}
                              title="Resend invitation"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
