import { useState, useEffect, useCallback } from 'react';
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

const formatEventName = (eventName: string): string => {
  const eventMap: Record<string, string> = {
    'feature_viewed': 'Viewed feature',
    'feature_action': 'Performed action',
    'create_segments': 'Created segments',
    'ai_suggestion_used': 'Used AI suggestion',
    'segment_created': 'Created segment',
    'klaviyo_connected': 'Connected Klaviyo',
    'settings_updated': 'Updated settings',
    'feedback_submitted': 'Submitted feedback',
    'api_key_added': 'Added API key',
    'bundle_created': 'Created bundle',
    'page_view': 'Visited page',
    'banner_clicked': 'Clicked banner',
    'banner_dismissed': 'Dismissed banner',
    'onboarding_completed': 'Completed onboarding',
    'onboarding_step_completed': 'Completed onboarding step',
    'onboarding_flow_started': 'Started onboarding',
    'tour_completed': 'Completed product tour',
    'tour_skipped': 'Skipped product tour',
    'tour_step_completed': 'Completed tour step',
  };

  return eventMap[eventName] || eventName.replace(/_/g, ' ');
};

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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadDashboardStats = useCallback(async () => {
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
      // Note: operation_type is 'created' in the database
      const { count: segmentCount } = await supabase
        .from('segment_operations')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .in('operation_type', ['create', 'created'])
        .eq('operation_status', 'success');

      const totalSegmentsCreated = segmentCount || 0;

      // Get recent activity from analytics_events - include all meaningful events
      const majorEvents = [
        'create_segments',
        'ai_suggestion_used',
        'klaviyo_connected',
        'segment_created',
        'bundle_created',
        'settings_updated',
        'api_key_added',
        'feedback_submitted',
        'onboarding_completed',
        'onboarding_step_completed',
        'onboarding_flow_started',
        'tour_completed',
        'feature_action', // Include significant feature actions
      ];
      
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('id, event_name, created_at, event_metadata')
        .eq('user_id', user.id)
        .in('event_name', majorEvents)
        .order('created_at', { ascending: false })
        .limit(5);

      // If no major events, fall back to recent activity from segment_operations
      let recentActivity: Array<{ id: string; action: string; timestamp: string; metadata?: any }> = [];
      
      if (recentEvents && recentEvents.length > 0) {
        recentActivity = recentEvents.map(event => ({
          id: event.id,
          action: formatEventName(event.event_name),
          timestamp: event.created_at || '',
          metadata: event.event_metadata,
        }));
      } else {
        // Fall back to segment_operations for activity
        const { data: segmentOps } = await supabase
          .from('segment_operations')
          .select('id, segment_name, operation_type, operation_status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (segmentOps) {
          recentActivity = segmentOps.map(op => ({
            id: op.id,
            action: op.operation_status === 'success' 
              ? `Created segment: ${op.segment_name}`
              : `Failed to create: ${op.segment_name}`,
            timestamp: op.created_at,
            metadata: { segment_name: op.segment_name, status: op.operation_status },
          }));
        }
      }

      setStats({
        totalSegmentsCreated,
        aiSuggestionsUsed: usageLimits?.ai_suggestions_total || 0,
        daysSinceSignup,
        klaviyoConnected: (klaviyoKeys?.length || 0) > 0,
        recentActivity,
        firstName: userData?.first_name || 'User',
        loading: false,
      });
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
    
    // Rotate tip daily
    const tipIndex = new Date().getDate() % TIPS.length;
    setTipOfTheDay(TIPS[tipIndex]);

    // Set up real-time subscriptions for live updates
    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('dashboard-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'segment_operations',
            filter: `user_id=eq.${user.id}`,
          },
          () => loadDashboardStats()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'analytics_events',
            filter: `user_id=eq.${user.id}`,
          },
          () => loadDashboardStats()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'usage_limits',
            filter: `user_id=eq.${user.id}`,
          },
          () => loadDashboardStats()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'klaviyo_keys',
            filter: `user_id=eq.${user.id}`,
          },
          () => loadDashboardStats()
        )
        .subscribe();

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupRealtimeSubscriptions().then(c => { channel = c; });

    // Also poll every 30 seconds as a fallback
    const pollInterval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadDashboardStats]);

  return { ...stats, tipOfTheDay, lastRefresh, refreshStats: loadDashboardStats };
}
