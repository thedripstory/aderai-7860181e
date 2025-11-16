import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Shield, BarChart3, FileText } from "lucide-react";
import { ClientPerformanceScorecard } from "@/components/ClientPerformanceScorecard";
import { AgencyTeamPermissions } from "@/components/AgencyTeamPermissions";
import { CrossClientInsights } from "@/components/CrossClientInsights";
import { ClientProposalGenerator } from "@/components/ClientProposalGenerator";

export default function AgencyToolsDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Agency Tools</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive client management and performance tracking
          </p>
        </div>

        <Tabs defaultValue="scorecard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="scorecard" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Scorecards</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Proposals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard">
            <ClientPerformanceScorecard />
          </TabsContent>

          <TabsContent value="insights">
            <CrossClientInsights />
          </TabsContent>

          <TabsContent value="team">
            <AgencyTeamPermissions />
          </TabsContent>

          <TabsContent value="proposals">
            <ClientProposalGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
