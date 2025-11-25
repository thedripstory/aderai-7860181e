import { Calculator, BarChart3, Activity, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValueCalculator } from "@/components/ValueCalculator";
import { ComparisonChart } from "@/components/ComparisonChart";
import { RevenueTestimonials } from "@/components/RevenueTestimonials";
import { SegmentHealthMonitor } from "@/components/SegmentHealthMonitor";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function FeatureShowcase() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Feature Showcase</h1>
              <p className="text-muted-foreground">Explore all the powerful features designed to maximize your email revenue</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">ROI Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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

          <TabsContent value="health">
            <SegmentHealthMonitor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
