import React, { useState } from 'react';
import { Sparkles, Loader, CheckCircle, Lightbulb, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KlaviyoKey } from '@/hooks/useKlaviyoSegments';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useAILimits } from '@/hooks/useAILimits';
import { ErrorLogger } from '@/lib/errorLogger';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

interface AISegmentSuggesterProps {
  activeKey: KlaviyoKey;
}

export const AISegmentSuggester: React.FC<AISegmentSuggesterProps> = ({ activeKey }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { trackAction } = useFeatureTracking('ai_segment_suggester');
  const { allowed, remaining, total_used, daily_limit, loading: limitsLoading, incrementUsage } = useAILimits();

  const generateAiSuggestions = async () => {
    if (!aiPrompt.trim()) {
      toast.warning('Please enter a description of your business goal', {
        description: 'Describe what you want to achieve with your segments',
        duration: 4000,
      });
      return;
    }

    // Check if user has reached their limit
    if (!allowed) {
      toast.error("Daily AI suggestion limit reached", {
        description: `You've used all ${daily_limit} AI suggestions for today. Limits reset at midnight UTC.`,
        duration: 6000,
      });
      return;
    }

    trackAction('generate_suggestions', { prompt_length: aiPrompt.length });
    setAiLoading(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('klaviyo-suggest-segments', {
        body: {
          apiKey: activeKey.klaviyo_api_key_hash,
          answers: {
            businessGoal: aiPrompt,
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
                achievement_id: achievements.id
              })
              .select()
              .single();
          }
        }
      } catch (achievementError) {
        // Silently handle - achievement might already be earned
      }
      
      toast.success('AI suggestions generated successfully!', {
        description: `Created ${response.segments?.length || 0} segment suggestions for you`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      
      // Log AI error to database
      await ErrorLogger.logAIError(error, 'Generate AI Suggestions');
      
      toast.error('Failed to generate AI suggestions', {
        description: error.message || 'Check your Klaviyo connection and try again',
        action: {
          label: 'Retry',
          onClick: () => generateAiSuggestions(),
        },
      });
    } finally {
      setAiLoading(false);
    }
  };

  const createAiSegment = async (suggestion: any) => {
    trackAction('create_ai_segment', { segment_name: suggestion.name });
    setAiLoading(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('klaviyo-create-custom-segment', {
        body: {
          apiKey: activeKey.klaviyo_api_key_hash,
          segmentName: suggestion.name,
          segmentDescription: suggestion.description,
        },
      });

      if (error) throw error;

      if (response.status === 'exists') {
        toast.info(`Segment "${suggestion.name}" already exists`, {
          description: 'This segment is already in your Klaviyo account',
          duration: 4000,
        });
      } else if (response.status === 'created') {
        toast.success(`Created segment "${suggestion.name}"!`, {
          description: 'Segment is now live in your Klaviyo account',
          duration: 3000,
        });
        setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
      }
    } catch (error: any) {
      console.error('Segment creation error:', error);
      toast.error('Failed to create segment', {
        description: error.message || 'Check your Klaviyo API key and try again',
        action: {
          label: 'Get Help',
          onClick: () => window.open('/help?article=troubleshooting', '_blank'),
        },
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
            <span className="text-xs text-muted-foreground">
              Resets at midnight UTC
            </span>
          </div>
          <Progress value={(total_used / daily_limit) * 100} className="h-2" />
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
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Example: I want to identify customers who are likely to make a repeat purchase in the next 30 days..."
          className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[120px] mb-4"
        />

        <button
          onClick={generateAiSuggestions}
          disabled={aiLoading || !aiPrompt.trim() || !allowed}
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
                  <div className="bg-muted p-3 rounded-lg text-xs">
                    <span className="font-medium">Definition: </span>
                    {suggestion.definition || 'Custom AI-generated criteria'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => createAiSegment(suggestion)}
                disabled={aiLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create This Segment
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
