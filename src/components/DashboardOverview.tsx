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
import { HelpTooltip } from '@/components/HelpTooltip';
import { useMemo } from 'react';

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

  // Memoize expensive calculations (must be before early return)
  const progressPercentage = useMemo(() => 
    (totalSegmentsCreated / TOTAL_AVAILABLE_SEGMENTS) * 100,
    [totalSegmentsCreated]
  );

  // Determine suggested next actions (memoized to avoid recalculation)
  const nextActions = useMemo(() => {
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
  }, [klaviyoConnected, totalSegmentsCreated, aiSuggestionsUsed, navigate]);

  if (loading) {
    return <LoadingState message="Loading your dashboard" description="Fetching your stats and recent activity..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-2xl">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
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
        <CardContent className="relative">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm">
            <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Tip of the Day</p>
              <p className="text-sm text-muted-foreground">{tipOfTheDay}</p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Segments Created Card */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Segments Created</CardTitle>
              <HelpTooltip content="Total number of segments you've deployed to your Klaviyo account using Aderai" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{totalSegmentsCreated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {TOTAL_AVAILABLE_SEGMENTS} available
            </p>
          </CardContent>
        </div>

        {/* AI Suggestions Card */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">AI Suggestions Used</CardTitle>
              <HelpTooltip content="Number of times you've used AI to generate custom segment recommendations based on your business goals" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{aiSuggestionsUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime usage
            </p>
          </CardContent>
        </div>

        {/* Days Active Card */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-border/70 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <HelpTooltip content="Number of days since you created your Aderai account" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 border border-border/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{daysSinceSignup}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since signup
            </p>
          </CardContent>
        </div>

        {/* Klaviyo Status Card */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-border/70 transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${klaviyoConnected ? 'from-primary/5' : 'from-secondary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Klaviyo Status</CardTitle>
              <HelpTooltip content="Shows whether your Klaviyo account is connected. You need an active connection to create and manage segments" />
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${klaviyoConnected ? 'from-primary/20 to-primary/10 border-primary/30' : 'from-secondary/20 to-secondary/10 border-border/30'} border flex items-center justify-center`}>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <Badge 
              variant={klaviyoConnected ? "default" : "secondary"}
              className="text-sm px-3 py-1"
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Section */}
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Segmentation Progress
            </CardTitle>
            <CardDescription>
              Track your journey to complete segment coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {totalSegmentsCreated} of {TOTAL_AVAILABLE_SEGMENTS} segments created
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-muted/50 backdrop-blur-sm" />
                {progressPercentage > 0 && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-md -z-10"
                    style={{ width: `${progressPercentage}%` }}
                  />
                )}
              </div>
            </div>
            
            {progressPercentage < 100 && (
              <Button 
                className="w-full group shadow-lg hover:shadow-xl transition-all duration-300" 
                variant="outline"
                onClick={() => navigate('/dashboard?tab=segments')}
              >
                Complete your segmentation library
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </CardContent>
        </div>

        {/* Recent Activity Feed */}
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and events
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50 transition-all duration-200"
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
                    className="w-full text-sm group"
                    onClick={() => navigate('/dashboard?tab=analytics')}
                  >
                    View all activity
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Suggested Next Actions */}
      {nextActions.length > 0 && (
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Suggested Next Actions
            </CardTitle>
            <CardDescription>
              Quick steps to get the most out of Aderai
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-3">
            {nextActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant={action.variant}
                    onClick={action.onClick}
                    className="ml-4 shadow-md"
                  >
                    {action.action}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </div>
      )}
    </div>
  );
};
