import { useEffect, useState, useRef } from "react";

export const AnimatedTimeCounter = () => {
  const [timeInSeconds, setTimeInSeconds] = useState(36000); // 10 hours in seconds
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Use Intersection Observer to start animation when visible
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Small delay after becoming visible
            setTimeout(() => {
              setIsAnimating(true);
              setHasAnimated(true);
            }, 300);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isAnimating) return;

    const targetTime = 30; // 30 seconds
    const duration = 2500; // Animation duration in ms
    const startTime = Date.now();
    const startValue = 36000; // Always start from 10 hours

    // Easing function for smooth bounce deceleration
    const easeOutBounce = (t: number): number => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    };

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutBounce(progress);
      const currentValue = startValue - (startValue - targetTime) * easedProgress;
      
      setTimeInSeconds(Math.max(targetTime, Math.round(currentValue)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  const formatTime = (seconds: number): string => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }
  };

  return (
    <span ref={ref} className="inline-block min-w-[200px] text-center tabular-nums">
      {formatTime(timeInSeconds)}
    </span>
  );
};
