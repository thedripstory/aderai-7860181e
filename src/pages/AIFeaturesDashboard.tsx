import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Shield } from "lucide-react";
import { ChurnPredictor } from "@/components/ChurnPredictor";

export default function AIFeaturesDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI-Powered Features</h1>
          <p className="text-xl text-muted-foreground">
            Advanced predictive analytics and intelligent automation
          </p>
        </div>

        <Tabs defaultValue="churn" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-8">
            <TabsTrigger value="churn" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Churn Predictor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="churn">
            <ChurnPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
