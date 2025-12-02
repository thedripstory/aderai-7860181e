-- Add first_name column to users table
ALTER TABLE public.users 
ADD COLUMN first_name TEXT;

-- Update existing users to extract first_name from account_name or set a default
UPDATE public.users 
SET first_name = COALESCE(
  SPLIT_PART(account_name, ' ', 1),
  'User'
)
WHERE first_name IS NULL;