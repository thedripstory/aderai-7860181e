import { SegmentHealthMonitor } from "@/components/SegmentHealthMonitor";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Activity } from "lucide-react";

export default function SegmentHealthDashboard() {
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
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Segment Health</h1>
              <p className="text-muted-foreground">Monitor the performance and health of your segments</p>
            </div>
          </div>
        </div>

        <SegmentHealthMonitor />
      </main>
    </div>
  );
}
