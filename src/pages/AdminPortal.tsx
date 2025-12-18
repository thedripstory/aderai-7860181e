import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// AdminPortal: Single entry for /admin. Shows login if not signed in, dashboard if admin.
const AdminPortal = () => {
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Timeout wrapper for async operations
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))]);
  };

  // Check current session and admin role
  const checkSessionAndRole = async () => {
    try {
      const {
        data: { session },
      } = await withTimeout(supabase.auth.getSession(), 10000);
      const user = session?.user ?? null;
      setSignedIn(!!user);

      if (user) {
        // Use RPC (security definer) to check admin without exposing table policies
        try {
          const rpcPromise = new Promise<{ data: boolean | null; error: Error | null }>((resolve) => {
            supabase.rpc("is_admin").then(resolve);
          });
          const { data, error } = await withTimeout(rpcPromise, 10000);
          if (error) throw error;
          setIsAdmin(Boolean(data));
        } catch (e) {
          console.error("Admin check failed", e);
          setIsAdmin(false);
          toast.error("Access check failed. Please try again.");
        }
      } else {
        setIsAdmin(null);
      }
    } catch (e) {
      console.error("Session check failed or timed out", e);
      setSignedIn(false);
      setIsAdmin(null);
      toast.error("Connection timed out. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    const handleSession = async (session: any) => {
      const user = session?.user ?? null;
      setSignedIn(!!user);

      if (!user) {
        setIsAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (error) throw error;
        setIsAdmin(Boolean(data));
      } catch (e) {
        console.error("Admin check failed", e);
        setIsAdmin(false);
        toast.error("Access check failed");
      } finally {
        setLoading(false);
      }
    };

    // Initial session
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        {/* Aggressive rotating loader */}
        <div className="relative w-8 h-8" aria-label="Loading">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
          <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          </div>
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return <AdminLogin />;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">Admin privileges are required to access this area.</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="default" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
            <Button variant="secondary" onClick={checkSessionAndRole}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return null;
};

export default AdminPortal;
