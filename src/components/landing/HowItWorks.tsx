import { AutomationFlow } from '@/components/AutomationFlow';
import { ComparisonChart } from '@/components/ComparisonChart';

/**
 * How It Works section explaining the product value
 * Includes automation flow and comparison chart
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Aderai</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to unlock enterprise-level segmentation
          </p>
        </div>

        {/* Automation Flow */}
        <div className="mb-20">
          <AutomationFlow />
        </div>

        {/* Comparison Chart */}
        <div>
          <ComparisonChart />
        </div>
      </div>
    </section>
  );
}
