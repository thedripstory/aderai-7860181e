import React, { useState, useCallback } from 'react';
import { Sparkles, Loader, Lightbulb, AlertCircle, HelpCircle, ChevronDown, Copy, Check } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { trackEvent } from '@/lib/analytics';

interface AISegmentSuggesterProps {
  activeKey: KlaviyoKey;
}

interface SegmentIdea {
  name: string;
  description: string;
  plain_english_criteria?: string[];
  definition?: unknown;
}

export const AISegmentSuggester: React.FC<AISegmentSuggesterProps> = ({ activeKey }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<SegmentIdea[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { trackAction } = useFeatureTracking('ai_segment_suggester');
  const { allowed, remaining, total_used, daily_limit, loading: limitsLoading, incrementUsage } = useAILimits();

  const displayName = (n: string) => n.replace(/\s*\|\s*Aderai\s*$/i, '').trim();

  const generateAiSuggestions = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Please describe your goal', {
        description: 'Tell us what kind of customers you want to target',
        duration: 4000,
      });
      return;
    }

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

      await incrementUsage();

      trackEvent('AI Suggestions Requested', {
        industry: activeKey.client_name,
        goal: sanitizedPrompt.substring(0, 100),
        suggestionsCount: response.segments?.length || 0,
      });

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('analytics_events').insert({
            user_id: user.id,
            event_name: 'ai_suggestion_used',
            event_metadata: {
              suggestions_count: response.segments?.length || 0,
              prompt_length: aiPrompt.length,
            },
            page_url: window.location.href,
            user_agent: navigator.userAgent,
          });
        }
      } catch (trackError) {
        console.error('Failed to track AI suggestion event:', trackError);
      }

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
              .insert({ user_id: user.id, achievement_id: achievements.id })
              .select()
              .single();
          }
        }
      } catch {
        // Silently handle - achievement might already be earned
      }

      toast.success('Segment ideas ready', {
        description: `Generated ${response.segments?.length || 0} related ideas for you to explore`,
        duration: 3000,
      });
    } catch (error: unknown) {
      const { data: { user } } = await supabase.auth.getUser();
      await ErrorHandler.handleAPIError(error, 'klaviyo-suggest-segments', {
        userId: user?.id,
        component: 'AISegmentSuggester',
        action: 'generate_ai_suggestions',
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, allowed, activeKey, trackAction, incrementUsage, daily_limit]);

  const copyIdea = useCallback((idea: SegmentIdea, idx: number) => {
    const criteria = (idea.plain_english_criteria || []).map(c => `• ${c}`).join('\n');
    const text = [
      displayName(idea.name),
      '',
      idea.description,
      criteria ? '\nCriteria:\n' + criteria : '',
    ].join('\n').trim();

    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedIdx(idx);
        toast.success('Copied to clipboard', { duration: 2000 });
        setTimeout(() => setCopiedIdx(c => (c === idx ? null : c)), 1800);
      },
      () => toast.error('Could not copy to clipboard')
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {limitsLoading && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            </div>
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
              <Link to="/dashboard?tab=segments" className="text-sm font-medium text-primary hover:underline">
                View Pre-built Segments →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Get Segment Ideas</h2>
            <p className="text-muted-foreground">
              Describe what you're trying to achieve and we'll suggest related segment ideas you can build in Klaviyo. For example: "Customers who bought [your product] in the last 30 days" — we'll also suggest browsers, repeat buyers, and adjacent variants.
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
          placeholder="Example: Customers who bought Jaadugar from my website over all time"
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
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Segment Ideas
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
          message="Generating segment ideas"
          description="Brainstorming related segments tailored to your goal..."
        />
      )}

      {!aiLoading && aiSuggestions.length === 0 && aiPrompt.trim() === '' && (
        <EmptyState
          icon={Lightbulb}
          title="Get your first batch of ideas"
          description="Describe a goal or customer group above, and we'll return a list of related segment ideas — variants by time window, frequency, behavior, and adjacent products — that you can recreate in Klaviyo."
          secondaryActionLabel="Learn how AI works →"
          onSecondaryAction={() => window.open('/help?article=ai-features', '_blank')}
        />
      )}

      {!aiLoading && aiSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold">Suggested Segment Ideas</h3>
            <span className="text-xs text-muted-foreground">{aiSuggestions.length} ideas • build the ones you like in Klaviyo</span>
          </div>
          {aiSuggestions.map((suggestion, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold mb-2">{displayName(suggestion.name)}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
                <button
                  onClick={() => copyIdea(suggestion, idx)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium hover:bg-muted transition-colors"
                  title="Copy idea to clipboard"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {suggestion.plain_english_criteria && suggestion.plain_english_criteria.length > 0 && (
                <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Criteria</p>
                  <ul className="space-y-1">
                    {suggestion.plain_english_criteria.map((c, i) => (
                      <li key={i} className="text-sm text-foreground flex gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                        : (suggestion.definition as string) || 'Custom AI-generated criteria'}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          <div className="bg-muted/40 border border-dashed border-border rounded-lg p-4 text-sm text-muted-foreground">
            These are ideas, not live segments. Pick the ones you like and recreate them in Klaviyo, or browse our <Link to="/dashboard?tab=segments" className="text-primary font-medium hover:underline">pre-built segments</Link> to push instantly.
          </div>
        </div>
      )}
    </div>
  );
};
