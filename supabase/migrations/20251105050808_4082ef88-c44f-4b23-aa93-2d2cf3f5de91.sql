-- Create table for tracking segment creation errors
CREATE TABLE public.segment_creation_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  klaviyo_key_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  segment_definition JSONB NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.segment_creation_errors ENABLE ROW LEVEL SECURITY;

-- Users can view their own errors
CREATE POLICY "Users can view own segment errors"
ON public.segment_creation_errors
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can insert errors
CREATE POLICY "Service can insert segment errors"
ON public.segment_creation_errors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own errors (mark as resolved)
CREATE POLICY "Users can update own segment errors"
ON public.segment_creation_errors
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_segment_errors_user_id ON public.segment_creation_errors(user_id);
CREATE INDEX idx_segment_errors_created_at ON public.segment_creation_errors(created_at DESC);

-- Create table for email verification reminders
CREATE TABLE public.email_verification_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reminder_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_verification_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY "Users can view own reminders"
ON public.email_verification_reminders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service can manage reminders
CREATE POLICY "Service can manage reminders"
ON public.email_verification_reminders
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
