CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: create_email_failure_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_email_failure_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  admin_ids UUID[];
  recent_failures INTEGER;
BEGIN
  -- Get all admin user IDs
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles
  WHERE role = 'admin';

  -- Check if this is a failed email
  IF NEW.status = 'failed' THEN
    -- Count recent failures in last hour
    SELECT COUNT(*) INTO recent_failures
    FROM email_audit_log
    WHERE status = 'failed'
      AND sent_at > NOW() - INTERVAL '1 hour';

    -- Create notification if failure rate is high
    IF recent_failures > 5 THEN
      INSERT INTO admin_notifications (
        admin_user_id,
        notification_type,
        severity,
        title,
        message,
        metadata
      )
      SELECT
        unnest(admin_ids),
        'error',
        CASE 
          WHEN recent_failures > 20 THEN 'critical'
          WHEN recent_failures > 10 THEN 'high'
          ELSE 'medium'
        END,
        'High Email Failure Rate',
        recent_failures || ' emails failed in the last hour. Latest: ' || NEW.error_message,
        jsonb_build_object(
          'email_id', NEW.id,
          'email_type', NEW.email_type,
          'recipient', NEW.recipient_email,
          'failure_count', recent_failures
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: create_error_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_error_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Get all admin user IDs
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles
  WHERE role = 'admin';

  -- Only create notification if error is unresolved and has high retry count
  IF NEW.resolved_at IS NULL AND NEW.retry_count > 2 THEN
    -- Insert notification for each admin
    INSERT INTO admin_notifications (
      admin_user_id,
      notification_type,
      severity,
      title,
      message,
      metadata
    )
    SELECT
      unnest(admin_ids),
      'error',
      CASE 
        WHEN NEW.retry_count > 5 THEN 'critical'
        WHEN NEW.retry_count > 3 THEN 'high'
        ELSE 'medium'
      END,
      'Segment Creation Error',
      'Segment "' || NEW.segment_name || '" failed: ' || NEW.error_message,
      jsonb_build_object(
        'error_id', NEW.id,
        'segment_name', NEW.segment_name,
        'retry_count', NEW.retry_count,
        'error_code', NEW.error_code
      );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: generate_affiliate_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_affiliate_code() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    email_verified,
    password_hash,
    account_type,
    account_name
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    '', -- Managed by auth.users
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'brand'),
    COALESCE(NEW.raw_user_meta_data->>'account_name', 'New User')
  );
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_notification_prefs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_notification_prefs() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;


--
-- Name: set_affiliate_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_affiliate_code() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_onboarding_progress_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_onboarding_progress_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid NOT NULL,
    action_type text NOT NULL,
    target_table text,
    target_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid NOT NULL,
    notification_type text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    metadata jsonb,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);


--
-- Name: affiliate_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_clicks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    affiliate_code text NOT NULL,
    ip_address text,
    user_agent text,
    referrer text,
    converted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: affiliate_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    affiliate_user_id uuid NOT NULL,
    referred_user_id uuid NOT NULL,
    commission_type text NOT NULL,
    commission_amount numeric NOT NULL,
    commission_paid boolean DEFAULT false,
    payment_date timestamp with time zone,
    stripe_payment_id text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affiliate_stats_commission_type_check CHECK ((commission_type = ANY (ARRAY['one-time'::text, 'recurring'::text])))
);


--
-- Name: agency_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agency_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agency_user_id uuid NOT NULL,
    brand_user_id uuid NOT NULL,
    client_name text NOT NULL,
    status text DEFAULT 'active'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agency_clients_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])))
);


--
-- Name: agency_team_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agency_team_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agency_user_id uuid NOT NULL,
    member_email text NOT NULL,
    member_role text DEFAULT 'member'::text NOT NULL,
    invitation_token text NOT NULL,
    token_expires_at timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    invited_user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_suggestions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    klaviyo_key_id uuid NOT NULL,
    goal text NOT NULL,
    industry text NOT NULL,
    challenge text,
    frequency text,
    specific_behaviors text,
    suggested_segments jsonb NOT NULL,
    created_segments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_name text NOT NULL,
    event_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    page_url text,
    user_agent text,
    ip_address text
);


