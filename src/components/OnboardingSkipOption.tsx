import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OnboardingSkipOptionProps {
  onSkip: () => void;
}

export const OnboardingSkipOption: React.FC<OnboardingSkipOptionProps> = ({ onSkip }) => {
  return (
    <button
      onClick={onSkip}
      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
    >
      Skip to Dashboard
      <ArrowRight className="w-4 h-4" />
    </button>
  );
};
