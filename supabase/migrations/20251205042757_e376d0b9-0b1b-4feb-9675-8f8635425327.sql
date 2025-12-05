-- Fix subscription_status constraint to include all valid statuses
-- Drop the old constraint safely if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_subscription_status_check' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_subscription_status_check;
  END IF;
END $$;

-- Add indexes for subscription-related queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);