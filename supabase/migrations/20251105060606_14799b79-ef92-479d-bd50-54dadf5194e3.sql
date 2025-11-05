-- Create notifications table for admin alerts
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- 'error', 'warning', 'info', 'success'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view their notifications
CREATE POLICY "Admins can view own notifications"
ON public.admin_notifications
FOR SELECT
USING (is_admin() AND auth.uid() = admin_user_id);

-- Admins can update their notifications (mark as read)
CREATE POLICY "Admins can update own notifications"
ON public.admin_notifications
FOR UPDATE
USING (is_admin() AND auth.uid() = admin_user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_admin_notifications_user_id ON public.admin_notifications(admin_user_id);
CREATE INDEX idx_admin_notifications_read ON public.admin_notifications(read);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_severity ON public.admin_notifications(severity);

-- Create function to auto-create critical error notifications
CREATE OR REPLACE FUNCTION public.create_error_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Get all admin user IDs
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles
  WHERE role = 'admin';

  -- Only create notification if error is unresolved and has high retry count
  IF NEW.resolved_at IS NULL AND NEW.retry_count > 2 THEN
    -- Insert notification for each admin
    INSERT INTO admin_notifications (
      admin_user_id,
      notification_type,
      severity,
      title,
      message,
      metadata
    )
    SELECT
      unnest(admin_ids),
      'error',
      CASE 
        WHEN NEW.retry_count > 5 THEN 'critical'
        WHEN NEW.retry_count > 3 THEN 'high'
        ELSE 'medium'
      END,
      'Segment Creation Error',
      'Segment "' || NEW.segment_name || '" failed: ' || NEW.error_message,
      jsonb_build_object(
        'error_id', NEW.id,
        'segment_name', NEW.segment_name,
        'retry_count', NEW.retry_count,
        'error_code', NEW.error_code
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for segment errors
DROP TRIGGER IF EXISTS notify_segment_error ON segment_creation_errors;
CREATE TRIGGER notify_segment_error
AFTER INSERT OR UPDATE ON segment_creation_errors
FOR EACH ROW
EXECUTE FUNCTION create_error_notification();

-- Create function to create email failure notifications
CREATE OR REPLACE FUNCTION public.create_email_failure_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_ids UUID[];
  recent_failures INTEGER;
BEGIN
  -- Get all admin user IDs
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles
  WHERE role = 'admin';

  -- Check if this is a failed email
  IF NEW.status = 'failed' THEN
    -- Count recent failures in last hour
    SELECT COUNT(*) INTO recent_failures
    FROM email_audit_log
    WHERE status = 'failed'
      AND sent_at > NOW() - INTERVAL '1 hour';

    -- Create notification if failure rate is high
    IF recent_failures > 5 THEN
      INSERT INTO admin_notifications (
        admin_user_id,
        notification_type,
        severity,
        title,
        message,
        metadata
      )
      SELECT
        unnest(admin_ids),
        'error',
        CASE 
          WHEN recent_failures > 20 THEN 'critical'
          WHEN recent_failures > 10 THEN 'high'
          ELSE 'medium'
        END,
        'High Email Failure Rate',
        recent_failures || ' emails failed in the last hour. Latest: ' || NEW.error_message,
        jsonb_build_object(
          'email_id', NEW.id,
          'email_type', NEW.email_type,
          'recipient', NEW.recipient_email,
          'failure_count', recent_failures
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for email failures
DROP TRIGGER IF EXISTS notify_email_failure ON email_audit_log;
CREATE TRIGGER notify_email_failure
AFTER INSERT ON email_audit_log
FOR EACH ROW
EXECUTE FUNCTION create_email_failure_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;