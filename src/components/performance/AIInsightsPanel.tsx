import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  Target,
  Users,
  Lightbulb,
  ArrowRight,
  Shield
} from 'lucide-react';
import { ChurnPredictor } from '@/components/ChurnPredictor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIInsightsPanelProps {
  klaviyoKeyId: string;
  apiKey: string;
}

interface SegmentRecommendation {
  id: string;
  name: string;
  description: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ klaviyoKeyId, apiKey }) => {
  const [activeInsightTab, setActiveInsightTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState<SegmentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis with mock recommendations
      // In production, this would call predict-segment-performance edge function
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockRecommendations: SegmentRecommendation[] = [
        {
          id: '1',
          name: 'Re-engage Dormant VIPs',
          description: 'High-value customers who haven\'t purchased in 60-90 days. Send personalized win-back campaign with exclusive offers.',
          expectedImpact: '+15-25% revenue recovery',
          priority: 'high',
          category: 'Win-back',
        },
        {
          id: '2',
          name: 'Convert Browse Abandoners',
          description: 'Users who viewed products 3+ times without adding to cart. Send targeted product recommendations.',
          expectedImpact: '+8-12% conversion rate',
          priority: 'high',
          category: 'Conversion',
        },
        {
          id: '3',
          name: 'Upsell Recent Buyers',
          description: 'Customers who purchased in last 30 days. Cross-sell complementary products based on purchase history.',
          expectedImpact: '+10-15% AOV increase',
          priority: 'medium',
          category: 'Revenue',
        },
        {
          id: '4',
          name: 'Reward Loyal Openers',
          description: 'Subscribers with 70%+ open rate. Offer early access or exclusive content to maintain engagement.',
          expectedImpact: '+5-8% retention',
          priority: 'medium',
          category: 'Engagement',
        },
        {
          id: '5',
          name: 'Reactivate Cold Leads',
          description: 'Subscribers who haven\'t opened in 90+ days but have past purchase history. Run sunset campaign.',
          expectedImpact: '2-5% reactivation rate',
          priority: 'low',
          category: 'List Health',
        },
      ];

      setRecommendations(mockRecommendations);
      setHasAnalyzed(true);
      toast.success('AI analysis complete', {
        description: `Generated ${mockRecommendations.length} actionable recommendations`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <CardDescription>
                  Get intelligent recommendations based on your Klaviyo data
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={generateRecommendations} 
              disabled={loading}
              className="shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Tabs */}
      <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Churn Risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-6">
          {!hasAnalyzed ? (
            <Card className="p-12 text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Click "Generate Insights" to run AI analysis on your Klaviyo data and get personalized segment recommendations.
              </p>
              <Button onClick={generateRecommendations} disabled={loading}>
                <Brain className="w-4 h-4 mr-2" />
                Start AI Analysis
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Priority Legend */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <Badge variant="outline" className={getPriorityColor('high')}>High</Badge>
                <Badge variant="outline" className={getPriorityColor('medium')}>Medium</Badge>
                <Badge variant="outline" className={getPriorityColor('low')}>Low</Badge>
              </div>

              {/* Recommendations List */}
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:border-primary/30 transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{rec.name}</h4>
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-emerald-600">{rec.expectedImpact}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        Create Segment
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="churn" className="mt-6">
          <ChurnPredictor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
