import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SegmentListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="p-4 border border-border rounded-lg bg-card animate-fade-in">
        <div className="flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const AnalyticsChartSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 border border-border rounded-lg bg-card">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    
    <div className="border border-border rounded-lg p-6 bg-card">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-6 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="border border-border rounded-lg overflow-hidden animate-fade-in">
    <div className="bg-muted p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-border last:border-b-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
);
