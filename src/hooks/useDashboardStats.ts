import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSegmentsCreated: number;
  aiSuggestionsUsed: number;
  daysSinceSignup: number;
  klaviyoConnected: boolean;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    metadata?: any;
  }>;
  firstName: string;
  loading: boolean;
}

const TIPS = [
  "Pro tip: Start with Core Essentials bundle - it covers 90% of common use cases!",
  "Use AI suggestions to create custom segments tailored to your specific business goals.",
  "Analytics refresh automatically - check back regularly to see how your segments perform.",
  "Bundle segments together to save time when creating multiple related audiences.",
  "VIP and high-value segments can help you identify your most profitable customers.",
  "Churn risk segments let you proactively re-engage customers before they leave.",
  "Segment templates can be customized to match your specific business needs.",
  "Use the performance tab to identify which segments drive the most revenue.",
];

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSegmentsCreated: 0,
    aiSuggestionsUsed: 0,
    daysSinceSignup: 0,
    klaviyoConnected: false,
    recentActivity: [],
    firstName: '',
    loading: true,
  });

  const [tipOfTheDay, setTipOfTheDay] = useState('');

  useEffect(() => {
    loadDashboardStats();
    // Rotate tip daily
    const tipIndex = new Date().getDate() % TIPS.length;
    setTipOfTheDay(TIPS[tipIndex]);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, created_at')
        .eq('id', user.id)
        .single();

      // Calculate days since signup
      const signupDate = userData?.created_at ? new Date(userData.created_at) : new Date();
      const daysSinceSignup = Math.floor(
        (new Date().getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check Klaviyo connection
      const { data: klaviyoKeys } = await supabase
        .from('klaviyo_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Get AI suggestions count from usage limits
      const { data: usageLimits } = await supabase
        .from('usage_limits')
        .select('ai_suggestions_total')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get segments created count
      const { data: aiSuggestions } = await supabase
        .from('ai_suggestions')
        .select('created_segments')
        .eq('user_id', user.id);

      let totalSegmentsCreated = 0;
      aiSuggestions?.forEach(suggestion => {
        const segments = suggestion.created_segments as any[];
        totalSegmentsCreated += segments?.length || 0;
      });

      // Get recent activity from analytics_events
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('id, event_name, created_at, event_metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = recentEvents?.map(event => ({
        id: event.id,
        action: formatEventName(event.event_name),
        timestamp: event.created_at || '',
        metadata: event.event_metadata,
      })) || [];

      setStats({
        totalSegmentsCreated,
        aiSuggestionsUsed: usageLimits?.ai_suggestions_total || 0,
        daysSinceSignup,
        klaviyoConnected: (klaviyoKeys?.length || 0) > 0,
        recentActivity,
        firstName: userData?.first_name || 'User',
        loading: false,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatEventName = (eventName: string): string => {
    const eventMap: Record<string, string> = {
      'feature_viewed': 'Viewed feature',
      'feature_action': 'Performed action',
      'create_segments': 'Created segments',
      'ai_suggestion_used': 'Used AI suggestion',
      'page_view': 'Visited page',
      'banner_clicked': 'Clicked banner',
      'banner_dismissed': 'Dismissed banner',
    };

    return eventMap[eventName] || eventName.replace(/_/g, ' ');
  };

  return { ...stats, tipOfTheDay, refreshStats: loadDashboardStats };
}