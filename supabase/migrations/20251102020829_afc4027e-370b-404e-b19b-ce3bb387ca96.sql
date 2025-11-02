-- ADERAI V2 SUPABASE DATABASE SCHEMA

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('brand', 'agency')),
    account_name TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'trial')),
    subscription_tier TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    affiliate_code TEXT UNIQUE,
    referred_by TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Klaviyo API keys table
CREATE TABLE klaviyo_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    klaviyo_api_key_hash TEXT NOT NULL,
    client_name TEXT,
    currency TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    aov NUMERIC DEFAULT 100,
    vip_threshold NUMERIC DEFAULT 1000,
    high_value_threshold NUMERIC DEFAULT 500,
    new_customer_days INTEGER DEFAULT 60,
    lapsed_days INTEGER DEFAULT 90,
    churned_days INTEGER DEFAULT 180,
    locked BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI suggestions table
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    klaviyo_key_id UUID NOT NULL REFERENCES klaviyo_keys(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    industry TEXT NOT NULL,
    challenge TEXT,
    frequency TEXT,
    specific_behaviors TEXT,
    suggested_segments JSONB NOT NULL,
    created_segments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate stats table
CREATE TABLE affiliate_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('one-time', 'recurring')),
    commission_amount NUMERIC NOT NULL,
    commission_paid BOOLEAN DEFAULT false,
    payment_date TIMESTAMP WITH TIME ZONE,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segment analytics cache table
CREATE TABLE segment_analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    klaviyo_key_id UUID NOT NULL REFERENCES klaviyo_keys(id) ON DELETE CASCADE,
    segment_data JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_code TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX idx_klaviyo_keys_user_id ON klaviyo_keys(user_id);
CREATE INDEX idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX idx_affiliate_stats_affiliate_user_id ON affiliate_stats(affiliate_user_id);
CREATE INDEX idx_affiliate_clicks_code ON affiliate_clicks(affiliate_code);
CREATE INDEX idx_segment_cache_key_id ON segment_analytics_cache(klaviyo_key_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE klaviyo_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Klaviyo keys policies
CREATE POLICY klaviyo_keys_select_own ON klaviyo_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY klaviyo_keys_insert_own ON klaviyo_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY klaviyo_keys_update_own ON klaviyo_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY klaviyo_keys_delete_own ON klaviyo_keys FOR DELETE USING (auth.uid() = user_id);

-- AI suggestions policies
CREATE POLICY ai_suggestions_select_own ON ai_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ai_suggestions_insert_own ON ai_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Affiliate stats policies (can see own affiliate stats)
CREATE POLICY affiliate_stats_select_own ON affiliate_stats FOR SELECT USING (auth.uid() = affiliate_user_id);

-- Cache policies
CREATE POLICY cache_select_own ON segment_analytics_cache FOR SELECT USING (
    EXISTS (SELECT 1 FROM klaviyo_keys WHERE klaviyo_keys.id = klaviyo_key_id AND klaviyo_keys.user_id = auth.uid())
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_klaviyo_keys_updated_at BEFORE UPDATE ON klaviyo_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text), 1, 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE affiliate_code = code) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate affiliate code on user creation
CREATE OR REPLACE FUNCTION set_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_affiliate_code BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION set_affiliate_code();