-- Add milestone tracking column to email_audit_log if needed
ALTER TABLE email_audit_log ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone;
ALTER TABLE email_audit_log ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add missing email preference columns to notification_preferences
ALTER TABLE notification_preferences 
  ADD COLUMN IF NOT EXISTS email_product_updates boolean DEFAULT true;

-- Create function to track segment milestones
CREATE OR REPLACE FUNCTION check_segment_milestone()
RETURNS TRIGGER AS $$
DECLARE
  segment_count INTEGER;
  user_email TEXT;
  milestone INTEGER;
BEGIN
  -- Count total segments for this user
  SELECT COUNT(*) INTO segment_count
  FROM ai_suggestions
  WHERE user_id = NEW.user_id;
  
  -- Check if we hit a milestone
  IF segment_count IN (10, 25, 50) THEN
    milestone := segment_count;
    
    -- Get user email
    SELECT email INTO user_email
    FROM users
    WHERE id = NEW.user_id;
    
    -- Insert notification for milestone email to be sent
    INSERT INTO admin_notifications (
      admin_user_id,
      notification_type,
      severity,
      title,
      message,
      metadata
    ) VALUES (
      NEW.user_id,
      'info',
      'low',
      'Segment Milestone Reached',
      'User reached ' || milestone || ' segments',
      jsonb_build_object(
        'milestone', milestone,
        'email', user_email,
        'user_id', NEW.user_id,
        'trigger_email', 'milestone'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for segment milestones
DROP TRIGGER IF EXISTS segment_milestone_trigger ON ai_suggestions;
CREATE TRIGGER segment_milestone_trigger
  AFTER INSERT ON ai_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION check_segment_milestone();