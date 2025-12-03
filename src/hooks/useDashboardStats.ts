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

      // Get segments created count from segment_operations (successful creates)
      // Note: operation_type can be 'create' or 'created' depending on when it was logged
      const { count: segmentCount } = await supabase
        .from('segment_operations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('operation_type', ['create', 'created'])
        .eq('operation_status', 'success');

      const totalSegmentsCreated = segmentCount || 0;

      // Get recent activity - combine segment operations and analytics events
      const { data: segmentActivity } = await supabase
        .from('segment_operations')
        .select('id, segment_name, operation_type, created_at')
        .eq('user_id', user.id)
        .eq('operation_status', 'success')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('id, event_name, created_at, event_metadata')
        .eq('user_id', user.id)
        .in('event_name', ['create_segments', 'ai_suggestion_used', 'feature_action'])
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine segment operations and analytics events for recent activity
      const segmentActivities = segmentActivity?.map(op => ({
        id: op.id,
        action: `Created segment: ${op.segment_name}`,
        timestamp: op.created_at || '',
        metadata: { segment_name: op.segment_name },
      })) || [];

      const eventActivities = recentEvents?.map(event => ({
        id: event.id,
        action: formatEventName(event.event_name, event.event_metadata),
        timestamp: event.created_at || '',
        metadata: event.event_metadata,
      })) || [];

      // Merge and sort by timestamp, take top 5
      const recentActivity = [...segmentActivities, ...eventActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

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

  const formatEventName = (eventName: string, metadata?: any): string => {
    if (eventName === 'create_segments' && metadata?.segment_count) {
      return `Created ${metadata.segment_count} segment${metadata.segment_count > 1 ? 's' : ''}`;
    }
    if (eventName === 'feature_action' && metadata?.action) {
      const actionMap: Record<string, string> = {
        'fetch_analytics': 'Refreshed analytics',
        'create_segments': 'Created segments',
        'generate_ai_suggestions': 'Generated AI suggestions',
      };
      return actionMap[metadata.action] || `${metadata.action.replace(/_/g, ' ')}`;
    }
    
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