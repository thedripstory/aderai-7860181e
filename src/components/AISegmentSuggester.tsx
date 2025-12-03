import React, { useState, useCallback } from 'react';
import { Sparkles, Loader, CheckCircle, Lightbulb, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useAILimits } from '@/hooks/useAILimits';
import { ErrorHandler } from '@/lib/errorHandlers';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { sanitizeString } from '@/lib/inputSanitization';
import { SegmentCreationModal } from '@/components/SegmentCreationModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AISegmentSuggesterProps {
  activeKey: KlaviyoKey;
}

export const AISegmentSuggester: React.FC<AISegmentSuggesterProps> = ({ activeKey }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [creatingSegment, setCreatingSegment] = useState<{ name: string; description: string } | null>(null);
  const [segmentCreationComplete, setSegmentCreationComplete] = useState(false);
  const { trackAction } = useFeatureTracking('ai_segment_suggester');
  const { allowed, remaining, total_used, daily_limit, loading: limitsLoading, incrementUsage } = useAILimits();

  const generateAiSuggestions = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Please enter a description of your business goal', {
        description: 'Describe what you want to achieve with your segments',
        duration: 4000,
      });
      return;
    }

    // Check if user has reached their limit
    if (!allowed) {
      toast.error('Daily AI suggestion limit reached', {
        description: `You've used all ${daily_limit} AI suggestions for today. Limits reset at midnight UTC.`,
        duration: 6000,
      });
      return;
    }

    trackAction('generate_suggestions', { prompt_length: aiPrompt.length });
    setAiLoading(true);

    try {
      // Sanitize user input before sending to AI
      const sanitizedPrompt = sanitizeString(aiPrompt);

      const { data: response, error } = await supabase.functions.invoke('klaviyo-suggest-segments', {
        body: {
          apiKey: activeKey.klaviyo_api_key_hash,
          answers: {
            businessGoal: sanitizedPrompt,
            currency: activeKey.currency,
            aov: activeKey.aov,
            vipThreshold: activeKey.vip_threshold,
            highValueThreshold: activeKey.high_value_threshold,
          },
        },
      });

      if (error) throw error;
      setAiSuggestions(response.segments || []);

      // Increment usage counter after successful generation
      await incrementUsage();

      // Award "AI Explorer" achievement
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: achievements } = await supabase
            .from('achievements')
            .select('id')
            .eq('criteria_type', 'ai_used')
            .single();

          if (achievements) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_id: achievements.id,
              })
              .select()
              .single();
          }
        }
      } catch {
        // Silently handle - achievement might already be earned
      }

      toast.success('AI suggestions generated successfully!', {
        description: `Created ${response.segments?.length || 0} segment suggestions for you`,
        duration: 3000,
      });
    } catch (error: any) {
      // Get user for logging
      const { data: { user } } = await supabase.auth.getUser();

      // Log AI error with standardized handler
      await ErrorHandler.handleAPIError(error, 'klaviyo-suggest-segments', {
        userId: user?.id,
        component: 'AISegmentSuggester',
        action: 'generate_ai_suggestions',
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, allowed, activeKey, trackAction, incrementUsage, daily_limit]);

  const createAiSegment = useCallback(
    async (suggestion: any) => {
      trackAction('create_ai_segment', { segment_name: suggestion.name });
      setCreatingSegment({ name: suggestion.name, description: suggestion.description });
      setSegmentCreationComplete(false);

      try {
        const { data: response, error } = await supabase.functions.invoke('klaviyo-create-custom-segment', {
          body: {
            apiKey: activeKey.klaviyo_api_key_hash,
            segmentName: suggestion.name,
            segmentDescription: suggestion.description,
          },
        });

        if (error) throw error;

        setSegmentCreationComplete(true);

        if (response.status === 'exists') {
          setTimeout(() => {
            setCreatingSegment(null);
            toast.info(`Segment "${suggestion.name}" already exists`, {
              description: 'This segment is already in your Klaviyo account',
              duration: 4000,
            });
          }, 1500);
        } else if (response.status === 'created') {
          setTimeout(() => {
            setCreatingSegment(null);
            toast.success(`Created segment "${suggestion.name}"!`, {
              description: 'Segment is now live in your Klaviyo account',
              duration: 3000,
            });
            setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
          }, 1500);
        }
      } catch (error: any) {
        setCreatingSegment(null);
        const { data: { user } } = await supabase.auth.getUser();

        await ErrorHandler.handleAPIError(error, 'klaviyo-create-custom-segment', {
          userId: user?.id,
          component: 'AISegmentSuggester',
          action: 'create_ai_segment',
          metadata: { segmentName: suggestion.name },
        });
      }
    },
    [activeKey, trackAction]
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* AI Limit Loading Indicator */}
      {limitsLoading && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          {/* Aggressive rotating loader */}
          <div className="relative w-8 h-8">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />

            {/* Middle counter-rotating ring */}
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />

            {/* Inner pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            </div>
            <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Checking your AI suggestion limits…</p>
            <p className="text-xs text-muted-foreground">This only takes a moment and keeps usage fair for everyone.</p>
          </div>
        </div>
      )}

      {/* Usage Limit Indicator */}
      {!limitsLoading && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {allowed ? (
                <span className="text-foreground">
                  {remaining} of {daily_limit} AI suggestions remaining today
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Daily limit reached
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">Resets automatically at midnight UTC</span>
          </div>
          <Progress value={daily_limit ? (total_used / daily_limit) * 100 : 0} className="h-2" />
          {!allowed && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                You've used all {daily_limit} AI suggestions for today. While you wait for the reset, explore our 70+ pre-built segments!
              </p>
              <Link
                to="/dashboard?tab=segments"
                className="text-sm font-medium text-primary hover:underline"
              >
                View Pre-built Segments →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Describe Your Goal</h2>
            <p className="text-muted-foreground">
              Tell us what you're trying to achieve, and our AI will suggest custom segments tailored to your needs.
            </p>
          </div>
          <a
            href="/help?article=ai-features"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Learn about AI features"
          >
            <HelpCircle className="w-5 h-5" />
          </a>
        </div>

        <textarea
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder="Example: I want to identify customers who are likely to make a repeat purchase in the next 30 days..."
          className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[120px] mb-4"
        />

        <button
          onClick={generateAiSuggestions}
          disabled={aiLoading || limitsLoading || !aiPrompt.trim() || !allowed}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {aiLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Suggestions
            </>
          )}
        </button>

        {!limitsLoading && (
          <p className="mt-2 text-xs text-muted-foreground text-right">
            {allowed
              ? `${remaining} of ${daily_limit} AI suggestions remaining today`
              : `You've reached today's limit of ${daily_limit} AI suggestions.`}
          </p>
        )}
      </div>

      {aiLoading && (
        <LoadingState
          message="Generating AI suggestions"
          description="Our AI is analyzing your goal and creating custom segment suggestions..."
        />
      )}

      {!aiLoading && aiSuggestions.length === 0 && aiPrompt.trim() === '' && (
        <EmptyState
          icon={Lightbulb}
          title="Get your first AI suggestion"
          description="Describe your business goal above, and our AI will create custom segment suggestions tailored to your needs. For example: 'I want to target customers likely to purchase again in the next 30 days'."
          secondaryActionLabel="Learn how AI works →"
          onSecondaryAction={() => window.open('/help?article=ai-features', '_blank')}
        />
      )}

      {!aiLoading && aiSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">AI Suggestions</h3>
          {aiSuggestions.map((suggestion, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2">{suggestion.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                      <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
                      <span>View technical definition</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto mt-2">
                        <pre className="whitespace-pre-wrap break-words">
                          {typeof suggestion.definition === 'object'
                            ? JSON.stringify(suggestion.definition, null, 2)
                            : suggestion.definition || 'Custom AI-generated criteria'}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
              <button
                onClick={() => createAiSegment(suggestion)}
                disabled={!!creatingSegment}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create This Segment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Segment Creation Modal */}
      <SegmentCreationModal
        isOpen={!!creatingSegment}
        segmentName={creatingSegment?.name || ''}
        segmentDescription={creatingSegment?.description || ''}
        isComplete={segmentCreationComplete}
      />
    </div>
  );
};