--
-- Name: client_performance_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agency_user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    metric_date date DEFAULT CURRENT_DATE NOT NULL,
    segments_total integer DEFAULT 0 NOT NULL,
    segments_active integer DEFAULT 0 NOT NULL,
    total_revenue numeric(12,2) DEFAULT 0 NOT NULL,
    emails_sent integer DEFAULT 0 NOT NULL,
    engagement_rate numeric(5,2) DEFAULT 0 NOT NULL,
    revenue_growth numeric(5,2) DEFAULT 0,
    metric_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: cross_client_best_practices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cross_client_best_practices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agency_user_id uuid NOT NULL,
    metric_name text NOT NULL,
    best_performing_client_id uuid NOT NULL,
    worst_performing_client_id uuid NOT NULL,
    best_value text NOT NULL,
    worst_value text NOT NULL,
    average_value text NOT NULL,
    recommendation text NOT NULL,
    analysis_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: email_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_type text NOT NULL,
    recipient_email text NOT NULL,
    subject text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'sent'::text,
    error_message text
);


--
-- Name: email_delivery_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.email_delivery_analytics AS
 SELECT date(sent_at) AS date,
    email_type,
    count(*) AS total_emails,
    count(
        CASE
            WHEN (status = 'sent'::text) THEN 1
            ELSE NULL::integer
        END) AS successful,
    count(
        CASE
            WHEN (status = 'failed'::text) THEN 1
            ELSE NULL::integer
        END) AS failed
   FROM public.email_audit_log
  GROUP BY (date(sent_at)), email_type
  ORDER BY (date(sent_at)) DESC;


--
-- Name: email_verification_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    last_reminder_sent_at timestamp with time zone DEFAULT now(),
    reminder_count integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: klaviyo_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.klaviyo_keys (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    klaviyo_api_key_hash text NOT NULL,
    client_name text,
    currency text DEFAULT 'USD'::text,
    currency_symbol text DEFAULT '$'::text,
    aov numeric DEFAULT 100,
    vip_threshold numeric DEFAULT 1000,
    high_value_threshold numeric DEFAULT 500,
    new_customer_days integer DEFAULT 60,
    lapsed_days integer DEFAULT 90,
    churned_days integer DEFAULT 180,
    locked boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: klaviyo_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.klaviyo_webhook_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    processed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT klaviyo_webhook_events_event_type_check CHECK ((char_length(event_type) <= 100))
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_on_segment_creation boolean DEFAULT true,
    email_on_password_reset boolean DEFAULT true,
    email_on_client_invitation boolean DEFAULT true,
    email_on_api_key_changes boolean DEFAULT true,
    email_weekly_summary boolean DEFAULT true,
    email_marketing boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email_on_client_added boolean DEFAULT true,
    email_on_api_key_added boolean DEFAULT true,
    email_on_settings_updated boolean DEFAULT false
);


--
-- Name: onboarding_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    current_step integer DEFAULT 1 NOT NULL,
    steps_completed jsonb DEFAULT '[]'::jsonb,
    last_step_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: roi_campaign_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roi_campaign_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid,
    campaign_name text NOT NULL,
    segment_name text NOT NULL,
    emails_sent integer NOT NULL,
    revenue_generated numeric(12,2) DEFAULT 0 NOT NULL,
    time_saved_hours numeric(5,2) DEFAULT 0,
    engagement_rate numeric(5,2) DEFAULT 0,
    campaign_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: segment_analytics_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segment_analytics_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    klaviyo_key_id uuid NOT NULL,
    segment_data jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now()
);


--
-- Name: segment_creation_errors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segment_creation_errors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    klaviyo_key_id uuid NOT NULL,
    segment_name text NOT NULL,
    segment_definition jsonb NOT NULL,
    error_message text NOT NULL,
    error_code text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone
);


--
-- Name: segment_creation_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segment_creation_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    klaviyo_key_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    segments_to_create jsonb NOT NULL,
    segments_processed integer DEFAULT 0,
    total_segments integer NOT NULL,
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: segment_error_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.segment_error_analytics AS
 SELECT date(created_at) AS date,
    count(*) AS total_errors,
    count(
        CASE
            WHEN (resolved_at IS NULL) THEN 1
            ELSE NULL::integer
        END) AS unresolved_errors,
    count(
        CASE
            WHEN (resolved_at IS NOT NULL) THEN 1
            ELSE NULL::integer
        END) AS resolved_errors
   FROM public.segment_creation_errors
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


