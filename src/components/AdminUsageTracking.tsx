import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Zap, Activity, Sparkles, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const AdminUsageTracking = () => {
  const [usageData, setUsageData] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    activeKlaviyoKeys: 0,
    totalSegmentsCreated: 0,
    totalAISuggestions: 0,
    usersHittingLimits: 0,
    avgAISuggestionsPerUser: 0,
    dailySignups: [] as any[],
    segmentCreationTrend: [] as any[],
    aiUsageTrend: [] as any[]
  });

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      // Get total users
      const { data: users } = await supabase
        .from("users")
        .select("created_at, email_verified");

      const totalUsers = users?.length || 0;
      const verifiedUsers = users?.filter(u => u.email_verified).length || 0;

      // Get active Klaviyo keys
      const { data: klaviyoKeys } = await supabase
        .from("klaviyo_keys")
        .select("id")
        .eq("is_active", true);

      const activeKlaviyoKeys = klaviyoKeys?.length || 0;

      // Get segment creation stats
      const { data: aiSuggestions } = await supabase
        .from("ai_suggestions")
        .select("created_at, created_segments");

      let totalSegmentsCreated = 0;
      aiSuggestions?.forEach(suggestion => {
        const segments = suggestion.created_segments as any[];
        totalSegmentsCreated += segments?.length || 0;
      });

      // Generate daily signups trend (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const dailySignups = last30Days.map(date => {
        const signups = users?.filter(u => 
          u.created_at?.split('T')[0] === date
        ).length || 0;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signups
        };
      });

      // Generate segment creation trend (last 14 days)
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return date.toISOString().split('T')[0];
      });

      const segmentCreationTrend = last14Days.map(date => {
        let segments = 0;
        aiSuggestions?.forEach(suggestion => {
          if (suggestion.created_at?.split('T')[0] === date) {
            const createdSegments = suggestion.created_segments as any[];
            segments += createdSegments?.length || 0;
          }
        });
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          segments
        };
      });

      // Get AI usage limits data
      const { data: usageLimits } = await supabase
        .from("usage_limits")
        .select("ai_suggestions_today, ai_suggestions_total");

      const totalAISuggestions = usageLimits?.reduce((sum, limit) => sum + limit.ai_suggestions_total, 0) || 0;
      const usersHittingLimits = usageLimits?.filter(limit => limit.ai_suggestions_today >= 10).length || 0;
      const avgAISuggestionsPerUser = Math.round(totalAISuggestions / (totalUsers || 1));

      // Generate AI usage trend (last 14 days)
      const { data: analyticsEvents } = await supabase
        .from("analytics_events")
        .select("created_at, event_metadata")
        .eq("event_name", "ai_suggestion_used")
        .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

      const aiUsageTrend = last14Days.map(date => {
        const usage = analyticsEvents?.filter(event => 
          event.created_at?.split('T')[0] === date
        ).length || 0;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          usage
        };
      });

      setUsageData({
        totalUsers,
        verifiedUsers,
        activeKlaviyoKeys,
        totalSegmentsCreated,
        totalAISuggestions,
        usersHittingLimits,
        avgAISuggestionsPerUser,
        dailySignups,
        segmentCreationTrend,
        aiUsageTrend
      });
    } catch (error) {
      console.error("Failed to load usage data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageData.verifiedUsers} verified ({Math.round((usageData.verifiedUsers / usageData.totalUsers) * 100) || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Klaviyo Keys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.activeKlaviyoKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.totalSegmentsCreated}</div>
            <p className="text-xs text-muted-foreground mt-1">Created by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Segments/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(usageData.totalSegmentsCreated / (usageData.totalUsers || 1))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per active user</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total AI Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.totalAISuggestions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime usage (for cost monitoring)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users at Limit</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.usersHittingLimits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hit 10/day limit today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg AI/User/Day</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.avgAISuggestionsPerUser}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average suggestions per user
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Signups (Last 30 Days)</CardTitle>
          <CardDescription>Daily new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData.dailySignups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="signups" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segment Creation Activity (Last 14 Days)</CardTitle>
          <CardDescription>Segments created per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData.segmentCreationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="segments" 
                fill="hsl(var(--accent))" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions Usage (Last 14 Days)</CardTitle>
          <CardDescription>AI suggestions generated per day (for cost monitoring)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData.aiUsageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
