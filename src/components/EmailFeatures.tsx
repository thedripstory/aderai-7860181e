import { Zap, MousePointerClick, TrendingUp, Clock } from "lucide-react";

const features = [
  {
    icon: MousePointerClick,
    title: "One-click deployment",
    description: "Select segments, customize metrics, deploy. All 70 segments auto-created in Klaviyo instantly."
  },
  {
    icon: Clock,
    title: "Save 10+ hours",
    description: "What takes days manually, done in 30 seconds. Focus on strategy, not Boolean logic."
  },
  {
    icon: TrendingUp,
    title: "Boost revenue 40%",
    description: "Proven segmentation framework captures revenue competitors miss. Data-backed results."
  },
  {
    icon: Zap,
    title: "AI-powered custom segments",
    description: "Describe your goal. Get segments specifically for your brand, industry, and audience."
  }
];

export const EmailFeatures = () => {
  return (
    <section className="px-4 py-12 sm:py-16 bg-muted">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deploy enterprise-level segmentation. No coding. No complexity.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-200"
              >
                <Icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
