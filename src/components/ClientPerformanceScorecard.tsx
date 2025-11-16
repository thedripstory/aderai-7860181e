import { useState } from "react";
import { TrendingUp, DollarSign, Users, Mail, Target, Download, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useClientPerformanceMetrics } from "@/hooks/useClientPerformanceMetrics";

export const ClientPerformanceScorecard = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("30days");
  const { toast } = useToast();
  const { clients, loading } = useClientPerformanceMetrics(timeframe);

  // Set first client as selected when data loads
  if (!selectedClientId && clients.length > 0) {
    setSelectedClientId(clients[0].clientId);
  }

  const currentMetrics = clients.find(c => c.clientId === selectedClientId);

  const exportPDF = () => {
    toast({
      title: "Export Coming Soon",
      description: "PDF export functionality will be available soon. This feature will generate white-label reports.",
    });
  };

  const scheduleQBR = () => {
    toast({
      title: "QBR Scheduled",
      description: `Quarterly Business Review scheduled for ${currentMetrics?.clientName}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading client metrics...</p>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Clients Found</h3>
          <p className="text-muted-foreground mb-4">
            Add clients to your agency to start tracking their performance.
          </p>
        </Card>
      </div>
    );
  }

  if (!currentMetrics) {
    return null;
  }

  return (
    <div className="space-y-6" id="scorecard-content">
      {/* Header with Controls */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Client Performance Scorecard
          </h2>
          <p className="text-muted-foreground">
            Track and report on client success metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.clientId} value={client.clientId}>
                  {client.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Client Header Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">{currentMetrics.clientName}</h3>
            <p className="text-sm text-muted-foreground">
              Last synced: {new Date(currentMetrics.lastSync).toLocaleString()}
            </p>
          </div>
          <Badge className="text-lg px-4 py-2">
            {currentMetrics.activeSegments} / {currentMetrics.segments} Segments Active
          </Badge>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            ${currentMetrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            +{currentMetrics.revenueGrowth.toFixed(1)}% growth
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Emails Sent</span>
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{currentMetrics.emailsSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2">Across all segments</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Engagement Rate</span>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold">{currentMetrics.engagementRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-2">Average across campaigns</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Segments</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{currentMetrics.activeSegments}</div>
          <p className="text-xs text-muted-foreground mt-2">Currently running</p>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Top Performing Segments</h3>
        {currentMetrics.topSegments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No segment data available</p>
        ) : (
          <div className="space-y-4">
            {currentMetrics.topSegments.map((segment, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-muted-foreground">{segment.profiles.toLocaleString()} profiles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${(segment.revenue / 1000).toFixed(1)}k</p>
                    <p className="text-sm text-muted-foreground">{segment.engagement.toFixed(1)}% engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button size="lg" onClick={exportPDF} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export White-Label PDF
        </Button>
        <Button size="lg" variant="outline" onClick={scheduleQBR} className="flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule QBR
        </Button>
      </div>

      {/* Recommendations Section */}
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-background border-accent">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          Recommendations
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-background rounded-lg border">
            <h4 className="font-semibold text-accent mb-2">Optimize High Performers</h4>
            <p className="text-sm text-muted-foreground">
              Your top segments are performing well. Consider increasing email frequency by 15% to maximize revenue.
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <h4 className="font-semibold text-accent mb-2">Re-engage Inactive Segments</h4>
            <p className="text-sm text-muted-foreground">
              {currentMetrics.segments - currentMetrics.activeSegments} segments are inactive. Review and reactivate potential high-value segments.
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <h4 className="font-semibold text-accent mb-2">Expand VIP Program</h4>
            <p className="text-sm text-muted-foreground">
              Your VIP segment shows strong engagement. Consider creating a VIP+ tier for top 10% performers.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
