import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AderaiLogo } from "@/components/AderaiLogo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = "loading" | "valid" | "invalid" | "already" | "submitting" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Missing token.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const data = await res.json();
        if (data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else { setStatus("invalid"); setMessage(data.error || "Invalid or expired link."); }
      } catch (e) {
        setStatus("error");
        setMessage((e as Error).message);
      }
    })();
  }, [token]);

  async function confirm() {
    setStatus("submitting");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setStatus("done");
      else if (data.reason === "already_unsubscribed") setStatus("already");
      else { setStatus("error"); setMessage(data.error || "Could not unsubscribe."); }
    } catch (e) {
      setStatus("error");
      setMessage((e as Error).message);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="flex justify-center mb-6"><AderaiLogo size="lg" /></div>
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Verifying your unsubscribe link...</p>
          </div>
        )}
        {status === "valid" && (
          <>
            <h1 className="text-2xl font-bold mb-3">Unsubscribe from Aderai emails</h1>
            <p className="text-muted-foreground mb-6">You will stop receiving non-essential emails from Aderai.</p>
            <Button onClick={confirm} className="w-full">Confirm unsubscribe</Button>
          </>
        )}
        {status === "submitting" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Unsubscribing...</p>
          </div>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-2">You have been unsubscribed</h1>
            <p className="text-muted-foreground">You will no longer receive these emails.</p>
          </>
        )}
        {status === "already" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-2">Already unsubscribed</h1>
            <p className="text-muted-foreground">This email address is already removed from our list.</p>
          </>
        )}
        {(status === "invalid" || status === "error") && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-2">We could not process this link</h1>
            <p className="text-muted-foreground">{message || "Please contact hello@aderai.io if you need help."}</p>
          </>
        )}
      </div>
    </main>
  );
}
