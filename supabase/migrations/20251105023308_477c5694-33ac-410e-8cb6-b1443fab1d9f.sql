-- Create table for segment creation job tracking
CREATE TABLE IF NOT EXISTS public.segment_creation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  klaviyo_key_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  segments_to_create JSONB NOT NULL,
  segments_processed INTEGER DEFAULT 0,
  total_segments INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.segment_creation_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own jobs"
  ON public.segment_creation_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs"
  ON public.segment_creation_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON public.segment_creation_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_segment_jobs_user_id ON public.segment_creation_jobs(user_id);
CREATE INDEX idx_segment_jobs_status ON public.segment_creation_jobs(status);