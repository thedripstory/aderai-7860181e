import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { AchievementCard } from './AchievementCard';
import { Trophy, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number | null;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

export const AchievementsPanel = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('criteria_value', { ascending: true, nullsFirst: false });

        if (achievementsError) throw achievementsError;

        // Fetch user's earned achievements
        const { data: userAchievements, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        if (userError) throw userError;

        setAchievements(allAchievements || []);

        const earnedMap = new Map<string, string>();
        userAchievements?.forEach(ua => {
          earnedMap.set(ua.achievement_id, ua.earned_at);
        });
        setEarnedAchievements(earnedMap);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const earnedCount = earnedAchievements.size;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 animate-pulse" />
        
        <div className="relative p-8">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 blur-xl animate-pulse" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-gradient-to-r from-muted/70 to-muted/30 animate-pulse" />
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s',
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-muted/50" />
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-3 w-16 rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/95 to-card backdrop-blur-xl shadow-2xl">
      {/* Animated gradient orbs in background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,hsl(var(--border)/0.03)_50%,transparent_100%)] bg-[length:100px_100px]" />

      <div className="relative p-8">
        {/* Premium Header */}
        <div className="flex items-start gap-6 mb-8">
          {/* Glowing trophy icon */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Achievements
              </h2>
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {earnedCount}/{totalCount}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>

            {/* Animated progress bar */}
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-muted/50 backdrop-blur-sm border border-border/30"
              />
              {progressPercentage > 0 && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-md -z-10"
                  style={{ width: `${progressPercentage}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              <AchievementCard
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                earned={earnedAchievements.has(achievement.id)}
                earnedAt={earnedAchievements.get(achievement.id)}
              />
            </div>
          ))}
        </div>

        {/* Motivational message */}
        {earnedCount < totalCount && (
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/30 backdrop-blur-sm animate-fade-in">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-foreground">{totalCount - earnedCount}</span> achievement{totalCount - earnedCount !== 1 ? 's' : ''} remaining. Keep going! 🚀
            </p>
          </div>
        )}

        {earnedCount === totalCount && totalCount > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 backdrop-blur-sm animate-scale-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse" />
            <div className="relative text-center">
              <div className="mb-2 flex justify-center">
                <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)] animate-pulse" />
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                🎉 All Achievements Unlocked! 🎉
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You're a true Aderai champion!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
