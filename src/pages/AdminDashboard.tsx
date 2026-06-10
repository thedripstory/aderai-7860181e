import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";

import {
  Shield, LogOut, LayoutDashboard, Activity, Users, UserCog, HeartPulse, Route,
  GitBranch, FlaskConical, CreditCard, KeyRound, Layers, MessageSquareWarning,
  Mail, MailCheck, MailWarning, ServerCog, Cpu, AlertOctagon, ScrollText, Bell,
  Sparkles, Gauge, FlaskRound, Eye, Key,
} from "lucide-react";

import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminUserSessions } from "@/components/AdminUserSessions";
import { AdminUserHealth } from "@/components/AdminUserHealth";
import { AdminUserJourneyAnalytics } from "@/components/AdminUserJourneyAnalytics";
import { AdminCohortAnalysis } from "@/components/AdminCohortAnalysis";
import { AdminTestUserManagement } from "@/components/AdminTestUserManagement";
import { AdminSubscriptionMonitoring } from "@/components/AdminSubscriptionMonitoring";
import { AdminSegmentAnalytics } from "@/components/AdminSegmentAnalytics";
import { AdminSegmentMismatchReports } from "@/components/AdminSegmentMismatchReports";
import { AdminEmailDelivery } from "@/components/AdminEmailDelivery";
import { AdminEmailTracking } from "@/components/AdminEmailTracking";
import { AdminEmailMonitoring } from "@/components/AdminEmailMonitoring";
import { AdminSystemHealth } from "@/components/AdminSystemHealth";
import { AdminSystemHealthMetrics } from "@/components/AdminSystemHealthMetrics";
import { AdminAPIMonitoring } from "@/components/AdminAPIMonitoring";
import { AdminErrorTracking } from "@/components/AdminErrorTracking";
import { AdminAuditTab } from "./AdminDashboard_AuditTab";
import { AdminNotificationCenter } from "@/components/AdminNotificationCenter";
import { AdminFeatureUsage } from "@/components/AdminFeatureUsage";
import { AdminAdvancedFeatureUsage } from "@/components/AdminAdvancedFeatureUsage";
import { AdminUsageTracking } from "@/components/AdminUsageTracking";
import { ABTestResults } from "@/components/ABTestResults";
import { AdminAnalyticsCharts } from "@/components/AdminAnalyticsCharts";
import { AdminDateRangeFilter, DateRange } from "@/components/AdminDateRangeFilter";
import { useSystemHealthMonitor } from "@/hooks/useSystemHealthMonitor";
import { AdminTrafficPage } from "@/components/admin/AdminTrafficPage";

type SectionId =
  | "overview" | "traffic"
  | "users" | "sessions" | "user-health" | "journey" | "cohorts" | "test-users"
  | "subscriptions"
  | "klaviyo" | "segments" | "mismatch"
  | "email-delivery" | "email-tracking" | "email-monitoring"
  | "system-health" | "api" | "errors" | "audit" | "notifications"
  | "features" | "usage" | "abtests";

const NAV: { group: string; items: { id: SectionId; label: string; icon: any }[] }[] = [
  { group: "Overview", items: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "traffic", label: "Traffic", icon: Activity },
  ]},
  { group: "Users", items: [
    { id: "users", label: "All Users", icon: Users },
    { id: "sessions", label: "Sessions", icon: Eye },
    { id: "user-health", label: "User Health", icon: HeartPulse },
    { id: "journey", label: "Journey", icon: Route },
    { id: "cohorts", label: "Cohorts", icon: GitBranch },
    { id: "test-users", label: "Test Users", icon: FlaskConical },
  ]},
  { group: "Revenue", items: [
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  ]},
  { group: "Klaviyo & Segments", items: [
    { id: "klaviyo", label: "Klaviyo Keys", icon: KeyRound },
    { id: "segments", label: "Segment Analytics", icon: Layers },
    { id: "mismatch", label: "Mismatch Reports", icon: MessageSquareWarning },
  ]},
  { group: "Email", items: [
    { id: "email-delivery", label: "Delivery", icon: Mail },
    { id: "email-tracking", label: "Tracking", icon: MailCheck },
    { id: "email-monitoring", label: "Monitoring", icon: MailWarning },
  ]},
  { group: "System", items: [
    { id: "system-health", label: "Health", icon: ServerCog },
    { id: "api", label: "API Monitoring", icon: Cpu },
    { id: "errors", label: "Errors", icon: AlertOctagon },
    { id: "audit", label: "Audit Log", icon: ScrollText },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]},
  { group: "Product", items: [
    { id: "features", label: "Feature Usage", icon: Sparkles },
    { id: "usage", label: "Usage / Limits", icon: Gauge },
    { id: "abtests", label: "A/B Tests", icon: FlaskRound },
  ]},
];

const validIds = new Set<string>(NAV.flatMap(g => g.items.map(i => i.id)));

