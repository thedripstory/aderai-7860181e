import { ArrowRight, Sparkles, Zap, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CircleDoodle } from '@/components/CircleDoodle';
import { AnimatedTimeCounter } from '@/components/AnimatedTimeCounter';
import { AnimatedUnderline } from '@/components/AnimatedUnderline';
import { ArrowDoodle } from '@/components/ArrowDoodle';

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

interface HeroProps {
  variant: 'A' | 'B';
  onGetStarted: () => void;
}

/**
 * Hero section component with A/B test variants
 * @param variant - Which headline variant to display ('A' or 'B')
 * @param onGetStarted - Callback when user clicks CTA button
 */
export function Hero({ variant, onGetStarted }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 pt-40 pb-12 px-6 overflow-visible">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Top Bar - Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm">
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
            <div className="flex -space-x-2">
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/cm-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/kraus-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/tiger-marr-round-min.png" alt="Customer logo" className="w-6 h-6 rounded-full border-2 border-background" loading="lazy" />
            </div>
            <span className="text-muted-foreground font-medium">Trusted by fast-growing brands</span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">100% Free • No credit card required</span>
          </div>
        </div>

        {/* Main Headline - A/B Test */}
        <div className="text-center max-w-5xl mx-auto mb-16">
          {variant === 'A' ? (
            <>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-6">
                <span className="block">
                  <AnimatedUnderline delay="0.2s">70 Klaviyo Segments</AnimatedUnderline>
                </span>
                <span className="block mt-4">
                  in <CircleDoodle delay="0.6s">
                    <span className="bg-gradient-to-r from-primary via-accent to-orange-500 bg-clip-text text-transparent">
                      30 Seconds
                    </span>
                  </CircleDoodle>
                </span>
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-6">
                <span className="block mb-4">
                  <span className="bg-gradient-to-r from-primary via-accent to-orange-500 bg-clip-text text-transparent">
                    Segment like a $50M brand.
                  </span>
                </span>
              </h1>
            </>
          )}

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium leading-relaxed max-w-4xl mx-auto mb-12">
            {variant === 'A' 
              ? "Stop spending hours building segments manually. Deploy expert-grade segmentation straight into Klaviyo."
              : "Instantly import 70+ segments, with one click - straight inside Klaviyo"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onGetStarted}
              className="group bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full text-lg font-semibold border-2 border-border hover:border-primary transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              See how it works
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">30-second setup</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={klaviyoLogo} alt="Klaviyo" className="h-5" loading="lazy" />
              <span className="font-medium">70+ Klaviyo segments</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-medium">Free forever</span>
            </div>
          </div>
        </div>

        {/* Time Counter Visual */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-2 border-border rounded-3xl p-12 backdrop-blur-sm shadow-2xl">
            <ArrowDoodle />
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
                <span className="text-2xl font-bold">Deploy complete library in</span>
              </div>

              <div className="relative">
                <div className="text-7xl md:text-8xl font-black text-primary/10 absolute -top-4 left-0">30</div>
                <div className="relative pt-8">
                  <CircleDoodle delay="1.5s">
                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      <AnimatedTimeCounter />
                    </span>
                  </CircleDoodle>
                </div>
                <div className="text-sm text-muted-foreground mt-2">and all 70 segments are live</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
