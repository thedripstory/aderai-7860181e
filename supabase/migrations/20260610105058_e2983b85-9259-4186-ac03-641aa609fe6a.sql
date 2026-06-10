
DO $$
DECLARE
  admin_id UUID := 'acc3a6e3-41af-4501-a357-dae23955b0d1';
BEGIN
  DELETE FROM public.analytics_events WHERE user_id IS NULL OR user_id <> admin_id;
  DELETE FROM public.user_sessions WHERE user_id <> admin_id;
  DELETE FROM public.error_logs WHERE user_id IS NULL OR user_id <> admin_id;
  DELETE FROM public.email_audit_log WHERE user_id IS NULL OR user_id <> admin_id;
  DELETE FROM public.email_send_log;
  DELETE FROM public.email_send_state;
  DELETE FROM public.email_tracking;
  DELETE FROM public.email_unsubscribe_tokens;
  DELETE FROM public.email_verification_reminders WHERE user_id <> admin_id;
  DELETE FROM public.ai_suggestions WHERE user_id <> admin_id;
  DELETE FROM public.segment_creation_jobs WHERE user_id <> admin_id;
  DELETE FROM public.segment_creation_errors;
  DELETE FROM public.segment_operations WHERE user_id <> admin_id;
  DELETE FROM public.segment_historical_data;
  DELETE FROM public.segment_analytics_cache;
  DELETE FROM public.segment_mismatch_reports WHERE user_id <> admin_id;
  DELETE FROM public.klaviyo_keys WHERE user_id <> admin_id;
  DELETE FROM public.klaviyo_webhook_events;
  DELETE FROM public.notification_preferences WHERE user_id <> admin_id;
  DELETE FROM public.admin_notifications WHERE admin_user_id <> admin_id;
  DELETE FROM public.onboarding_progress WHERE user_id <> admin_id;
  DELETE FROM public.usage_limits WHERE user_id <> admin_id;
  DELETE FROM public.user_feedback WHERE user_id IS NULL OR user_id <> admin_id;
  DELETE FROM public.user_achievements WHERE user_id <> admin_id;
  DELETE FROM public.two_factor_auth WHERE user_id <> admin_id;
  DELETE FROM public.subscription_events WHERE user_id <> admin_id;
  DELETE FROM public.premium_invite_requests;
  DELETE FROM public.newsletter_subscribers;
  DELETE FROM public.suppressed_emails;
  DELETE FROM public.rate_limits;
  DELETE FROM public.help_article_views WHERE user_id IS NULL OR user_id <> admin_id;
  DELETE FROM public.test_users;
  DELETE FROM public.admin_audit_log;

  UPDATE public.usage_limits SET ai_suggestions_today = 0, ai_suggestions_total = 0 WHERE user_id = admin_id;

  DELETE FROM auth.refresh_tokens WHERE user_id IN (SELECT id::text FROM auth.users WHERE id <> admin_id);
  DELETE FROM auth.sessions WHERE user_id <> admin_id;
  DELETE FROM auth.identities WHERE user_id <> admin_id;
  DELETE FROM auth.mfa_factors WHERE user_id <> admin_id;
  DELETE FROM auth.one_time_tokens WHERE user_id <> admin_id;

  DELETE FROM public.users WHERE id <> admin_id;
  DELETE FROM auth.users WHERE id <> admin_id;
  DELETE FROM public.user_roles WHERE user_id <> admin_id;

  RAISE NOTICE 'Whitewash complete. Admin preserved: %', admin_id;
END $$;

CREATE TABLE IF NOT EXISTS public.traffic_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view','cta_click','signup','checkout_started','purchase')),
  session_id TEXT,
  user_id UUID,
  path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  country TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  value_usd NUMERIC(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.traffic_events TO authenticated;
GRANT ALL ON public.traffic_events TO service_role;

ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read traffic events"
  ON public.traffic_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS traffic_events_created_at_idx ON public.traffic_events (created_at DESC);
CREATE INDEX IF NOT EXISTS traffic_events_event_type_idx ON public.traffic_events (event_type);
CREATE INDEX IF NOT EXISTS traffic_events_utm_source_idx ON public.traffic_events (utm_source);
CREATE INDEX IF NOT EXISTS traffic_events_session_id_idx ON public.traffic_events (session_id);
