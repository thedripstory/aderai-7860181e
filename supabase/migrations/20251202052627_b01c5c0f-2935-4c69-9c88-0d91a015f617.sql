-- Update handle_new_user trigger to populate first_name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    email_verified,
    password_hash,
    account_name,
    first_name
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    '', -- Managed by auth.users
    COALESCE(NEW.raw_user_meta_data->>'brandName', NEW.raw_user_meta_data->>'account_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'firstName', 'User')
  );
  RETURN NEW;
END;
$function$;