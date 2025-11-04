-- Add missing notification preference columns
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS email_on_client_added BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_on_api_key_added BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_on_settings_updated BOOLEAN DEFAULT FALSE;