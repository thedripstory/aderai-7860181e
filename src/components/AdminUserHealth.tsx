import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, XCircle, Zap, Download } from "lucide-react";
import { subDays } from "date-fns";

interface UserHealthStats {
  active: number;
  atRisk: number;
  churned: number;
  powerUsers: number;
  activeUsers: any[];
  atRiskUsers: any[];
  churnedUsers: any[];
  powerUserList: any[];
}

export const AdminUserHealth = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserHealthStats>({
    active: 0,
    atRisk: 0,
    churned: 0,
    powerUsers: 0,
    activeUsers: [],
    atRiskUsers: [],
    churnedUsers: [],
    powerUserList: [],
  });

  useEffect(() => {
    loadUserHealth();
  }, []);

  const loadUserHealth = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, account_name, created_at");

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch recent analytics events
      const { data: events } = await supabase
        .from("analytics_events")
        .select("user_id, created_at")
        .gte("created_at", subDays(new Date(), 30).toISOString());

      // Fetch segment counts per user
      const { data: segments } = await supabase
        .from("ai_suggestions")
        .select("user_id, created_segments");

      // Calculate segment counts
      const segmentCounts = new Map<string, number>();
      segments?.forEach(seg => {
        const created = (seg.created_segments as any[]) || [];
        segmentCounts.set(seg.user_id, (segmentCounts.get(seg.user_id) || 0) + created.length);
      });

      // Categorize users
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);
      const thirtyDaysAgo = subDays(now, 30);

      const activeUsers: any[] = [];
      const atRiskUsers: any[] = [];
      const churnedUsers: any[] = [];
      const powerUserList: any[] = [];

      users.forEach(user => {
        // Get user's last activity
        const userEvents = events?.filter(e => e.user_id === user.id) || [];
        const lastActivity = userEvents.length > 0 
          ? new Date(Math.max(...userEvents.map(e => new Date(e.created_at).getTime())))
          : new Date(user.created_at);

        const segmentCount = segmentCounts.get(user.id) || 0;
        const userWithStats = { ...user, segmentCount, lastActivity };

        // Power users: >50 segments OR daily active
        const isDailyActive = userEvents.filter(e => 
          new Date(e.created_at) >= subDays(now, 1)
        ).length > 0;
        
        if (segmentCount > 50 || isDailyActive) {
          powerUserList.push(userWithStats);
        }

        // Categorize by last activity
        if (lastActivity >= sevenDaysAgo) {
          activeUsers.push(userWithStats);
        } else if (lastActivity >= fourteenDaysAgo) {
          atRiskUsers.push(userWithStats);
        } else if (lastActivity < thirtyDaysAgo) {
          churnedUsers.push(userWithStats);
        }
      });

      setStats({
        active: activeUsers.length,
        atRisk: atRiskUsers.length,
        churned: churnedUsers.length,
        powerUsers: powerUserList.length,
        activeUsers,
        atRiskUsers,
        churnedUsers,
        powerUserList,
      });
    } catch (error) {
      console.error("Error loading user health:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportUserHealth = () => {
    const csv = [
      ["Email", "Account Name", "Category", "Segment Count", "Last Activity"],
      ...stats.activeUsers.map(u => [u.email, u.account_name, "Active", u.segmentCount, u.lastActivity.toISOString()]),
      ...stats.atRiskUsers.map(u => [u.email, u.account_name, "At Risk", u.segmentCount, u.lastActivity.toISOString()]),
      ...stats.churnedUsers.map(u => [u.email, u.account_name, "Churned", u.segmentCount, u.lastActivity.toISOString()]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-health-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">No activity 14+ days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churned</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.churned}</div>
            <p className="text-xs text-muted-foreground mt-1">No activity 30+ days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Power Users</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.powerUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">&gt;50 segments or daily active</p>
          </CardContent>
        </Card>
      </div>

      {/* User Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Power Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Power Users
                </CardTitle>
                <CardDescription>Most engaged users</CardDescription>
              </div>
              <Button onClick={exportUserHealth} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.powerUserList.slice(0, 10).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/10">
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.account_name}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500 text-white">
                    {user.segmentCount} segments
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* At Risk Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              At Risk Users
            </CardTitle>
            <CardDescription>Need re-engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.atRiskUsers.slice(0, 10).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/10">
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.account_name}</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-500 text-white">
                    {user.segmentCount} segments
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
