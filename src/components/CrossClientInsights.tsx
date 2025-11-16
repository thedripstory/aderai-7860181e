import { useState } from "react";
import { BarChart3, TrendingUp, Users, Target, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrossClientInsights } from "@/hooks/useCrossClientInsights";

export const CrossClientInsights = () => {
  const [timeframe, setTimeframe] = useState("30days");
  const { portfolioMetrics, crossClientData, clientComparison, loading } = useCrossClientInsights(timeframe);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "good": return "bg-blue-100 text-blue-800 border-blue-300";
      case "needs-attention": return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading cross-client insights...</p>
        </div>
      </div>
    );
  }

  if (portfolioMetrics.totalClients === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Add clients and track their performance to see cross-client insights.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Cross-Client Insights
          </h2>
          <p className="text-muted-foreground">
            Portfolio-wide analytics and best practice identification
          </p>
        </div>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{portfolioMetrics.totalClients}</div>
          <div className="text-sm text-muted-foreground">Total Clients</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-background">
          <div className="text-2xl font-bold text-emerald-600">
            ${(portfolioMetrics.totalRevenue / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            ${(portfolioMetrics.avgRevenuePerClient / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-muted-foreground">Avg per Client</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{portfolioMetrics.totalSegments}</div>
          <div className="text-sm text-muted-foreground">Total Segments</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{portfolioMetrics.activeSegments}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{portfolioMetrics.avgEngagement}%</div>
          <div className="text-sm text-muted-foreground">Avg Engagement</div>
        </Card>
      </div>

      {/* Cross-Client Performance Comparison */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Client Performance Ranking</h3>
        <div className="space-y-2">
          {clientComparison.map((client, idx) => (
            <div
              key={client.name}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{client.name}</span>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {client.segments} segments • {client.engagement}% engagement
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    ${client.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    +{client.growth}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Best Practices Grid */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Cross-Client Best Practices</h3>
        <div className="space-y-4">
          {crossClientData.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 border border-border rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg mb-1">{metric.metric}</h4>
                  <p className="text-sm text-muted-foreground">
                    Portfolio Average: <span className="font-semibold">{metric.averageValue}</span>
                  </p>
                </div>
                <Target className="w-5 h-5 text-primary" />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs text-emerald-600 font-semibold mb-1">
                    🏆 Top Performer
                  </div>
                  <div className="font-bold">{metric.bestClient}</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {metric.bestValue}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xs text-amber-600 font-semibold mb-1">
                    ⚠️ Needs Improvement
                  </div>
                  <div className="font-bold">{metric.worstClient}</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {metric.worstValue}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-primary uppercase mb-1">
                    Recommended Action
                  </div>
                  <p className="text-sm">{metric.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategic Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Portfolio-Wide Strategic Recommendations
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>
              <strong>Replicate Success:</strong> Deploy Luxe Beauty's engagement tactics to Fashion Forward (+16.3% potential)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>
              <strong>Revenue Optimization:</strong> Share Premium Apparel's high-value customer nurture sequence across all clients
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>
              <strong>Segment Activation:</strong> Audit and optimize 45 inactive segments across 3 clients (potential $28K monthly)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>
              <strong>Cross-Pollination:</strong> Schedule workshop to share Outdoor Gear's cart recovery tactics
            </span>
          </li>
        </ul>

        <Button className="mt-4">
          <Users className="w-4 h-4 mr-2" />
          Schedule Cross-Client Strategy Session
        </Button>
      </Card>
    </div>
  );
};
