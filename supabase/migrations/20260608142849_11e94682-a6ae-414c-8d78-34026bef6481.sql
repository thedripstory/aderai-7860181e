
-- 1) Tighten error_logs insert: must match auth.uid()
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Users insert own error logs"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2) Remove client SELECT access to 2FA secrets/backup codes.
-- 2FA is disabled platform-wide; only service_role (server) should read this table.
DROP POLICY IF EXISTS "Users can view own 2FA" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can insert own 2FA" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can update own 2FA" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can delete own 2FA" ON public.two_factor_auth;
REVOKE ALL ON public.two_factor_auth FROM anon, authenticated;

-- 3) Revoke EXECUTE on internal SECURITY DEFINER helper functions from anon/authenticated.
-- These are trigger/queue helpers — they should only run via triggers (owner) or service_role.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_usage_limits_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_onboarding_progress_updated_at() FROM anon, authenticated, PUBLIC;