--
-- Name: segment_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segment_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    klaviyo_key_id uuid NOT NULL,
    segment_name text NOT NULL,
    klaviyo_segment_id text,
    revenue numeric(12,2) DEFAULT 0 NOT NULL,
    emails_sent integer DEFAULT 0 NOT NULL,
    engagement_rate numeric(5,2) DEFAULT 0 NOT NULL,
    profile_count integer DEFAULT 0 NOT NULL,
    metric_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: two_factor_auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.two_factor_auth (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    secret text NOT NULL,
    enabled boolean DEFAULT false,
    backup_codes text[] DEFAULT '{}'::text[],
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    account_type text NOT NULL,
    account_name text NOT NULL,
    subscription_status text DEFAULT 'inactive'::text,
    subscription_tier text,
    stripe_customer_id text,
    stripe_subscription_id text,
    affiliate_code text,
    referred_by text,
    email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    industry text,
    monthly_revenue_range text,
    email_list_size_range text,
    marketing_goals text,
    current_challenges text,
    onboarding_completed boolean DEFAULT false,
    klaviyo_setup_completed boolean DEFAULT false,
    agency_size text,
    number_of_clients text,
    agency_specialization text,
    service_offerings text,
    client_management_needs text,
    password_reset_token text,
    password_reset_expires timestamp with time zone,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret text,
    two_factor_backup_codes jsonb,
    two_factor_prompt_shown_at timestamp with time zone,
    CONSTRAINT users_account_type_check CHECK ((account_type = ANY (ARRAY['brand'::text, 'agency'::text]))),
    CONSTRAINT users_subscription_status_check CHECK ((subscription_status = ANY (ARRAY['active'::text, 'inactive'::text, 'canceled'::text, 'trial'::text])))
);


--
-- Name: user_growth_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_growth_analytics AS
 SELECT date(created_at) AS date,
    count(*) AS new_users,
    sum(count(*)) OVER (ORDER BY (date(created_at))) AS total_users
   FROM public.users
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token text NOT NULL,
    last_activity timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: affiliate_clicks affiliate_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_pkey PRIMARY KEY (id);


--
-- Name: affiliate_stats affiliate_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_stats
    ADD CONSTRAINT affiliate_stats_pkey PRIMARY KEY (id);


--
-- Name: agency_clients agency_clients_agency_user_id_brand_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_clients
    ADD CONSTRAINT agency_clients_agency_user_id_brand_user_id_key UNIQUE (agency_user_id, brand_user_id);


--
-- Name: agency_clients agency_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_clients
    ADD CONSTRAINT agency_clients_pkey PRIMARY KEY (id);


--
-- Name: agency_team_invitations agency_team_invitations_agency_user_id_member_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_team_invitations
    ADD CONSTRAINT agency_team_invitations_agency_user_id_member_email_key UNIQUE (agency_user_id, member_email);


--
-- Name: agency_team_invitations agency_team_invitations_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_team_invitations
    ADD CONSTRAINT agency_team_invitations_invitation_token_key UNIQUE (invitation_token);


--
-- Name: agency_team_invitations agency_team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_team_invitations
    ADD CONSTRAINT agency_team_invitations_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestions ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: client_performance_metrics client_performance_metrics_client_id_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_performance_metrics
    ADD CONSTRAINT client_performance_metrics_client_id_metric_date_key UNIQUE (client_id, metric_date);


--
-- Name: client_performance_metrics client_performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_performance_metrics
    ADD CONSTRAINT client_performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: cross_client_best_practices cross_client_best_practices_agency_user_id_metric_name_anal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_client_best_practices
    ADD CONSTRAINT cross_client_best_practices_agency_user_id_metric_name_anal_key UNIQUE (agency_user_id, metric_name, analysis_date);


--
-- Name: cross_client_best_practices cross_client_best_practices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_client_best_practices
    ADD CONSTRAINT cross_client_best_practices_pkey PRIMARY KEY (id);


--
-- Name: email_audit_log email_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_audit_log
    ADD CONSTRAINT email_audit_log_pkey PRIMARY KEY (id);


