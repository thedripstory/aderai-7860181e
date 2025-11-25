-- Create error_logs table for comprehensive error tracking
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);

-- RLS Policies
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own error logs"
ON public.error_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all error logs"
ON public.error_logs
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can delete error logs"
ON public.error_logs
FOR DELETE
USING (public.is_admin());