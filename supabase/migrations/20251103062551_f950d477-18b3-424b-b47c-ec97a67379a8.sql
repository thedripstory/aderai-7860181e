-- Fix security issues from linter

-- 1. Enable RLS on affiliate_clicks table
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 2. Add policies for affiliate_clicks
-- Allow service role to insert clicks (for tracking)
CREATE POLICY "Service can insert clicks"
ON public.affiliate_clicks
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own affiliate clicks
CREATE POLICY "Users can view clicks for their code"
ON public.affiliate_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.affiliate_code = affiliate_clicks.affiliate_code
    AND users.id = auth.uid()
  )
);

-- 3. Fix function search paths
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;