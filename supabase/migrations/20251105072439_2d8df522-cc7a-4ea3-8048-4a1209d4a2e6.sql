-- Create klaviyo_webhook_events table with proper RLS
CREATE TABLE IF NOT EXISTS public.klaviyo_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (char_length(event_type) <= 100),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.klaviyo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook events
CREATE POLICY "Admins can view webhook events"
  ON public.klaviyo_webhook_events FOR SELECT
  USING (public.is_admin());

-- No user INSERT/UPDATE/DELETE - only service role via edge function

-- Create index for performance
CREATE INDEX idx_webhook_events_processed ON public.klaviyo_webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON public.klaviyo_webhook_events(created_at DESC);