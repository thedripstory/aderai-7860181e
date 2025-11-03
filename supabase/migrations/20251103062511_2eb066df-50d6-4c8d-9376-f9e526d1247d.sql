-- Ensure trigger exists for auto-generating affiliate codes
-- This trigger should be created AFTER the users table already exists

-- First, ensure the functions exist (they should from the DB info, but let's be safe)
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.set_affiliate_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'auto_generate_affiliate_code'
    ) THEN
        CREATE TRIGGER auto_generate_affiliate_code
            BEFORE INSERT ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION public.set_affiliate_code();
    END IF;
END
$$;

-- Ensure RLS policies allow users to insert their own records
-- Policy for inserting users (needed for signup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'users_insert_own'
    ) THEN
        CREATE POLICY users_insert_own
        ON public.users
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END
$$;