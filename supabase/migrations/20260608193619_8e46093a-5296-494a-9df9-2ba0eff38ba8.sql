
-- 1. Drop password_hash column from public.users (managed by auth.users)
-- First update functions that reference it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    account_name,
    email_verified
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'account_name', split_part(new.email, '@', 1)),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    account_name = COALESCE(EXCLUDED.account_name, users.account_name);
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fix_orphan_users()
RETURNS TABLE(fixed_user_id uuid, fixed_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, email_verified, account_name)
  SELECT
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL,
    COALESCE(au.raw_user_meta_data->>'account_name', 'User')
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.notification_preferences np ON au.id = np.user_id
  WHERE np.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  INNER JOIN public.users pu ON au.id = pu.id
  WHERE pu.created_at > NOW() - INTERVAL '1 minute';
END;
$function$;

ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- 2. email_tracking: explicit service_role-only write policies
DROP POLICY IF EXISTS "Service role can insert email tracking" ON public.email_tracking;
CREATE POLICY "Service role can insert email tracking"
  ON public.email_tracking
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update email tracking" ON public.email_tracking;
CREATE POLICY "Service role can update email tracking"
  ON public.email_tracking
  FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete email tracking" ON public.email_tracking;
CREATE POLICY "Service role can delete email tracking"
  ON public.email_tracking
  FOR DELETE
  TO service_role
  USING (true);

-- 3. segment_analytics_cache: explicit service_role write policies
DROP POLICY IF EXISTS "Service role can insert segment cache" ON public.segment_analytics_cache;
CREATE POLICY "Service role can insert segment cache"
  ON public.segment_analytics_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update segment cache" ON public.segment_analytics_cache;
CREATE POLICY "Service role can update segment cache"
  ON public.segment_analytics_cache
  FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete segment cache" ON public.segment_analytics_cache;
CREATE POLICY "Service role can delete segment cache"
  ON public.segment_analytics_cache
  FOR DELETE
  TO service_role
  USING (true);

-- 4. two_factor_auth: feature is disabled; add explicit deny-all policy so RLS is documented
DROP POLICY IF EXISTS "2FA disabled - no client access" ON public.two_factor_auth;
CREATE POLICY "2FA disabled - no client access"
  ON public.two_factor_auth
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
