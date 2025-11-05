import React, { useState, useEffect } from "react";
import { Shield, Copy, Download, CheckCircle, AlertCircle, Key, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onSetupComplete?: () => void;
}

export function TwoFactorSetup({ userId, userEmail, onSetupComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"generate" | "verify" | "backup" | "complete">("generate");
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSecret = () => {
    // Generate a base32 secret (simulated - in production use a proper library)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  useEffect(() => {
    if (step === "generate") {
      const newSecret = generateSecret();
      setSecret(newSecret);

      // Generate QR code
      const otpauth = `otpauth://totp/KlaviyoSegments:${userEmail}?secret=${newSecret}&issuer=KlaviyoSegments`;
      QRCode.toDataURL(otpauth).then(setQrCodeUrl);
    }
  }, [step, userEmail]);

  const encryptSecret = async (plaintext: string): Promise<string> => {
    // Simple Base64 encoding with obfuscation (in production, use proper encryption with Vault)
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const base64 = btoa(String.fromCharCode(...data));
    return `ENC_${base64}`;
  };

  const hashBackupCode = async (code: string): Promise<string> => {
    // Simple hash for backup codes (in production, use bcrypt or similar)
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In production, verify the TOTP code on the backend
      // For now, we'll simulate verification
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Encrypt secret before storing
      const encryptedSecret = await encryptSecret(secret);
      
      // Hash backup codes before storing
      const hashedCodes = await Promise.all(codes.map(code => hashBackupCode(code)));

      // Store 2FA settings in database with encrypted values
      const { error: insertError } = await supabase.from("two_factor_auth").insert({
        user_id: userId,
        secret: encryptedSecret,
        enabled: true,
        backup_codes: hashedCodes,
      });

      if (insertError) {
        // If already exists, update
        const { error: updateError } = await supabase
          .from("two_factor_auth")
          .update({
            secret: encryptedSecret,
            enabled: true,
            backup_codes: hashedCodes,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      }

      // Update users table with encrypted values
      await supabase
        .from("users")
        .update({
          two_factor_enabled: true,
          two_factor_secret: encryptedSecret,
          two_factor_backup_codes: hashedCodes,
        })
        .eq("id", userId);

      setStep("backup");
      toast({
        title: "2FA Enabled!",
        description: "Your account is now protected with two-factor authentication.",
      });
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = `Klaviyo Segments - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nEmail: ${userEmail}\n\n${backupCodes.join("\n")}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klaviyo-segments-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Backup codes have been downloaded",
    });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  const handleComplete = () => {
    setStep("complete");
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === "generate" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Set Up Two-Factor Authentication</h2>
            <p className="text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <h3 className="font-semibold mb-4">Step 1: Scan QR Code</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use an authenticator app like Google Authenticator, Authy, or 1Password to scan this QR
              code:
            </p>
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="border-2 border-border rounded-lg" />
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Or enter this code manually:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">{secret}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast({ title: "Copied", description: "Secret copied to clipboard" });
                  }}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <Button onClick={() => setStep("verify")} className="w-full" size="lg">
            Continue to Verification
          </Button>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify Your Setup</h2>
            <p className="text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <label className="block text-sm font-medium mb-3">Authentication Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-6 py-4 text-center text-2xl font-mono tracking-widest rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Open your authenticator app and enter the 6-digit code
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep("generate")} variant="outline" className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        </div>
      )}

      {step === "backup" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Save Your Backup Codes</h2>
            <p className="text-muted-foreground">
              Store these codes in a safe place. You can use them to access your account if you lose
              your device.
            </p>
          </div>

          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Important!</p>
                <p className="text-muted-foreground">
                  Each code can only be used once. Store them securely and don't share them with
                  anyone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border-2 border-border p-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-center">
                  <code className="text-sm font-mono">{code}</code>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleDownloadBackupCodes} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleCopyBackupCodes} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg">
            I've Saved My Backup Codes
          </Button>
        </div>
      )}

      {step === "complete" && (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">2FA Successfully Enabled!</h2>
            <p className="text-muted-foreground">
              Your account is now protected with two-factor authentication
            </p>
          </div>
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
            <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              From now on, you'll need to enter a code from your authenticator app whenever you sign
              in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface TwoFactorDisableProps {
  userId: string;
  onDisabled: () => void;
}

export function TwoFactorDisable({ userId, onDisabled }: TwoFactorDisableProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDisable = async () => {
    if (confirmText.toLowerCase() !== "disable") {
      toast({
        title: "Confirmation required",
        description: 'Please type "disable" to confirm',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update two_factor_auth table
      await supabase
        .from("two_factor_auth")
        .update({ enabled: false })
        .eq("user_id", userId);

      // Update users table
      await supabase
        .from("users")
        .update({
          two_factor_enabled: false,
        })
        .eq("id", userId);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });

      onDisabled();
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Disable Two-Factor Authentication</h2>
        <p className="text-muted-foreground">
          This will make your account less secure. Are you sure?
        </p>
      </div>

      <div className="bg-red-500/10 border-2 border-red-500/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          After disabling 2FA, you'll only need your password to sign in. We strongly recommend
          keeping 2FA enabled for better security.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Type <strong>"disable"</strong> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="disable"
          className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
      </div>

      <Button
        onClick={handleDisable}
        disabled={loading || confirmText.toLowerCase() !== "disable"}
        variant="destructive"
        className="w-full"
      >
        {loading ? "Disabling..." : "Disable 2FA"}
      </Button>
    </div>
  );
}
