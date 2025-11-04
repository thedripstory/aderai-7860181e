import { Mail, X } from "lucide-react";

interface EmailVerificationBannerProps {
  onDismiss: () => void;
}

export const EmailVerificationBanner = ({ onDismiss }: EmailVerificationBannerProps) => {
  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please verify your email address. Check your inbox for a confirmation link.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
