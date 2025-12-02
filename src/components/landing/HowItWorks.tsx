import { AutomationFlow } from '@/components/AutomationFlow';
import { CheckCircle2 } from 'lucide-react';

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

/**
 * How It Works section - two column layout matching November 26th version
 * Left: Headline and features | Right: Live deployment visualization
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Official Partner Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-full">
              <img src={klaviyoLogo} alt="Klaviyo" className="h-4" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                OFFICIAL API PARTNER
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Literal 1 click<br />
                segmentation.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                With official API integration, Aderai deploys high-impact audience segments directly into your{' '}
                <img src={klaviyoLogo} alt="Klaviyo" className="inline h-5 mx-1 align-text-bottom" />
                {' '}account, instantly.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-lg mb-1">Smart Triggers</div>
                  <p className="text-muted-foreground">
                    Automatically detect customer behaviors and segment in real-time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-lg mb-1">Segment Score</div>
                  <p className="text-muted-foreground">
                    Monitor segment health with actionable performance indicators
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-lg mb-1">Instant Deployment</div>
                  <div className="flex items-center gap-2">
                    <img src={klaviyoLogo} alt="Klaviyo" className="h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => window.location.href = '/signup'}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right Column - Live Deployment Visualization */}
          <div>
            <AutomationFlow />
          </div>
        </div>
      </div>
    </section>
  );
}
