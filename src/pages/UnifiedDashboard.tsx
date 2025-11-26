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
    if (klaviyoKeys.length === 0) {
      console.log('No Klaviyo keys available');
      return;
    }

    const activeKey = klaviyoKeys[activeKeyIndex];
    if (!activeKey?.id) {
      console.log('No active key ID available');
      return;
    }

    trackAction('fetch_analytics');
    setLoadingAnalytics(true);
    
    try {
      console.log('Fetching segments with keyId:', activeKey.id);
      
      let allFetchedSegments: any[] = [];
      let includedTags: Record<string, any> = {};
      // Fetch segments with tags for Aderai detection
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
      
      console.log('Klaviyo segments fetched:', allFetchedSegments.length);
      console.log('Tags collected:', Object.keys(includedTags).length);
      
      // Now fetch profile counts for each segment in parallel batches
      const BATCH_SIZE = 5; // Fetch 5 at a time to respect rate limits
      const segmentProfileCounts: Record<string, number> = {};
      
      for (let i = 0; i < allFetchedSegments.length; i += BATCH_SIZE) {
        const batch = allFetchedSegments.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (segment) => {
          try {
            const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
              body: {
                keyId: activeKey.id,
                endpoint: `https://a.klaviyo.com/api/segments/${segment.id}/?additional-fields[segment]=profile_count`,
                method: 'GET',
              },
            });
            
            if (!error && data?.data?.attributes?.profile_count !== undefined) {
              return { id: segment.id, count: data.data.attributes.profile_count };
            }
            return { id: segment.id, count: null };
          } catch {
            return { id: segment.id, count: null };
          }
        });
        
        const results = await Promise.all(batchPromises);
        results.forEach(r => {
          if (r.count !== null) {
            segmentProfileCounts[r.id] = r.count;
          }
        });
        
        // Update progress
        setAnalyticsProgress({ 
          current: Math.min(i + BATCH_SIZE, allFetchedSegments.length), 
          total: allFetchedSegments.length 
        });
        
        // Small delay between batches for rate limiting
        if (i + BATCH_SIZE < allFetchedSegments.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log('Profile counts fetched for', Object.keys(segmentProfileCounts).length, 'segments');
      setAllSegments(allFetchedSegments);
      
      // Build stats from segment attributes
      const stats: Record<string, any> = {};
      const historicalDataToInsert: any[] = [];
      
      allFetchedSegments.forEach((segment: any) => {
        // Use fetched profile count or fall back to null
        const profileCount = segmentProfileCounts[segment.id] ?? null;
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
        
        // Prepare historical data for trend tracking (only for segments with known profile counts)
        if (profileCount !== null && profileCount > 0) {
          historicalDataToInsert.push({
            segment_klaviyo_id: segment.id,
            segment_name: segmentName,
            profile_count: profileCount,
            klaviyo_key_id: activeKey.id,
            user_id: currentUser?.id,
          });
        }
      });

      setSegmentStats(stats);
      
      // Save historical data for trend visualization (don't wait for it)
      if (currentUser?.id && historicalDataToInsert.length > 0) {
        supabase
          .from('segment_historical_data')
          .insert(historicalDataToInsert)
          .then(({ error: histError }) => {
            if (histError) {
              console.log('Historical data save skipped (may be duplicate):', histError.message);
            } else {
              console.log('Historical segment data recorded for', historicalDataToInsert.length, 'segments');
            }
          });
      }
      
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
