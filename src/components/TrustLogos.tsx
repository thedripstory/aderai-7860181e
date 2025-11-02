import { Sparkles, TrendingUp, Award, Zap, Star } from "lucide-react";

export const TrustLogos = () => {
  const features = [
    { 
      icon: Sparkles, 
      label: "AI-Powered", 
      stat: "70+ Segments",
      color: "from-primary/20 to-primary/5"
    },
    { 
      icon: Zap, 
      label: "Lightning Fast", 
      stat: "30 Seconds",
      color: "from-orange-500/20 to-orange-500/5"
    },
    { 
      icon: TrendingUp, 
      label: "Revenue Boost", 
      stat: "+40% AOV",
      color: "from-green-500/20 to-green-500/5"
    },
    { 
      icon: Award, 
      label: "Klaviyo Native", 
      stat: "Zero Setup",
      color: "from-blue-500/20 to-blue-500/5"
    },
    { 
      icon: Star, 
      label: "Top Rated", 
      stat: "5-Star Reviews",
      color: "from-yellow-500/20 to-yellow-500/5"
    }
  ];

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trusted by Leading Brands</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">
            Everything You Need to Succeed
          </h3>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="group relative"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Card */}
              <div className={`relative h-full p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${feature.color} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20`}>
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-background/80 border border-border/50 group-hover:border-primary/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {feature.label}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {feature.stat}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="mt-12 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
};
