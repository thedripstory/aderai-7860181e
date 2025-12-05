-- Add foreign key constraint between segment_creation_jobs and klaviyo_keys
ALTER TABLE public.segment_creation_jobs
ADD CONSTRAINT segment_creation_jobs_klaviyo_key_id_fkey
FOREIGN KEY (klaviyo_key_id) REFERENCES public.klaviyo_keys(id)
ON DELETE CASCADE;