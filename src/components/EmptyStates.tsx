import { FileQuestion, Sparkles, BarChart3, Mail, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-2">
        {action && (
          <Button onClick={action.onClick} className="w-full">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick} className="w-full">
            {secondaryAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function NoSegmentsEmptyState({ onCreateSegments }: { onCreateSegments: () => void }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-8 w-8 text-muted-foreground" />}
      title="No Segments Yet"
      description="Get started by creating your first batch of segments. Aderai will automatically set up 70+ high-performing segments in your Klaviyo account."
      action={{
        label: "Create Segments Now",
        onClick: onCreateSegments,
      }}
    />
  );
}

export function NoAnalyticsEmptyState() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
      title="No Analytics Data Yet"
      description="Analytics will appear here once your segments start collecting data. This usually takes 24-48 hours after segment creation."
    />
  );
}

export function NoAISuggestionsEmptyState({ onGenerateSuggestions }: { onGenerateSuggestions: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="h-8 w-8 text-muted-foreground" />}
      title="AI Segment Suggestions"
      description="Get personalized segment recommendations based on your Klaviyo data. Our AI analyzes your customer behavior to suggest high-impact segments."
      action={{
        label: "Generate AI Suggestions",
        onClick: onGenerateSuggestions,
      }}
    />
  );
}

export function NoKlaviyoConnectionEmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <EmptyState
      icon={<Settings className="h-8 w-8 text-muted-foreground" />}
      title="Connect Your Klaviyo Account"
      description="To use Aderai, you need to connect your Klaviyo account. This allows us to create and manage segments on your behalf."
      action={{
        label: "Connect Klaviyo",
        onClick: onConnect,
      }}
    />
  );
}

export function NoPerformanceDataEmptyState() {
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8 text-muted-foreground" />}
      title="No Campaign Data Yet"
      description="Performance metrics will appear once you've sent campaigns using your segments. Check back after running some campaigns!"
    />
  );
}
