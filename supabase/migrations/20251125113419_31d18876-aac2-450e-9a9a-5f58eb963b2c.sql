-- Performance optimization: Add indexes to frequently queried columns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Klaviyo keys indexes (user_id already has index from foreign key)
CREATE INDEX IF NOT EXISTS idx_klaviyo_keys_is_active ON public.klaviyo_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_klaviyo_keys_created_at ON public.klaviyo_keys(created_at);

-- Analytics events indexes (already has idx_analytics_events_user_id, adding more)
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);

-- AI suggestions indexes (already has foreign key index on user_id)
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_klaviyo_key_id ON public.ai_suggestions(klaviyo_key_id);

-- User achievements indexes (already has foreign key index on user_id)
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Feedback indexes (user_id needs index)
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);

-- Email audit log indexes (user_id needs index)
CREATE INDEX IF NOT EXISTS idx_email_audit_log_status ON public.email_audit_log(status);

-- Segment creation jobs indexes
CREATE INDEX IF NOT EXISTS idx_segment_creation_jobs_user_id ON public.segment_creation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_segment_creation_jobs_status ON public.segment_creation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_segment_creation_jobs_created_at ON public.segment_creation_jobs(created_at);

-- Segment creation errors indexes
CREATE INDEX IF NOT EXISTS idx_segment_creation_errors_user_id ON public.segment_creation_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_segment_creation_errors_resolved_at ON public.segment_creation_errors(resolved_at);

-- Onboarding progress indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_current_step ON public.onboarding_progress(current_step);

-- Usage limits indexes
CREATE INDEX IF NOT EXISTS idx_usage_limits_last_reset_date ON public.usage_limits(last_reset_date);

-- Admin notifications indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_user_id ON public.admin_notifications(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at);

-- Help article views indexes
CREATE INDEX IF NOT EXISTS idx_help_article_views_article_id ON public.help_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_help_article_views_viewed_at ON public.help_article_views(viewed_at);