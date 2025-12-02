import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const AchievementCard = ({ name, description, icon, earned, earnedAt }: AchievementCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`p-4 transition-all duration-300 cursor-pointer ${
              earned 
                ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:scale-105' 
                : 'bg-muted/30 opacity-50 grayscale hover:opacity-70'
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className={`text-4xl transition-transform ${earned ? 'animate-pulse' : ''}`}>
                {icon}
              </div>
              <h3 className="font-semibold text-sm">{name}</h3>
              {earned && earnedAt && (
                <Badge variant="secondary" className="text-xs">
                  {new Date(earnedAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{description}</p>
          {!earned && (
            <p className="text-xs text-muted-foreground mt-1">Keep going to unlock this!</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