function AdminSidebarNav({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm leading-tight">Admin</p>
              <p className="text-xs text-muted-foreground">Aderai Control</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map(group => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active === item.id}
                      onClick={() => onSelect(item.id)}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        {!collapsed && (
          <a href="/admin/pricing-preview" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">
            Pricing Preview →
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

const OverviewSection = () => {
  const [stats, setStats] = useState({ users: 0, verified: 0, klaviyoKeys: 0, activeKeys: 0, emails: 0, errors: 0 });
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  useEffect(() => {
    (async () => {
      const [u, k, e, se] = await Promise.all([
        supabase.from("users").select("id,email_verified", { count: "exact" }),
        supabase.from("klaviyo_keys").select("id,is_active", { count: "exact" }),
        supabase.from("email_audit_log").select("id", { count: "exact", head: true }),
        supabase.from("segment_creation_errors").select("id,resolved_at", { count: "exact" }),
      ]);
      setStats({
        users: u.count || 0,
        verified: (u.data || []).filter((x: any) => x.email_verified).length,
        klaviyoKeys: k.count || 0,
        activeKeys: (k.data || []).filter((x: any) => x.is_active).length,
        emails: e.count || 0,
        errors: (se.data || []).filter((x: any) => !x.resolved_at).length,
      });
    })();
  }, []);

  const card = (title: string, value: number | string, sub: string) => (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-sm text-muted-foreground">Live system snapshot.</p>
        </div>
        <AdminDateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {card("Total Users", stats.users, `${stats.verified} verified`)}
        {card("Klaviyo Keys", stats.klaviyoKeys, `${stats.activeKeys} active`)}
        {card("Emails Sent", stats.emails, "lifetime")}
        {card("Open Errors", stats.errors, "unresolved segment errors")}
      </div>
      <AdminAnalyticsCharts />
    </div>
  );
};

const KlaviyoKeysSection = () => {
  const [keys, setKeys] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("klaviyo_keys")
        .select("*, users(email, account_name)")
        .order("created_at", { ascending: false });
      setKeys(data || []);
    })();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Klaviyo API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No Klaviyo keys connected yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead><TableHead>User</TableHead>
                <TableHead>Status</TableHead><TableHead>Currency</TableHead>
                <TableHead>AOV</TableHead><TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k: any) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.client_name || "N/A"}</TableCell>
                  <TableCell>{k.users?.email}</TableCell>
                  <TableCell><Badge variant={k.is_active ? "default" : "destructive"}>{k.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>{k.currency}</TableCell>
                  <TableCell>{k.currency_symbol}{k.aov}</TableCell>
                  <TableCell>{new Date(k.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const AuditSection = () => {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      setLogs(data || []);
    })();
  }, []);
  return <AdminAuditTab auditLogs={logs} />;
};

const renderSection = (id: SectionId) => {
  switch (id) {
    case "overview": return <OverviewSection />;
    case "traffic": return <AdminTrafficPage />;
    case "users": return <AdminUserManagement />;
    case "sessions": return <AdminUserSessions />;
    case "user-health": return <AdminUserHealth />;
    case "journey": return <AdminUserJourneyAnalytics />;
    case "cohorts": return <AdminCohortAnalysis />;
    case "test-users": return <AdminTestUserManagement />;
    case "subscriptions": return <AdminSubscriptionMonitoring />;
    case "klaviyo": return <KlaviyoKeysSection />;
    case "segments": return <AdminSegmentAnalytics />;
    case "mismatch": return <AdminSegmentMismatchReports />;
    case "email-delivery": return <AdminEmailDelivery />;
    case "email-tracking": return <AdminEmailTracking />;
    case "email-monitoring": return <AdminEmailMonitoring />;
    case "system-health": return <div className="space-y-6"><AdminSystemHealthMetrics /><AdminSystemHealth /></div>;
    case "api": return <AdminAPIMonitoring />;
    case "errors": return <AdminErrorTracking />;
    case "audit": return <AuditSection />;
    case "notifications": return <AdminNotificationCenter />;
    case "features": return <div className="space-y-6"><AdminFeatureUsage /><AdminAdvancedFeatureUsage /></div>;
    case "usage": return <AdminUsageTracking />;
    case "abtests": return <ABTestResults testName="hero-headline" />;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const initialHash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const [section, setSection] = useState<SectionId>(
    validIds.has(initialHash) ? (initialHash as SectionId) : "overview"
  );

  useSystemHealthMonitor();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/admin-login"); return; }
        const { data: isAdminUser, error } = await supabase.rpc("is_admin");
        if (error || !isAdminUser) {
          toast.error("Access denied. Admin privileges required.");
          await supabase.auth.signOut();
          navigate("/admin-login");
          return;
        }
        setIsAdmin(true);
      } catch (e) {
        console.error(e);
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({}, "", `/admin#${section}`);
  }, [section]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
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

  return (
    <PageErrorBoundary pageName="Admin Dashboard">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebarNav active={section} onSelect={setSection} />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-lg font-semibold leading-tight">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground leading-tight">System Management & Analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AdminNotificationCenter />
                <Button variant="outline" size="icon" onClick={handleSignOut} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-x-auto">
              <PageErrorBoundary pageName={`Admin: ${section}`}>
                {renderSection(section)}
              </PageErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </PageErrorBoundary>
  );
};

export default AdminDashboard;
