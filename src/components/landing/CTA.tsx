import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Final call-to-action section
 * Encourages user to sign up with compelling value prop
 */
export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20 mb-8">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="font-bold text-primary">Limited Time: 100% Free Forever</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
          Ready to 10x Your <br />
          <span className="bg-gradient-to-r from-primary via-accent to-orange-500 bg-clip-text text-transparent">
            Email Revenue?
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
          Join the brands using Aderai to unlock their full Klaviyo potential. Free forever. No credit card required.
        </p>

        <button
          onClick={() => navigate('/signup')}
          className="group bg-primary text-primary-foreground px-10 py-5 rounded-full text-xl font-bold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-primary/40 inline-flex items-center gap-3"
        >
          Get Started Free
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-sm text-muted-foreground mt-6">
          ✓ No credit card required • ✓ Setup in 30 seconds • ✓ 70+ segments included
        </p>
      </div>
    </section>
  );
}
