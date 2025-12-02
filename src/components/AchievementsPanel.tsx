import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementCard } from './AchievementCard';
import { Skeleton } from '@/components/ui/skeleton';

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          {earnedCount} of {totalCount} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              earned={earnedAchievements.has(achievement.id)}
              earnedAt={earnedAchievements.get(achievement.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
