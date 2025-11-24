-- Drop subscription, payment, agency, and affiliate-related tables
-- These are no longer needed for the free tool model

-- Drop affiliate tables
DROP TABLE IF EXISTS public.affiliate_clicks CASCADE;
DROP TABLE IF EXISTS public.affiliate_stats CASCADE;

-- Drop agency-related tables
DROP TABLE IF EXISTS public.agency_clients CASCADE;
DROP TABLE IF EXISTS public.agency_team_invitations CASCADE;
DROP TABLE IF EXISTS public.client_performance_metrics CASCADE;
DROP TABLE IF EXISTS public.cross_client_best_practices CASCADE;
DROP TABLE IF EXISTS public.roi_campaign_results CASCADE;
DROP TABLE IF EXISTS public.segment_performance CASCADE;

-- Drop triggers first (before dropping the function they depend on)
DROP TRIGGER IF EXISTS auto_generate_affiliate_code ON public.users;
DROP TRIGGER IF EXISTS users_set_affiliate_code ON public.users;
DROP TRIGGER IF EXISTS set_user_affiliate_code ON public.users;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.set_affiliate_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_affiliate_code() CASCADE;

-- Remove subscription and affiliate columns from users table
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS affiliate_code,
  DROP COLUMN IF EXISTS referred_by,
  DROP COLUMN IF EXISTS account_type,
  DROP COLUMN IF EXISTS agency_size,
  DROP COLUMN IF EXISTS agency_specialization,
  DROP COLUMN IF EXISTS service_offerings,
  DROP COLUMN IF EXISTS client_management_needs,
  DROP COLUMN IF EXISTS number_of_clients,
  DROP COLUMN IF EXISTS monthly_revenue_range,
  DROP COLUMN IF EXISTS email_list_size_range;