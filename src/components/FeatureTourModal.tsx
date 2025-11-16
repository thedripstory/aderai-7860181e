import React, { useEffect } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useFeatureTour } from '@/hooks/useFeatureTour';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export const FeatureTourModal = () => {
  const {
    tourSteps,
    tourEnabled,
    tourCompleted,
    loading,
    completeTour,
    skipTour,
    restartTour,
  } = useFeatureTour();

  if (loading) return null;

  return (
    <>
      {/* Restart Tour Button (shows after completion) */}
      {tourCompleted && (
        <Button
          variant="outline"
          size="sm"
          onClick={restartTour}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Feature Tour
        </Button>
      )}

      {/* Intro.js Tour */}
      <Steps
        enabled={tourEnabled}
        steps={tourSteps.map(step => ({
          element: step.element,
          intro: step.intro,
          position: step.position || 'bottom',
          title: step.title,
        }))}
        initialStep={0}
        onExit={skipTour}
        onComplete={completeTour}
        options={{
          showProgress: true,
          showBullets: true,
          exitOnOverlayClick: false,
          doneLabel: 'Get Started! 🚀',
          nextLabel: 'Next →',
          prevLabel: '← Back',
          skipLabel: 'Skip Tour',
          hidePrev: false,
          hideNext: false,
          tooltipClass: 'customTooltip',
          highlightClass: 'customHighlight',
          scrollToElement: true,
          scrollPadding: 30,
        }}
      />
    </>
  );
};
