-- Enable realtime for dashboard-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.segment_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_limits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.klaviyo_keys;