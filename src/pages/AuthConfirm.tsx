import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AderaiLogo } from "@/components/AderaiLogo";

type EmailOtpType =
  | "signup"
  | "magiclink"
  | "recovery"
  | "invite"
  | "email_change"
  | "email";

const ALLOWED_TYPES: EmailOtpType[] = [
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
  "email",
];

// Only allow same-origin (aderai.io) relative paths
function safeNext(next: string | null, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export default function AuthConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token_hash = params.get("token_hash") || params.get("token");
      const typeRaw = (params.get("type") || "").toLowerCase() as EmailOtpType;
      const next = params.get("next");

      if (!token_hash || !ALLOWED_TYPES.includes(typeRaw)) {
        setError("This confirmation link is invalid or has expired.");
        return;
      }

      const fallback = typeRaw === "recovery" ? "/reset-password" : "/dashboard";
      const destination = safeNext(next, fallback);

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: typeRaw as any,
      });

      if (verifyError) {
        setError(verifyError.message || "This confirmation link is invalid or has expired.");
        toast({
          title: "Link invalid or expired",
          description: "Please request a new email and try again.",
          variant: "destructive",
        });
        return;
      }

      navigate(destination, { replace: true });
    };

    run();
  }, [params, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <AderaiLogo size="xl" />
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Link invalid or expired</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="text-primary underline text-sm"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Confirming your link…</p>
          </>
        )}
      </div>
    </div>
  );
}
