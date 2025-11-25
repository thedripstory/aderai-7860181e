import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Shield, Sparkles } from "lucide-react";
import { ChurnPredictor } from "@/components/ChurnPredictor";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function AIFeaturesDashboard() {
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
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI-Powered Features</h1>
              <p className="text-muted-foreground">Advanced predictive analytics and intelligent automation</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="churn" className="w-full">
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="churn" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Shield className="w-4 h-4" />
              Churn Predictor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="churn">
            <ChurnPredictor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
