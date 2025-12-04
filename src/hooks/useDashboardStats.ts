import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreatedSegment {
  id: string;
  name: string;
  createdAt: string;
}

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
  createdSegments: CreatedSegment[];
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

const formatEventName = (eventName: string, metadata?: any): string => {
  // Handle segment operations with specific segment names
  if (metadata?.segment_name) {
    if (metadata.status === 'success' || eventName.includes('created')) {
      return `Created segment: ${metadata.segment_name}`;
    }
    return `Segment: ${metadata.segment_name}`;
  }

  // Handle create_segments with count
  if (eventName === 'create_segments' && metadata?.segments_created) {
    return `Created ${metadata.segments_created} segment${metadata.segments_created > 1 ? 's' : ''}`;
  }

  // Handle AI suggestions with context
  if (eventName === 'ai_suggestion_used' && metadata?.total_count) {
    return `Generated AI suggestions (#${metadata.total_count})`;
  }

  // Handle feature actions with specific feature names
  if (eventName === 'feature_action' && metadata?.feature) {
    return `Used ${metadata.feature.replace(/_/g, ' ')}`;
  }
  if (eventName === 'feature_action' && metadata?.action) {
    return `${metadata.action.replace(/_/g, ' ')}`;
  }

  // Handle settings updates with specific setting
  if (eventName === 'settings_updated' && metadata?.setting_type) {
    return `Updated ${metadata.setting_type.replace(/_/g, ' ')} settings`;
  }

  // Handle feedback with type
  if (eventName === 'feedback_submitted' && metadata?.feedback_type) {
    return `Submitted ${metadata.feedback_type.replace(/_/g, ' ')}`;
  }

  // Handle onboarding steps
  if (eventName === 'onboarding_step_completed' && metadata?.step) {
    return `Completed onboarding: ${metadata.step}`;
  }

  const eventMap: Record<string, string> = {
    'feature_viewed': 'Viewed dashboard',
    'feature_action': 'Dashboard activity',
    'create_segments': 'Created segments',
    'ai_suggestion_used': 'Generated AI suggestions',
    'segment_created': 'Created segment',
    'klaviyo_connected': 'Connected Klaviyo account',
    'settings_updated': 'Updated account settings',
    'feedback_submitted': 'Submitted feedback',
    'api_key_added': 'Added Klaviyo API key',
    'bundle_created': 'Created segment bundle',
    'page_view': 'Viewed page',
    'banner_clicked': 'Clicked setup banner',
    'banner_dismissed': 'Dismissed banner',
    'onboarding_completed': 'Completed onboarding',
    'onboarding_step_completed': 'Completed setup step',
    'onboarding_flow_started': 'Started onboarding',
    'onboarding_klaviyo_connect_clicked': 'Started Klaviyo setup',
    'tour_completed': 'Completed product tour',
    'tour_skipped': 'Skipped product tour',
    'tour_step_completed': 'Viewed tour step',
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
    createdSegments: [],
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

      // Get segments created from segment_operations (successful creates)
      const { data: segmentData, count: segmentCount } = await supabase
        .from('segment_operations')
        .select('id, segment_name, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .in('operation_type', ['create', 'created'])
        .eq('operation_status', 'success')
        .order('created_at', { ascending: false });

      const totalSegmentsCreated = segmentCount || 0;
      const createdSegments: CreatedSegment[] = (segmentData || []).map(seg => ({
        id: seg.id,
        name: seg.segment_name,
        createdAt: seg.created_at,
      }));

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
          action: formatEventName(event.event_name, event.event_metadata),
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
        createdSegments,
        firstName: userData?.first_name || '',
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
