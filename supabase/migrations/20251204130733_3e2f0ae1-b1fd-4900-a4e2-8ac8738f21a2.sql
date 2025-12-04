-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'landing_page',
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view all subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (is_admin());

-- Only admins can update subscribers
CREATE POLICY "Admins can update subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  USING (is_admin());

-- Create index for email lookups
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);