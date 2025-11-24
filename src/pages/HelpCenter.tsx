import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { helpArticlesData } from '@/lib/helpArticlesData';
import ReactMarkdown from 'react-markdown';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('Getting Started');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data } = await supabase
      .from('help_articles')
      .select('*')
      .order('order_index');
    
    if (data && data.length > 0) {
      setArticles(data);
    } else {
      // Seed articles if empty
      await seedArticles();
    }
  };

  const seedArticles = async () => {
    await supabase.from('help_articles').insert(helpArticlesData);
    loadArticles();
  };

  const trackView = async (articleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('help_article_views').insert({
      article_id: articleId,
      user_id: user?.id,
      session_id: sessionStorage.getItem('session_id') || crypto.randomUUID()
    });
  };

  const filteredArticles = articles.filter(a => 
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (searchQuery || a.category === activeCategory)
  );

  const categories = ['Getting Started', 'Segments', 'AI Features', 'Troubleshooting'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground">Find answers and learn how to use Segment Portal</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {!searchQuery ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-4 mb-6">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid gap-4">
                  {articles.filter(a => a.category === category).map(article => (
                    <Card key={article.id} className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => { setSelectedArticle(article); trackView(article.id); }}>
                      <CardHeader>
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>{article.excerpt}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map(article => (
              <Card key={article.id} className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => { setSelectedArticle(article); trackView(article.id); }}>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription>{article.excerpt}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {selectedArticle && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}>
            <Card className="max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>{selectedArticle.title}</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
