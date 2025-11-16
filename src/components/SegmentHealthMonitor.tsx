import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, Activity, RefreshCw, Bell, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SegmentHealth {
  id: string;
  name: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  currentSize: number;
  previousSize: number;
  engagementRate: number;
  lastChecked: string;
  recommendation?: string;
}

export const SegmentHealthMonitor = () => {
  const [segments, setSegments] = useState<SegmentHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data - in production this would come from Klaviyo API
  const mockSegments: SegmentHealth[] = [
    {
      id: "1",
      name: "VIP Customers",
      status: "healthy",
      trend: "up",
      currentSize: 1247,
      previousSize: 1189,
      engagementRate: 87,
      lastChecked: new Date().toISOString(),
      recommendation: "Segment performing well. Consider creating similar high-value segments."
    },
    {
      id: "2",
      name: "At-Risk Customers",
      status: "warning",
      trend: "up",
      currentSize: 523,
      previousSize: 412,
      engagementRate: 34,
      lastChecked: new Date().toISOString(),
      recommendation: "Size increasing by 27%. Deploy win-back campaigns immediately."
    },
    {
      id: "3",
      name: "Cart Abandoners",
      status: "critical",
      trend: "up",
      currentSize: 891,
      previousSize: 623,
      engagementRate: 21,
      lastChecked: new Date().toISOString(),
      recommendation: "Critical: 43% increase. Check checkout flow for issues. Deploy urgent recovery campaigns."
    },
    {
      id: "4",
      name: "Engaged Subscribers",
      status: "healthy",
      trend: "stable",
      currentSize: 3456,
      previousSize: 3442,
      engagementRate: 76,
      lastChecked: new Date().toISOString(),
      recommendation: "Stable engagement. Maintain current content strategy."
    },
    {
      id: "5",
      name: "Recent Customers",
      status: "warning",
      trend: "down",
      currentSize: 234,
      previousSize: 312,
      engagementRate: 62,
      lastChecked: new Date().toISOString(),
      recommendation: "25% decline in new customers. Review acquisition channels and landing page conversion."
    },
    {
      id: "6",
      name: "High-Value Customers",
      status: "healthy",
      trend: "up",
      currentSize: 789,
      previousSize: 756,
      engagementRate: 91,
      lastChecked: new Date().toISOString(),
      recommendation: "Growing nicely. Create exclusive campaigns to maintain loyalty."
    }
  ];

  useEffect(() => {
    // Load segments on mount
    refreshSegments();
  }, []);

  const refreshSegments = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSegments(mockSegments);
      setLoading(false);
      toast({
        title: "Health check complete",
        description: "All segments analyzed successfully",
      });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-emerald-600 bg-emerald-100 border-emerald-300";
      case "warning": return "text-amber-600 bg-amber-100 border-amber-300";
      case "critical": return "text-red-600 bg-red-100 border-red-300";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle2 className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "critical": return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const criticalCount = segments.filter(s => s.status === "critical").length;
  const warningCount = segments.filter(s => s.status === "warning").length;
  const healthyCount = segments.filter(s => s.status === "healthy").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Segment Health Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring and proactive alerts for all your segments
          </p>
        </div>
        <Button onClick={refreshSegments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-background border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Healthy Segments</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{healthyCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Performing well</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-background border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Needs Attention</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600">{warningCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500/5 to-background border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical Issues</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
        </Card>
      </div>

      {/* Alert Banner for Critical Issues */}
      {criticalCount > 0 && (
        <Card className="p-4 bg-red-50 border-red-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Critical Issues Detected</h3>
              <p className="text-sm text-red-800">
                {criticalCount} segment{criticalCount > 1 ? 's' : ''} require immediate attention. 
                Review recommendations below and take action.
              </p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Bell className="w-4 h-4 mr-2" />
              Set Alert
            </Button>
          </div>
        </Card>
      )}

      {/* Segments List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Segment Details</h3>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing segments...</p>
          </div>
        ) : (
          segments.map((segment) => (
            <Card key={segment.id} className={`p-6 border-2 transition-all hover:shadow-lg ${
              segment.status === 'critical' ? 'border-red-300 bg-red-50/50' :
              segment.status === 'warning' ? 'border-amber-300 bg-amber-50/50' :
              'border-emerald-300 bg-emerald-50/50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getStatusColor(segment.status)}`}>
                    {getStatusIcon(segment.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{segment.name}</h4>
                      <Badge variant={segment.status === 'healthy' ? 'default' : 'secondary'}>
                        {segment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {new Date(segment.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getTrendIcon(segment.trend)}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Size</div>
                  <div className="text-2xl font-bold">{segment.currentSize.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {segment.trend === 'up' ? '+' : segment.trend === 'down' ? '-' : ''}
                    {Math.abs(((segment.currentSize - segment.previousSize) / segment.previousSize) * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Previous Size</div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {segment.previousSize.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">7 days ago</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Engagement Rate</div>
                  <div className="text-2xl font-bold">{segment.engagementRate}%</div>
                  <div className={`text-xs ${
                    segment.engagementRate >= 70 ? 'text-emerald-600' :
                    segment.engagementRate >= 50 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {segment.engagementRate >= 70 ? 'Excellent' :
                     segment.engagementRate >= 50 ? 'Good' : 'Needs improvement'}
                  </div>
                </div>
              </div>

              {segment.recommendation && (
                <div className={`p-4 rounded-lg ${
                  segment.status === 'critical' ? 'bg-red-100 border border-red-300' :
                  segment.status === 'warning' ? 'bg-amber-100 border border-amber-300' :
                  'bg-emerald-100 border border-emerald-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <Bell className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      segment.status === 'critical' ? 'text-red-600' :
                      segment.status === 'warning' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`} />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                        Recommendation
                      </div>
                      <p className="text-sm">{segment.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Auto-refresh Notice */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>
            Segments are automatically monitored every 24 hours. Critical changes trigger instant alerts.
          </span>
        </div>
      </Card>
    </div>
  );
};
