import React from "react";
import { CheckCircle, Circle, Mail, Key, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingProgressBarProps {
  emailVerified: boolean;
  klaviyoSetupCompleted: boolean;
  hasCreatedSegments: boolean;
}

export default function OnboardingProgressBar({
  emailVerified,
  klaviyoSetupCompleted,
  hasCreatedSegments,
}: OnboardingProgressBarProps) {
  const steps = [
    {
      label: "Verify Email",
      completed: emailVerified,
      icon: Mail,
    },
    {
      label: "Connect Klaviyo",
      completed: klaviyoSetupCompleted,
      icon: Key,
    },
    {
      label: "Create First Segment",
      completed: hasCreatedSegments,
      icon: Users,
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Don't show if everything is complete
  if (completedSteps === steps.length) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border-2 border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Complete Your Setup</h3>
        <span className="text-sm text-muted-foreground">
          {completedSteps} of {steps.length} complete
        </span>
      </div>

      <Progress value={progressPercentage} className="mb-6" />

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.completed
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-muted border border-border"
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span
                className={`text-sm font-medium ${
                  step.completed ? "text-green-500" : "text-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
