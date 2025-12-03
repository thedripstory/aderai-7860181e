import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Lock } from 'lucide-react';
import { useState } from 'react';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const AchievementCard = ({ name, description, icon, earned, earnedAt }: AchievementCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              group relative overflow-hidden rounded-xl border transition-all duration-500 cursor-pointer
              ${
                earned
                  ? 'border-primary/40 bg-gradient-to-br from-card/90 via-card to-card/90 hover:border-primary/60 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]'
                  : 'border-border/30 bg-card/40 hover:border-border/50 hover:bg-card/60'
              }
            `}
            style={{
              transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
          >
            {/* Animated gradient background for earned achievements */}
            {earned && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.1),transparent_50%)]" />
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl" />
                </div>

              </>
            )}

            {/* Lock icon for unearned */}
            {!earned && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
            )}

            {/* Check badge for earned */}
            {earned && (
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center animate-scale-in">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}

            <div className="relative p-6">
              <div className="flex flex-col items-center text-center gap-3">
                {/* Icon container */}
                <div
                  className={`
                    relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${
                      earned
                        ? 'bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-lg shadow-primary/20'
                        : 'bg-muted/30 border border-border/30 grayscale opacity-60 group-hover:opacity-80'
                    }
                  `}
                  style={{
                    transform: isHovered && earned ? 'rotateY(10deg) rotateX(-10deg) scale(1.05)' : 'rotateY(0deg) rotateX(0deg) scale(1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Icon glow effect */}
                  {earned && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  
                  <div
                    className={`
                      relative text-5xl transition-all duration-300
                      ${isHovered && earned ? 'scale-110' : 'scale-100'}
                    `}
                    style={{
                      filter: earned ? 'drop-shadow(0 0 8px hsl(var(--primary)/0.5))' : 'none',
                    }}
                  >
                    {icon}
                  </div>
                </div>

                {/* Achievement name */}
                <h3
                  className={`
                    font-bold text-sm transition-all duration-300
                    ${
                      earned
                        ? 'text-foreground group-hover:text-primary'
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {name}
                </h3>

                {/* Earned date badge */}
                {earned && earnedAt && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors duration-300 animate-fade-in"
                  >
                    {new Date(earnedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Badge>
                )}

                {/* Locked indicator for unearned */}
                {!earned && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-muted/50 border-border/50 text-muted-foreground"
                  >
                    Locked
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom glow line for earned achievements */}
            {earned && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="max-w-xs p-4 bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{icon}</span>
              <h4 className="font-bold text-foreground">{name}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            {earned ? (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Unlocked {earnedAt && `on ${new Date(earnedAt).toLocaleDateString()}`}
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Keep going to unlock this achievement!
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
