import { TestimonialCard } from "@/components/TestimonialCard";

export const RevenueTestimonials = () => {
  const testimonials = [
    {
      quote: "Deployed all 70 segments in under 2 minutes. Our email revenue jumped from $23K to $34K per month. The ROI paid for itself in week one.",
      author: "Sarah Chen",
      role: "Email Marketing Director",
      company: "Luxe Beauty Co.",
      metric: "+$11K/mo"
    },
    {
      quote: "We were spending 15 hours a month building segments manually. Aderai did it in 30 seconds. The AI suggestions helped us discover 3 high-value segments we never thought of. Generated an extra $47K in 60 days.",
      author: "Marcus Rodriguez",
      role: "Head of Growth",
      company: "Premium Apparel Brand",
      metric: "+$47K"
    },
    {
      quote: "As an agency managing 8 clients, Aderai transformed our workflow. We deployed segments for all clients in one afternoon. Each client saw 30-45% email revenue lift within the first month.",
      author: "Jessica Park",
      role: "Agency Owner",
      company: "Catalyst Digital",
      metric: "40% lift"
    },
    {
      quote: "I'm not technical at all. With Aderai, I clicked a few buttons and had enterprise-level segmentation running. Our VIP segment alone generated $28K in targeted campaigns last quarter.",
      author: "David Thompson",
      role: "Ecommerce Manager",
      company: "Outdoor Gear Co.",
      metric: "+$28K/qtr"
    },
    {
      quote: "The segment performance tracking showed us which audiences were most profitable. We doubled down on those and cut waste. Email marketing went from 15% to 24% of total revenue.",
      author: "Emily Watson",
      role: "CMO",
      company: "Wellness Brands Inc.",
      metric: "9% revenue share"
    },
    {
      quote: "Aderai's AI suggested a 'seasonal high-spenders' segment we hadn't considered. That single segment drove $19K during our Q4 campaign. Absolute game-changer.",
      author: "Ryan Mitchell",
      role: "Marketing Lead",
      company: "Home Decor Direct",
      metric: "+$19K"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real brands. Real revenue.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how Aderai customers are driving measurable business impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-card border-2 border-primary/20 rounded-2xl p-8">
            <div className="text-left">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue Generated</div>
              <div className="text-4xl font-bold text-primary">$2.4M+</div>
              <div className="text-xs text-muted-foreground mt-1">By Aderai customers last quarter</div>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground mb-1">Average Revenue Lift</div>
              <div className="text-4xl font-bold text-primary">38%</div>
              <div className="text-xs text-muted-foreground mt-1">Within first 90 days</div>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground mb-1">Time Saved</div>
              <div className="text-4xl font-bold text-primary">5,000+</div>
              <div className="text-xs text-muted-foreground mt-1">Hours per month across customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
