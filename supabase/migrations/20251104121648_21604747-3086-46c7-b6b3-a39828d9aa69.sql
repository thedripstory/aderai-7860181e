-- Add brand onboarding fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS monthly_revenue_range text,
ADD COLUMN IF NOT EXISTS email_list_size_range text,
ADD COLUMN IF NOT EXISTS marketing_goals text,
ADD COLUMN IF NOT EXISTS current_challenges text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS klaviyo_setup_completed boolean DEFAULT false;