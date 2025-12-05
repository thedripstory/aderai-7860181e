import { useState } from 'react';
import { AlertCircle, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SegmentMismatchBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    segmentName: '',
    expectedBehavior: '',
    actualBehavior: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.segmentName.trim() || !formData.expectedBehavior.trim() || !formData.actualBehavior.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('segment_mismatch_reports')
        .insert({
          user_id: user.id,
          user_email: userData?.email || user.email || '',
          segment_name: formData.segmentName.trim(),
          expected_behavior: formData.expectedBehavior.trim(),
          actual_behavior: formData.actualBehavior.trim(),
          additional_notes: formData.additionalNotes.trim() || null
        });

      if (error) throw error;

      setIsSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({
          segmentName: '',
          expectedBehavior: '',
          actualBehavior: '',
          additionalNotes: ''
        });
      }, 2500);

    } catch (error: any) {
      console.error('Failed to submit report:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Banner */}
      <div 
        onClick={() => setIsOpen(true)}
        className="mt-8 mx-auto max-w-3xl cursor-pointer group"
      >
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">
                Think there's a segment mismatch?{' '}
                <span className="text-primary underline underline-offset-2 decoration-primary/50 group-hover:decoration-primary transition-colors">
                  Report here
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Our team will personally review and create the correct segment for you — no extra charge.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Get Help →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report Submitted!</h3>
              <p className="text-muted-foreground">
                Our team will review your report and reach out within 24-48 hours.
                We'll create the correct segment for you personally.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Report Segment Mismatch
                </DialogTitle>
                <DialogDescription>
                  Tell us what's wrong and our team will personally fix or create the segment for you.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="segmentName">
                    Which segment has the issue? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="segmentName"
                    placeholder="e.g., VIP Customers, Cart Abandoners..."
                    value={formData.segmentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, segmentName: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedBehavior">
                    What did you expect? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="expectedBehavior"
                    placeholder="Describe what you expected the segment to do or include..."
                    rows={3}
                    value={formData.expectedBehavior}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualBehavior">
                    What actually happened? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="actualBehavior"
                    placeholder="Describe what the segment is actually doing or who it's including..."
                    rows={3}
                    value={formData.actualBehavior}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Additional notes <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any other context that might help us understand the issue..."
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  We typically respond within 24-48 hours and will personally create or fix the segment for you.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
