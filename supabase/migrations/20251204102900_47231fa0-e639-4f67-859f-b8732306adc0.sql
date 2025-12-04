-- Update the handle_new_user function to properly use first_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    account_name, 
    password_hash, 
    email_verified
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'account_name', split_part(new.email, '@', 1)),
    '',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    account_name = COALESCE(EXCLUDED.account_name, users.account_name);
  RETURN new;
END;
$$;