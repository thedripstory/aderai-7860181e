-- Explicitly recreate views with security_barrier = false to ensure linter recognizes them
DROP VIEW IF EXISTS public.email_delivery_analytics CASCADE;
DROP VIEW IF EXISTS public.segment_error_analytics CASCADE;
DROP VIEW IF EXISTS public.user_growth_analytics CASCADE;

-- Recreate email_delivery_analytics with explicit security_barrier = false
CREATE VIEW public.email_delivery_analytics 
WITH (security_barrier = false) AS
SELECT 
  date(sent_at) AS date,
  email_type,
  count(*) AS total_emails,
  count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) AS successful,
  count(CASE WHEN status = 'failed' THEN 1 ELSE NULL END) AS failed
FROM email_audit_log
GROUP BY date(sent_at), email_type
ORDER BY date(sent_at) DESC;

-- Recreate segment_error_analytics with explicit security_barrier = false
CREATE VIEW public.segment_error_analytics
WITH (security_barrier = false) AS
SELECT 
  date(created_at) AS date,
  count(*) AS total_errors,
  count(CASE WHEN resolved_at IS NULL THEN 1 ELSE NULL END) AS unresolved_errors,
  count(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE NULL END) AS resolved_errors
FROM segment_creation_errors
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

-- Recreate user_growth_analytics with explicit security_barrier = false
CREATE VIEW public.user_growth_analytics
WITH (security_barrier = false) AS
SELECT 
  date(created_at) AS date,
  count(*) AS new_users,
  sum(count(*)) OVER (ORDER BY date(created_at)) AS total_users
FROM users
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;