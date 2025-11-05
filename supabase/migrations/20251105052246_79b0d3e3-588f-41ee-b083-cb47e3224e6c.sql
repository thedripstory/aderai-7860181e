-- Create admin audit trail table
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Create indexes for performance
CREATE INDEX idx_admin_audit_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_action_type ON public.admin_audit_log(action_type);

-- Create analytics view for user growth
CREATE OR REPLACE VIEW public.user_growth_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
FROM public.users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create analytics view for segment errors
CREATE OR REPLACE VIEW public.segment_error_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_errors,
  COUNT(CASE WHEN resolved_at IS NULL THEN 1 END) as unresolved_errors,
  COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_errors
FROM public.segment_creation_errors
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create analytics view for email delivery
CREATE OR REPLACE VIEW public.email_delivery_analytics AS
SELECT 
  DATE(sent_at) as date,
  email_type,
  COUNT(*) as total_emails,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM public.email_audit_log
GROUP BY DATE(sent_at), email_type
ORDER BY date DESC;