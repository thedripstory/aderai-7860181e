import React, { useState, useEffect, useCallback } from 'react';
import { Loader, Target, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { KlaviyoSetupBanner } from '@/components/KlaviyoSetupBanner';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { DashboardOverview } from '@/components/DashboardOverview';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OnboardingTour } from '@/components/OnboardingTour';
import { SegmentDashboard } from '@/components/SegmentDashboard';
import { BUNDLES, SEGMENTS, UserSegmentSettings, DEFAULT_SEGMENT_SETTINGS } from '@/lib/segmentData';
import { SegmentCreationFlow } from '@/components/SegmentCreationFlow';
import { AISegmentSuggester } from '@/components/AISegmentSuggester';
import { KlaviyoSyncIndicator } from '@/components/KlaviyoSyncIndicator';
import { KlaviyoHealthDashboard } from '@/components/KlaviyoHealthDashboard';
import { SegmentHistoricalTrends } from '@/components/SegmentHistoricalTrends';
import { SegmentOperationHistory } from '@/components/SegmentOperationHistory';
import { AderaiSegmentManager } from '@/components/AderaiSegmentManager';
import { PremiumInviteGate } from '@/components/PremiumInviteGate';
import { WelcomeBackModal } from '@/components/WelcomeBackModal';

import { AchievementsPanel } from '@/components/AchievementsPanel';
import { useKlaviyoSegments, KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { useKlaviyoSegmentStatus } from '@/hooks/useKlaviyoSegmentStatus';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { EmptyState } from '@/components/ui/empty-state';
import { MobileMenu } from '@/components/MobileMenu';
import { DashboardFooter } from '@/components/DashboardFooter';
import { toast } from 'sonner';

export default function UnifiedDashboard() {
  useNetworkStatus();
  useInactivityLogout();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [klaviyoKeys, setKlaviyoKeys] = useState<KlaviyoKey[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [segmentCustomInputs, setSegmentCustomInputs] = useState<Record<string, string>>({});
  const [view, setView] = useState<'creating' | 'results' | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');


  const { loading: creatingSegments, results, createSegments, setResults, batchProgress } = useKlaviyoSegments();
  const { trackAction } = useFeatureTracking('unified_dashboard');
  
  // Track which segments are already created in Klaviyo
  const { isSegmentCreated, syncSegmentStatus, createdCount } = useKlaviyoSegmentStatus(
    klaviyoKeys.length > 0 ? klaviyoKeys[activeKeyIndex]?.id : null
  );
  const { 
    run: runTour, 
    stepIndex, 
    loading: tourLoading,
    startTour,
    handleJoyrideCallback,
    completeTour 
  } = useOnboardingTour();

  // Handle URL tab parameter
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData) {
        navigate('/login');
        return;
      }

      setEmailVerified(userData.email_verified || false);
      setCurrentUser(session.user);
      await loadKlaviyoKeys(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loadKlaviyoKeys = async (userId: string) => {
    const { data } = await supabase
      .from('klaviyo_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setKlaviyoKeys(data);
      setActiveKeyIndex(0);
    }
  };

  const toggleSegment = useCallback((segmentId: string) => {
    setSelectedSegments(prev => {
      if (prev.includes(segmentId)) {
        return prev.filter(id => id !== segmentId);
      }
      return [...prev, segmentId];
    });
  }, []);

  const selectBundle = useCallback((bundleId: string) => {
    const bundle = BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      setSelectedSegments(prev => {
        // Check if all segments in bundle are already selected
        const allSelected = bundle.segments.every(id => prev.includes(id));
        
        if (allSelected) {
          // Deselect all segments from this bundle
          return prev.filter(id => !bundle.segments.includes(id));
        } else {
          // Add remaining segments from bundle
          const newSegments = [...prev, ...bundle.segments];
          return Array.from(new Set(newSegments));
        }
      });
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    // Only select available segments that are NOT already created in Klaviyo
    const availableSegments = SEGMENTS.filter(s => {
      if (s.unavailable) return false;
      // Skip segments already created in Klaviyo
      if (isSegmentCreated(s.name)) return false;
      return true;
    });
    setSelectedSegments(availableSegments.map(s => s.id));
  }, [isSegmentCreated]);

  const handleClearAll = useCallback(() => {
    setSelectedSegments([]);
  }, []);

  const handleCustomInputChange = useCallback((segmentId: string, value: string) => {
    setSegmentCustomInputs(prev => ({ ...prev, [segmentId]: value }));
  }, []);

  const handleCreateSegments = useCallback(async (segmentIds?: string[]) => {
    const segmentsToCreate = segmentIds || selectedSegments;
    
    // Filter out any unavailable segments before creating
    const availableSegments = segmentsToCreate.filter(id => {
      const segment = SEGMENTS.find(s => s.id === id);
      return segment && !segment.unavailable;
    });
    
    if (availableSegments.length === 0 || klaviyoKeys.length === 0) {
      toast.error('No segments available to create');
      return;
    }

    trackAction('create_segments', { segment_count: availableSegments.length });
    setView('creating');
    await createSegments(
      availableSegments,
      klaviyoKeys[activeKeyIndex],
      SEGMENTS,
      undefined,
      segmentCustomInputs
    );
    
    // Check segment creation achievements
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get total segment count
        const { count } = await supabase
          .from('ai_suggestions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Award achievements based on segment count
        const checkAchievements = async (criteriaValue: number) => {
          const { data: achievement } = await supabase
            .from('achievements')
            .select('id')
            .eq('criteria_type', 'segments_created')
            .eq('criteria_value', criteriaValue)
            .single();

          if (achievement) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_id: achievement.id
              })
              .select()
              .single();
          }
        };

        const totalCount = (count || 0) + segmentsToCreate.length;
        if (totalCount >= 1) await checkAchievements(1);
        if (totalCount >= 25) await checkAchievements(25);
        if (totalCount >= 50) await checkAchievements(50);
      }
    } catch (error) {
      // Silently handle achievement check errors
    }

    setView('results');
  }, [selectedSegments, klaviyoKeys, activeKeyIndex, trackAction, createSegments]);

  const handleRetryFailed = useCallback(async (failedSegmentIds: string[]) => {
    setResults([]);
    await handleCreateSegments(failedSegmentIds);
  }, [handleCreateSegments]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (view === 'creating' || view === 'results') {
    const activeKey = klaviyoKeys[activeKeyIndex];
    const userSettings = activeKey ? {
      currencySymbol: activeKey.currency_symbol || '$',
      highValueThreshold: activeKey.high_value_threshold || 500,
      vipThreshold: activeKey.vip_threshold || 1000,
      aov: activeKey.aov || 100,
      lapsedDays: activeKey.lapsed_days || 90,
      churnedDays: activeKey.churned_days || 180,
      newCustomerDays: activeKey.new_customer_days || 60,
    } : undefined;
    
    return (
      <SegmentCreationFlow
        loading={creatingSegments}
        results={results}
        onViewResults={() => setView(null)}
        onRetryFailed={handleRetryFailed}
        userSettings={userSettings}
        batchProgress={batchProgress}
      />
    );
  }

  return (
    <PageErrorBoundary pageName="Dashboard">
    <div className="min-h-screen relative bg-background overflow-hidden">
      {/* Animated gradient orbs background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,transparent_0%,hsl(var(--border)/0.02)_50%,transparent_100%)] bg-[length:100px_100px] pointer-events-none" />

      {/* Onboarding Tour */}
      {!tourLoading && (
        <OnboardingTour
          run={runTour}
          stepIndex={stepIndex}
          onCallback={handleJoyrideCallback}
          onComplete={completeTour}
        />
      )}

      {/* Welcome Back Modal - shows when segments were created while user was away */}
      <WelcomeBackModal />

      {currentUser && !emailVerified && (
        <EmailVerificationBanner 
          userEmail={currentUser.email}
          emailVerified={emailVerified}
          userId={currentUser.id}
        />
      )}
      
      <KlaviyoSetupBanner hasKlaviyoKeys={klaviyoKeys.length > 0} />
      
      {/* New Header with Logo */}
      <DashboardHeader onStartTour={startTour}>
        {klaviyoKeys.length > 0 && (
          <KlaviyoSyncIndicator
            klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
            apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
          />
        )}
        <FeedbackWidget />
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tubelight-style navigation */}
          <div className="flex justify-center mb-8">
            <TabsList className="w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="segments" data-tour="segments-tab">Segments</TabsTrigger>
              <TabsTrigger value="analytics" data-tour="analytics-tab">Analytics</TabsTrigger>
              <TabsTrigger value="ai" data-tour="ai-tab">AI</TabsTrigger>
              <TabsTrigger value="performance" className="relative">
                Performance
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-600 rounded-full border border-amber-500/30 cursor-help">
                        🔧
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>Under maintenance - Some features may be incomplete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div data-tour="dashboard-stats" className="space-y-6">
              <DashboardOverview />
              <AchievementsPanel />
            </div>
          </TabsContent>

          <TabsContent value="segments">
            <SegmentDashboard
              selectedSegments={selectedSegments}
              onToggleSegment={toggleSegment}
              onSelectBundle={selectBundle}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              segmentLimit={999}
              currentTier="starter"
              userSettings={klaviyoKeys[activeKeyIndex] ? {
                currencySymbol: klaviyoKeys[activeKeyIndex].currency_symbol || '$',
                highValueThreshold: klaviyoKeys[activeKeyIndex].high_value_threshold || 500,
                vipThreshold: klaviyoKeys[activeKeyIndex].vip_threshold || 1000,
                aov: klaviyoKeys[activeKeyIndex].aov || 100,
                lapsedDays: klaviyoKeys[activeKeyIndex].lapsed_days || 90,
                churnedDays: klaviyoKeys[activeKeyIndex].churned_days || 180,
                newCustomerDays: klaviyoKeys[activeKeyIndex].new_customer_days || 60,
              } : DEFAULT_SEGMENT_SETTINGS}
              customInputs={segmentCustomInputs}
              onCustomInputChange={handleCustomInputChange}
            />

          </TabsContent>

          <TabsContent value="analytics">
            <PremiumInviteGate featureName="Advanced Analytics" />
          </TabsContent>

          <TabsContent value="ai">
            {klaviyoKeys.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Connect Klaviyo to use AI"
                description="AI segment suggestions analyze your Klaviyo data to recommend custom audience segments tailored to your business goals. Connect your account to get started."
                actionLabel="Connect Klaviyo"
                onAction={() => navigate('/klaviyo-setup')}
                secondaryActionLabel="Learn about AI"
                onSecondaryAction={() => window.open('/help?article=ai-features', '_blank')}
              />
            ) : (
              <AISegmentSuggester
                activeKey={klaviyoKeys[activeKeyIndex]}
              />
            )}
          </TabsContent>

          <TabsContent value="performance">
            <PremiumInviteGate featureName="Performance Insights" variant="performance" />
          </TabsContent>

          <TabsContent value="more">
            <div className="grid gap-6">
              {klaviyoKeys.length > 0 && (
                <>
                  <KlaviyoHealthDashboard 
                    klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
                    apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
                  />
                  <SegmentHistoricalTrends klaviyoKeyId={klaviyoKeys[activeKeyIndex].id} />
                  <SegmentOperationHistory klaviyoKeyId={klaviyoKeys[activeKeyIndex].id} />
                  <AderaiSegmentManager klaviyoKeyId={klaviyoKeys[activeKeyIndex].id} />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dashboard Footer */}
      <DashboardFooter />
    </div>
    
    {/* Floating sticky segment selection bar */}
    {selectedSegments.length > 0 && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fade-in">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/95 to-primary/85 backdrop-blur-xl border border-primary-foreground/20 shadow-2xl shadow-primary/40 relative overflow-hidden animate-[pulse_2s_ease-in-out_2]">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
          <div className="absolute -inset-1 bg-primary/30 blur-xl -z-10" />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-primary-foreground text-lg">
                  {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-primary-foreground/80">Ready to create in Klaviyo</p>
              </div>
            </div>
            <ShimmerButton
              onClick={() => handleCreateSegments()}
              disabled={creatingSegments}
              shimmerColor="#ffffff"
              background="hsl(var(--background))"
              className="shadow-2xl text-foreground"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight lg:text-base">
                {creatingSegments ? 'Creating...' : 'Create Segments'}
              </span>
            </ShimmerButton>
          </div>
        </div>
      </div>
    )}
    </PageErrorBoundary>
  );
}
