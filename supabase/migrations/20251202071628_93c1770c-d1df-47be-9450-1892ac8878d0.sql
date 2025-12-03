-- Fix RLS Policies: Change from RESTRICTIVE to PERMISSIVE mode
-- This allows proper access control while maintaining security

-- Drop existing restrictive policies and recreate as permissive
-- analytics_events table
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON analytics_events;

CREATE POLICY "Users can insert own analytics events" 
ON analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events" 
ON analytics_events 
FOR SELECT 
TO authenticated
USING (is_admin());

-- email_audit_log table - Add missing INSERT policy
CREATE POLICY "System can insert email audit logs" 
ON email_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- achievements table
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements" 
ON achievements 
FOR SELECT 
TO authenticated
USING (true);

-- admin_audit_log table
DROP POLICY IF EXISTS "Admins can insert audit logs" ON admin_audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_log;

CREATE POLICY "Admins can insert audit logs" 
ON admin_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can view audit logs" 
ON admin_audit_log 
FOR SELECT 
TO authenticated
USING (is_admin());

-- admin_notifications table
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can view own notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can update own notifications" ON admin_notifications;

CREATE POLICY "System can insert notifications" 
ON admin_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view own notifications" 
ON admin_notifications 
FOR SELECT 
TO authenticated
USING (is_admin() AND auth.uid() = admin_user_id);

CREATE POLICY "Admins can update own notifications" 
ON admin_notifications 
FOR UPDATE 
TO authenticated
USING (is_admin() AND auth.uid() = admin_user_id);

-- ai_suggestions table
DROP POLICY IF EXISTS "ai_suggestions_insert_own" ON ai_suggestions;
DROP POLICY IF EXISTS "ai_suggestions_select_own" ON ai_suggestions;

CREATE POLICY "ai_suggestions_insert_own" 
ON ai_suggestions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_suggestions_select_own" 
ON ai_suggestions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- error_logs table
DROP POLICY IF EXISTS "Anyone can insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view own error logs" ON error_logs;
DROP POLICY IF EXISTS "Admins can view all error logs" ON error_logs;
DROP POLICY IF EXISTS "Admins can delete error logs" ON error_logs;

CREATE POLICY "Anyone can insert error logs" 
ON error_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own error logs" 
ON error_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all error logs" 
ON error_logs 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete error logs" 
ON error_logs 
FOR DELETE 
TO authenticated
USING (is_admin());

-- help_article_views table
DROP POLICY IF EXISTS "Users can insert own article views" ON help_article_views;
DROP POLICY IF EXISTS "Admins can view all article views" ON help_article_views;

CREATE POLICY "Users can insert own article views" 
ON help_article_views 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all article views" 
ON help_article_views 
FOR SELECT 
TO authenticated
USING (is_admin());

-- help_articles table
DROP POLICY IF EXISTS "Anyone can view help articles" ON help_articles;
DROP POLICY IF EXISTS "Admins can insert help articles" ON help_articles;
DROP POLICY IF EXISTS "Admins can update help articles" ON help_articles;
DROP POLICY IF EXISTS "Admins can delete help articles" ON help_articles;

CREATE POLICY "Anyone can view help articles" 
ON help_articles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can insert help articles" 
ON help_articles 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update help articles" 
ON help_articles 
FOR UPDATE 
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete help articles" 
ON help_articles 
FOR DELETE 
TO authenticated
USING (is_admin());