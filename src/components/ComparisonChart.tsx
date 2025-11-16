import { Check, X, Zap, Clock, DollarSign, TrendingUp } from "lucide-react";

export const ComparisonChart = () => {
  const comparisons = [
    {
      feature: "Setup Time",
      manual: "2-3 weeks",
      aderai: "30 seconds",
      icon: Clock
    },
    {
      feature: "Technical Skills Required",
      manual: "Advanced Boolean logic",
      aderai: "None - just click",
      icon: Zap
    },
    {
      feature: "Segment Count",
      manual: "10-15 segments typically",
      aderai: "70+ pre-built segments",
      icon: TrendingUp
    },
    {
      feature: "Maintenance Time/Month",
      manual: "10+ hours",
      aderai: "Zero - automated",
      icon: Clock
    },
    {
      feature: "Cost (Labor + Opportunity)",
      manual: "$1,500+/month",
      aderai: "$79/month",
      icon: DollarSign
    },
    {
      feature: "AI-Powered Suggestions",
      manual: false,
      aderai: true,
      icon: Zap
    },
    {
      feature: "Performance Analytics",
      manual: "Manual tracking",
      aderai: "Real-time dashboard",
      icon: TrendingUp
    },
    {
      feature: "Segment Updates",
      manual: "Manual edits each time",
      aderai: "One-click updates",
      icon: Zap
    }
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Aderai vs Manual Segmentation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See why thousands of brands switched from manual segment creation
          </p>
        </div>

        <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xl">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50 border-b-2 border-border">
            <div className="p-6"></div>
            <div className="p-6 text-center border-x border-border">
              <div className="text-sm text-muted-foreground mb-2">Old Way</div>
              <div className="text-xl font-bold">Manual Klaviyo</div>
            </div>
            <div className="p-6 text-center bg-primary/5">
              <div className="text-sm text-primary mb-2">Modern Solution</div>
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Aderai
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`grid grid-cols-3 ${idx !== comparisons.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/30 transition-colors`}
              >
                {/* Feature Name */}
                <div className="p-6 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">{item.feature}</span>
                </div>

                {/* Manual Column */}
                <div className="p-6 border-x border-border flex items-center justify-center text-center">
                  {typeof item.manual === 'boolean' ? (
                    item.manual ? (
                      <Check className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <X className="w-6 h-6 text-destructive" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{item.manual}</span>
                  )}
                </div>

                {/* Aderai Column */}
                <div className="p-6 bg-primary/5 flex items-center justify-center text-center">
                  {typeof item.aderai === 'boolean' ? (
                    item.aderai ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <X className="w-6 h-6 text-destructive" />
                    )
                  ) : (
                    <span className="font-semibold text-primary">{item.aderai}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom CTA */}
          <div className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background text-center">
            <div className="max-w-xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">
                Stop wasting time on manual segments
              </h3>
              <p className="text-muted-foreground mb-6">
                Join 500+ brands saving 10+ hours monthly while increasing revenue by 40%
              </p>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                Switch to Aderai Today
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-card rounded-xl border border-border">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Brands using Aderai</div>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div className="text-sm text-muted-foreground">Hours saved monthly</div>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <div className="text-4xl font-bold text-primary mb-2">40%</div>
            <div className="text-sm text-muted-foreground">Average revenue increase</div>
          </div>
        </div>
      </div>
    </section>
  );
};
