import React, { useState, useEffect } from 'react';
import { Loader, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { KlaviyoSetupBanner } from '@/components/KlaviyoSetupBanner';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { DashboardOverview } from '@/components/DashboardOverview';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OnboardingTour } from '@/components/OnboardingTour';
import { SegmentDashboard, BUNDLES, SEGMENTS } from '@/components/SegmentDashboard';
import { SegmentCreationFlow } from '@/components/SegmentCreationFlow';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AISegmentSuggester } from '@/components/AISegmentSuggester';
import { KlaviyoSyncIndicator } from '@/components/KlaviyoSyncIndicator';
import { KlaviyoHealthDashboard } from '@/components/KlaviyoHealthDashboard';
import { SegmentHistoricalTrends } from '@/components/SegmentHistoricalTrends';
import { SegmentOperationHistory } from '@/components/SegmentOperationHistory';
import { AderaiSegmentManager } from '@/components/AderaiSegmentManager';
import { SegmentPerformance } from '@/components/SegmentPerformance';
import { SegmentTemplateManager } from '@/components/SegmentTemplateManager';
import { AutomationPlaybooks } from '@/components/AutomationPlaybooks';
import { SegmentCloner } from '@/components/SegmentCloner';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { ErrorLogger } from '@/lib/errorLogger';
import { useKlaviyoSegments, KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { toast } from 'sonner';

export default function UnifiedDashboard() {
  const navigate = useNavigate();
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
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

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

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => {
      if (prev.includes(segmentId)) {
        return prev.filter(id => id !== segmentId);
      }
      return [...prev, segmentId];
    });
  };

  const selectBundle = (bundleId: string) => {
    const bundle = BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      setSelectedSegments(prev => {
        const newSegments = [...prev, ...bundle.segments];
        return Array.from(new Set(newSegments));
      });
    }
  };

  const handleSelectAll = () => {
    setSelectedSegments(SEGMENTS.map(s => s.id));
  };

  const handleClearAll = () => {
    setSelectedSegments([]);
  };

  const handleCreateSegments = async (segmentIds?: string[]) => {
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
  };

  const handleRetryFailed = async (failedSegmentIds: string[]) => {
    setResults([]);
    await handleCreateSegments(failedSegmentIds);
  };

  const fetchAllSegments = async () => {
    if (klaviyoKeys.length === 0) return;

    trackAction('fetch_analytics');
    setLoadingAnalytics(true);
    try {
      const activeKey = klaviyoKeys[activeKeyIndex];
      
      // Fetch all segments - Klaviyo returns profile_count in segment attributes
      const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          keyId: activeKey.id,
          endpoint: `https://a.klaviyo.com/api/segments/?page[size]=100`,
          method: 'GET',
        },
      });

      if (error) throw error;
      const segments = data?.data || [];
      setAllSegments(segments);
      
      // Build stats from segment attributes - no additional API calls needed
      const stats: Record<string, any> = {};
      segments.forEach((segment: any, index: number) => {
        stats[segment.id] = {
          profileCount: segment.attributes?.profile_count || 0,
          name: segment.attributes?.name || 'Unnamed Segment',
          created: segment.attributes?.created || null,
          updated: segment.attributes?.updated || null,
        };
        setAnalyticsProgress({ current: index + 1, total: segments.length });
      });

      setSegmentStats(stats);
    } catch (error) {
      console.error('Error fetching segments:', error);
      
      // Log Klaviyo API error
      await ErrorLogger.logKlaviyoError(
        'Fetch All Segments',
        error as Error,
        klaviyoKeys[activeKeyIndex]?.id
      );
      
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments" data-tour="segments-tab">Segments</TabsTrigger>
            <TabsTrigger value="analytics" data-tour="analytics-tab">Analytics</TabsTrigger>
            <TabsTrigger value="ai" data-tour="ai-tab">AI</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>

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
            />

            {selectedSegments.length > 0 && (
              <div className="mt-8 p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">Ready to create in Klaviyo</p>
                  </div>
                  <Button
                    onClick={() => handleCreateSegments()}
                    disabled={creatingSegments}
                    size="lg"
                  >
                    {creatingSegments ? 'Creating...' : 'Create Segments'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {klaviyoKeys.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Connect your Klaviyo account to view analytics
                </p>
                <Button onClick={() => navigate('/klaviyo-setup')}>
                  Connect Klaviyo
                </Button>
              </div>
            ) : (
              <>
                {allSegments.length === 0 && !loadingAnalytics && (
                  <div className="bg-card border border-border rounded-lg p-8 text-center mb-4">
                    <p className="text-muted-foreground mb-4">
                      Load your segments to see analytics
                    </p>
                    <Button onClick={fetchAllSegments} disabled={loadingAnalytics}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                      Fetch Analytics
                    </Button>
                  </div>
                )}
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
            {klaviyoKeys.length > 0 && (
              <AISegmentSuggester
                activeKey={klaviyoKeys[activeKeyIndex]}
              />
            )}
          </TabsContent>

          <TabsContent value="performance">
            {klaviyoKeys.length > 0 && (
              <SegmentPerformance 
                klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
                apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
              />
            )}
          </TabsContent>

          <TabsContent value="templates">
            <SegmentTemplateManager />
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
              <AutomationPlaybooks />
              {klaviyoKeys.length > 0 && (
                <SegmentCloner 
                  currentKeyId={klaviyoKeys[activeKeyIndex].id}
                  segments={allSegments}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
