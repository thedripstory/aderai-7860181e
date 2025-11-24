-- Create usage_limits table for AI suggestions rate limiting
CREATE TABLE IF NOT EXISTS public.usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_suggestions_today INTEGER NOT NULL DEFAULT 0,
  ai_suggestions_total INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own limits
CREATE POLICY "Users can view own usage limits"
  ON public.usage_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own limits
CREATE POLICY "Users can insert own usage limits"
  ON public.usage_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own limits
CREATE POLICY "Users can update own usage limits"
  ON public.usage_limits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all limits
CREATE POLICY "Admins can view all usage limits"
  ON public.usage_limits
  FOR SELECT
  USING (is_admin());

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_usage_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usage_limits_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_usage_limits_user_id ON public.usage_limits(user_id);
CREATE INDEX idx_usage_limits_last_reset_date ON public.usage_limits(last_reset_date);