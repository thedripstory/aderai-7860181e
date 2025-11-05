import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const ALLOWED_ADMIN_EMAIL = "akshat@aderai.io";

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user is allowed admin
      if (user.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        // Check if user has admin role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (roleData) {
          navigate("/admin");
        } else {
          // User is allowed but doesn't have admin role yet - auto-assign
          await assignAdminRole(user.id);
          navigate("/admin");
        }
      } else {
        // Not allowed admin email
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
      }
    }
  };

  const assignAdminRole = async (userId: string) => {
    try {
      await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: "admin", created_by: userId }]);
    } catch (error) {
      console.error("Error assigning admin role:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      // The actual email check will happen in the redirect callback
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  // Listen for auth state changes after OAuth redirect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        
        console.log('Admin login attempt:', userEmail);
        
        if (userEmail === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
          // Check if user has admin role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .single();

          if (!roleData) {
            // Auto-assign admin role
            await assignAdminRole(session.user.id);
          }
          
          navigate("/admin");
        } else {
          // Not authorized
          await supabase.auth.signOut();
          toast.error(`Access denied. Only ${ALLOWED_ADMIN_EMAIL} is authorized.`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Admin Access</CardTitle>
            <CardDescription className="mt-2">
              Sign in with your authorized Google account to access the admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Only authorized administrators can access this area</p>
            <p className="mt-1 font-mono text-xs">{ALLOWED_ADMIN_EMAIL}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
