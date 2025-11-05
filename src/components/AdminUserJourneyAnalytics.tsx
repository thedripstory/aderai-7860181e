import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, CheckCircle, Key, Users, TrendingUp, AlertTriangle,
  ArrowRight, ArrowDown, BarChart3 
} from "lucide-react";

interface JourneyMetrics {
  totalSignups: number;
  onboardingCompleted: number;
  klaviyoSetupCompleted: number;
  firstSegmentCreated: number;
  activeUsers: number;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
  dropOff: number;
  icon: any;
}

export function AdminUserJourneyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<JourneyMetrics>({
    totalSignups: 0,
    onboardingCompleted: 0,
    klaviyoSetupCompleted: 0,
    firstSegmentCreated: 0,
    activeUsers: 0,
  });
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [eventStats, setEventStats] = useState<any[]>([]);

  useEffect(() => {
    loadJourneyMetrics();
  }, []);

  const loadJourneyMetrics = async () => {
    try {
      // Load all users
      const { data: allUsers } = await supabase
        .from("users")
        .select("id, onboarding_completed, klaviyo_setup_completed, created_at");

      if (!allUsers) return;

      const totalSignups = allUsers.length;
      const onboardingCompleted = allUsers.filter(u => u.onboarding_completed).length;
      const klaviyoSetupCompleted = allUsers.filter(u => u.klaviyo_setup_completed).length;

      // Load first segment creation events
      const { data: segmentEvents } = await supabase
        .from("analytics_events")
        .select("user_id")
        .eq("event_name", "first_segment_created");

      const firstSegmentCreated = segmentEvents?.length || 0;

      // Count active users (have klaviyo keys)
      const { data: activeUsersData } = await supabase
        .from("klaviyo_keys")
        .select("user_id")
        .eq("is_active", true);

      const uniqueActiveUsers = new Set(activeUsersData?.map(k => k.user_id) || []).size;

      setMetrics({
        totalSignups,
        onboardingCompleted,
        klaviyoSetupCompleted,
        firstSegmentCreated,
        activeUsers: uniqueActiveUsers,
      });

      // Calculate conversion funnel
      const funnel: ConversionFunnel[] = [
        {
          stage: "Sign Up",
          count: totalSignups,
          percentage: 100,
          dropOff: 0,
          icon: UserPlus,
        },
        {
          stage: "Onboarding Complete",
          count: onboardingCompleted,
          percentage: totalSignups > 0 ? (onboardingCompleted / totalSignups) * 100 : 0,
          dropOff: totalSignups - onboardingCompleted,
          icon: CheckCircle,
        },
        {
          stage: "Klaviyo Setup",
          count: klaviyoSetupCompleted,
          percentage: totalSignups > 0 ? (klaviyoSetupCompleted / totalSignups) * 100 : 0,
          dropOff: onboardingCompleted - klaviyoSetupCompleted,
          icon: Key,
        },
        {
          stage: "First Segment Created",
          count: firstSegmentCreated,
          percentage: totalSignups > 0 ? (firstSegmentCreated / totalSignups) * 100 : 0,
          dropOff: klaviyoSetupCompleted - firstSegmentCreated,
          icon: Users,
        },
        {
          stage: "Active Users",
          count: uniqueActiveUsers,
          percentage: totalSignups > 0 ? (uniqueActiveUsers / totalSignups) * 100 : 0,
          dropOff: firstSegmentCreated - uniqueActiveUsers,
          icon: TrendingUp,
        },
      ];

      setConversionFunnel(funnel);

      // Load event statistics
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (events) {
        // Aggregate events by name
        const eventCounts = events.reduce((acc: any, event: any) => {
          acc[event.event_name] = (acc[event.event_name] || 0) + 1;
          return acc;
        }, {});

        const sortedEvents = Object.entries(eventCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10);

        setEventStats(sortedEvents);
      }
    } catch (error) {
      console.error("Error loading journey metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sign Ups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSignups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onboardingCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSignups > 0
                ? ((metrics.onboardingCompleted / metrics.totalSignups) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klaviyo Setup</CardTitle>
            <Key className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.klaviyoSetupCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSignups > 0
                ? ((metrics.klaviyoSetupCompleted / metrics.totalSignups) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">First Segment</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.firstSegmentCreated}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSignups > 0
                ? ((metrics.firstSegmentCreated / metrics.totalSignups) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSignups > 0
                ? ((metrics.activeUsers / metrics.totalSignups) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey progression and drop-off points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => {
              const Icon = stage.icon;
              const isLastStage = index === conversionFunnel.length - 1;
              
              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{stage.stage}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stage.count} users ({stage.percentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stage.count}</div>
                        {stage.dropOff > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            -{stage.dropOff} drop-off
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!isLastStage && stage.dropOff > 0 && (
                    <div className="flex items-center gap-2 pl-8 text-sm text-muted-foreground">
                      <ArrowDown className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">
                        {((stage.dropOff / conversionFunnel[index].count) * 100).toFixed(1)}% dropped off
                      </span>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                  
                  {!isLastStage && (
                    <div className="flex justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top User Events</CardTitle>
          <CardDescription>Most tracked events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventStats.map((event: any, index) => (
              <div key={event.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{event.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold">{event.count}</span>
                </div>
              </div>
            ))}
            {eventStats.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No events tracked yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
