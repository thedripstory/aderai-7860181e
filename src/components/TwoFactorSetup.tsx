import { Shield, AlertCircle } from "lucide-react";

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onSetupComplete?: () => void;
}

/**
 * 2FA setup is temporarily disabled.
 *
 * The previous client-side implementation generated TOTP secrets with
 * `Math.random()`, never verified the entered code, and stored secrets with
 * base64 "encryption" — meaning enabling it provided no real security and
 * gave users a false sense of safety. The UI is intentionally inert until a
 * server-side TOTP flow (proper crypto.getRandomValues secret, real TOTP
 * verification, AES-GCM at rest) is shipped.
 */
export function TwoFactorSetup(_props: TwoFactorSetupProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg border-2 border-border p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
        <div className="flex items-start gap-3 bg-amber-500/10 border-2 border-amber-500/20 rounded-lg p-4 text-left">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Coming soon</p>
            <p>
              We're rebuilding 2FA with a proper server-side TOTP flow. The previous
              setup did not provide real protection and has been disabled to avoid a
              false sense of security. Your account is still protected by your
              password and email-based sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TwoFactorDisableProps {
  userId: string;
  onDisabled: () => void;
}

export function TwoFactorDisable(_props: TwoFactorDisableProps) {
  return (
    <div className="max-w-md mx-auto text-center text-sm text-muted-foreground">
      Two-factor authentication is currently disabled platform-wide while we
      rebuild it server-side. No action is required.
    </div>
  );
}
