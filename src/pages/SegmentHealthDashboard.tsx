import { SegmentHealthMonitor } from "@/components/SegmentHealthMonitor";
import { SubscriptionGate } from "@/components/SubscriptionGate";

export default function SegmentHealthDashboard() {
  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <SegmentHealthMonitor />
        </div>
      </div>
    </SubscriptionGate>
  );
}
