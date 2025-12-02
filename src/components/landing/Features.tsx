import { Zap, Target, Layers, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "30-Second Setup",
    description: "Connect Klaviyo, click deploy. That's it. No configuration, no complexity.",
  },
  {
    icon: Target,
    title: "70+ Pre-Built Segments",
    description: "Behavioral, lifecycle, value-based, and exclusion segments that drive revenue.",
  },
  {
    icon: Layers,
    title: "Agency-Grade Strategy",
    description: "Built by experts who've managed $100M+ in email revenue for top brands.",
  },
  {
    icon: TrendingUp,
    title: "Instant Results",
    description: "Start sending smarter campaigns immediately. No learning curve.",
  },
];

/**
 * Features section showcasing key benefits
 * Uses card grid layout with icons and descriptions
 */
export function Features() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Everything you need. <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for e-commerce brands who want results, not complexity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-card border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
