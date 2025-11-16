-- Client Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.client_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core metrics
  segments_total INTEGER NOT NULL DEFAULT 0,
  segments_active INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  revenue_growth DECIMAL(5, 2) DEFAULT 0,
  
  -- Additional metadata
  metric_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, metric_date)
);

-- Segment Performance Table
CREATE TABLE IF NOT EXISTS public.segment_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
  klaviyo_key_id UUID NOT NULL REFERENCES public.klaviyo_keys(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL,
  klaviyo_segment_id TEXT,
  
  -- Performance metrics
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  profile_count INTEGER NOT NULL DEFAULT 0,
  
  -- Tracking
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(klaviyo_key_id, segment_name, metric_date)
);

-- ROI Campaign Results Table  
CREATE TABLE IF NOT EXISTS public.roi_campaign_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.agency_clients(id) ON DELETE CASCADE,
  
  campaign_name TEXT NOT NULL,
  segment_name TEXT NOT NULL,
  emails_sent INTEGER NOT NULL,
  revenue_generated DECIMAL(12, 2) NOT NULL DEFAULT 0,
  time_saved_hours DECIMAL(5, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  campaign_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-Client Best Practices Table
CREATE TABLE IF NOT EXISTS public.cross_client_best_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  metric_name TEXT NOT NULL,
  best_performing_client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
  worst_performing_client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
  
  best_value TEXT NOT NULL,
  worst_value TEXT NOT NULL,
  average_value TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(agency_user_id, metric_name, analysis_date)
);

-- Enable RLS
ALTER TABLE public.client_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_campaign_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_client_best_practices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_performance_metrics
CREATE POLICY "Agencies can view metrics for their clients"
  ON public.client_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_clients
      WHERE agency_clients.id = client_performance_metrics.client_id
      AND agency_clients.agency_user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can insert metrics for their clients"
  ON public.client_performance_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agency_clients
      WHERE agency_clients.id = client_performance_metrics.client_id
      AND agency_clients.agency_user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can update metrics for their clients"
  ON public.client_performance_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_clients
      WHERE agency_clients.id = client_performance_metrics.client_id
      AND agency_clients.agency_user_id = auth.uid()
    )
  );

-- RLS Policies for segment_performance
CREATE POLICY "Users can view segment performance for their clients"
  ON public.segment_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_clients ac
      WHERE ac.id = segment_performance.client_id
      AND (ac.agency_user_id = auth.uid() OR ac.brand_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert segment performance"
  ON public.segment_performance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.klaviyo_keys
      WHERE klaviyo_keys.id = segment_performance.klaviyo_key_id
      AND klaviyo_keys.user_id = auth.uid()
    )
  );

-- RLS Policies for roi_campaign_results
CREATE POLICY "Users can view own campaign results"
  ON public.roi_campaign_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign results"
  ON public.roi_campaign_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign results"
  ON public.roi_campaign_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign results"
  ON public.roi_campaign_results FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for cross_client_best_practices
CREATE POLICY "Agencies can view own best practices"
  ON public.cross_client_best_practices FOR SELECT
  USING (auth.uid() = agency_user_id);

CREATE POLICY "Agencies can insert own best practices"
  ON public.cross_client_best_practices FOR INSERT
  WITH CHECK (auth.uid() = agency_user_id);

-- Create indexes for performance
CREATE INDEX idx_client_performance_metrics_client_date 
  ON public.client_performance_metrics(client_id, metric_date DESC);

CREATE INDEX idx_segment_performance_client_date 
  ON public.segment_performance(client_id, metric_date DESC);

CREATE INDEX idx_roi_campaign_results_user_date 
  ON public.roi_campaign_results(user_id, campaign_date DESC);

CREATE INDEX idx_cross_client_best_practices_agency_date 
  ON public.cross_client_best_practices(agency_user_id, analysis_date DESC);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_client_performance_metrics_updated_at
  BEFORE UPDATE ON public.client_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segment_performance_updated_at
  BEFORE UPDATE ON public.segment_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_campaign_results_updated_at
  BEFORE UPDATE ON public.roi_campaign_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();