--
-- Name: email_verification_reminders email_verification_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_reminders
    ADD CONSTRAINT email_verification_reminders_pkey PRIMARY KEY (id);


--
-- Name: email_verification_reminders email_verification_reminders_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_reminders
    ADD CONSTRAINT email_verification_reminders_user_id_key UNIQUE (user_id);


--
-- Name: klaviyo_keys klaviyo_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.klaviyo_keys
    ADD CONSTRAINT klaviyo_keys_pkey PRIMARY KEY (id);


--
-- Name: klaviyo_webhook_events klaviyo_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.klaviyo_webhook_events
    ADD CONSTRAINT klaviyo_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: onboarding_progress onboarding_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_pkey PRIMARY KEY (id);


--
-- Name: onboarding_progress onboarding_progress_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_user_id_key UNIQUE (user_id);


--
-- Name: roi_campaign_results roi_campaign_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roi_campaign_results
    ADD CONSTRAINT roi_campaign_results_pkey PRIMARY KEY (id);


--
-- Name: segment_analytics_cache segment_analytics_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_analytics_cache
    ADD CONSTRAINT segment_analytics_cache_pkey PRIMARY KEY (id);


--
-- Name: segment_creation_errors segment_creation_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_creation_errors
    ADD CONSTRAINT segment_creation_errors_pkey PRIMARY KEY (id);


--
-- Name: segment_creation_jobs segment_creation_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_creation_jobs
    ADD CONSTRAINT segment_creation_jobs_pkey PRIMARY KEY (id);


--
-- Name: segment_performance segment_performance_klaviyo_key_id_segment_name_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_performance
    ADD CONSTRAINT segment_performance_klaviyo_key_id_segment_name_metric_date_key UNIQUE (klaviyo_key_id, segment_name, metric_date);


--
-- Name: segment_performance segment_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_performance
    ADD CONSTRAINT segment_performance_pkey PRIMARY KEY (id);


--
-- Name: two_factor_auth two_factor_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_pkey PRIMARY KEY (id);


--
-- Name: two_factor_auth two_factor_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_affiliate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_affiliate_code_key UNIQUE (affiliate_code);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_audit_action_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_action_type ON public.admin_audit_log USING btree (action_type);


--
-- Name: idx_admin_audit_admin_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_admin_user ON public.admin_audit_log USING btree (admin_user_id);


--
-- Name: idx_admin_audit_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_created_at ON public.admin_audit_log USING btree (created_at DESC);


--
-- Name: idx_admin_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications USING btree (created_at DESC);


--
-- Name: idx_admin_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_read ON public.admin_notifications USING btree (read);


--
-- Name: idx_admin_notifications_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_severity ON public.admin_notifications USING btree (severity);


--
-- Name: idx_admin_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_user_id ON public.admin_notifications USING btree (admin_user_id);


--
-- Name: idx_affiliate_clicks_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_clicks_code ON public.affiliate_clicks USING btree (affiliate_code);


--
-- Name: idx_affiliate_stats_affiliate_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_stats_affiliate_user_id ON public.affiliate_stats USING btree (affiliate_user_id);


--
-- Name: idx_ai_suggestions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_suggestions_user_id ON public.ai_suggestions USING btree (user_id);


--
-- Name: idx_analytics_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events USING btree (created_at DESC);


--
-- Name: idx_analytics_events_event_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_event_name ON public.analytics_events USING btree (event_name);


--
-- Name: idx_analytics_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events USING btree (user_id);


--
-- Name: idx_client_performance_metrics_client_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_performance_metrics_client_date ON public.client_performance_metrics USING btree (client_id, metric_date DESC);


--
-- Name: idx_cross_client_best_practices_agency_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cross_client_best_practices_agency_date ON public.cross_client_best_practices USING btree (agency_user_id, analysis_date DESC);


--
-- Name: idx_email_audit_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_audit_sent_at ON public.email_audit_log USING btree (sent_at DESC);


--
-- Name: idx_email_audit_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_audit_user_id ON public.email_audit_log USING btree (user_id);


--
-- Name: idx_klaviyo_keys_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_klaviyo_keys_user_id ON public.klaviyo_keys USING btree (user_id);


--
-- Name: idx_roi_campaign_results_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roi_campaign_results_user_date ON public.roi_campaign_results USING btree (user_id, campaign_date DESC);


