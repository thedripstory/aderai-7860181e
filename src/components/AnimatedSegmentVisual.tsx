export const AnimatedSegmentVisual = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto my-12">
      <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-xl border border-border p-8 overflow-hidden">
        {/* Animated segments appearing */}
        <div className="space-y-3">
          {[
            { label: "VIP Customers", delay: "0s" },
            { label: "At-Risk Buyers", delay: "0.2s" },
            { label: "High AOV Shoppers", delay: "0.4s" },
            { label: "Cart Abandoners", delay: "0.6s" },
            { label: "Loyal Subscribers", delay: "0.8s" },
          ].map((segment, i) => (
            <div
              key={i}
              className="flex items-center gap-3 opacity-0 animate-fade-in"
              style={{ animationDelay: segment.delay, animationFillMode: "forwards" }}
            >
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div className="flex-1 bg-card rounded-lg px-4 py-3 border border-border">
                <span className="text-sm font-medium">{segment.label}</span>
              </div>
              <div className="text-accent text-sm font-bold">✓</div>
            </div>
          ))}
        </div>
        
        {/* Counter in corner */}
        <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-full text-sm font-bold">
          70 segments
        </div>
      </div>
    </div>
  );
};
