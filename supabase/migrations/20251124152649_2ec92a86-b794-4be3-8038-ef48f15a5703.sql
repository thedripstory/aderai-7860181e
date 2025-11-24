-- Create help_articles table
CREATE TABLE public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create help_article_views table for tracking
CREATE TABLE public.help_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.help_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT
);

-- Enable RLS
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_articles (public read, admin write)
CREATE POLICY "Anyone can view help articles"
  ON public.help_articles
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert help articles"
  ON public.help_articles
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update help articles"
  ON public.help_articles
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete help articles"
  ON public.help_articles
  FOR DELETE
  USING (is_admin());

-- RLS Policies for help_article_views
CREATE POLICY "Users can insert own article views"
  ON public.help_article_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all article views"
  ON public.help_article_views
  FOR SELECT
  USING (is_admin());

-- Create index for faster lookups
CREATE INDEX idx_help_articles_category ON public.help_articles(category);
CREATE INDEX idx_help_articles_slug ON public.help_articles(slug);
CREATE INDEX idx_help_article_views_article ON public.help_article_views(article_id);
CREATE INDEX idx_help_article_views_viewed_at ON public.help_article_views(viewed_at);

-- Trigger for updated_at
CREATE TRIGGER update_help_articles_updated_at
  BEFORE UPDATE ON public.help_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for most popular articles
CREATE VIEW help_article_popularity AS
SELECT 
  ha.id,
  ha.slug,
  ha.title,
  ha.category,
  COUNT(hav.id) as view_count,
  COUNT(DISTINCT hav.user_id) as unique_users,
  MAX(hav.viewed_at) as last_viewed
FROM help_articles ha
LEFT JOIN help_article_views hav ON ha.id = hav.article_id
GROUP BY ha.id, ha.slug, ha.title, ha.category
ORDER BY view_count DESC;