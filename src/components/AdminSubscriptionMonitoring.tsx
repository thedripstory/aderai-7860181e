import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CreditCard, Users, TrendingUp, AlertCircle, CheckCircle2, XCircle, Clock, DollarSign, TrendingDown, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from "recharts";

interface SubscriptionEvent {
  id: string;
  user_id: string;
  stripe_event_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface UserSubscription {
  id: string;
  email: string;
  account_name: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_canceled_at: string | null;
  created_at: string;
}

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  emerald: "#10b981",
  amber: "#f59e0b",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

export function AdminSubscriptionMonitoring() {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadEvents(), loadUserSubscriptions()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("subscription_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setEvents(data);
    }
  };

  const loadUserSubscriptions = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, account_name, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_start_date, subscription_end_date, subscription_canceled_at, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  // Calculate stats
  const activeSubscriptions = users.filter(u => u.subscription_status === 'active').length;
  const canceledSubscriptions = users.filter(u => u.subscription_status === 'canceled').length;
  const pendingCancellations = users.filter(u => u.subscription_canceled_at && u.subscription_status === 'active').length;
  const totalRevenue = activeSubscriptions * 9; // $9/month per active subscription

  // Calculate churn metrics
  const churnAnalytics = useMemo(() => {
    const totalEverSubscribed = users.filter(u => u.stripe_subscription_id).length;
    const churnRate = totalEverSubscribed > 0 
      ? ((canceledSubscriptions / totalEverSubscribed) * 100).toFixed(1) 
      : 0;
    
    // Calculate monthly churn data (last 6 months)
    const now = new Date();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
      
      const newSubs = users.filter(u => {
        if (!u.subscription_start_date) return false;
        const startDate = new Date(u.subscription_start_date);
        return startDate >= monthStart && startDate <= monthEnd;
      }).length;
      
      const churned = users.filter(u => {
        if (!u.subscription_canceled_at) return false;
        const cancelDate = new Date(u.subscription_canceled_at);
        return cancelDate >= monthStart && cancelDate <= monthEnd;
      }).length;
      
      // Estimate MRR for that month (simplified)
      const activeAtMonthEnd = users.filter(u => {
        if (!u.subscription_start_date) return false;
        const startDate = new Date(u.subscription_start_date);
        if (startDate > monthEnd) return false;
        if (u.subscription_canceled_at) {
          const cancelDate = new Date(u.subscription_canceled_at);
          if (cancelDate < monthEnd) return false;
        }
        return true;
      }).length;
      
      monthlyData.push({
        month: monthName,
        newSubscriptions: newSubs,
        churned: churned,
        mrr: activeAtMonthEnd * 9,
        active: activeAtMonthEnd,
      });
    }
    
    return {
      churnRate,
      totalEverSubscribed,
      monthlyData,
    };
  }, [users, canceledSubscriptions]);

  // Subscription status distribution for pie chart
  const statusDistribution = useMemo(() => {
    return [
      { name: 'Active', value: activeSubscriptions, color: CHART_COLORS.emerald },
      { name: 'Canceled', value: canceledSubscriptions, color: CHART_COLORS.muted },
      { name: 'Pending Cancel', value: pendingCancellations, color: CHART_COLORS.amber },
      { name: 'Inactive', value: users.filter(u => !u.subscription_status || u.subscription_status === 'inactive').length, color: '#6b7280' },
    ].filter(item => item.value > 0);
  }, [users, activeSubscriptions, canceledSubscriptions, pendingCancellations]);

  // Event type distribution
  const eventTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      const type = event.event_type.replace('customer.subscription.', '').replace('checkout.session.', '');
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'canceled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Trial</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('completed') || eventType.includes('created')) {
      return <Badge className="bg-emerald-500/20 text-emerald-600">{eventType}</Badge>;
    }
    if (eventType.includes('canceled') || eventType.includes('deleted')) {
      return <Badge variant="destructive">{eventType}</Badge>;
    }
    if (eventType.includes('failed')) {
      return <Badge variant="destructive">{eventType}</Badge>;
    }
    if (eventType.includes('updated') || eventType.includes('resumed')) {
      return <Badge className="bg-blue-500/20 text-blue-600">{eventType}</Badge>;
    }
    return <Badge variant="outline">{eventType}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              MRR @ $9/user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{churnAnalytics.churnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {canceledSubscriptions} of {churnAnalytics.totalEverSubscribed} churned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Cancels</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCancellations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              End of period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stripe webhooks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* MRR Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              MRR Trend
            </CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={churnAnalytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].payload.month}</p>
                            <p className="text-emerald-500">MRR: ${payload[0].value}</p>
                            <p className="text-muted-foreground text-sm">{payload[0].payload.active} active users</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke={CHART_COLORS.emerald}
                    fill={CHART_COLORS.emerald}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New vs Churned Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Subscriptions vs Churn
            </CardTitle>
            <CardDescription>New subscriptions vs cancellations by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnAnalytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].payload.month}</p>
                            <p className="text-emerald-500">New: {payload[0].payload.newSubscriptions}</p>
                            <p className="text-red-500">Churned: {payload[0].payload.churned}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="newSubscriptions" name="New" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.destructive} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Subscription Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of all user subscription statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].name}</p>
                            <p>{payload[0].value} users</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Event Types
            </CardTitle>
            <CardDescription>Distribution of Stripe webhook events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {eventTypeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventTypeDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      width={100}
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{payload[0].payload.name}</p>
                              <p>{payload[0].value} events</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No events recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Subscriptions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Subscription Status
            </CardTitle>
            <CardDescription>All users and their subscription status</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe Customer</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Canceled At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.account_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                  <TableCell>
                    {user.stripe_customer_id ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {user.stripe_customer_id.slice(0, 18)}...
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.subscription_start_date 
                      ? new Date(user.subscription_start_date).toLocaleDateString() 
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {user.subscription_end_date 
                      ? new Date(user.subscription_end_date).toLocaleDateString() 
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {user.subscription_canceled_at ? (
                      <span className="text-amber-600">
                        {new Date(user.subscription_canceled_at).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Events
          </CardTitle>
          <CardDescription>Recent subscription events from Stripe (last 100)</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No subscription events yet</p>
              <p className="text-sm">Events will appear here as users subscribe</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Stripe Event ID</TableHead>
                  <TableHead>Event Data</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{getEventBadge(event.event_type)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {event.stripe_event_id.slice(0, 25)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded max-w-xs truncate block">
                        {JSON.stringify(event.event_data).slice(0, 50)}...
                      </code>
                    </TableCell>
                    <TableCell>{new Date(event.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
