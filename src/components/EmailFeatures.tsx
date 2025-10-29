import { BarChart3, Target, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your sales performance with live dashboards and actionable insights.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set, monitor, and achieve your sales targets with precision tools.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    description: "Predict future revenue with AI-powered forecasting models.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Unite your sales team with seamless communication and shared strategies.",
  },
];

export const EmailFeatures = () => {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Win
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for modern sales teams who need speed, insights, and results.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
