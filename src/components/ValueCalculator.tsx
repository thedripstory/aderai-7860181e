import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ValueCalculator = () => {
  const [emailListSize, setEmailListSize] = useState<number>(10000);
  const [avgOrderValue, setAovValue] = useState<number>(75);
  const [currentEmailRevenue, setCurrentRevenue] = useState<number>(5000);

  // Calculation logic based on industry benchmarks
  const calculateImpact = () => {
    // Conservative estimates:
    // - Better segmentation typically lifts email revenue by 30-40%
    // - We use 35% as middle ground
    const revenueIncrease = currentEmailRevenue * 0.35;
    const newMonthlyRevenue = currentEmailRevenue + revenueIncrease;
    const annualImpact = revenueIncrease * 12;
    
    // Time saved (10+ hours per month at $100/hr value)
    const timeSaved = 10;
    const timeSavingsValue = timeSaved * 100;
    
    return {
      monthlyIncrease: Math.round(revenueIncrease),
      newMonthlyRevenue: Math.round(newMonthlyRevenue),
      annualImpact: Math.round(annualImpact),
      timeSaved,
      timeSavingsValue
    };
  };

  const impact = calculateImpact();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">ROI Calculator</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See your potential revenue impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate how much revenue Aderai can generate for your business
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <Card className="p-8 border-2">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" />
              Your Numbers
            </h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="list-size" className="text-base font-semibold mb-2 block">
                  Email List Size
                </Label>
                <Input
                  id="list-size"
                  type="number"
                  value={emailListSize}
                  onChange={(e) => setEmailListSize(Number(e.target.value))}
                  className="text-lg h-12"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">Number of subscribers</p>
              </div>

              <div>
                <Label htmlFor="aov" className="text-base font-semibold mb-2 block">
                  Average Order Value
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="aov"
                    type="number"
                    value={avgOrderValue}
                    onChange={(e) => setAovValue(Number(e.target.value))}
                    className="text-lg h-12 pl-7"
                    min="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Typical purchase amount</p>
              </div>

              <div>
                <Label htmlFor="revenue" className="text-base font-semibold mb-2 block">
                  Current Monthly Email Revenue
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="revenue"
                    type="number"
                    value={currentEmailRevenue}
                    onChange={(e) => setCurrentRevenue(Number(e.target.value))}
                    className="text-lg h-12 pl-7"
                    min="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenue from email campaigns</p>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold">Your Potential Results</h3>
              </div>

              <div className="space-y-6">
                <div className="pb-6 border-b border-border">
                  <div className="text-sm text-muted-foreground mb-1">Additional Monthly Revenue</div>
                  <div className="text-4xl font-bold text-primary">
                    +${impact.monthlyIncrease.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    35% revenue increase from better segmentation
                  </div>
                </div>

                <div className="pb-6 border-b border-border">
                  <div className="text-sm text-muted-foreground mb-1">New Monthly Revenue</div>
                  <div className="text-3xl font-bold">
                    ${impact.newMonthlyRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="pb-6 border-b border-border">
                  <div className="text-sm text-muted-foreground mb-1">Annual Revenue Impact</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    +${impact.annualImpact.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">First year projection</div>
                </div>

                <div className="pb-6 border-b border-border">
                  <div className="text-sm text-muted-foreground mb-1">Time Saved Monthly</div>
                  <div className="text-2xl font-bold">{impact.timeSaved}+ hours</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Worth ${impact.timeSavingsValue.toLocaleString()} in labor costs
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Efficiency Gain</div>
                  <div className="text-3xl font-bold">10+ hrs/mo</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Time saved with automated segmentation
                  </div>
                </div>
              </div>
            </Card>

            <div className="text-center">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="group bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/50 inline-flex items-center gap-2"
              >
                Start Generating Revenue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-sm text-muted-foreground mt-3">
                Join 500+ brands already seeing results
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            * Calculations based on industry benchmarks. Actual results may vary. 
            Conservative estimate of 35% revenue lift from advanced segmentation.
          </p>
        </div>
      </div>
    </section>
  );
};
