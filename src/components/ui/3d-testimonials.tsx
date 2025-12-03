import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
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
}: MarqueeProps) {
  const items = React.Children.toArray(children);
  
  return (
    <div
      className={cn(
        'flex overflow-hidden [--gap:1rem]',
        vertical ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, repeatIndex) => (
        <div
          key={repeatIndex}
          className={cn(
            'flex shrink-0',
            vertical ? 'flex-col gap-4 animate-marquee-vertical' : 'flex-row gap-4 animate-marquee',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {items}
        </div>
      ))}
    </div>
  );
}
