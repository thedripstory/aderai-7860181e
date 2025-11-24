-- Fix Security Definer Views by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.email_delivery_analytics;
DROP VIEW IF EXISTS public.segment_error_analytics;
DROP VIEW IF EXISTS public.user_growth_analytics;

-- Recreate email_delivery_analytics without SECURITY DEFINER
CREATE VIEW public.email_delivery_analytics AS
SELECT 
  date(sent_at) AS date,
  email_type,
  count(*) AS total_emails,
  count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) AS successful,
  count(CASE WHEN status = 'failed' THEN 1 ELSE NULL END) AS failed
FROM email_audit_log
GROUP BY date(sent_at), email_type
ORDER BY date(sent_at) DESC;

-- Recreate segment_error_analytics without SECURITY DEFINER
CREATE VIEW public.segment_error_analytics AS
SELECT 
  date(created_at) AS date,
  count(*) AS total_errors,
  count(CASE WHEN resolved_at IS NULL THEN 1 ELSE NULL END) AS unresolved_errors,
  count(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE NULL END) AS resolved_errors
FROM segment_creation_errors
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

-- Recreate user_growth_analytics without SECURITY DEFINER
CREATE VIEW public.user_growth_analytics AS
SELECT 
  date(created_at) AS date,
  count(*) AS new_users,
  sum(count(*)) OVER (ORDER BY date(created_at)) AS total_users
FROM users
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

-- Fix Function Search Path for trigger functions
CREATE OR REPLACE FUNCTION public.update_onboarding_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;