import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Target } from 'lucide-react';

interface ABTestStats {
  variant: string;
  views: number;
  conversions: number;
  conversionRate: number;
}

export function ABTestResults({ testName }: { testName: string }) {
  const [stats, setStats] = useState<ABTestStats[]>([]);
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
    } catch (error) {
      console.error('Failed to fetch AB test stats:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Hero Headline A/B Test</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.variant}
            className={stat.variant === winner.variant ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Variant {stat.variant}</span>
                {stat.variant === winner.variant && (
                  <span className="text-sm text-primary font-normal">🏆 Leading</span>
                )}
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
