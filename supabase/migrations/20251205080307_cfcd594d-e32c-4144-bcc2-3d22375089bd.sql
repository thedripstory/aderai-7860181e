-- Create table for segment mismatch reports
CREATE TABLE public.segment_mismatch_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  segment_name TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  actual_behavior TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.segment_mismatch_reports ENABLE ROW LEVEL SECURITY;

-- Users can submit their own reports
CREATE POLICY "Users can submit mismatch reports"
ON public.segment_mismatch_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view own mismatch reports"
ON public.segment_mismatch_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view and manage all reports
CREATE POLICY "Admins can manage all mismatch reports"
ON public.segment_mismatch_reports
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());