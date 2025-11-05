-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing tables to allow admin access
-- Users table
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Klaviyo keys
CREATE POLICY "Admins can view all klaviyo keys"
ON public.klaviyo_keys
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update all klaviyo keys"
ON public.klaviyo_keys
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Agency clients
CREATE POLICY "Admins can view all agency clients"
ON public.agency_clients
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage all agency clients"
ON public.agency_clients
FOR ALL
TO authenticated
USING (public.is_admin());

-- Agency team invitations
CREATE POLICY "Admins can view all invitations"
ON public.agency_team_invitations
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Affiliate stats
CREATE POLICY "Admins can view all affiliate stats"
ON public.affiliate_stats
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Affiliate clicks
CREATE POLICY "Admins can view all affiliate clicks"
ON public.affiliate_clicks
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Email audit log
CREATE POLICY "Admins can view all email logs"
ON public.email_audit_log
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Segment creation errors
CREATE POLICY "Admins can view all segment errors"
ON public.segment_creation_errors
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Notification preferences
CREATE POLICY "Admins can view all notification preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (public.is_admin());