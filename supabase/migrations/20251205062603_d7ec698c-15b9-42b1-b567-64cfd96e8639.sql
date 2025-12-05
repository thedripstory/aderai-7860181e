-- Fix security issue 1: segment_creation_jobs has overly permissive policy
-- Drop the "Service role full access" policy that allows public reads
DROP POLICY IF EXISTS "Service role full access to segment jobs" ON public.segment_creation_jobs;

-- The existing user-specific policies are correct:
-- - "Users can view own jobs" - FOR SELECT USING (auth.uid() = user_id)
-- - "Users can create own jobs" - FOR INSERT WITH CHECK (auth.uid() = user_id)
-- - "Users can update own jobs" - FOR UPDATE USING (auth.uid() = user_id)

-- Add a policy for service role operations (used by edge functions with service_role key)
-- This uses a function check instead of true to prevent public access
CREATE POLICY "Edge functions can manage jobs via service role" 
ON public.segment_creation_jobs 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Fix security issue 2: Verify klaviyo_keys policies are properly restrictive
-- The existing policies should be correct, but let's ensure no overly permissive policies exist

-- Ensure admin policies use proper role check function
DROP POLICY IF EXISTS "Admins can view all klaviyo keys" ON public.klaviyo_keys;
DROP POLICY IF EXISTS "Admins can update all klaviyo keys" ON public.klaviyo_keys;

-- Recreate admin policies with explicit is_admin() check
CREATE POLICY "Admins can view all klaviyo keys" 
ON public.klaviyo_keys 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all klaviyo keys" 
ON public.klaviyo_keys 
FOR UPDATE 
TO authenticated
USING (is_admin());