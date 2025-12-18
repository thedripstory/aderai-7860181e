-- Create test_users table to track admin-created test users
CREATE TABLE public.test_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_by_admin_id UUID NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    brand_name TEXT,
    temp_password TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    first_login_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    subscription_bypassed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view all test users"
ON public.test_users
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert test users"
ON public.test_users
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update test users"
ON public.test_users
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete test users"
ON public.test_users
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_test_users_updated_at
BEFORE UPDATE ON public.test_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_test_users_email ON public.test_users(email);
CREATE INDEX idx_test_users_status ON public.test_users(status);
CREATE INDEX idx_test_users_user_id ON public.test_users(user_id);