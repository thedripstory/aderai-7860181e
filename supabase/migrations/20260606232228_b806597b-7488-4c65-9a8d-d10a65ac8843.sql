ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_segment_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS klaviyo_reminder_sent boolean NOT NULL DEFAULT false;
