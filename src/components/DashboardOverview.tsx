import React, { useState, useMemo } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { HelpTooltip } from '@/components/HelpTooltip';
import { ActivityHistoryModal } from '@/components/ActivityHistoryModal';

const TOTAL_AVAILABLE_SEGMENTS = 70;

export const DashboardOverview = () => {
  const navigate = useNavigate();
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [segmentPage, setSegmentPage] = useState(0);
  const SEGMENTS_PER_PAGE = 4;
  
  const { 
    totalSegmentsCreated, 
    aiSuggestionsUsed, 
    daysSinceSignup, 
    klaviyoConnected,
    recentActivity,
    createdSegments,
    firstName,
    tipOfTheDay,
    lastRefresh,
    refreshStats,
    loading 
  } = useDashboardStats();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Memoize expensive calculations (must be before early return)
  const progressPercentage = useMemo(() => 
    (totalSegmentsCreated / TOTAL_AVAILABLE_SEGMENTS) * 100,
    [totalSegmentsCreated]
  );

  const paginatedSegments = useMemo(() => {
    const start = segmentPage * SEGMENTS_PER_PAGE;
    return createdSegments.slice(start, start + SEGMENTS_PER_PAGE);
  }, [createdSegments, segmentPage]);

  const totalSegmentPages = useMemo(() => 
    Math.ceil(createdSegments.length / SEGMENTS_PER_PAGE),
    [createdSegments.length]
  );

  // Define all onboarding steps with completion status
  const onboardingSteps = useMemo(() => {
    return [
      {
        title: 'Connect Klaviyo',
        description: 'Link your Klaviyo account to start creating segments',
        action: 'Connect Now',
        onClick: () => navigate('/klaviyo-setup'),
        icon: Target,
        completed: klaviyoConnected,
      },
      {
        title: 'Create your first segment',
        description: 'Start building your audience with pre-built templates',
        action: 'View Segments',
        onClick: () => navigate('/dashboard?tab=segments'),
        icon: Target,
        completed: totalSegmentsCreated > 0,
      },
      {
        title: 'Try AI-powered suggestions',
        description: 'Get custom segment recommendations based on your goals',
        action: 'Try AI',
        onClick: () => navigate('/dashboard?tab=ai'),
        icon: Sparkles,
        completed: aiSuggestionsUsed > 0,
      },
    ];
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
                {firstName ? `Welcome back, ${firstName}!` : 'Welcome back!'}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={`Last updated ${formatDistanceToNow(lastRefresh, { addSuffix: true })}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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

            {/* Created segments list with pagination */}
            {createdSegments.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your Segments</p>
                <div className="space-y-1.5">
                  {paginatedSegments.map((segment) => (
                    <div 
                      key={segment.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{segment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(segment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Pagination controls */}
                {totalSegmentPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSegmentPage(p => Math.max(0, p - 1))}
                      disabled={segmentPage === 0}
                      className="h-7 px-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {segmentPage + 1} of {totalSegmentPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSegmentPage(p => Math.min(totalSegmentPages - 1, p + 1))}
                      disabled={segmentPage >= totalSegmentPages - 1}
                      className="h-7 px-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
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
                <Button 
                  variant="ghost" 
                  className="w-full text-sm group"
                  onClick={() => setActivityModalOpen(true)}
                >
                  View all activity
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Complete these steps to get the most out of Aderai
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-3">
          {onboardingSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  step.completed 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/30 border-border/30 hover:bg-muted/50 hover:border-border/50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                    step.completed 
                      ? 'bg-primary/20 border-primary/40' 
                      : 'bg-muted/50 border-border/30'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${step.completed ? 'text-primary' : ''}`}>
                      {step.title}
                      {step.completed && <span className="ml-2 text-xs font-normal text-primary/70">Completed</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {!step.completed && (
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={step.onClick}
                    className="ml-4"
                  >
                    {step.action}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </div>

      <ActivityHistoryModal 
        open={activityModalOpen} 
        onOpenChange={setActivityModalOpen} 
      />
    </div>
  );
};
