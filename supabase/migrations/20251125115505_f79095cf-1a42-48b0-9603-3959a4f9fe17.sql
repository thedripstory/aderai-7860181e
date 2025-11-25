-- Create email tracking table for opens and clicks
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id UUID REFERENCES email_audit_log(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_tracking_email_log_id ON email_tracking(email_log_id);
CREATE INDEX idx_email_tracking_user_id ON email_tracking(user_id);
CREATE INDEX idx_email_tracking_event_type ON email_tracking(event_type);
CREATE INDEX idx_email_tracking_created_at ON email_tracking(created_at);

-- Enable RLS
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- Admin can view all tracking data
CREATE POLICY "Admins can view all email tracking"
ON email_tracking FOR SELECT
USING (is_admin());

-- Add email_log_id to email_audit_log for better tracking
ALTER TABLE email_audit_log ADD COLUMN IF NOT EXISTS email_log_id TEXT;