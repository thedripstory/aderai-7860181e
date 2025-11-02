import { Target, Zap, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Deploy in 30 Seconds",
    description: "70 proven segments ready instantly. No technical knowledge needed. Connect Klaviyo, customize for your metrics, deploy."
  },
  {
    icon: Target,
    title: "Ultra-Specific. Zero Generic.",
    description: "Every segment customized to your AOV, currency, and customer lifecycle. Built for precision, not one-size-fits-all."
  },
  {
    icon: TrendingUp,
    title: "Secure 40% More Revenue",
    description: "Deploy the proven segmentation framework that captures revenue your competitors miss. Data-backed results."
  },
  {
    icon: Users,
    title: "Know Exactly Who to Target",
    description: "Over 70 pre-built customer journey segments. From browsers to VIPs, target every micro-audience."
  }
];

export const EmailFeatures = () => {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop Guessing. Start Scaling.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The complete segmentation system used by top e-commerce brands. Ready in minutes, not weeks.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
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
