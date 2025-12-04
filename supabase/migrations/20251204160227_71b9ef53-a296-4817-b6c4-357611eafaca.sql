-- Add retry-related columns to segment_creation_jobs table
ALTER TABLE public.segment_creation_jobs 
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_segments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS next_retry_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS custom_inputs jsonb DEFAULT '{}'::jsonb;

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_segment_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_segment_creation_jobs_updated_at ON public.segment_creation_jobs;
CREATE TRIGGER update_segment_creation_jobs_updated_at
BEFORE UPDATE ON public.segment_creation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_segment_job_updated_at();

-- Add updated_at column if it doesn't exist
ALTER TABLE public.segment_creation_jobs 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for retry queries
CREATE INDEX IF NOT EXISTS idx_segment_jobs_retry 
ON public.segment_creation_jobs(status, updated_at) 
WHERE status = 'waiting_retry';

-- Enable realtime for segment_creation_jobs
ALTER PUBLICATION supabase_realtime ADD TABLE public.segment_creation_jobs;