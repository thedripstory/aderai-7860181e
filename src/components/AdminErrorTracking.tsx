import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const AdminErrorTracking = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const { data: segmentErrors } = await supabase
        .from("segment_creation_errors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: emailErrors } = await supabase
        .from("email_audit_log")
        .select("*")
        .eq("status", "failed")
        .order("sent_at", { ascending: false })
        .limit(50);

      const combinedErrors = [
        ...(segmentErrors?.map(e => ({
          ...e,
          type: "segment",
          timestamp: e.created_at
        })) || []),
        ...(emailErrors?.map(e => ({
          ...e,
          type: "email",
          timestamp: e.sent_at,
          segment_name: e.email_type
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setErrors(combinedErrors);
    } catch (error) {
      console.error("Failed to load errors:", error);
      toast.error("Failed to load error tracking data");
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (error: any) => {
    try {
      if (error.type === "segment") {
        await supabase
          .from("segment_creation_errors")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", error.id);
      }
      toast.success("Error marked as resolved");
      loadErrors();
    } catch (err) {
      toast.error("Failed to mark error as resolved");
    }
  };

  const getSeverityBadge = (error: any) => {
    if (error.retry_count && error.retry_count > 3) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (error.resolved_at) {
      return <Badge variant="outline">Resolved</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 50 errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errors.filter(e => !e.resolved_at).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errors.filter(e => e.resolved_at).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Error Log</CardTitle>
              <CardDescription>Recent system errors and failures</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={loadErrors} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name/Subject</TableHead>
                <TableHead>Error Message</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No errors found
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{error.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {error.segment_name || error.subject || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {error.error_message}
                    </TableCell>
                    <TableCell>{getSeverityBadge(error)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {!error.resolved_at && error.type === "segment" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsResolved(error)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
