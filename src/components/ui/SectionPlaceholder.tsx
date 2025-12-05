interface SectionPlaceholderProps {
  height?: string;
  className?: string;
}

export function SectionPlaceholder({ height = '400px', className = '' }: SectionPlaceholderProps) {
  return (
    <div 
      className={`w-full flex items-center justify-center ${className}`}
      style={{ minHeight: height }}
    >
      <div className="relative w-8 h-8">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
        
        {/* Middle counter-rotating ring */}
        <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
        
        {/* Inner pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
        </div>
        
        {/* Orbiting particles */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
        </div>
        <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
        </div>
      </div>
    </div>
  );
}

export default SectionPlaceholder;
