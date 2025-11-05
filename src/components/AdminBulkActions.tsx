import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronDown, UserCog, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminBulkActionsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  items: any[];
  type: "users" | "roles" | "keys";
  onActionComplete: () => void;
}

export const AdminBulkActions = ({
  selectedIds,
  onSelectionChange,
  items,
  type,
  onActionComplete,
}: AdminBulkActionsProps) => {
  const [loading, setLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const exportToCSV = () => {
    const headers = Object.keys(items[0] || {}).join(",");
    const rows = items.map(item => 
      Object.values(item).map(val => 
        typeof val === 'object' ? JSON.stringify(val) : val
      ).join(",")
    );
    
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${items.length} items to CSV`);
  };

  const bulkUpdateUserStatus = async (status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ subscription_status: status })
        .in("id", selectedIds);

      if (error) throw error;

      // Log audit trail
      await logAuditAction("bulk_user_status_update", selectedIds.length, { status });

      toast.success(`Updated ${selectedIds.length} users to ${status}`);
      onSelectionChange([]);
      onActionComplete();
    } catch (error: any) {
      toast.error("Failed to update users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const bulkAssignRole = async (role: "admin" | "user") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Delete existing roles for selected users
      await supabase
        .from("user_roles")
        .delete()
        .in("user_id", selectedIds);

      // Insert new roles
      const roleInserts = selectedIds.map(userId => ({
        user_id: userId,
        role,
        created_by: user?.id
      }));

      const { error } = await supabase
        .from("user_roles")
        .insert(roleInserts);

      if (error) throw error;

      // Log audit trail
      await logAuditAction("bulk_role_assignment", selectedIds.length, { role });

      toast.success(`Assigned ${role} role to ${selectedIds.length} users`);
      onSelectionChange([]);
      onActionComplete();
    } catch (error: any) {
      toast.error("Failed to assign roles: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logAuditAction = async (actionType: string, count: number, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_audit_log").insert([{
        admin_user_id: user?.id,
        action_type: actionType,
        target_table: type,
        new_values: { ...details, affected_count: count }
      }]);
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedIds.length === items.length && items.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
        {selectedIds.length > 0 && (
          <Badge variant="secondary">
            {selectedIds.length} selected
          </Badge>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2">
          {type === "users" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Bulk Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => bulkUpdateUserStatus("active")}>
                  Set Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => bulkUpdateUserStatus("inactive")}>
                  Set Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {type === "roles" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  Assign Role
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => bulkAssignRole("admin")}>
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => bulkAssignRole("user")}>
                  Make User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      )}
    </div>
  );
};
