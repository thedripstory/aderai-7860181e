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

interface ClientMetrics {
  clientName: string;
  segments: number;
  totalRevenue: number;
  emailsSent: number;
  engagementRate: number;
  revenueGrowth: number;
  activeSegments: number;
  lastSync: string;
}

export const ClientPerformanceScorecard = () => {
  const [selectedClient, setSelectedClient] = useState<string>("client1");
  const [timeframe, setTimeframe] = useState<string>("30days");
  const { toast } = useToast();

  // Mock client data - in production this would come from database
  const clientsData: Record<string, ClientMetrics> = {
    client1: {
      clientName: "Luxe Beauty Co.",
      segments: 65,
      totalRevenue: 127500,
      emailsSent: 45230,
      engagementRate: 34.5,
      revenueGrowth: 42,
      activeSegments: 58,
      lastSync: new Date().toISOString()
    },
    client2: {
      clientName: "Premium Apparel Brand",
      segments: 52,
      totalRevenue: 89400,
      emailsSent: 32100,
      engagementRate: 28.3,
      revenueGrowth: 31,
      activeSegments: 48,
      lastSync: new Date().toISOString()
    },
    client3: {
      clientName: "Outdoor Gear Co.",
      segments: 48,
      totalRevenue: 73200,
      emailsSent: 28900,
      engagementRate: 31.2,
      revenueGrowth: 25,
      activeSegments: 44,
      lastSync: new Date().toISOString()
    }
  };

  const currentMetrics = clientsData[selectedClient];

  const exportPDF = () => {
    toast({
      title: "Export Coming Soon",
      description: "PDF export functionality will be available soon. This feature will generate white-label reports.",
    });
  };

  const scheduleQBR = () => {
    toast({
      title: "QBR Scheduled",
      description: `Quarterly Business Review scheduled for ${currentMetrics.clientName}`,
    });
  };

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
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client1">Luxe Beauty Co.</SelectItem>
              <SelectItem value="client2">Premium Apparel</SelectItem>
              <SelectItem value="client3">Outdoor Gear Co.</SelectItem>
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
            +{currentMetrics.revenueGrowth}% growth
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
          <div className="text-3xl font-bold">{currentMetrics.engagementRate}%</div>
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
        <h3 className="text-xl font-bold mb-4">Top Performing Segments</h3>
        <div className="space-y-3">
          {[
            { name: "VIP Customers", revenue: 32400, emails: 1240, rate: 87 },
            { name: "High-Value Customers", revenue: 28900, emails: 2130, rate: 76 },
            { name: "Cart Abandoners", revenue: 19800, emails: 8940, rate: 42 },
            { name: "Recent Customers", revenue: 15600, emails: 3420, rate: 68 },
            { name: "Engaged Subscribers", revenue: 12300, emails: 5890, rate: 54 }
          ].map((segment, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold">{segment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {segment.emails.toLocaleString()} emails sent • {segment.rate}% engagement
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${segment.revenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Revenue generated</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={exportPDF} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export White-Label PDF
        </Button>
        <Button onClick={scheduleQBR} variant="outline" className="flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule QBR
        </Button>
      </div>

      {/* Recommendations */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Recommendations for {currentMetrics.clientName}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>Deploy win-back campaigns to "At-Risk Customers" segment (23% size increase detected)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>VIP segment showing strong performance - consider creating exclusive product launches</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span>Cart abandonment recovery performing well - increase frequency to 3 emails</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
