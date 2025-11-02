import { useEffect, useState } from "react";

export const AnimatedTimeCounter = () => {
  const [timeInSeconds, setTimeInSeconds] = useState(36000); // 10 hours in seconds
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a brief delay
    const startDelay = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const targetTime = 30; // 30 seconds
    const duration = 2500; // Animation duration in ms
    const startTime = Date.now();
    const startValue = 36000; // Always start from 10 hours

    // Easing function for deceleration
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutExpo(progress);
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
    <span className="inline-block min-w-[200px] text-center tabular-nums">
      {formatTime(timeInSeconds)}
    </span>
  );
};
