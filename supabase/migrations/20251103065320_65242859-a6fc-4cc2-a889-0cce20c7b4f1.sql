-- Fix 1: Add explicit INSERT/DELETE policies to users table
CREATE POLICY "users_no_direct_insert" ON users
FOR INSERT
WITH CHECK (false);

CREATE POLICY "users_no_delete" ON users
FOR DELETE
USING (false);

-- Fix 2: Update database functions to include fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text), 1, 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE affiliate_code = code) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_affiliate_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix 3: Add explicit policies to affiliate_stats table
COMMENT ON TABLE affiliate_stats IS 
'RLS enabled. No INSERT/UPDATE/DELETE policies for users. All writes handled by service role via affiliate-track-conversion edge function.';

CREATE POLICY "users_cannot_insert_stats" ON affiliate_stats
FOR INSERT
WITH CHECK (false);

CREATE POLICY "users_cannot_update_stats" ON affiliate_stats
FOR UPDATE
USING (false);

CREATE POLICY "users_cannot_delete_stats" ON affiliate_stats
FOR DELETE
USING (false);

-- Fix 4: Create trigger to handle user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    email_verified,
    password_hash,
    account_type,
    account_name
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    '', -- Managed by auth.users
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'brand'),
    COALESCE(NEW.raw_user_meta_data->>'account_name', 'New User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();