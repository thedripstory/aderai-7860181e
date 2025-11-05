import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const AdminUserSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Get recent user activity (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, account_name, updated_at, created_at")
        .gte("updated_at", twentyFourHoursAgo)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSessions(users || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load user sessions");
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (updatedAt: string) => {
    const minutesAgo = (Date.now() - new Date(updatedAt).getTime()) / 1000 / 60;
    if (minutesAgo < 5) return { label: "Active", variant: "default" as const };
    if (minutesAgo < 30) return { label: "Idle", variant: "secondary" as const };
    return { label: "Inactive", variant: "outline" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active User Sessions
            </CardTitle>
            <CardDescription>Monitor active user sessions in the last 24 hours</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={loadSessions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Session Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No active sessions
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => {
                const status = getSessionStatus(session.updated_at);
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.account_name}</TableCell>
                    <TableCell>{session.email}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: false })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
