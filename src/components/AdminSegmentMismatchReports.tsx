import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Clock, Mail, RefreshCw, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface MismatchReport {
  id: string;
  user_id: string;
  user_email: string;
  segment_name: string;
  expected_behavior: string;
  actual_behavior: string;
  additional_notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export const AdminSegmentMismatchReports = () => {
  const [reports, setReports] = useState<MismatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MismatchReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("segment_mismatch_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading mismatch reports:", error);
      toast.error("Failed to load mismatch reports");
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async () => {
    if (!selectedReport) return;

    try {
      const updates: any = {
        status: newStatus || selectedReport.status,
        admin_notes: adminNotes || selectedReport.admin_notes,
      };

      if (newStatus === "resolved" && selectedReport.status !== "resolved") {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("segment_mismatch_reports")
        .update(updates)
        .eq("id", selectedReport.id);

      if (error) throw error;

      toast.success("Report updated successfully");
      setSelectedReport(null);
      setAdminNotes("");
      setNewStatus("");
      loadReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><RefreshCw className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const inProgressCount = reports.filter(r => r.status === "in_progress").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Being investigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">Fixed for customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Segment Mismatch Reports
              </CardTitle>
              <CardDescription>Customer-reported segment issues that need attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No mismatch reports yet</p>
              <p className="text-sm">When customers report segment issues, they'll appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer Email</TableHead>
                  <TableHead>Segment Name</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{report.segment_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || "");
                          setNewStatus(report.status);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Segment Mismatch Report
            </DialogTitle>
            <DialogDescription>
              Review and respond to customer-reported segment issue
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Email</label>
                  <p className="font-medium">{selectedReport.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Segment Name</label>
                  <p className="font-mono">{selectedReport.segment_name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Expected Behavior</label>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm">{selectedReport.expected_behavior}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Actual Behavior</label>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm">{selectedReport.actual_behavior}</p>
                </div>
              </div>

              {selectedReport.additional_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReport.additional_notes}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes about this issue and resolution..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button onClick={updateReport}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