--
-- Name: idx_segment_cache_key_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_cache_key_id ON public.segment_analytics_cache USING btree (klaviyo_key_id);


--
-- Name: idx_segment_errors_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_errors_created_at ON public.segment_creation_errors USING btree (created_at DESC);


--
-- Name: idx_segment_errors_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_errors_user_id ON public.segment_creation_errors USING btree (user_id);


--
-- Name: idx_segment_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_jobs_status ON public.segment_creation_jobs USING btree (status);


--
-- Name: idx_segment_jobs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_jobs_user_id ON public.segment_creation_jobs USING btree (user_id);


--
-- Name: idx_segment_performance_client_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segment_performance_client_date ON public.segment_performance USING btree (client_id, metric_date DESC);


--
-- Name: idx_user_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_affiliate_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_affiliate_code ON public.users USING btree (affiliate_code);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_webhook_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_events_created_at ON public.klaviyo_webhook_events USING btree (created_at DESC);


--
-- Name: idx_webhook_events_processed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_events_processed ON public.klaviyo_webhook_events USING btree (processed);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


--
-- Name: users auto_generate_affiliate_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_generate_affiliate_code BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_affiliate_code();


--
-- Name: email_audit_log notify_email_failure; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notify_email_failure AFTER INSERT ON public.email_audit_log FOR EACH ROW EXECUTE FUNCTION public.create_email_failure_notification();


--
-- Name: segment_creation_errors notify_segment_error; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notify_segment_error AFTER INSERT OR UPDATE ON public.segment_creation_errors FOR EACH ROW EXECUTE FUNCTION public.create_error_notification();


--
-- Name: agency_clients update_agency_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agency_clients_updated_at BEFORE UPDATE ON public.agency_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agency_team_invitations update_agency_team_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agency_team_invitations_updated_at BEFORE UPDATE ON public.agency_team_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_performance_metrics update_client_performance_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_performance_metrics_updated_at BEFORE UPDATE ON public.client_performance_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: klaviyo_keys update_klaviyo_keys_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_klaviyo_keys_updated_at BEFORE UPDATE ON public.klaviyo_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_preferences update_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: onboarding_progress update_onboarding_progress_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_onboarding_progress_timestamp BEFORE UPDATE ON public.onboarding_progress FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_progress_updated_at();


--
-- Name: roi_campaign_results update_roi_campaign_results_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_roi_campaign_results_updated_at BEFORE UPDATE ON public.roi_campaign_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: segment_performance update_segment_performance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_segment_performance_updated_at BEFORE UPDATE ON public.segment_performance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: two_factor_auth update_two_factor_auth_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON public.two_factor_auth FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users users_set_affiliate_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_set_affiliate_code BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_affiliate_code();


