import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Mail, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TEMPLATES = [
  "test-email",
  "welcome",
  "first-segment",
  "connect-klaviyo-reminder",
  "billing-subscription-confirmed",
  "billing-payment-failed",
  "billing-subscription-canceled",
];

interface LogRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    sent: "bg-green-500",
    pending: "bg-blue-500",
    dlq: "bg-destructive",
    failed: "bg-destructive",
    suppressed: "bg-amber-500",
    bounced: "bg-destructive",
    complained: "bg-destructive",
  };
  return <Badge className={map[s] || "bg-muted"}>{s}</Badge>;
}

export const AdminEmailDelivery = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<string>("welcome");
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_send_log" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      // Deduplicate by message_id (keep latest)
      const seen = new Set<string>();
      const dedup: LogRow[] = [];
      for (const r of (data as any[]) || []) {
        const key = r.message_id || r.id;
        if (seen.has(key)) continue;
        seen.add(key);
        dedup.push(r as LogRow);
      }
      setLogs(dedup);
    } catch (e: any) {
      toast.error("Failed to load email log: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => logs.filter(l =>
    (statusFilter === "all" || l.status === statusFilter) &&
    (templateFilter === "all" || l.template_name === templateFilter)
  ), [logs, statusFilter, templateFilter]);

  const stats = useMemo(() => ({
    total: filtered.length,
    sent: filtered.filter(l => l.status === "sent").length,
    pending: filtered.filter(l => l.status === "pending").length,
    failed: filtered.filter(l => l.status === "dlq" || l.status === "failed").length,
    suppressed: filtered.filter(l => l.status === "suppressed").length,
  }), [filtered]);

  async function sendTest() {
    if (!testEmail) { toast.error("Enter a recipient email"); return; }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "test-email",
          recipientEmail: testEmail,
          idempotencyKey: `test-${Date.now()}`,
          templateData: { recipient: testEmail, sentAt: new Date().toISOString() },
        },
      });
      if (error) throw error;
      toast.success(`Test email queued for ${testEmail}`);
      setTimeout(load, 1500);
    } catch (e: any) {
      toast.error("Send failed: " + e.message);
    } finally {
      setSending(false);
    }
  }

  async function resend(row: LogRow) {
    if (!row.recipient_email) return;
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: row.template_name,
          recipientEmail: row.recipient_email,
          idempotencyKey: `resend-${row.id}-${Date.now()}`,
        },
      });
      if (error) throw error;
      toast.success(`Resent ${row.template_name} to ${row.recipient_email}`);
      setTimeout(load, 1500);
    } catch (e: any) {
      toast.error("Resend failed: " + e.message);
    }
  }

  async function loadPreview(name: string) {
    setPreviewing(true);
    setPreviewHtml("");
    setPreviewSubject("");
    try {
      // Render via a small invoke; preview-transactional-email requires LOVABLE_API_KEY,
      // so as a fallback we just send a test render to your own inbox.
      // Here we render client-side approximation by fetching subject only from registry conventions.
      // Actually call the dedicated preview function via service helper:
      const { data, error } = await supabase.functions.invoke("admin-preview-email" as any, {
        body: { templateName: name },
      });
      if (error) throw error;
      setPreviewHtml((data as any)?.html || "<p>No preview available</p>");
      setPreviewSubject((data as any)?.subject || "");
    } catch (e: any) {
      setPreviewHtml(`<p style="color:#b00">Preview not available. Send a test email instead.</p>`);
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Delivery log</TabsTrigger>
          <TabsTrigger value="test">Send test</TabsTrigger>
          <TabsTrigger value="preview">Preview templates</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{stats.sent}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-500">{stats.pending}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Failed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{stats.failed}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Suppressed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-500">{stats.suppressed}</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Email delivery log</CardTitle>
                  <CardDescription>Latest 200 emails from notify.aderai.io (deduplicated by message id)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="dlq">Failed (DLQ)</SelectItem>
                      <SelectItem value="suppressed">Suppressed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={templateFilter} onValueChange={setTemplateFilter}>
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All templates</SelectItem>
                      {TEMPLATES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={load} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No emails match these filters.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">{format(new Date(r.created_at), "MMM dd, HH:mm:ss")}</TableCell>
                          <TableCell className="text-xs">{r.template_name}</TableCell>
                          <TableCell className="font-mono text-xs">{r.recipient_email}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-xs text-destructive max-w-xs truncate">{r.error_message || "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => resend(r)}>
                              <Send className="w-3 h-3 mr-1" /> Resend
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Send a test email</CardTitle>
              <CardDescription>Delivers the "test-email" template from notify.aderai.io to verify branding, DKIM, and SPF.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" />
              <Button onClick={sendTest} disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send test"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Select value={previewTemplate} onValueChange={setPreviewTemplate}>
                  <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => loadPreview(previewTemplate)} disabled={previewing}>
                  <Eye className="w-4 h-4 mr-2" />
                  {previewing ? "Rendering..." : "Render preview"}
                </Button>
              </div>
              {previewSubject && <CardDescription className="mt-2">Subject: {previewSubject}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white p-2 min-h-[400px]">
                <iframe srcDoc={previewHtml} className="w-full min-h-[600px] bg-white" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
