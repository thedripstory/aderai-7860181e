-- Add 2FA prompt tracking to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS two_factor_prompt_shown_at timestamp with time zone;