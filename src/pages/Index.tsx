import { EmailHero } from "@/components/EmailHero";
import { EmailFeatures } from "@/components/EmailFeatures";
import { EmailTestimonial } from "@/components/EmailTestimonial";
import { EmailCTA } from "@/components/EmailCTA";
import { EmailFooter } from "@/components/EmailFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <EmailHero />
      <EmailFeatures />
      <EmailTestimonial />
      <EmailCTA />
      <EmailFooter />
    </div>
  );
};

export default Index;
