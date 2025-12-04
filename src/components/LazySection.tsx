import React, { useEffect, useRef, useState, ReactNode, Suspense } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallbackHeight?: string;
  className?: string;
}

export const LazySection = ({ children, fallbackHeight = "400px", className = "" }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before it comes into view
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={<div style={{ minHeight: fallbackHeight }} />}>
          {children}
        </Suspense>
      ) : (
        <div style={{ minHeight: fallbackHeight }} />
      )}
    </div>
  );
};
