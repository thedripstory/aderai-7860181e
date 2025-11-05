import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Gift, Settings as SettingsIcon, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientSwitcher, AddClientModal } from '@/components/ClientSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { SegmentDashboard, BUNDLES, SEGMENTS } from '@/components/SegmentDashboard';
import { SegmentCreationFlow } from '@/components/SegmentCreationFlow';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AISegmentSuggester } from '@/components/AISegmentSuggester';
import { KlaviyoSyncIndicator } from '@/components/KlaviyoSyncIndicator';
import { useKlaviyoSegments, KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { toast } from 'sonner';

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [klaviyoKeys, setKlaviyoKeys] = useState<KlaviyoKey[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [view, setView] = useState<'creating' | 'results' | null>(null);

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
    setSelectedSegments((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
    );
  };

  const selectBundle = (bundleId: string) => {
    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (bundle) {
      setSelectedSegments((prev) => {
        const newSegments = [...prev];
        bundle.segments.forEach((segId) => {
          if (!newSegments.includes(segId)) {
            newSegments.push(segId);
          }
        });
        return newSegments;
      });
    }
  };

  const handleSelectAll = () => {
    setSelectedSegments(SEGMENTS.map(s => s.id));
  };

  const handleClearAll = () => {
    setSelectedSegments([]);
  };

  const handleCreateSegments = async () => {
    if (selectedSegments.length === 0) {
      toast.error('Please select at least one segment to create');
      return;
    }

    if (klaviyoKeys.length === 0) {
      toast.error('No Klaviyo API key found');
      return;
    }

    setView('creating');

    try {
      await createSegments(selectedSegments, klaviyoKeys[activeKeyIndex], SEGMENTS);
      setView('results');
      toast.success('Segments created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create segments');
      setView('results');
    }
  };

  const fetchAllSegments = async () => {
    if (klaviyoKeys.length === 0) return;

    setLoadingAnalytics(true);

    try {
      const { data: segmentsResponse } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          keyId: klaviyoKeys[activeKeyIndex].id,
          endpoint: 'https://a.klaviyo.com/api/segments/',
          method: 'GET',
        },
      });

      const segments = segmentsResponse?.data || [];
      setAllSegments(segments);
      
      // Fetch stats for each segment
      const stats: Record<string, any> = {};
      for (const segment of segments) {
        const { data: profilesResponse } = await supabase.functions.invoke('klaviyo-proxy', {
          body: {
            keyId: klaviyoKeys[activeKeyIndex].id,
            endpoint: `https://a.klaviyo.com/api/segments/${segment.id}/profiles/`,
            method: 'GET',
          },
        });

        stats[segment.id] = {
          profileCount: profilesResponse?.data?.length || 0,
          name: segment.attributes?.name || 'Unknown',
          created: segment.attributes?.created,
          updated: segment.attributes?.updated,
        };
      }

      setSegmentStats(stats);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const calculateHealthScore = (): number => {
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <EmailVerificationBanner />
      
      <div className="border-b-2 border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
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
              <button
                onClick={() => navigate('/affiliate')}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
              >
                <Gift className="w-4 h-4" />
                Affiliate
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-lg"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="segments">Create Segments</TabsTrigger>
            <TabsTrigger value="analytics" onClick={fetchAllSegments}>Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI Suggester</TabsTrigger>
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
                  <button
                    onClick={handleCreateSegments}
                    disabled={creatingSegments}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingSegments ? 'Creating...' : 'Create Segments'}
                  </button>
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
              <AISegmentSuggester activeKey={klaviyoKeys[activeKeyIndex]} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
