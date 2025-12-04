import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CreditCard, Users, TrendingUp, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalRevenue}/month MRR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Cancellations</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCancellations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled to cancel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canceledSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total churned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Subscription events
            </p>
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
