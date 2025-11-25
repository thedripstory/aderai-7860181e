-- Create function to check for orphan users
CREATE OR REPLACE FUNCTION public.check_for_orphan_users()
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-fix orphan users by creating their profiles
CREATE OR REPLACE FUNCTION public.fix_orphan_users()
RETURNS TABLE(fixed_user_id UUID, fixed_email TEXT)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert missing profiles from auth.users
  INSERT INTO public.users (id, email, email_verified, password_hash, account_name)
  SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL,
    '', -- Managed by auth.users
    COALESCE(au.raw_user_meta_data->>'account_name', 'User')
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ON CONFLICT (id) DO NOTHING;

  -- Insert missing notification preferences
  INSERT INTO public.notification_preferences (user_id)
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.notification_preferences np ON au.id = np.user_id
  WHERE np.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  -- Return fixed users
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  INNER JOIN public.users pu ON au.id = pu.id
  WHERE pu.created_at > NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;