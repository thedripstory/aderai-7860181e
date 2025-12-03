-- Create rate_limits table for API rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  operation TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, operation, created_at);

-- Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits (edge functions need this)
CREATE POLICY "Service role can manage rate limits" 
ON rate_limits 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);