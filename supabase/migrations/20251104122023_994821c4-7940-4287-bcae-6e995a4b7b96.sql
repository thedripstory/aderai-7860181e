-- Add agency-specific fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS agency_size text,
ADD COLUMN IF NOT EXISTS number_of_clients text,
ADD COLUMN IF NOT EXISTS agency_specialization text,
ADD COLUMN IF NOT EXISTS service_offerings text,
ADD COLUMN IF NOT EXISTS client_management_needs text;

-- Add constraint to ensure email uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON public.users (email);

-- Add password reset tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;