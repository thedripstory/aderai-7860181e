import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    acceptInvitation();
  }, []);

  const acceptInvitation = async () => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link");
      return;
    }

    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        setMessage("You must be logged in to accept an invitation. Please log in first.");
        toast.error("Please log in to accept the invitation");
        setTimeout(() => {
          navigate("/agency-login");
        }, 2000);
        return;
      }

      // Call edge function which will verify email matches invitation
      const { data, error } = await supabase.functions.invoke("agency-accept-invite", {
        body: { 
          invitationToken: token,
          userEmail: user.email // Send email for verification
        },
      });

      if (error) throw error;

      setStatus("success");
      setMessage("Successfully joined the team!");
      
      setTimeout(() => {
        navigate("/agency-dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
      setMessage(error.message || "Failed to accept invitation");
      toast.error(error.message || "Failed to accept invitation");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your invitation..."}
            {status === "success" && "Welcome to the team!"}
            {status === "error" && "Something went wrong"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-sm text-muted-foreground">
                {message}
              </p>
              <p className="text-center text-sm">
                Redirecting to dashboard...
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-sm text-muted-foreground">
                {message}
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}