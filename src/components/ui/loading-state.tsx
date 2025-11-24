import React from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message?: string;
  description?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  description,
  onCancel,
  cancelLabel = "Cancel",
  progress,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="relative w-16 h-16 mb-4">
        {/* Aggressive rotating loader */}
        <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
        
        {/* Middle counter-rotating ring */}
        <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
        
        {/* Inner pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
        </div>
        
        {/* Orbiting particles */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
        <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      {progress && (
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{progress.current} of {progress.total}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {onCancel && (
        <Button variant="outline" onClick={onCancel} className="mt-4">
          <X className="w-4 h-4 mr-2" />
          {cancelLabel}
        </Button>
      )}
    </div>
  );
};

export const InlineLoadingState: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
};