--
-- Name: admin_audit_log admin_audit_log_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: affiliate_stats affiliate_stats_affiliate_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_stats
    ADD CONSTRAINT affiliate_stats_affiliate_user_id_fkey FOREIGN KEY (affiliate_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: affiliate_stats affiliate_stats_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_stats
    ADD CONSTRAINT affiliate_stats_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: agency_clients agency_clients_agency_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_clients
    ADD CONSTRAINT agency_clients_agency_user_id_fkey FOREIGN KEY (agency_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agency_clients agency_clients_brand_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_clients
    ADD CONSTRAINT agency_clients_brand_user_id_fkey FOREIGN KEY (brand_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agency_team_invitations agency_team_invitations_agency_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_team_invitations
    ADD CONSTRAINT agency_team_invitations_agency_user_id_fkey FOREIGN KEY (agency_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agency_team_invitations agency_team_invitations_invited_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agency_team_invitations
    ADD CONSTRAINT agency_team_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ai_suggestions ai_suggestions_klaviyo_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_klaviyo_key_id_fkey FOREIGN KEY (klaviyo_key_id) REFERENCES public.klaviyo_keys(id) ON DELETE CASCADE;


--
-- Name: ai_suggestions ai_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_performance_metrics client_performance_metrics_agency_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_performance_metrics
    ADD CONSTRAINT client_performance_metrics_agency_user_id_fkey FOREIGN KEY (agency_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: client_performance_metrics client_performance_metrics_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_performance_metrics
    ADD CONSTRAINT client_performance_metrics_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.agency_clients(id) ON DELETE CASCADE;


--
-- Name: cross_client_best_practices cross_client_best_practices_agency_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_client_best_practices
    ADD CONSTRAINT cross_client_best_practices_agency_user_id_fkey FOREIGN KEY (agency_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cross_client_best_practices cross_client_best_practices_best_performing_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_client_best_practices
    ADD CONSTRAINT cross_client_best_practices_best_performing_client_id_fkey FOREIGN KEY (best_performing_client_id) REFERENCES public.agency_clients(id) ON DELETE CASCADE;


--
-- Name: cross_client_best_practices cross_client_best_practices_worst_performing_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_client_best_practices
    ADD CONSTRAINT cross_client_best_practices_worst_performing_client_id_fkey FOREIGN KEY (worst_performing_client_id) REFERENCES public.agency_clients(id) ON DELETE CASCADE;


--
-- Name: email_audit_log email_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_audit_log
    ADD CONSTRAINT email_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: email_verification_reminders email_verification_reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_reminders
    ADD CONSTRAINT email_verification_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: klaviyo_keys klaviyo_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.klaviyo_keys
    ADD CONSTRAINT klaviyo_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: onboarding_progress onboarding_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: roi_campaign_results roi_campaign_results_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roi_campaign_results
    ADD CONSTRAINT roi_campaign_results_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.agency_clients(id) ON DELETE CASCADE;


--
-- Name: roi_campaign_results roi_campaign_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roi_campaign_results
    ADD CONSTRAINT roi_campaign_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: segment_analytics_cache segment_analytics_cache_klaviyo_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_analytics_cache
    ADD CONSTRAINT segment_analytics_cache_klaviyo_key_id_fkey FOREIGN KEY (klaviyo_key_id) REFERENCES public.klaviyo_keys(id) ON DELETE CASCADE;


--
-- Name: segment_creation_errors segment_creation_errors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_creation_errors
    ADD CONSTRAINT segment_creation_errors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: segment_creation_jobs segment_creation_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_creation_jobs
    ADD CONSTRAINT segment_creation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: segment_performance segment_performance_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_performance
    ADD CONSTRAINT segment_performance_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.agency_clients(id) ON DELETE CASCADE;


--
-- Name: segment_performance segment_performance_klaviyo_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segment_performance
    ADD CONSTRAINT segment_performance_klaviyo_key_id_fkey FOREIGN KEY (klaviyo_key_id) REFERENCES public.klaviyo_keys(id) ON DELETE CASCADE;


--
-- Name: two_factor_auth two_factor_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_audit_log Admins can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: agency_clients Admins can manage all agency clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all agency clients" ON public.agency_clients TO authenticated USING (public.is_admin());


--
-- Name: klaviyo_keys Admins can update all klaviyo keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all klaviyo keys" ON public.klaviyo_keys FOR UPDATE TO authenticated USING (public.is_admin());


--
-- Name: users Admins can update all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE TO authenticated USING (public.is_admin());


--
-- Name: admin_notifications Admins can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update own notifications" ON public.admin_notifications FOR UPDATE USING ((public.is_admin() AND (auth.uid() = admin_user_id)));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_clicks Admins can view all affiliate clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all affiliate clicks" ON public.affiliate_clicks FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: affiliate_stats Admins can view all affiliate stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all affiliate stats" ON public.affiliate_stats FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: agency_clients Admins can view all agency clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all agency clients" ON public.agency_clients FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: analytics_events Admins can view all analytics events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics events" ON public.analytics_events FOR SELECT USING (public.is_admin());


--
-- Name: email_audit_log Admins can view all email logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all email logs" ON public.email_audit_log FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: agency_team_invitations Admins can view all invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all invitations" ON public.agency_team_invitations FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: klaviyo_keys Admins can view all klaviyo keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all klaviyo keys" ON public.klaviyo_keys FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: notification_preferences Admins can view all notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all notification preferences" ON public.notification_preferences FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: segment_creation_errors Admins can view all segment errors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all segment errors" ON public.segment_creation_errors FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: users Admins can view all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: admin_audit_log Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: admin_notifications Admins can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view own notifications" ON public.admin_notifications FOR SELECT USING ((public.is_admin() AND (auth.uid() = admin_user_id)));


--
-- Name: klaviyo_webhook_events Admins can view webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view webhook events" ON public.klaviyo_webhook_events FOR SELECT USING (public.is_admin());


--
-- Name: agency_team_invitations Agencies can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can create invitations" ON public.agency_team_invitations FOR INSERT WITH CHECK ((auth.uid() = agency_user_id));


--
-- Name: agency_clients Agencies can delete their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can delete their clients" ON public.agency_clients FOR DELETE USING ((auth.uid() = agency_user_id));


--
-- Name: agency_clients Agencies can insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can insert clients" ON public.agency_clients FOR INSERT WITH CHECK ((auth.uid() = agency_user_id));


--
-- Name: client_performance_metrics Agencies can insert metrics for their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can insert metrics for their clients" ON public.client_performance_metrics FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.agency_clients
  WHERE ((agency_clients.id = client_performance_metrics.client_id) AND (agency_clients.agency_user_id = auth.uid())))));


--
-- Name: cross_client_best_practices Agencies can insert own best practices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can insert own best practices" ON public.cross_client_best_practices FOR INSERT WITH CHECK ((auth.uid() = agency_user_id));


--
-- Name: client_performance_metrics Agencies can update metrics for their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can update metrics for their clients" ON public.client_performance_metrics FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.agency_clients
  WHERE ((agency_clients.id = client_performance_metrics.client_id) AND (agency_clients.agency_user_id = auth.uid())))));


