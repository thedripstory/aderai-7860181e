import React, { useState } from 'react';
import { MessageSquare, X, Send, Bug, Lightbulb, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { toast } from 'sonner';
import { z } from 'zod';
import { sanitizeString } from '@/lib/inputSanitization';
import { ErrorLogger } from '@/lib/errorLogger';

const bugReportSchema = z.object({
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  steps: z.string().trim().max(2000, 'Steps must be less than 2000 characters').optional(),
});

const featureRequestSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  importance: z.number().min(1).max(5),
});

const generalFeedbackSchema = z.object({
  feedback: z.string().trim().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
  satisfaction: z.number().min(1).max(5),
});

export const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bug' | 'feature' | 'general'>('bug');
  const [submitting, setSubmitting] = useState(false);
  const { trackAction } = useFeatureTracking('feedback_widget');

  // Bug Report State
  const [bugDescription, setBugDescription] = useState('');
  const [bugSteps, setBugSteps] = useState('');

  // Feature Request State
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [featureImportance, setFeatureImportance] = useState(3);

  // General Feedback State
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);

  const handleOpen = () => {
    setIsOpen(true);
    trackAction('widget_opened');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForms();
  };

  const resetForms = () => {
    setBugDescription('');
    setBugSteps('');
    setFeatureTitle('');
    setFeatureDescription('');
    setFeatureImportance(3);
    setGeneralFeedback('');
    setSatisfaction(5);
  };

  const submitFeedback = async (type: 'bug_report' | 'feature_request' | 'general', data: any, metadata: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit feedback');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('account_name, email')
        .eq('id', user.id)
        .single();

      // Sanitize all user inputs before saving
      const sanitizedData = {
        title: data.title ? sanitizeString(data.title) : null,
        description: sanitizeString(data.description),
      };

      // Insert feedback into database
      const { error: insertError } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback_type: type,
          title: sanitizedData.title,
          description: sanitizedData.description,
          metadata: metadata,
        });

      if (insertError) throw insertError;

      // Send email notification to admin
      const { error: emailError } = await supabase.functions.invoke('send-feedback-notification', {
        body: {
          feedbackType: type,
          userName: userData?.account_name || 'Unknown User',
          userEmail: userData?.email || user.email,
          title: data.title,
          description: data.description,
          metadata: metadata,
        },
      });

      if (emailError) {
        await ErrorLogger.logError(emailError, {
          context: 'Failed to send feedback email notification',
        });
      }

      trackAction('feedback_submitted', { type });

      // Track feedback submitted event
      try {
        await supabase.from('analytics_events').insert({
          user_id: user.id,
          event_name: 'feedback_submitted',
          event_metadata: {
            feedback_type: type,
            title: data.title || null,
          },
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (trackError) {
        console.error('Failed to track feedback event:', trackError);
      }

      // Award "Feedback Champion" achievement
      try {
        const { data: achievements } = await supabase
          .from('achievements')
          .select('id')
          .eq('criteria_type', 'feedback_submitted')
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
      } catch (achievementError) {
        // Silently handle - achievement might already be earned
      }

      toast.success('Thanks for your feedback!', {
        description: 'We review every submission and will get back to you if needed.',
        duration: 5000,
      });

      handleClose();
    } catch (error: any) {
      await ErrorLogger.logError(error, {
        context: 'Error submitting feedback',
      });
      toast.error('Failed to submit feedback', {
        description: error.message || 'Please try again later',
      });
    }
  };

  const handleBugReportSubmit = async () => {
    try {
      const validated = bugReportSchema.parse({
        description: bugDescription,
        steps: bugSteps,
      });

      setSubmitting(true);

      const metadata = {
        steps_to_reproduce: validated.steps || '',
        browser: navigator.userAgent,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      await submitFeedback('bug_report', { description: validated.description }, metadata);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error('Validation Error', {
          description: error.errors[0].message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeatureRequestSubmit = async () => {
    try {
      const validated = featureRequestSchema.parse({
        title: featureTitle,
        description: featureDescription,
        importance: featureImportance,
      });

      setSubmitting(true);

      const metadata = {
        importance: validated.importance,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      await submitFeedback('feature_request', { title: validated.title, description: validated.description }, metadata);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error('Validation Error', {
          description: error.errors[0].message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneralFeedbackSubmit = async () => {
    try {
      const validated = generalFeedbackSchema.parse({
        feedback: generalFeedback,
        satisfaction: satisfaction,
      });

      setSubmitting(true);

      const metadata = {
        satisfaction_rating: validated.satisfaction,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      await submitFeedback('general', { description: validated.feedback }, metadata);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error('Validation Error', {
          description: error.errors[0].message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (value: number, onChange: (value: number) => void) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none hover:scale-110 transition-transform"
        >
          <Star
            className={`w-8 h-8 ${rating <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Button
        onClick={handleOpen}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              We'd love to hear from you!
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bug" className="gap-2">
                <Bug className="w-4 h-4" />
                Bug Report
              </TabsTrigger>
              <TabsTrigger value="feature" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                Feature Request
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                General
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bug" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="bug-description">
                  What went wrong? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="bug-description"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Describe the issue you encountered..."
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{bugDescription.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-steps">Steps to reproduce (optional)</Label>
                <Textarea
                  id="bug-steps"
                  value={bugSteps}
                  onChange={(e) => setBugSteps(e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  className="min-h-[100px]"
                  maxLength={2000}
                />
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Auto-captured information:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Browser: {navigator.userAgent.split('(')[0]}</li>
                  <li>• Page: {window.location.pathname}</li>
                  <li>• Timestamp: {new Date().toLocaleString()}</li>
                </ul>
              </div>

              <Button onClick={handleBugReportSubmit} disabled={submitting || !bugDescription.trim()} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </Button>
            </TabsContent>

            <TabsContent value="feature" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="feature-title">
                  Feature Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="feature-title"
                  value={featureTitle}
                  onChange={(e) => setFeatureTitle(e.target.value)}
                  placeholder="Short, descriptive title..."
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="feature-description"
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                  placeholder="Describe the feature you'd like to see..."
                  className="min-h-[120px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{featureDescription.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label>How important is this to you?</Label>
                <div className="flex items-center gap-4">
                  {renderStarRating(featureImportance, setFeatureImportance)}
                  <span className="text-sm text-muted-foreground">
                    {featureImportance === 1 && 'Nice to have'}
                    {featureImportance === 2 && 'Would be helpful'}
                    {featureImportance === 3 && 'Important'}
                    {featureImportance === 4 && 'Very important'}
                    {featureImportance === 5 && 'Critical'}
                  </span>
                </div>
              </div>

              <Button onClick={handleFeatureRequestSubmit} disabled={submitting || !featureTitle.trim() || !featureDescription.trim()} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Feature Request'}
              </Button>
            </TabsContent>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>How satisfied are you with Aderai?</Label>
                <div className="flex items-center gap-4">
                  {renderStarRating(satisfaction, setSatisfaction)}
                  <span className="text-sm text-muted-foreground">
                    {satisfaction === 1 && 'Very dissatisfied'}
                    {satisfaction === 2 && 'Dissatisfied'}
                    {satisfaction === 3 && 'Neutral'}
                    {satisfaction === 4 && 'Satisfied'}
                    {satisfaction === 5 && 'Very satisfied'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="general-feedback">
                  Your feedback <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="general-feedback"
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or anything else..."
                  className="min-h-[150px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{generalFeedback.length}/1000</p>
              </div>

              <Button onClick={handleGeneralFeedbackSubmit} disabled={submitting || !generalFeedback.trim()} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
