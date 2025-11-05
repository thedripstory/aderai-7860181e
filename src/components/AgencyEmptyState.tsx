import { Users, Plus, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgencyEmptyStateProps {
  onAddClient: () => void;
}

export function AgencyEmptyState({ onAddClient }: AgencyEmptyStateProps) {
  return (
    <div className="bg-card rounded-lg border-2 border-border p-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Users className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3">Welcome to Your Agency Dashboard</h3>
        <p className="text-muted-foreground mb-8">
          Start managing your clients by adding your first brand. Once added, you'll be able to
          create segments, track performance, and grow their business.
        </p>

        {/* CTA Button */}
        <Button onClick={onAddClient} size="lg" className="mb-8">
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Client
        </Button>

        {/* 3-Step Guide */}
        <div className="mt-12 pt-8 border-t border-border">
          <h4 className="text-lg font-semibold mb-6">How It Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-1 flex items-center gap-2">
                  Add Clients
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </h5>
                <p className="text-sm text-muted-foreground">
                  Connect your brand clients and their Klaviyo accounts
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold">2</span>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-1 flex items-center gap-2">
                  Create Segments
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </h5>
                <p className="text-sm text-muted-foreground">
                  Use AI to build powerful customer segments in seconds
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-1">Track Performance</h5>
                <p className="text-sm text-muted-foreground">
                  Monitor analytics and optimize campaigns for each client
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
