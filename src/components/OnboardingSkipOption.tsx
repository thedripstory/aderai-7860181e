import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const OnboardingSkipOption = () => {
  const navigate = useNavigate();

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only mark onboarding as completed, NOT Klaviyo setup
      // This ensures users will see the Klaviyo setup reminder on their dashboard
      await supabase
        .from("users")
        .update({ 
          onboarding_completed: true
        })
        .eq("id", user.id);

      toast.success("Onboarding skipped. You'll be reminded to connect Klaviyo on your dashboard.");
      navigate("/app");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      toast.error("Failed to skip onboarding");
    }
  };

  return (
    <div className="mt-4 text-center">
      <Button
        variant="ghost"
        onClick={handleSkip}
        className="text-muted-foreground hover:text-foreground"
      >
        Skip to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        You can complete this later in settings
      </p>
    </div>
  );
};
