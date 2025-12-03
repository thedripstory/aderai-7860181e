import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  metadata?: any;
}

interface ActivityHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 10;

const MAJOR_EVENTS = [
  'create_segments',
  'ai_suggestion_used',
  'klaviyo_connected',
  'segment_created',
  'bundle_created',
  'settings_updated',
  'api_key_added',
  'feedback_submitted',
];

const formatEventName = (eventName: string): string => {
  const eventMap: Record<string, string> = {
    'create_segments': 'Created segments',
    'ai_suggestion_used': 'Used AI suggestion',
    'klaviyo_connected': 'Connected Klaviyo',
    'segment_created': 'Created segment',
    'bundle_created': 'Created bundle',
    'settings_updated': 'Updated settings',
    'api_key_added': 'Added API key',
    'feedback_submitted': 'Submitted feedback',
    'feature_viewed': 'Viewed feature',
    'feature_action': 'Performed action',
    'page_view': 'Visited page',
  };
  return eventMap[eventName] || eventName.replace(/_/g, ' ');
};

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open, currentPage]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get total count
      const { count } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalCount(count || 0);

      // Get paginated data
      const { data } = await supabase
        .from('analytics_events')
        .select('id, event_name, created_at, event_metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      const formattedActivities = data?.map(event => ({
        id: event.id,
        action: formatEventName(event.event_name),
        timestamp: event.created_at || '',
        metadata: event.event_metadata,
      })) || [];

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Activity History
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                </div>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
