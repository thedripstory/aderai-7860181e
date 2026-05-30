import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';
import { getConfettiEnabled } from '@/lib/preferences';

interface SuccessAnimationProps {
  show: boolean;
  title: string;
  description?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({
  show,
  title,
  description,
  onComplete,
}: SuccessAnimationProps) {
  const firedRef = useRef(false);
  // Keep latest onComplete without retriggering the effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!show) {
      // reset so the next show=true transition can fire once
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;

    if (getConfettiEnabled()) {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#f97316', '#8b5cf6', '#ec4899'],
      });
    }

    const timer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="h-20 w-20 mx-auto text-green-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
