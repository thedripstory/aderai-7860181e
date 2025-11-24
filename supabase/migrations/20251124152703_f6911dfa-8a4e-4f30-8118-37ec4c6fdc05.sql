-- Drop and recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS help_article_popularity;

CREATE VIEW help_article_popularity 
WITH (security_invoker = true) AS
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