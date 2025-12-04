import { RevolvingTestimonials } from '@/components/RevolvingTestimonials';
import { FlipTestimonialCard } from '@/components/FlipTestimonialCard';

/**
 * Social proof section with testimonials
 * Features revolving testimonials and flip cards
 */
export function SocialProof() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Loved by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">e-commerce brands</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of brands using Aderai to unlock their Klaviyo potential
          </p>
        </div>

        {/* Revolving Testimonials */}
        <div className="mb-16">
          <RevolvingTestimonials />
        </div>

        {/* Static Testimonial Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <FlipTestimonialCard
            name="Sarah Chen"
            role="Marketing Director"
            company="DTC Apparel Brand"
            story="Aderai saved us 40+ hours of segment building. We went from 0 to 70 segments in under a minute."
            metrics={[
              { label: "Email Revenue", value: "$847K" },
              { label: "Growth", value: "+127%" }
            ]}
            image="https://i.pravatar.cc/150?img=1"
            delay="0.1s"
          />
          <FlipTestimonialCard
            name="Mike Rodriguez"
            role="E-commerce Manager"
            company="Beauty & Wellness"
            story="At just $9/month, Aderai gives us everything we need. We're seeing 30% better email engagement already."
            metrics={[
              { label: "Email Revenue", value: "$523K" },
              { label: "Growth", value: "+89%" }
            ]}
            image="https://i.pravatar.cc/150?img=12"
            delay="0.2s"
          />
          <FlipTestimonialCard
            name="Emily Watson"
            role="Founder"
            company="Lifestyle Brand"
            story="As a small team, this tool is a game-changer. Agency-grade segments without the agency price tag."
            metrics={[
              { label: "Email Revenue", value: "$312K" },
              { label: "Growth", value: "+156%" }
            ]}
            image="https://i.pravatar.cc/150?img=5"
            delay="0.3s"
          />
        </div>
      </div>
    </section>
  );
}
