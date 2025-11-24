import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const fetchAchievements = async () => {
      try {
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
          .eq('user_id', userId);

        if (userError) throw userError;

        setAchievements(allAchievements || []);
        setEarnedAchievements(new Set(userAchievements?.map(ua => ua.achievement_id) || []));
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const checkAndAwardAchievement = async (criteriaType: string, criteriaValue?: number) => {
    if (!userId) return;

    const eligibleAchievements = achievements.filter(achievement => {
      if (earnedAchievements.has(achievement.id)) return false;
      if (achievement.criteria_type !== criteriaType) return false;
      if (achievement.criteria_value && criteriaValue !== undefined) {
        return criteriaValue >= achievement.criteria_value;
      }
      return true;
    });

    for (const achievement of eligibleAchievements) {
      try {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });

        if (!error) {
          setEarnedAchievements(prev => new Set([...prev, achievement.id]));
          
          // Show celebration toast
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.icon} ${achievement.name}`,
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error awarding achievement:', error);
      }
    }
  };

  return {
    achievements,
    earnedAchievements,
    loading,
    checkAndAwardAchievement
  };
};
