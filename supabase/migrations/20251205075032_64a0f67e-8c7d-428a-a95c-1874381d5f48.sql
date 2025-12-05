-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own jobs" ON public.segment_creation_jobs;
DROP POLICY IF EXISTS "Users can create own jobs" ON public.segment_creation_jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.segment_creation_jobs;
DROP POLICY IF EXISTS "Edge functions can manage jobs via service role" ON public.segment_creation_jobs;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view own jobs" 
ON public.segment_creation_jobs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs" 
ON public.segment_creation_jobs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" 
ON public.segment_creation_jobs 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all jobs" 
ON public.segment_creation_jobs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);