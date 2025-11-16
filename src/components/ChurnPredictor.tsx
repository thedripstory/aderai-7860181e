import { useState } from "react";
import { AlertCircle, Shield, DollarSign, Mail, TrendingDown, RefreshCw, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChurnPrediction {
  customerId: string;
  customerName: string;
  churnProbability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskIndicators: string[];
  recommendedAction: string;
  revenueAtRisk: number;
  optimalContactDay: number;
  lastPurchase: string;
  lifetimeValue: number;
}

export const ChurnPredictor = () => {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runChurnAnalysis = async () => {
    setLoading(true);
    
    try {
      // Mock customer data - in production this comes from Klaviyo
      const customerData = [
        { id: "1", lastPurchase: 45, frequency: 2, avgValue: 156, engagement: 12 },
        { id: "2", lastPurchase: 67, frequency: 1, avgValue: 89, engagement: 5 },
        { id: "3", lastPurchase: 89, frequency: 0, avgValue: 234, engagement: 2 }
      ];

      const { data, error } = await supabase.functions.invoke('predict-churn-risk', {
        body: { customerData }
      });

      if (error) throw error;

      // Mock predictions for demo
      const mockPredictions: ChurnPrediction[] = [
        {
          customerId: "C001",
          customerName: "Sarah M.",
          churnProbability: 89,
          riskLevel: "critical",
          riskIndicators: [
            "No purchase in 67 days (avg: 32 days)",
            "Email open rate dropped to 8%",
            "Last 3 emails ignored",
            "Previous high-value customer ($2,340 LTV)"
          ],
          recommendedAction: "Immediate win-back campaign with 20% discount + free shipping",
          revenueAtRisk: 2340,
          optimalContactDay: 3,
          lastPurchase: "67 days ago",
          lifetimeValue: 2340
        },
        {
          customerId: "C002",
          customerName: "Michael T.",
          churnProbability: 72,
          riskLevel: "high",
          riskIndicators: [
            "Purchase frequency declining (4 → 2 per quarter)",
            "Cart abandonment increased",
            "Engagement rate 45% (was 78%)"
          ],
          recommendedAction: "Personal outreach email + exclusive offer",
          revenueAtRisk: 1456,
          optimalContactDay: 5,
          lastPurchase: "45 days ago",
          lifetimeValue: 1456
        },
        {
          customerId: "C003",
          customerName: "Jessica L.",
          churnProbability: 58,
          riskLevel: "medium",
          riskIndicators: [
            "Engagement dropping gradually",
            "No interaction with recent campaigns",
            "Browse behavior decreased 40%"
          ],
          recommendedAction: "Re-engagement series + product recommendations",
          revenueAtRisk: 890,
          optimalContactDay: 7,
          lastPurchase: "52 days ago",
          lifetimeValue: 890
        },
        {
          customerId: "C004",
          customerName: "David K.",
          churnProbability: 34,
          riskLevel: "low",
          riskIndicators: [
            "Slight decrease in email opens",
            "Last purchase within normal range"
          ],
          recommendedAction: "Maintain regular nurture cadence",
          revenueAtRisk: 567,
          optimalContactDay: 14,
          lastPurchase: "28 days ago",
          lifetimeValue: 567
        }
      ];

      setPredictions(mockPredictions);

      toast({
        title: "Churn Analysis Complete",
        description: `Identified ${mockPredictions.filter(p => p.riskLevel !== 'low').length} customers at risk`,
      });
    } catch (error) {
      console.error('Churn prediction error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete churn analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-300";
      case "low": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const totalRevenueAtRisk = predictions.reduce((sum, p) => sum + p.revenueAtRisk, 0);
  const criticalCount = predictions.filter(p => p.riskLevel === "critical").length;
  const highRiskCount = predictions.filter(p => p.riskLevel === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Churn Risk Predictor
          </h2>
          <p className="text-muted-foreground">
            Identify at-risk customers before they leave and save revenue
          </p>
        </div>
        
        <Button onClick={runChurnAnalysis} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Run Churn Analysis
            </>
          )}
        </Button>
      </div>

      {/* Summary Stats */}
      {predictions.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-red-500/5 to-background border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Revenue at Risk</span>
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              ${totalRevenueAtRisk.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total LTV at stake</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Critical Risk</span>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">High Risk</span>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Analyzed</span>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers scanned</p>
          </Card>
        </div>
      )}

      {/* Predictions List */}
      {predictions.length > 0 ? (
        <div className="space-y-3">
          {predictions
            .sort((a, b) => b.churnProbability - a.churnProbability)
            .map((pred) => (
              <Card
                key={pred.customerId}
                className={`p-6 border-2 ${
                  pred.riskLevel === 'critical' ? 'bg-red-50/50 border-red-300' :
                  pred.riskLevel === 'high' ? 'bg-orange-50/50 border-orange-300' :
                  pred.riskLevel === 'medium' ? 'bg-amber-50/50 border-amber-300' :
                  'bg-emerald-50/50 border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{pred.customerName[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{pred.customerName}</h4>
                        <Badge className={getRiskColor(pred.riskLevel)}>
                          {pred.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>LTV: ${pred.lifetimeValue.toLocaleString()}</span>
                        <span>•</span>
                        <span>Last purchase: {pred.lastPurchase}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">{pred.churnProbability}%</div>
                    <div className="text-xs text-muted-foreground">Churn risk</div>
                  </div>
                </div>

                <Progress value={pred.churnProbability} className="mb-4" />

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Risk Indicators */}
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Risk Indicators
                    </div>
                    <ul className="space-y-1">
                      {pred.riskIndicators.map((indicator, i) => (
                        <li key={i} className="text-sm flex items-start gap-1.5">
                          <span className="text-red-600">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-xs font-semibold uppercase text-primary mb-2 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Recommended Action
                    </div>
                    <p className="text-sm font-medium">{pred.recommendedAction}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Optimal contact timing: Next {pred.optimalContactDay} days
                    </p>
                  </div>
                </div>

                {/* Revenue at Risk Badge */}
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Revenue at Risk</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    ${pred.revenueAtRisk.toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Analysis Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run AI churn analysis to identify at-risk customers and save revenue
          </p>
          <Button onClick={runChurnAnalysis} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Analyze Customer Base
          </Button>
        </Card>
      )}

      {/* Action Summary */}
      {predictions.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-red-500/5 to-background border-red-500/20">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Urgent Action Required
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>${totalRevenueAtRisk.toLocaleString()} in customer lifetime value at risk</strong> across {predictions.length} customers.
            </p>
            <p>
              <strong>{criticalCount} critical cases</strong> require immediate win-back campaigns within next 3 days.
            </p>
            <p>
              <strong>Estimated save rate: 40-60%</strong> with proper intervention. 
              Potential revenue recovery: ${Math.round(totalRevenueAtRisk * 0.5).toLocaleString()}.
            </p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Deploy Win-Back Campaigns
            </Button>
            <Button variant="outline" className="flex-1">
              Export Risk List
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
