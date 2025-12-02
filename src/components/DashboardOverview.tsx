import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Sparkles, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TOTAL_AVAILABLE_SEGMENTS = 70;

export const DashboardOverview = () => {
  const navigate = useNavigate();
  const { 
    totalSegmentsCreated, 
    aiSuggestionsUsed, 
    daysSinceSignup, 
    klaviyoConnected,
    recentActivity,
    accountName,
    tipOfTheDay,
    loading 
  } = useDashboardStats();

  if (loading) {
    return <LoadingState message="Loading your dashboard" description="Fetching your stats and recent activity..." />;
  }

  const progressPercentage = (totalSegmentsCreated / TOTAL_AVAILABLE_SEGMENTS) * 100;

  // Determine suggested next actions
  const getNextActions = () => {
    const actions = [];
    
    if (!klaviyoConnected) {
      actions.push({
        title: 'Connect Klaviyo to get started',
        description: 'Link your Klaviyo account to start creating segments',
        action: 'Connect Now',
        onClick: () => navigate('/klaviyo-setup'),
        icon: Target,
        variant: 'default' as const,
      });
    } else if (totalSegmentsCreated === 0) {
      actions.push({
        title: 'Create your first segment',
        description: 'Start building your audience with pre-built templates',
        action: 'View Segments',
        onClick: () => navigate('/dashboard?tab=segments'),
        icon: Target,
        variant: 'default' as const,
      });
    } else if (totalSegmentsCreated < 10) {
      actions.push({
        title: 'Try the Core Essentials bundle',
        description: 'Get the most important segments for your business',
        action: 'View Bundle',
        onClick: () => navigate('/dashboard?tab=segments'),
        icon: TrendingUp,
        variant: 'default' as const,
      });
    }

    if (aiSuggestionsUsed === 0) {
      actions.push({
        title: 'Get personalized segment suggestions with AI',
        description: 'Describe your goals and get custom segment recommendations',
        action: 'Try AI Suggestions',
        onClick: () => navigate('/dashboard?tab=ai'),
        icon: Sparkles,
        variant: 'secondary' as const,
      });
    }

    return actions;
  };

  const nextActions = getNextActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">
                {accountName ? `Welcome back, ${accountName}!` : 'Welcome back!'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-4 bg-accent/50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Tip of the Day</p>
              <p className="text-sm text-muted-foreground">{tipOfTheDay}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Segments Created</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSegmentsCreated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {TOTAL_AVAILABLE_SEGMENTS} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions Used</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiSuggestionsUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysSinceSignup}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since signup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klaviyo Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge 
              variant={klaviyoConnected ? "default" : "secondary"}
              className="text-sm"
            >
              {klaviyoConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {klaviyoConnected ? 'Account linked' : 'Setup required'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Segmentation Progress
            </CardTitle>
            <CardDescription>
              Track your journey to complete segment coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {totalSegmentsCreated} of {TOTAL_AVAILABLE_SEGMENTS} segments created
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            {progressPercentage < 100 && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/dashboard?tab=segments')}
              >
                Complete your segmentation library
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Your recent activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length > 0 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => navigate('/dashboard?tab=analytics')}
                  >
                    View all activity
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Next Actions */}
      {nextActions.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Suggested Next Actions
            </CardTitle>
            <CardDescription>
              Quick steps to get the most out of Aderai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant={action.variant}
                    onClick={action.onClick}
                    className="ml-4"
                  >
                    {action.action}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};