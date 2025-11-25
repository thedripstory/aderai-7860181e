import { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { helpArticlesData } from '@/lib/helpArticlesData';
import ReactMarkdown from 'react-markdown';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const navigate = useNavigate();

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

  const categoryIcons: Record<string, string> = {
    'Getting Started': '🚀',
    'Segments': '📊',
    'AI Features': '🤖',
    'Troubleshooting': '🔧'
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
              <p className="text-muted-foreground">Find answers and learn how to use Aderai</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-card border-border/50 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!searchQuery ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
            <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2"
                >
                  <span className="mr-2">{categoryIcons[cat]}</span>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {articles.filter(a => a.category === category).map(article => (
                    <Card 
                      key={article.id} 
                      className="group cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm"
                      onClick={() => { setSelectedArticle(article); trackView(article.id); }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between group-hover:text-primary transition-colors">
                          {article.title}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardTitle>
                        <CardDescription className="text-sm">{article.excerpt}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="group cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm"
                  onClick={() => { setSelectedArticle(article); trackView(article.id); }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>{categoryIcons[article.category]}</span>
                      <span>{article.category}</span>
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between group-hover:text-primary transition-colors">
                      {article.title}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription className="text-sm">{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Article Modal */}
        {selectedArticle && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <Card 
              className="max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border-border shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <CardHeader className="border-b border-border bg-card shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{categoryIcons[selectedArticle.category]}</span>
                      <span>{selectedArticle.category}</span>
                    </div>
                    <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto p-6 prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
