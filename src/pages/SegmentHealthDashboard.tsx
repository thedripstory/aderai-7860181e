import { SegmentHealthMonitor } from "@/components/SegmentHealthMonitor";

export default function SegmentHealthDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <SegmentHealthMonitor />
      </div>
    </div>
  );
}
