import { useState } from "react";
import { Calculator, BarChart3, Activity, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValueCalculator } from "@/components/ValueCalculator";
import { ComparisonChart } from "@/components/ComparisonChart";
import { RevenueTestimonials } from "@/components/RevenueTestimonials";
import { ROITracker } from "@/components/ROITracker";
import { SegmentHealthMonitor } from "@/components/SegmentHealthMonitor";
import { SubscriptionGate } from "@/components/SubscriptionGate";

export default function FeatureShowcase() {
  return (
    <SubscriptionGate>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-6 bg-gradient-to-br from-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Aderai Feature Showcase
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore all the powerful features designed to maximize your email revenue
          </p>
        </div>
      </section>

      {/* Tabbed Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">ROI Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Comparison</span>
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">ROI Tracker</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Health Monitor</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator">
              <ValueCalculator />
            </TabsContent>

            <TabsContent value="comparison">
              <ComparisonChart />
            </TabsContent>

            <TabsContent value="testimonials">
              <RevenueTestimonials />
            </TabsContent>

            <TabsContent value="tracker">
              <ROITracker />
            </TabsContent>

            <TabsContent value="health">
              <SegmentHealthMonitor />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
    </SubscriptionGate>
  );
}
