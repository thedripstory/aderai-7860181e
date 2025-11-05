-- Create agency_team_invitations table for team member invitations
CREATE TABLE IF NOT EXISTS public.agency_team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_role TEXT NOT NULL DEFAULT 'member',
  invitation_token TEXT NOT NULL UNIQUE,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agency_user_id, member_email)
);

-- Enable RLS
ALTER TABLE public.agency_team_invitations ENABLE ROW LEVEL SECURITY;

-- Agencies can view their sent invitations
CREATE POLICY "Agencies can view their invitations"
ON public.agency_team_invitations
FOR SELECT
USING (auth.uid() = agency_user_id);

-- Agencies can insert invitations
CREATE POLICY "Agencies can create invitations"
ON public.agency_team_invitations
FOR INSERT
WITH CHECK (auth.uid() = agency_user_id);

-- Agencies can update their invitations
CREATE POLICY "Agencies can update their invitations"
ON public.agency_team_invitations
FOR UPDATE
USING (auth.uid() = agency_user_id);

-- Invited members can view invitations sent to their email
CREATE POLICY "Members can view invitations sent to them"
ON public.agency_team_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = agency_team_invitations.member_email
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_agency_team_invitations_updated_at
BEFORE UPDATE ON public.agency_team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();