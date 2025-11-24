import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CohortData {
  cohort: string;
  day1: number;
  day7: number;
  day30: number;
  totalUsers: number;
}

export const AdminCohortAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [groupBy, setGroupBy] = useState<"week" | "month">("week");

  useEffect(() => {
    loadCohortData();
  }, [groupBy]);

  const loadCohortData = async () => {
    setLoading(true);
    try {
      // Fetch all users with their creation and activity dates
      const { data: users, error } = await supabase
        .from("users")
        .select("id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!users || users.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch analytics events to determine activity
      const { data: events } = await supabase
        .from("analytics_events")
        .select("user_id, created_at");

      // Group users by cohort
      const cohorts = new Map<string, { users: Set<string>; day1Active: Set<string>; day7Active: Set<string>; day30Active: Set<string> }>();

      for (const user of users) {
        const createdAt = new Date(user.created_at);
        const cohortKey = groupBy === "week" 
          ? format(startOfWeek(createdAt), "yyyy-MM-dd")
          : format(startOfMonth(createdAt), "yyyy-MM");

        if (!cohorts.has(cohortKey)) {
          cohorts.set(cohortKey, {
            users: new Set(),
            day1Active: new Set(),
            day7Active: new Set(),
            day30Active: new Set(),
          });
        }

        const cohort = cohorts.get(cohortKey)!;
        cohort.users.add(user.id);

        // Check activity within retention windows
        const userEvents = events?.filter(e => e.user_id === user.id) || [];
        
        for (const event of userEvents) {
          const eventDate = new Date(event.created_at);
          const daysSinceSignup = Math.floor((eventDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceSignup <= 1) cohort.day1Active.add(user.id);
          if (daysSinceSignup <= 7) cohort.day7Active.add(user.id);
          if (daysSinceSignup <= 30) cohort.day30Active.add(user.id);
        }
      }

      // Convert to array and calculate retention percentages
      const cohortArray: CohortData[] = Array.from(cohorts.entries())
        .map(([cohort, data]) => ({
          cohort,
          totalUsers: data.users.size,
          day1: data.users.size > 0 ? (data.day1Active.size / data.users.size) * 100 : 0,
          day7: data.users.size > 0 ? (data.day7Active.size / data.users.size) * 100 : 0,
          day30: data.users.size > 0 ? (data.day30Active.size / data.users.size) * 100 : 0,
        }))
        .slice(0, 12); // Last 12 cohorts

      setCohortData(cohortArray.reverse());
    } catch (error) {
      console.error("Error loading cohort data:", error);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Cohort Analysis
              </CardTitle>
              <CardDescription>Retention rates by signup cohort</CardDescription>
            </div>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "week" | "month")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {cohortData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No cohort data available yet</p>
            </div>
          ) : (
            <>
              <div className="h-80 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" angle={-45} textAnchor="end" height={80} />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => `Cohort: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="day1" 
                      name="Day 1" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="day7" 
                      name="Day 7" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="day30" 
                      name="Day 30" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4">
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Cohort</th>
                        <th className="text-right p-3 font-medium">Users</th>
                        <th className="text-right p-3 font-medium">Day 1</th>
                        <th className="text-right p-3 font-medium">Day 7</th>
                        <th className="text-right p-3 font-medium">Day 30</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((cohort) => (
                        <tr key={cohort.cohort} className="border-t">
                          <td className="p-3 font-medium">{cohort.cohort}</td>
                          <td className="p-3 text-right">{cohort.totalUsers}</td>
                          <td className="p-3 text-right text-green-600 font-medium">
                            {cohort.day1.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right text-orange-600 font-medium">
                            {cohort.day7.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right text-red-600 font-medium">
                            {cohort.day30.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
