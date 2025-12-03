import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/cm-round-min.png" alt="" className="w-5 h-5 rounded-full border-2 border-background" />
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/kraus-round-min.png" alt="" className="w-5 h-5 rounded-full border-2 border-background" />
              <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/tiger-marr-round-min.png" alt="" className="w-5 h-5 rounded-full border-2 border-background" />
            </div>
            <span className="font-medium">Trusted by growing brands</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Works directly with Klaviyo</span>
          </div>
        </div>

        {/* Klaviyo Partner Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white text-sm font-semibold shadow-lg">
            <img src={klaviyoLogo} alt="Klaviyo" className="h-4 brightness-0 invert" />
            OFFICIAL KLAVIYO PARTNER
          </div>
        </div>

        {/* Main Headline - A/B Test Variants */}
        <div className="text-center mb-8">
          {variant === 'A' ? (
            <>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                70 Klaviyo Segments<br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  in 30 Seconds
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Stop spending hours building segments manually. Deploy expert-grade segmentation straight into <img src={klaviyoLogo} alt="Klaviyo" className="inline h-6 align-text-bottom" />
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                Segment like a<br />
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  $50M brand.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Instantly import 70+ segments, with one click - straight inside <img src={klaviyoLogo} alt="Klaviyo" className="inline h-6 align-text-bottom" />
              </p>
            </>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={onGetStarted}
            className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-10 py-5 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            Start building segments
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
