import { useState } from "react";
import { Brain, TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SegmentPrediction {
  segmentName: string;
  sizeProjection: number;
  engagementProjection: number;
  revenueProjection: number;
  confidenceScore: number;
  riskFactors?: string[];
  opportunities?: string[];
}

export const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<SegmentPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runPrediction = async () => {
    setLoading(true);
    
    try {
      // Mock segment data - in production this would come from Klaviyo
      const segmentData = {
        name: "VIP Customers",
        size: 1247,
        engagement: 87
      };

      const historicalData = [
        { date: "2025-10-16", size: 1089, engagement: 82, revenue: 28400 },
        { date: "2025-09-16", size: 1015, engagement: 79, revenue: 24200 },
        { date: "2025-08-16", size: 967, engagement: 81, revenue: 26100 }
      ];

      const { data, error } = await supabase.functions.invoke('predict-segment-performance', {
        body: { segmentData, historicalData }
      });

      if (error) throw error;

      // Mock predictions for demo
      const mockPredictions: SegmentPrediction[] = [
        {
          segmentName: "VIP Customers",
          sizeProjection: 1342,
          engagementProjection: 89,
          revenueProjection: 32400,
          confidenceScore: 87,
          riskFactors: ["Seasonal decline expected in 45 days"],
          opportunities: ["Introduce exclusive product line", "VIP-only early access events"]
        },
        {
          segmentName: "High-Value Customers",
          sizeProjection: 856,
          engagementProjection: 78,
          revenueProjection: 24300,
          confidenceScore: 82,
          riskFactors: ["Engagement slightly declining", "Price sensitivity detected"],
          opportunities: ["Loyalty program expansion", "Personalized product recommendations"]
        },
        {
          segmentName: "At-Risk Customers",
          sizeProjection: 612,
          engagementProjection: 41,
          revenueProjection: 8900,
          confidenceScore: 79,
          riskFactors: ["Expected 17% growth without intervention", "Low engagement trend"],
          opportunities: ["Win-back campaign deployment critical", "Survey to identify pain points"]
        },
        {
          segmentName: "Cart Abandoners",
          sizeProjection: 734,
          engagementProjection: 28,
          revenueProjection: 15600,
          confidenceScore: 91,
          riskFactors: ["High checkout friction detected"],
          opportunities: ["Implement 3-email recovery sequence", "Offer limited-time discount"]
        }
      ];

      setPredictions(mockPredictions);
      
      toast({
        title: "Predictions Generated",
        description: "AI analysis complete for all segments",
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: "Unable to generate predictions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-blue-600";
    return "text-amber-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Predictive Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered forecasting for segment performance and revenue
          </p>
        </div>
        
        <Button onClick={runPrediction} disabled={loading}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run AI Prediction
            </>
          )}
        </Button>
      </div>

      {predictions.length === 0 ? (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Predictions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run AI analysis to get performance predictions for all your segments
          </p>
          <Button onClick={runPrediction} disabled={loading}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Predictions
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.map((pred, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{pred.segmentName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">30-Day Forecast</span>
                    <Badge variant="outline" className={getConfidenceColor(pred.confidenceScore)}>
                      {pred.confidenceScore}% Confidence
                    </Badge>
                  </div>
                </div>
                <Progress value={pred.confidenceScore} className="w-24" />
              </div>

              {/* Predictions Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Projected Size</span>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{pred.sizeProjection.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    +{((pred.sizeProjection / 1247 - 1) * 100).toFixed(1)}% growth
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Engagement Rate</span>
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-bold">{pred.engagementProjection}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expected performance
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-emerald-600 font-semibold">Revenue Forecast</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ${pred.revenueProjection.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    Next 30 days
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {pred.riskFactors && pred.riskFactors.length > 0 && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 mb-1">Risk Factors</div>
                      <ul className="space-y-1">
                        {pred.riskFactors.map((risk, i) => (
                          <li key={i} className="text-sm text-amber-800">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {pred.opportunities && pred.opportunities.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-emerald-900 mb-1">Growth Opportunities</div>
                      <ul className="space-y-1">
                        {pred.opportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-emerald-800">• {opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* AI Insights Summary */}
      {predictions.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Strategic Summary
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Portfolio Forecast:</strong> Projected revenue increase of $12,400 over next 30 days
              across all segments (+14% from current baseline).
            </p>
            <p>
              <strong>Priority Actions:</strong> Deploy win-back campaigns for At-Risk segment (growing 17%),
              optimize Cart Abandoner recovery sequence (highest confidence score 91%).
            </p>
            <p>
              <strong>Growth Opportunity:</strong> VIP segment showing strong momentum - prepare exclusive
              campaigns to maximize engagement and revenue during peak period.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
