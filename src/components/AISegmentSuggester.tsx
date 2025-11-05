import React, { useState } from 'react';
import { Sparkles, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KlaviyoKey } from '@/hooks/useKlaviyoSegments';

interface AISegmentSuggesterProps {
  activeKey: KlaviyoKey;
}

export const AISegmentSuggester: React.FC<AISegmentSuggesterProps> = ({ activeKey }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const generateAiSuggestions = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description of your business goal');
      return;
    }

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
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate suggestions: ${error.message || 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const createAiSegment = async (suggestion: any) => {
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
        alert(`Segment "${suggestion.name}" already exists in your Klaviyo account`);
      } else if (response.status === 'created') {
        alert(`Successfully created segment "${suggestion.name}"!`);
        setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
      }
    } catch (error: any) {
      console.error('Segment creation error:', error);
      alert(`Failed to create segment: ${error.message || 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Describe Your Goal</h2>
        <p className="text-muted-foreground mb-6">
          Tell us what you're trying to achieve, and our AI will suggest custom segments tailored to your needs.
        </p>

        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Example: I want to identify customers who are likely to make a repeat purchase in the next 30 days..."
          className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[120px] mb-4"
        />

        <button
          onClick={generateAiSuggestions}
          disabled={aiLoading || !aiPrompt.trim()}
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

      {aiSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">AI Suggestions</h3>
          {aiSuggestions.map((suggestion, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6">
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