--
-- Name: agency_clients Agencies can update their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can update their clients" ON public.agency_clients FOR UPDATE USING ((auth.uid() = agency_user_id));


--
-- Name: agency_team_invitations Agencies can update their invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can update their invitations" ON public.agency_team_invitations FOR UPDATE USING ((auth.uid() = agency_user_id));


--
-- Name: client_performance_metrics Agencies can view metrics for their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can view metrics for their clients" ON public.client_performance_metrics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.agency_clients
  WHERE ((agency_clients.id = client_performance_metrics.client_id) AND (agency_clients.agency_user_id = auth.uid())))));


--
-- Name: cross_client_best_practices Agencies can view own best practices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can view own best practices" ON public.cross_client_best_practices FOR SELECT USING ((auth.uid() = agency_user_id));


--
-- Name: agency_clients Agencies can view their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can view their clients" ON public.agency_clients FOR SELECT USING ((auth.uid() = agency_user_id));


--
-- Name: agency_team_invitations Agencies can view their invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Agencies can view their invitations" ON public.agency_team_invitations FOR SELECT USING ((auth.uid() = agency_user_id));


--
-- Name: agency_clients Brands can view agencies managing them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brands can view agencies managing them" ON public.agency_clients FOR SELECT USING ((auth.uid() = brand_user_id));


--
-- Name: agency_team_invitations Members can view invitations sent to them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view invitations sent to them" ON public.agency_team_invitations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = agency_team_invitations.member_email)))));


--
-- Name: affiliate_clicks Service can insert clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can insert clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);


--
-- Name: segment_creation_errors Service can insert segment errors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can insert segment errors" ON public.segment_creation_errors FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: email_verification_reminders Service can manage reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage reminders" ON public.email_verification_reminders TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: admin_notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);


--
-- Name: segment_creation_jobs Users can create own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own jobs" ON public.segment_creation_jobs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: two_factor_auth Users can delete own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own 2FA" ON public.two_factor_auth FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: roi_campaign_results Users can delete own campaign results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own campaign results" ON public.roi_campaign_results FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: two_factor_auth Users can insert own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own 2FA" ON public.two_factor_auth FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: analytics_events Users can insert own analytics events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: roi_campaign_results Users can insert own campaign results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own campaign results" ON public.roi_campaign_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: onboarding_progress Users can insert own onboarding progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own onboarding progress" ON public.onboarding_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can insert own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_sessions Users can insert own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: segment_performance Users can insert segment performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert segment performance" ON public.segment_performance FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.klaviyo_keys
  WHERE ((klaviyo_keys.id = segment_performance.klaviyo_key_id) AND (klaviyo_keys.user_id = auth.uid())))));


