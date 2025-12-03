import React, { ComponentPropsWithoutRef, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  reverse?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={marqueeRef}
      data-slot="marquee"
      className={cn(
        'flex overflow-hidden [--duration:25s] [--gap:1rem] [gap:var(--gap)]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 [gap:var(--gap)] will-change-transform',
            !vertical && 'flex-row animate-marquee',
            vertical && 'flex-col animate-marquee-vertical',
            reverse && '[animation-direction:reverse]',
          )}
          style={{
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transform: 'translateZ(0)',
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
