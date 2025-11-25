-- Create segment_operations table for audit logging
CREATE TABLE public.segment_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  klaviyo_key_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  segment_klaviyo_id TEXT,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('created', 'deleted', 'modified')),
  operation_status TEXT NOT NULL CHECK (operation_status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.segment_operations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own segment operations" 
ON public.segment_operations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own segment operations" 
ON public.segment_operations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_segment_operations_user_id ON public.segment_operations(user_id);
CREATE INDEX idx_segment_operations_created_at ON public.segment_operations(created_at DESC);

-- Create segment_historical_data table for trend tracking
CREATE TABLE public.segment_historical_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  klaviyo_key_id UUID NOT NULL,
  segment_klaviyo_id TEXT NOT NULL,
  segment_name TEXT NOT NULL,
  profile_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.segment_historical_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own segment historical data" 
ON public.segment_historical_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own segment historical data" 
ON public.segment_historical_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_segment_historical_user ON public.segment_historical_data(user_id);
CREATE INDEX idx_segment_historical_recorded ON public.segment_historical_data(recorded_at DESC);
CREATE INDEX idx_segment_historical_segment ON public.segment_historical_data(segment_klaviyo_id);