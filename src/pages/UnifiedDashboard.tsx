import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader, RefreshCw, Target, Key, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { KlaviyoSetupBanner } from '@/components/KlaviyoSetupBanner';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { DashboardOverview } from '@/components/DashboardOverview';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OnboardingTour } from '@/components/OnboardingTour';
import { SegmentDashboard } from '@/components/SegmentDashboard';
import { BUNDLES, SEGMENTS, UserSegmentSettings, DEFAULT_SEGMENT_SETTINGS } from '@/lib/segmentData';
import { SegmentCreationFlow } from '@/components/SegmentCreationFlow';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AISegmentSuggester } from '@/components/AISegmentSuggester';
import { KlaviyoSyncIndicator } from '@/components/KlaviyoSyncIndicator';
import { KlaviyoHealthDashboard } from '@/components/KlaviyoHealthDashboard';
import { SegmentHistoricalTrends } from '@/components/SegmentHistoricalTrends';
import { SegmentOperationHistory } from '@/components/SegmentOperationHistory';
import { AderaiSegmentManager } from '@/components/AderaiSegmentManager';
import { SegmentPerformance } from '@/components/SegmentPerformance';

import { AchievementsPanel } from '@/components/AchievementsPanel';
import { ErrorLogger } from '@/lib/errorLogger';
import { useKlaviyoSegments, KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { EmptyState } from '@/components/ui/empty-state';
import { MobileMenu } from '@/components/MobileMenu';
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
  const [view, setView] = useState<'creating' | 'results' | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics state
  const [allSegments, setAllSegments] = useState<any[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, any>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsProgress, setAnalyticsProgress] = useState({ current: 0, total: 0 });

  const { loading: creatingSegments, results, createSegments, setResults } = useKlaviyoSegments();
  const { trackAction } = useFeatureTracking('unified_dashboard');
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
        const newSegments = [...prev, ...bundle.segments];
        return Array.from(new Set(newSegments));
      });
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedSegments(SEGMENTS.map(s => s.id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedSegments([]);
  }, []);

  const handleCreateSegments = useCallback(async (segmentIds?: string[]) => {
    const segmentsToCreate = segmentIds || selectedSegments;
    if (segmentsToCreate.length === 0 || klaviyoKeys.length === 0) {
      return;
    }

    trackAction('create_segments', { segment_count: segmentsToCreate.length });
    setView('creating');
    await createSegments(
      segmentsToCreate,
      klaviyoKeys[activeKeyIndex],
      SEGMENTS
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

  const fetchAllSegments = async () => {
    if (klaviyoKeys.length === 0) {
      return;
    }

    const activeKey = klaviyoKeys[activeKeyIndex];
    if (!activeKey?.id) {
      return;
    }

    trackAction('fetch_analytics');
    setLoadingAnalytics(true);
    
    try {
      let allFetchedSegments: any[] = [];
      let includedTags: Record<string, any> = {};
      // Fetch segments with tags (profile_count not available on list endpoint due to Klaviyo API limitations)
      let nextPageUrl: string | null = 'https://a.klaviyo.com/api/segments/?include=tags';
      
      // Fetch all pages of segments
      while (nextPageUrl) {
        const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
          body: {
            keyId: activeKey.id,
            endpoint: nextPageUrl,
            method: 'GET',
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }
        
        // Check if Klaviyo returned an error
        if (data?.errors) {
          console.error('Klaviyo API error:', data.errors);
          throw new Error(data.errors[0]?.detail || 'Klaviyo API error');
        }
        
        const pageSegments = data?.data || [];
        allFetchedSegments = [...allFetchedSegments, ...pageSegments];
        
        // Collect included tags from the response
        if (data?.included) {
          data.included.forEach((item: any) => {
            if (item.type === 'tag') {
              includedTags[item.id] = item.attributes?.name || '';
            }
          });
        }
        
        // Check for next page
        nextPageUrl = data?.links?.next || null;
        
        setAnalyticsProgress({ 
          current: allFetchedSegments.length, 
          total: allFetchedSegments.length + (nextPageUrl ? 100 : 0) 
        });
      }
      
      // Fetch latest profile counts from historical data table
      let historicalCounts: Record<string, number> = {};
      if (currentUser?.id) {
        const segmentIds = allFetchedSegments.map((s: any) => s.id);
        
        // Get the most recent profile count for each segment
        const { data: historicalData } = await supabase
          .from('segment_historical_data')
          .select('segment_klaviyo_id, profile_count, recorded_at')
          .eq('klaviyo_key_id', activeKey.id)
          .in('segment_klaviyo_id', segmentIds)
          .order('recorded_at', { ascending: false });
        
        if (historicalData) {
          // Keep only the most recent entry for each segment
          historicalData.forEach((record: any) => {
            if (!historicalCounts[record.segment_klaviyo_id]) {
              historicalCounts[record.segment_klaviyo_id] = record.profile_count;
            }
          });
        }
      }
      
      setAllSegments(allFetchedSegments);
      
      // Build stats from segment attributes + historical profile counts
      const stats: Record<string, any> = {};
      
      allFetchedSegments.forEach((segment: any) => {
        // Use historical profile count if available, otherwise null
        const profileCount = historicalCounts[segment.id] ?? null;
        const segmentName = segment.attributes?.name || 'Unnamed Segment';
        
        // Check if segment has Aderai tag (tag-based detection)
        const segmentTagIds = segment.relationships?.tags?.data?.map((t: any) => t.id) || [];
        const segmentTags = segmentTagIds.map((id: string) => includedTags[id]).filter(Boolean);
        const hasAderaiTag = segmentTags.some((tag: string) => 
          tag.toLowerCase().includes('aderai')
        );
        
        // Check name-based detection
        const hasAderaiName = segmentName.includes('| Aderai') || segmentName.toLowerCase().includes('aderai');
        
        stats[segment.id] = {
          profileCount: profileCount,
          name: segmentName,
          created: segment.attributes?.created || null,
          updated: segment.attributes?.updated || null,
          isStarred: segment.attributes?.is_starred || false,
          isActive: segment.attributes?.is_active !== false,
          tags: segmentTags,
          isAderai: hasAderaiTag || hasAderaiName,
        };
      });

      setSegmentStats(stats);
      
      // Count Aderai segments and segments with profile counts for toast
      const aderaiCount = Object.values(stats).filter((s: any) => s.isAderai).length;
      const profileCountsLoaded = Object.values(stats).filter((s: any) => s.profileCount !== null).length;
      
      toast.success('Analytics loaded successfully', {
        description: `${allFetchedSegments.length} segments fetched (${profileCountsLoaded} with counts)${aderaiCount > 0 ? ` • ${aderaiCount} Aderai` : ''}`,
      });
    } catch (error) {
      console.error('Error fetching segments:', error);
      
      await ErrorLogger.logKlaviyoError(
        'Fetch All Segments',
        error as Error,
        activeKey?.id
      );
      
      toast.error('Failed to load analytics', {
        description: 'Check your Klaviyo connection and try again',
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Auto-fetch analytics when switching to the analytics tab
  useEffect(() => {
    if (activeTab === 'analytics' && klaviyoKeys.length > 0 && allSegments.length === 0 && !loadingAnalytics) {
      fetchAllSegments();
    }
  }, [activeTab, klaviyoKeys]);

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
    return (
      <SegmentCreationFlow
        loading={creatingSegments}
        results={results}
        onViewResults={() => setView(null)}
        onRetryFailed={handleRetryFailed}
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
              <TabsTrigger value="performance">Performance</TabsTrigger>
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
              currentTier="free"
              userSettings={klaviyoKeys[activeKeyIndex] ? {
                currencySymbol: klaviyoKeys[activeKeyIndex].currency_symbol || '$',
                highValueThreshold: klaviyoKeys[activeKeyIndex].high_value_threshold || 500,
                vipThreshold: klaviyoKeys[activeKeyIndex].vip_threshold || 1000,
                aov: klaviyoKeys[activeKeyIndex].aov || 100,
                lapsedDays: klaviyoKeys[activeKeyIndex].lapsed_days || 90,
                churnedDays: klaviyoKeys[activeKeyIndex].churned_days || 180,
                newCustomerDays: klaviyoKeys[activeKeyIndex].new_customer_days || 60,
              } : DEFAULT_SEGMENT_SETTINGS}
            />

            {selectedSegments.length > 0 && (
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl border border-primary/30 shadow-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-sm text-muted-foreground">Ready to create in Klaviyo</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCreateSegments()}
                    disabled={creatingSegments}
                    size="lg"
                    className="shadow-lg shadow-primary/20"
                  >
                    {creatingSegments ? 'Creating...' : 'Create Segments'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {klaviyoKeys.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Connect Klaviyo to view analytics"
                description="Analytics show segment performance, profile counts, and growth trends. Connect your Klaviyo account to start tracking your audience data."
                actionLabel="Connect Klaviyo"
                onAction={() => navigate('/klaviyo-setup')}
                secondaryActionLabel="Learn More"
                onSecondaryAction={() => window.open('/help?article=klaviyo-setup', '_blank')}
              />
            ) : (
              <>
                {/* Refresh button - always visible when Klaviyo is connected */}
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={fetchAllSegments} 
                    disabled={loadingAnalytics}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                    {loadingAnalytics ? 'Loading...' : 'Refresh Analytics'}
                  </Button>
                </div>
                <AnalyticsDashboard
                  allSegments={allSegments}
                  segmentStats={segmentStats}
                  loadingAnalytics={loadingAnalytics}
                  analyticsProgress={analyticsProgress}
                  onShowHealthScore={() => {}}
                  calculateHealthScore={() => 0}
                  klaviyoKeyId={klaviyoKeys[activeKeyIndex]?.id}
                />
              </>
            )}
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
            {klaviyoKeys.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Connect Klaviyo to view performance"
                description="Track how your segments perform over time with detailed metrics on engagement, conversions, and growth. Connect your Klaviyo account to start."
                actionLabel="Connect Klaviyo"
                onAction={() => navigate('/klaviyo-setup')}
              />
            ) : (
              <SegmentPerformance 
                klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
                apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
              />
            )}
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
    </div>
    </PageErrorBoundary>
  );
}
