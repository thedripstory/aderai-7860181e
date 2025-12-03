-- Add SELECT policy for users to view their own analytics events
CREATE POLICY "Users can view own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);