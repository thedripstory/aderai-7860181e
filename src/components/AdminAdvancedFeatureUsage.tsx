import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, BarChart3, Settings, TrendingUp } from "lucide-react";

interface FeatureUsageStats {
  aiTotalUsed: number;
  aiAvgPerUser: number;
  aiConversionRate: number;
  analyticsViewers: number;
  analyticsPercentage: number;
  settingsCompleted: number;
  settingsPercentage: number;
  totalUsers: number;
}

export const AdminAdvancedFeatureUsage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FeatureUsageStats>({
    aiTotalUsed: 0,
    aiAvgPerUser: 0,
    aiConversionRate: 0,
    analyticsViewers: 0,
    analyticsPercentage: 0,
    settingsCompleted: 0,
    settingsPercentage: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadFeatureUsage();
  }, []);

  const loadFeatureUsage = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // AI Usage Statistics
      const { data: usageLimits } = await supabase
        .from("usage_limits")
        .select("ai_suggestions_total");

      const aiTotalUsed = usageLimits?.reduce((sum, u) => sum + (u.ai_suggestions_total || 0), 0) || 0;
      const aiAvgPerUser = totalUsers && totalUsers > 0 ? aiTotalUsed / totalUsers : 0;

      // AI Conversion Rate (suggestions → created segments)
      const { data: aiSuggestions } = await supabase
        .from("ai_suggestions")
        .select("suggested_segments, created_segments");

      let totalSuggestions = 0;
      let totalCreated = 0;

      aiSuggestions?.forEach(suggestion => {
        const suggested = (suggestion.suggested_segments as any[]) || [];
        const created = (suggestion.created_segments as any[]) || [];
        totalSuggestions += suggested.length;
        totalCreated += created.length;
      });

      const aiConversionRate = totalSuggestions > 0 ? (totalCreated / totalSuggestions) * 100 : 0;

      // Analytics Viewers
      const { data: analyticsEvents } = await supabase
        .from("analytics_events")
        .select("user_id")
        .eq("event_name", "analytics_viewed");

      const uniqueAnalyticsViewers = new Set(analyticsEvents?.map(e => e.user_id) || []).size;
      const analyticsPercentage = totalUsers && totalUsers > 0 ? (uniqueAnalyticsViewers / totalUsers) * 100 : 0;

      // Settings Completed (users with Klaviyo keys)
      const { count: settingsCompleted } = await supabase
        .from("klaviyo_keys")
        .select("*", { count: "exact", head: true });

      const settingsPercentage = totalUsers && totalUsers > 0 ? ((settingsCompleted || 0) / totalUsers) * 100 : 0;

      setStats({
        aiTotalUsed,
        aiAvgPerUser,
        aiConversionRate,
        analyticsViewers: uniqueAnalyticsViewers,
        analyticsPercentage,
        settingsCompleted: settingsCompleted || 0,
        settingsPercentage,
        totalUsers: totalUsers || 0,
      });
    } catch (error) {
      console.error("Error loading feature usage:", error);
    } finally {
      setLoading(false);
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
          <CardDescription>Track how users engage with key features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* AI Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Total usage and conversion metrics
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 pl-12">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold">{stats.aiTotalUsed}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg per User</p>
                <p className="text-2xl font-bold">{stats.aiAvgPerUser.toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-500">{stats.aiConversionRate.toFixed(1)}%</p>
                <Progress value={stats.aiConversionRate} className="h-2" />
              </div>
            </div>
          </div>

          {/* Analytics Viewing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Analytics Viewing</h3>
                <p className="text-sm text-muted-foreground">
                  Users who have viewed analytics
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pl-12">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Viewers</p>
                <p className="text-2xl font-bold">{stats.analyticsViewers}</p>
                <p className="text-xs text-muted-foreground">
                  out of {stats.totalUsers} total users
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Adoption Rate</p>
                <p className="text-2xl font-bold text-blue-500">{stats.analyticsPercentage.toFixed(1)}%</p>
                <Progress value={stats.analyticsPercentage} className="h-2" />
              </div>
            </div>
          </div>

          {/* Settings Completion */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Settings Completion</h3>
                <p className="text-sm text-muted-foreground">
                  Users who completed Klaviyo setup
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pl-12">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.settingsCompleted}</p>
                <p className="text-xs text-muted-foreground">
                  out of {stats.totalUsers} total users
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-500">{stats.settingsPercentage.toFixed(1)}%</p>
                <Progress value={stats.settingsPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
