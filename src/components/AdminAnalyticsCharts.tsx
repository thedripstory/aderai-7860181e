import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Mail, AlertCircle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdminAnalyticsCharts = () => {
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [segmentErrors, setSegmentErrors] = useState<any[]>([]);
  const [emailDelivery, setEmailDelivery] = useState<any[]>([]);
  const [emailByType, setEmailByType] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // User growth
    const { data: growthData } = await supabase
      .from("user_growth_analytics")
      .select("*")
      .order("date", { ascending: true })
      .limit(30);

    if (growthData) {
      setUserGrowth(growthData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers: d.new_users,
        totalUsers: d.total_users
      })));
    }

    // Segment errors
    const { data: errorData } = await supabase
      .from("segment_error_analytics")
      .select("*")
      .order("date", { ascending: true })
      .limit(30);

    if (errorData) {
      setSegmentErrors(errorData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: d.total_errors,
        resolved: d.resolved_errors,
        unresolved: d.unresolved_errors
      })));
    }

    // Email delivery over time
    const { data: emailData } = await supabase
      .from("email_delivery_analytics")
      .select("*")
      .order("date", { ascending: true })
      .limit(30);

    if (emailData) {
      // Aggregate by date
      const byDate = emailData.reduce((acc: any, curr) => {
        const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { date, total: 0, successful: 0, failed: 0 };
        }
        acc[date].total += curr.total_emails;
        acc[date].successful += curr.successful;
        acc[date].failed += curr.failed;
        return acc;
      }, {});

      setEmailDelivery(Object.values(byDate));

      // By email type
      const byType = emailData.reduce((acc: any, curr) => {
        if (!acc[curr.email_type]) {
          acc[curr.email_type] = { name: curr.email_type, value: 0 };
        }
        acc[curr.email_type].value += curr.total_emails;
        return acc;
      }, {});

      setEmailByType(Object.values(byType));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Growth Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>User Growth Trend</CardTitle>
          </div>
          <CardDescription>New user registrations over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="New Users" strokeWidth={2} />
              <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" name="Total Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Segment Errors Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Segment Creation Errors</CardTitle>
          </div>
          <CardDescription>Error trends and resolution rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentErrors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              <Bar dataKey="unresolved" fill="#ef4444" name="Unresolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Email Delivery Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Delivery Metrics</CardTitle>
          </div>
          <CardDescription>Success and failure rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emailDelivery}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successful" fill="#10b981" name="Delivered" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Email Types Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Email Distribution by Type</CardTitle>
          <CardDescription>Breakdown of emails sent by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emailByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {emailByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
