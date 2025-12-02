import { SparklesCore } from "@/components/ui/sparkles";

interface BrandedLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const BrandedLoader = ({ message = "Loading...", size = "md" }: BrandedLoaderProps) => {
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-48 w-48"
  };

  const sparkleCount = {
    sm: 50,
    md: 100,
    lg: 150
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Sparkles effect */}
        <SparklesCore
          id={`branded-loader-${size}`}
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={sparkleCount[size]}
          className="absolute inset-0"
          particleColor="#fb923c"
        />
        
        {/* Aderai logo or icon in center */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="text-4xl font-bold text-primary animate-pulse">A</div>
        </div>
      </div>
      
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};