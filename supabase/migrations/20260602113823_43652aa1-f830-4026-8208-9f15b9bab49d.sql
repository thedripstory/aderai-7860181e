
-- 1. Restrict admin_notifications INSERT to service_role only (triggers are SECURITY DEFINER so they bypass RLS)
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2. Restrict subscription_events INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert subscription events" ON public.subscription_events;
CREATE POLICY "Service role can insert subscription events"
  ON public.subscription_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Hide sensitive credential columns on public.users from anon/authenticated clients.
-- Writes (UPDATE) for 2FA still work; SELECT no longer returns these fields to the client.
REVOKE SELECT (password_hash, two_factor_secret, two_factor_backup_codes, password_reset_token, password_reset_expires)
  ON public.users FROM anon, authenticated;

-- 4. Revoke EXECUTE on admin-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_for_orphan_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fix_orphan_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_error_notification() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_email_failure_notification() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_segment_milestone() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_notification_prefs() FROM anon, authenticated, public;
-- has_role and is_admin remain executable (called by RLS policies as the calling user)

-- 5. Realtime RLS: restrict channel subscriptions to authenticated users only.
-- This prevents anon users from subscribing to any Realtime channel.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated users can read realtime messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can write realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated users can write realtime messages"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
