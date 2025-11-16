import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Target, Calendar, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CampaignResult {
  id: string;
  segmentName: string;
  revenue: number;
  date: string;
  campaignName: string;
}

export const ROITracker = () => {
  const [campaigns, setCampaigns] = useState<CampaignResult[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    segmentName: "",
    revenue: "",
    date: new Date().toISOString().split('T')[0],
    campaignName: ""
  });
  const { toast } = useToast();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aderai_campaigns');
    if (saved) {
      setCampaigns(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aderai_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const addCampaign = () => {
    if (!newCampaign.segmentName || !newCampaign.revenue || !newCampaign.campaignName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const campaign: CampaignResult = {
      id: Date.now().toString(),
      segmentName: newCampaign.segmentName,
      revenue: parseFloat(newCampaign.revenue),
      date: newCampaign.date,
      campaignName: newCampaign.campaignName
    };

    setCampaigns([campaign, ...campaigns]);
    setNewCampaign({
      segmentName: "",
      revenue: "",
      date: new Date().toISOString().split('T')[0],
      campaignName: ""
    });

    toast({
      title: "Campaign added!",
      description: `${campaign.campaignName} tracked successfully`,
    });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast({
      title: "Campaign removed",
      description: "Campaign has been deleted from tracking",
    });
  };

  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const averageRevenue = campaigns.length > 0 ? totalRevenue / campaigns.length : 0;
  const monthlyRevenue = campaigns
    .filter(c => {
      const campaignDate = new Date(c.date);
      const now = new Date();
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return campaignDate >= monthAgo;
    })
    .reduce((sum, c) => sum + c.revenue, 0);

  // Popular segments
  const segmentStats = campaigns.reduce((acc, c) => {
    if (!acc[c.segmentName]) {
      acc[c.segmentName] = { count: 0, revenue: 0 };
    }
    acc[c.segmentName].count++;
    acc[c.segmentName].revenue += c.revenue;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const topSegments = Object.entries(segmentStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          ROI Tracker
        </h2>
        <p className="text-muted-foreground">
          Track campaign results and measure your revenue impact from Aderai segments
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue Generated</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {campaigns.length} campaigns
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Last 30 Days</span>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            ${monthlyRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Recent performance
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/5 to-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Average per Campaign</span>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold text-accent">
            ${averageRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per campaign revenue
          </p>
        </Card>
      </div>

      {/* Add New Campaign */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Add Campaign Result</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="Black Friday VIP Campaign"
              value={newCampaign.campaignName}
              onChange={(e) => setNewCampaign({ ...newCampaign, campaignName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="segment">Segment Used</Label>
            <Select
              value={newCampaign.segmentName}
              onValueChange={(value) => setNewCampaign({ ...newCampaign, segmentName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vip-customers">VIP Customers</SelectItem>
                <SelectItem value="high-value">High Value Customers</SelectItem>
                <SelectItem value="recent-customers">Recent Customers</SelectItem>
                <SelectItem value="repeat-customers">Repeat Customers</SelectItem>
                <SelectItem value="at-risk">At-Risk Customers</SelectItem>
                <SelectItem value="cart-abandoners">Cart Abandoners</SelectItem>
                <SelectItem value="engaged-subscribers">Engaged Subscribers</SelectItem>
                <SelectItem value="custom">Custom Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="revenue">Revenue Generated</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="revenue"
                type="number"
                placeholder="5000"
                className="pl-7"
                value={newCampaign.revenue}
                onChange={(e) => setNewCampaign({ ...newCampaign, revenue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Campaign Date</Label>
            <Input
              id="date"
              type="date"
              value={newCampaign.date}
              onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
            />
          </div>
        </div>

        <Button 
          onClick={addCampaign}
          className="mt-4 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Campaign
        </Button>
      </Card>

      {/* Top Performing Segments */}
      {topSegments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Top Performing Segments</h3>
          <div className="space-y-3">
            {topSegments.map(([segment, stats], idx) => (
              <div key={segment} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold capitalize">{segment.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">{stats.count} campaigns</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${stats.revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    ${Math.round(stats.revenue / stats.count).toLocaleString()} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Campaign History */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Campaign History</h3>
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No campaigns tracked yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first campaign result above to start tracking ROI
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold">{campaign.campaignName}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {campaign.segmentName.replace(/-/g, ' ')} • {new Date(campaign.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">
                      ${campaign.revenue.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCampaign(campaign.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
