import { ROITracker } from "@/components/ROITracker";
import { SubscriptionGate } from "@/components/SubscriptionGate";

export default function ROIDashboard() {
  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <ROITracker />
        </div>
      </div>
    </SubscriptionGate>
  );
}
