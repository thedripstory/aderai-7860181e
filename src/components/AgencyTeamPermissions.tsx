import { useState } from "react";
import { Shield, UserPlus, Mail, Settings, Trash2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "analyst" | "viewer";
  clientAccess: string[];
  status: "active" | "pending";
  lastActive: string;
}

export const AgencyTeamPermissions = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@agency.com",
      role: "admin",
      clientAccess: ["all"],
      status: "active",
      lastActive: new Date().toISOString()
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@agency.com",
      role: "manager",
      clientAccess: ["client1", "client2"],
      status: "active",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily@agency.com",
      role: "analyst",
      clientAccess: ["client1"],
      status: "active",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      email: "alex@agency.com",
      role: "viewer",
      clientAccess: ["client2", "client3"],
      status: "pending",
      lastActive: ""
    }
  ]);

  const [newMember, setNewMember] = useState({
    email: "",
    role: "viewer" as TeamMember["role"],
    clientAccess: [] as string[]
  });

  const { toast } = useToast();

  const rolePermissions = {
    admin: {
      label: "Admin",
      color: "bg-red-100 text-red-800 border-red-300",
      permissions: [
        "Full access to all clients",
        "Manage team members",
        "Configure billing",
        "Access all features"
      ]
    },
    manager: {
      label: "Manager",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      permissions: [
        "Manage assigned clients",
        "Create and edit segments",
        "View all analytics",
        "Export reports"
      ]
    },
    analyst: {
      label: "Analyst",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      permissions: [
        "View assigned clients",
        "Access analytics",
        "Export data",
        "Create reports"
      ]
    },
    viewer: {
      label: "Viewer",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      permissions: [
        "View only access",
        "See dashboards",
        "No edit permissions"
      ]
    }
  };

  const sendInvite = () => {
    if (!newMember.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.email.split('@')[0],
      email: newMember.email,
      role: newMember.role,
      clientAccess: newMember.clientAccess,
      status: "pending",
      lastActive: ""
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({ email: "", role: "viewer", clientAccess: [] });

    toast({
      title: "Invitation sent!",
      description: `Invite sent to ${member.email}`,
    });
  };

  const updateMemberRole = (memberId: string, newRole: TeamMember["role"]) => {
    setTeamMembers(members =>
      members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    );
    toast({
      title: "Role updated",
      description: "Team member permissions have been updated",
    });
  };

  const removeMember = (memberId: string) => {
    setTeamMembers(members => members.filter(m => m.id !== memberId));
    toast({
      title: "Member removed",
      description: "Team member has been removed from the agency",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Team & Permissions
        </h2>
        <p className="text-muted-foreground">
          Manage team access and granular permissions across clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{teamMembers.length}</div>
          <div className="text-sm text-muted-foreground">Total Members</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === "active").length}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === "pending").length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{teamMembers.filter(m => m.role === "admin").length}</div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </Card>
      </div>

      {/* Invite New Member */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Invite Team Member
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="team@agency.com"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={newMember.role}
              onValueChange={(value) => setNewMember({ ...newMember, role: value as TeamMember["role"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full Access</SelectItem>
                <SelectItem value="manager">Manager - Manage Clients</SelectItem>
                <SelectItem value="analyst">Analyst - View & Report</SelectItem>
                <SelectItem value="viewer">Viewer - Read Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={sendInvite} className="mt-4">
          <Mail className="w-4 h-4 mr-2" />
          Send Invitation
        </Button>
      </Card>

      {/* Role Permissions Guide */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-bold mb-4">Role Permissions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(rolePermissions).map(([key, role]) => (
            <div key={key} className="space-y-2">
              <Badge className={role.color}>{role.label}</Badge>
              <ul className="space-y-1 text-sm">
                {role.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Members List */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Team Members</h3>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{member.name[0]}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{member.name}</span>
                    <Badge
                      variant={member.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                  {member.lastActive && (
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(member.lastActive).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMemberRole(member.id, value as TeamMember["role"])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Badge variant="outline">
                    {member.clientAccess.includes("all")
                      ? "All Clients"
                      : `${member.clientAccess.length} Clients`}
                  </Badge>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {member.name} from your agency team. They will lose access to all clients and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeMember(member.id)} className="bg-destructive">
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Log Preview */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <span>Sarah Johnson updated permissions for Mike Chen</span>
            <span className="text-muted-foreground">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <span>New team member invited: Alex Rodriguez</span>
            <span className="text-muted-foreground">1 day ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <span>Emily Davis accessed Luxe Beauty Co. dashboard</span>
            <span className="text-muted-foreground">2 days ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
