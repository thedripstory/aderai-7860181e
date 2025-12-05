import { useState } from "react";
import { X, BarChart3, Users, Zap, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ADERAI_LOGO_URL } from "@/components/AderaiLogo";

interface ProductTourModalProps {
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function ProductTourModal({ onClose, onDontShowAgain }: ProductTourModalProps) {
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) {
      onDontShowAgain();
    }
    onClose();
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI Segment Suggester",
      description: "Let AI analyze your business and suggest perfect customer segments tailored to your goals.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Zap,
      title: "70 Segments in 30 Seconds",
      description: "Create comprehensive customer segments faster than ever. One click to deploy all recommended segments.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track segment performance, growth metrics, and engagement rates in real-time.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "For agencies: manage multiple clients, invite team members, and streamline workflows.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-lg border-2 border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={ADERAI_LOGO_URL} alt="Aderai" className="h-8 dark:invert" />
            <div>
              <h2 className="text-xl font-bold">Welcome! 🎉</h2>
              <p className="text-sm text-muted-foreground">Let's show you what you can do</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="p-6 space-y-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/20 transition-colors"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={dontShow}
                onCheckedChange={(checked) => setDontShow(checked as boolean)}
              />
              <span className="text-sm text-muted-foreground">Don't show this again</span>
            </label>
            <Button onClick={handleClose}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
