-- Add columns for smart auto-retry to segment_creation_jobs
ALTER TABLE public.segment_creation_jobs 
ADD COLUMN IF NOT EXISTS pending_segment_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_segment_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS failed_segment_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS retry_after timestamp with time zone,
ADD COLUMN IF NOT EXISTS rate_limit_type text,
ADD COLUMN IF NOT EXISTS last_klaviyo_error text,
ADD COLUMN IF NOT EXISTS email_notifications_sent jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS user_email text;

-- Index for the background job to efficiently find retry-ready jobs
CREATE INDEX IF NOT EXISTS idx_segment_jobs_retry_ready 
ON public.segment_creation_jobs(status, retry_after) 
WHERE status = 'waiting_retry';