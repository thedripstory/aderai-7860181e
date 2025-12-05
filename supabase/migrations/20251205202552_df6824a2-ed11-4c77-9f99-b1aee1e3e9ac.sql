-- Add bulletproof email deduplication flags to segment_creation_jobs
ALTER TABLE public.segment_creation_jobs 
ADD COLUMN IF NOT EXISTS daily_limit_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rate_limit_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completion_email_sent BOOLEAN DEFAULT FALSE;