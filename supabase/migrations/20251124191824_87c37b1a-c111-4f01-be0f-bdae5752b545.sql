-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria_type text NOT NULL,
  criteria_value integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert predefined achievements
INSERT INTO public.achievements (name, description, icon, criteria_type, criteria_value) VALUES
  ('First Steps', 'Connected your Klaviyo account and unlocked the power of segmentation', '🚀', 'klaviyo_connected', NULL),
  ('Segment Starter', 'Created your first segment and began your journey to better targeting', '⭐', 'segments_created', 1),
  ('Bundle Master', 'Created a full segment bundle to maximize your marketing strategy', '📦', 'bundle_created', NULL),
  ('AI Explorer', 'Used AI-powered suggestions to discover new segment opportunities', '🤖', 'ai_used', NULL),
  ('Segment Pro', 'Created 25 segments - you''re becoming a segmentation expert!', '🏆', 'segments_created', 25),
  ('Segmentation Expert', 'Created 50 segments - you''ve mastered the art of audience targeting', '💎', 'segments_created', 50),
  ('Feedback Champion', 'Shared valuable feedback to help improve the platform', '💬', 'feedback_submitted', NULL),
  ('Beta Pioneer', 'Joined during the beta period and helped shape the future', '🌟', 'beta_user', NULL);