--
-- Name: two_factor_auth Users can update own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own 2FA" ON public.two_factor_auth FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: roi_campaign_results Users can update own campaign results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own campaign results" ON public.roi_campaign_results FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: segment_creation_jobs Users can update own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own jobs" ON public.segment_creation_jobs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: onboarding_progress Users can update own onboarding progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own onboarding progress" ON public.onboarding_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can update own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own preferences" ON public.notification_preferences FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: segment_creation_errors Users can update own segment errors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own segment errors" ON public.segment_creation_errors FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: affiliate_clicks Users can view clicks for their code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view clicks for their code" ON public.affiliate_clicks FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.affiliate_code = affiliate_clicks.affiliate_code) AND (users.id = auth.uid())))));


--
-- Name: two_factor_auth Users can view own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own 2FA" ON public.two_factor_auth FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: roi_campaign_results Users can view own campaign results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own campaign results" ON public.roi_campaign_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: email_audit_log Users can view own email logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own email logs" ON public.email_audit_log FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: segment_creation_jobs Users can view own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own jobs" ON public.segment_creation_jobs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: onboarding_progress Users can view own onboarding progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own onboarding progress" ON public.onboarding_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can view own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: email_verification_reminders Users can view own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reminders" ON public.email_verification_reminders FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: segment_creation_errors Users can view own segment errors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own segment errors" ON public.segment_creation_errors FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: segment_performance Users can view segment performance for their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view segment performance for their clients" ON public.segment_performance FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.agency_clients ac
  WHERE ((ac.id = segment_performance.client_id) AND ((ac.agency_user_id = auth.uid()) OR (ac.brand_user_id = auth.uid()))))));


--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_clicks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_stats affiliate_stats_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY affiliate_stats_select_own ON public.affiliate_stats FOR SELECT USING ((auth.uid() = affiliate_user_id));


--
-- Name: agency_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: agency_team_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agency_team_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_suggestions ai_suggestions_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_suggestions_insert_own ON public.ai_suggestions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_suggestions ai_suggestions_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_suggestions_select_own ON public.ai_suggestions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: segment_analytics_cache cache_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cache_select_own ON public.segment_analytics_cache FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.klaviyo_keys
  WHERE ((klaviyo_keys.id = segment_analytics_cache.klaviyo_key_id) AND (klaviyo_keys.user_id = auth.uid())))));


--
-- Name: client_performance_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_performance_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: cross_client_best_practices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cross_client_best_practices ENABLE ROW LEVEL SECURITY;

--
-- Name: email_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: email_verification_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_verification_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: klaviyo_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.klaviyo_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: klaviyo_keys klaviyo_keys_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY klaviyo_keys_delete_own ON public.klaviyo_keys FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: klaviyo_keys klaviyo_keys_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY klaviyo_keys_insert_own ON public.klaviyo_keys FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: klaviyo_keys klaviyo_keys_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY klaviyo_keys_select_own ON public.klaviyo_keys FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: klaviyo_keys klaviyo_keys_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY klaviyo_keys_update_own ON public.klaviyo_keys FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: klaviyo_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.klaviyo_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: roi_campaign_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roi_campaign_results ENABLE ROW LEVEL SECURITY;

--
-- Name: segment_analytics_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.segment_analytics_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: segment_creation_errors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.segment_creation_errors ENABLE ROW LEVEL SECURITY;

--
-- Name: segment_creation_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.segment_creation_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: segment_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.segment_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: two_factor_auth; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_stats users_cannot_delete_stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_cannot_delete_stats ON public.affiliate_stats FOR DELETE USING (false);


--
-- Name: affiliate_stats users_cannot_insert_stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_cannot_insert_stats ON public.affiliate_stats FOR INSERT WITH CHECK (false);


--
-- Name: affiliate_stats users_cannot_update_stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_cannot_update_stats ON public.affiliate_stats FOR UPDATE USING (false);


--
-- Name: users users_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: users users_no_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_no_delete ON public.users FOR DELETE USING (false);


--
-- Name: users users_no_direct_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_no_direct_insert ON public.users FOR INSERT WITH CHECK (false);


--
-- Name: users users_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_own ON public.users FOR SELECT USING ((auth.uid() = id));


--
-- Name: users users_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own ON public.users FOR UPDATE USING ((auth.uid() = id));


--
-- PostgreSQL database dump complete
--


