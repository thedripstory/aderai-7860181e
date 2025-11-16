import React, { useState, useEffect } from 'react';
import { Building2, LogOut, Gift, Settings as SettingsIcon, Loader, TrendingUp, DollarSign, Activity, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ClientSwitcher, AddClientModal } from '@/components/ClientSwitcher';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { TimeBasedPopup } from '@/components/TimeBasedPopup';
import { SegmentDashboard, BUNDLES, SEGMENTS } from '@/components/SegmentDashboard';
import { SegmentCreationFlow } from '@/components/SegmentCreationFlow';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AISegmentSuggester } from '@/components/AISegmentSuggester';
import { KlaviyoSyncIndicator } from '@/components/KlaviyoSyncIndicator';
import { AgencyTeamManager } from '@/components/AgencyTeamManager';
import { SegmentPerformance } from '@/components/SegmentPerformance';
import { SegmentTemplateManager } from '@/components/SegmentTemplateManager';
import { AutomationPlaybooks } from '@/components/AutomationPlaybooks';
import { SegmentCloner } from '@/components/SegmentCloner';
import { useKlaviyoSegments, KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { toast } from 'sonner';

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlClientId = searchParams.get('clientId'); // For agencies accessing client dashboards
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [klaviyoKeys, setKlaviyoKeys] = useState<KlaviyoKey[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [view, setView] = useState<'creating' | 'results' | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [accountType, setAccountType] = useState("");

  // Analytics state
  const [allSegments, setAllSegments] = useState<any[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, any>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsProgress, setAnalyticsProgress] = useState({ current: 0, total: 0 });
  const [showHealthScore, setShowHealthScore] = useState(false);

  const { loading: creatingSegments, results, createSegments, setResults } = useKlaviyoSegments();

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

      // Redirect if onboarding not complete
      if (!userData.onboarding_completed) {
        if (userData.account_type === 'brand') {
          navigate('/onboarding/brand');
        } else {
          navigate('/onboarding/agency');
        }
        return;
      }

      setEmailVerified(userData.email_verified || false);
      setAccountType(userData.account_type);
      setCurrentUser(session.user);
      
      // Verify clientId if provided in URL (SECURITY CHECK)
      if (urlClientId) {
        // Only agencies can access client data
        if (userData.account_type !== "agency") {
          toast.error("You don't have permission to access client data");
          navigate("/dashboard");
          return;
        }
        
        // Verify agency owns this client
        const { data: clientRelation, error: clientError } = await supabase
          .from("agency_clients")
          .select("id")
          .eq("agency_user_id", session.user.id)
          .eq("brand_user_id", urlClientId)
          .maybeSingle();

        if (clientError || !clientRelation) {
          toast.error("You don't have access to this client");
          navigate("/agency-dashboard");
          return;
        }
        
        // Valid client access
        setClientId(urlClientId);
        setSelectedClientId(urlClientId);
        await loadClientKeys(session.user.id, urlClientId);
      } else {
        await loadKlaviyoKeys(session.user.id);
      }
      
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

  const loadClientKeys = async (agencyUserId: string, clientUserId: string) => {
    // Verify agency manages this client
    const { data: clientData, error: verifyError } = await supabase
      .from('agency_clients')
      .select('id')
      .eq('agency_user_id', agencyUserId)
      .eq('brand_user_id', clientUserId)
      .single();

    if (verifyError || !clientData) {
      toast.error("You don't have permission to access this client's dashboard");
      navigate('/agency-dashboard');
      return;
    }

    // Load client's Klaviyo keys
    const { data } = await supabase
      .from('klaviyo_keys')
      .select('*')
      .eq('user_id', clientUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setKlaviyoKeys(data);
      setActiveKeyIndex(0);
    }
  };

  const handleSelectClient = (index: number) => {
    setActiveKeyIndex(index);
  };

  const handleAddClient = () => {
    setShowAddClientModal(true);
  };

  const handleClientAdded = async () => {
    if (currentUser) {
      await loadKlaviyoKeys(currentUser.id);
    }
  };

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const selectBundle = (bundleId: string) => {
    const bundle = BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      setSelectedSegments(prev => {
        const allSegmentIds = [...prev, ...bundle.segments];
        return Array.from(new Set(allSegmentIds));
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
    // Check email verification
    if (!emailVerified) {
      toast.error("Please verify your email before creating segments");
      return;
    }

    const segmentsToCreate = segmentIds || selectedSegments;

    if (segmentsToCreate.length === 0 || klaviyoKeys.length === 0) {
      return;
    }

    setView('creating');
    
    const { SEGMENTS } = await import('@/components/SegmentDashboard');
    
    await createSegments(
      segmentsToCreate,
      klaviyoKeys[activeKeyIndex],
      SEGMENTS
    );

    setView('results');
  };

  const handleRetryFailed = async (failedSegmentIds: string[]) => {
    setResults([]); // Clear previous results
    await handleCreateSegments(failedSegmentIds);
  };

  const fetchAllSegments = async () => {
    if (klaviyoKeys.length === 0) return;

    setLoadingAnalytics(true);
    setAnalyticsProgress({ current: 0, total: 0 });

    try {
      const activeKey = klaviyoKeys[activeKeyIndex];
      
      const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          klaviyoKeyId: activeKey.id,
          apiKey: activeKey.klaviyo_api_key_hash,
          endpoint: 'segments',
          method: 'GET',
        },
      });

      if (error) throw error;

      const segments = data?.data || [];
      setAllSegments(segments);
      setAnalyticsProgress({ current: 0, total: segments.length });

      // Fetch profile counts
      const stats: Record<string, any> = {};
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        try {
          const { data: profileData, error: profileError } = await supabase.functions.invoke('klaviyo-proxy', {
            body: {
              klaviyoKeyId: activeKey.id,
              apiKey: activeKey.klaviyo_api_key_hash,
              endpoint: `segments/${segment.id}/profiles`,
              method: 'GET',
            },
          });

          if (!profileError && profileData) {
            stats[segment.id] = {
              profileCount: profileData.data?.length || 0,
              name: segment.attributes?.name || 'Unnamed Segment',
            };
          }
        } catch (err) {
          console.error(`Error fetching segment ${segment.id}:`, err);
        }

        setAnalyticsProgress({ current: i + 1, total: segments.length });
      }

      setSegmentStats(stats);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const calculateHealthScore = () => {
    const totalSegments = allSegments.length;
    const activeSegments = Object.values(segmentStats).filter((s: any) => s.profileCount > 0).length;

    if (totalSegments === 0) return 0;

    const coverageScore = (activeSegments / totalSegments) * 100;
    return Math.round(coverageScore);
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
      {currentUser && !emailVerified && (
        <EmailVerificationBanner 
          userEmail={currentUser.email}
          emailVerified={emailVerified}
          userId={currentUser.id}
        />
      )}
      {accountType === "agency" && <TimeBasedPopup onGetStarted={() => navigate("/settings")} />}
      
      <div className="border-b-2 border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Aderai</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Segmentation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {klaviyoKeys.length > 0 && (
                <KlaviyoSyncIndicator
                  klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
                  apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
                />
              )}
              <ClientSwitcher
                klaviyoKeys={klaviyoKeys}
                activeKeyIndex={activeKeyIndex}
                onSelectClient={handleSelectClient}
                onAddClient={handleAddClient}
              />
              <Button variant="outline" onClick={() => navigate('/affiliate')}>
                <Gift className="w-4 h-4 mr-2" />
                Affiliate
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSuccess={handleClientAdded}
        userId={currentUser?.id || ''}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            {accountType === "agency" && <TabsTrigger value="team">Team</TabsTrigger>}
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>

          <TabsContent value="segments">
            <SegmentDashboard
              selectedSegments={selectedSegments}
              onToggleSegment={toggleSegment}
              onSelectBundle={selectBundle}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
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
                    disabled={creatingSegments || !emailVerified}
                    size="lg"
                  >
                    {creatingSegments ? 'Creating...' : 'Create Segments'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard
              allSegments={allSegments}
              segmentStats={segmentStats}
              loadingAnalytics={loadingAnalytics}
              analyticsProgress={analyticsProgress}
              onShowHealthScore={() => setShowHealthScore(true)}
              calculateHealthScore={calculateHealthScore}
            />
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SegmentPerformance
                  klaviyoKeyId={klaviyoKeys[activeKeyIndex].id}
                  apiKey={klaviyoKeys[activeKeyIndex].klaviyo_api_key_hash}
                />
                <SegmentCloner
                  currentKeyId={klaviyoKeys[activeKeyIndex].id}
                  segments={allSegments}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SegmentTemplateManager
                currentSegment={selectedSegments.length > 0 ? {
                  name: `${selectedSegments.length} selected segments`,
                  conditions: []
                } : undefined}
              />
              <AutomationPlaybooks />
            </div>
          </TabsContent>

          {accountType === "agency" && (
            <TabsContent value="team">
              <AgencyTeamManager />
            </TabsContent>
          )}

          <TabsContent value="more">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/features')}
                className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                data-tour="feature-showcase"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Feature Showcase</h3>
                </div>
                <p className="text-sm text-muted-foreground">Explore ROI calculators, comparisons, and success stories</p>
              </button>

              <button
                onClick={() => navigate('/roi-dashboard')}
                className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                data-tour="roi-tracker"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold">ROI Tracker</h3>
                </div>
                <p className="text-sm text-muted-foreground">Track campaign performance and revenue metrics</p>
              </button>

              <button
                onClick={() => navigate('/segment-health')}
                className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                data-tour="segment-health"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold">Segment Health</h3>
                </div>
                <p className="text-sm text-muted-foreground">Monitor segment health status and trends</p>
              </button>

              {accountType === "agency" && (
                <>
                  <button
                    onClick={() => navigate('/agency-tools')}
                    className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                    data-tour="agency-tools"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">Agency Tools</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Client scorecards, team management, and proposals</p>
                  </button>

                  <button
                    onClick={() => navigate('/ai-features')}
                    className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                    data-tour="ai-features"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold">AI Features</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Predictive analytics and churn prediction</p>
                  </button>
                </>
              )}

              {accountType === "brand" && (
                <button
                  onClick={() => navigate('/ai-features')}
                  className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold">AI Features</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Predictive analytics and churn prediction</p>
                </button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
