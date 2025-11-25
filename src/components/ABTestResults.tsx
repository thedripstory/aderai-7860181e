import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Target, AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';

interface ABTestStats {
  variant: string;
  views: number;
  conversions: number;
  conversionRate: number;
}

interface StatisticalSignificance {
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  minSampleSize: number;
  improvement: number;
}

export function ABTestResults({ testName }: { testName: string }) {
  const [stats, setStats] = useState<ABTestStats[]>([]);
  const [significance, setSignificance] = useState<StatisticalSignificance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [testName]);

  async function fetchStats() {
    try {
      // Get views
      const { data: viewsData } = await supabase
        .from('analytics_events')
        .select('event_metadata')
        .eq('event_name', 'ab_test_view')
        .filter('event_metadata->>test_name', 'eq', testName);

      // Get conversions
      const { data: conversionsData } = await supabase
        .from('analytics_events')
        .select('event_metadata')
        .eq('event_name', 'ab_test_conversion')
        .filter('event_metadata->>test_name', 'eq', testName);

      const viewsByVariant = countByVariant(viewsData || []);
      const conversionsByVariant = countByVariant(conversionsData || []);

      const results: ABTestStats[] = ['A', 'B'].map(variant => {
        const views = viewsByVariant[variant] || 0;
        const conversions = conversionsByVariant[variant] || 0;
        const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

        return { variant, views, conversions, conversionRate };
      });

      setStats(results);
      
      // Calculate statistical significance if we have data for both variants
      if (results.length === 2 && results[0].views > 0 && results[1].views > 0) {
        const sig = calculateStatisticalSignificance(results[0], results[1]);
        setSignificance(sig);
      }
    } catch (error) {
      console.error('Failed to fetch AB test stats:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStatisticalSignificance(
    variantA: ABTestStats,
    variantB: ABTestStats
  ): StatisticalSignificance {
    const p1 = variantA.conversions / variantA.views;
    const p2 = variantB.conversions / variantB.views;
    const n1 = variantA.views;
    const n2 = variantB.views;

    // Pooled probability
    const pPooled = (variantA.conversions + variantB.conversions) / (n1 + n2);
    
    // Standard error
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1/n1 + 1/n2));
    
    // Z-score for two-proportion test
    const zScore = se > 0 ? (p2 - p1) / se : 0;
    
    // P-value (two-tailed test)
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    // Confidence level
    const confidenceLevel = (1 - pValue) * 100;
    
    // Is significant at 95% confidence?
    const isSignificant = pValue < 0.05;
    
    // Relative improvement
    const improvement = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;
    
    // Minimum sample size needed for 80% power, 95% confidence
    // Using simplified formula: n = (Z_alpha + Z_beta)^2 * (p1(1-p1) + p2(1-p2)) / (p2-p1)^2
    const zAlpha = 1.96; // 95% confidence
    const zBeta = 0.84; // 80% power
    const effectSize = Math.abs(p2 - p1);
    const minSampleSize = effectSize > 0 
      ? Math.ceil(((zAlpha + zBeta) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))) / (effectSize ** 2))
      : 1000;

    return {
      zScore,
      pValue,
      isSignificant,
      confidenceLevel,
      minSampleSize,
      improvement
    };
  }

  // Standard normal cumulative distribution function
  function normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - probability : probability;
  }

  function countByVariant(data: any[]) {
    return data.reduce((acc, item) => {
      const variant = item.event_metadata?.variant;
      if (variant) {
        acc[variant] = (acc[variant] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  if (loading) {
    return <div className="text-center py-8">Loading A/B test results...</div>;
  }

  const winner = stats.reduce((prev, current) => 
    current.conversionRate > prev.conversionRate ? current : prev
  );

  const totalSampleSize = stats.reduce((sum, stat) => sum + stat.views, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Hero Headline A/B Test</h3>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalSampleSize} total visitors
        </Badge>
      </div>

      {/* Statistical Significance Alert */}
      {significance && (
        <Alert className={significance.isSignificant ? 'border-primary bg-primary/5' : 'border-muted'}>
          <div className="flex items-start gap-3">
            {significance.isSignificant ? (
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <AlertDescription>
                {significance.isSignificant ? (
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      ✓ Results are statistically significant
                    </p>
                    <p className="text-sm">
                      Variant {winner.variant} is performing{' '}
                      <strong>{Math.abs(significance.improvement).toFixed(1)}%</strong>{' '}
                      {significance.improvement > 0 ? 'better' : 'worse'} with{' '}
                      <strong>{significance.confidenceLevel.toFixed(1)}%</strong> confidence.
                      You can confidently implement the winning variant.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      ⚠ Not enough data for statistical significance
                    </p>
                    <p className="text-sm">
                      Current confidence: <strong>{significance.confidenceLevel.toFixed(1)}%</strong> 
                      {' '}(need 95%+). 
                      Recommended sample size: <strong>{significance.minSampleSize}</strong> visitors per variant.
                      Current: <strong>{Math.min(stats[0]?.views || 0, stats[1]?.views || 0)}</strong> per variant.
                    </p>
                  </div>
                )}
              </AlertDescription>
              
              <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div>
                  <span className="font-medium">Z-score:</span> {significance.zScore.toFixed(3)}
                </div>
                <div>
                  <span className="font-medium">P-value:</span> {significance.pValue.toFixed(4)}
                </div>
                <div>
                  <span className="font-medium">Effect size:</span> {Math.abs(significance.improvement).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.variant}
            className={stat.variant === winner.variant ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Variant {stat.variant}</span>
                <div className="flex items-center gap-2">
                  {stat.variant === winner.variant && (
                    <Badge variant="default" className="text-xs">
                      {significance?.isSignificant ? '🏆 Winner' : '📈 Leading'}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {stat.variant === 'A' ? '"70 segments. One click."' : '"Segment like a $50M brand."'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Views:</span>
                <span className="font-semibold">{stat.views}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sign-ups:</span>
                <span className="font-semibold">{stat.conversions}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-2xl font-bold text-primary">
                  {stat.conversionRate.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">Conversion Rate</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> The test tracks anonymous visitors. Each visitor is randomly assigned to variant A or B (50-50 split) and will consistently see that variant. Conversions are tracked when users click "Get Started".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
