import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Brain, 
  Users, 
  DollarSign,
  Mail,
  Activity
} from 'lucide-react';
import { SegmentPerformance } from '@/components/SegmentPerformance';
import { SegmentHistoricalTrends } from '@/components/SegmentHistoricalTrends';
import { CampaignPerformance } from './CampaignPerformance';
import { FlowPerformance } from './FlowPerformance';
import { AIInsightsPanel } from './AIInsightsPanel';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceDashboardProps {
  klaviyoKeyId: string;
  apiKey: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  klaviyoKeyId, 
  apiKey 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('segments');
  const [overviewStats, setOverviewStats] = useState({
    totalSegments: 0,
    totalCampaigns: 0,
    totalFlows: 0,
    totalProfiles: 0,
  });

  useEffect(() => {
    loadOverviewStats();
  }, [klaviyoKeyId]);

  const loadOverviewStats = async () => {
    try {
      // Load segment count from historical data
      const { count: segmentCount } = await supabase
        .from('segment_historical_data')
        .select('segment_klaviyo_id', { count: 'exact', head: true })
        .eq('klaviyo_key_id', klaviyoKeyId);

      // Get total profiles from most recent segment data
      const { data: profileData } = await supabase
        .from('segment_historical_data')
        .select('profile_count')
        .eq('klaviyo_key_id', klaviyoKeyId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      const totalProfiles = profileData?.reduce((sum, item) => sum + (item.profile_count || 0), 0) || 0;

      setOverviewStats({
        totalSegments: segmentCount || 0,
        totalCampaigns: 0, // Will be updated when campaigns load
        totalFlows: 0, // Will be updated when flows load
        totalProfiles,
      });
    } catch (error) {
      console.error('Error loading overview stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Segments',
      value: overviewStats.totalSegments,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Profiles',
      value: overviewStats.totalProfiles.toLocaleString(),
      icon: Activity,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Campaigns',
      value: overviewStats.totalCampaigns,
      icon: Mail,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Active Flows',
      value: overviewStats.totalFlows,
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub-tabs Navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-5 w-auto bg-muted/30 backdrop-blur-sm">
            <TabsTrigger value="segments" className="flex items-center gap-2 text-xs md:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Segments</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 text-xs md:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2 text-xs md:text-sm">
              <Mail className="w-4 h-4" />
              <span className="hidden md:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2 text-xs md:text-sm">
              <Zap className="w-4 h-4" />
              <span className="hidden md:inline">Flows</span>
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2 text-xs md:text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden md:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="segments" className="mt-0">
          <SegmentPerformance klaviyoKeyId={klaviyoKeyId} apiKey={apiKey} />
        </TabsContent>

        <TabsContent value="trends" className="mt-0">
          <SegmentHistoricalTrends klaviyoKeyId={klaviyoKeyId} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <CampaignPerformance 
            klaviyoKeyId={klaviyoKeyId} 
            apiKey={apiKey}
            onStatsUpdate={(count) => setOverviewStats(prev => ({ ...prev, totalCampaigns: count }))}
          />
        </TabsContent>

        <TabsContent value="flows" className="mt-0">
          <FlowPerformance 
            klaviyoKeyId={klaviyoKeyId} 
            apiKey={apiKey}
            onStatsUpdate={(count) => setOverviewStats(prev => ({ ...prev, totalFlows: count }))}
          />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-0">
          <AIInsightsPanel klaviyoKeyId={klaviyoKeyId} apiKey={apiKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
