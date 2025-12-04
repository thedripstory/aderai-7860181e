import { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { helpArticlesData } from '@/lib/helpArticlesData';
import { HelpArticleRenderer } from '@/components/HelpArticleRenderer';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<typeof helpArticlesData[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('Getting Started');

  // Use local data directly - more reliable for public help page
  const articles = helpArticlesData.map((a, i) => ({ ...a, id: `article-${i}` }));

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

  const categoryDescriptions: Record<string, string> = {
    'Getting Started': 'Get up and running with Aderai',
    'Segments': 'Master customer segmentation',
    'AI Features': 'Leverage AI-powered tools',
    'Troubleshooting': 'Solve common issues'
  };

  const getArticleReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
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
              className="pl-12 h-12 text-base bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary shadow-sm"
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
            <TabsList className="bg-card/80 backdrop-blur-sm border border-border p-1.5 h-auto flex-wrap gap-1">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 rounded-lg transition-all"
                >
                  <span className="mr-2">{categoryIcons[cat]}</span>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-6 space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{categoryIcons[category]}</span>
                  <div>
                    <h2 className="text-xl font-semibold">{category}</h2>
                    <p className="text-sm text-muted-foreground">{categoryDescriptions[category]}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {articles.filter(a => a.category === category).map((article) => (
                    <Card 
                      key={article.id} 
                      className="group cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card/80 backdrop-blur-sm overflow-hidden relative"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {getArticleReadTime(article.content)} min read
                              </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="text-sm mt-2 line-clamp-2">
                              {article.excerpt}
                            </CardDescription>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
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
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for "<span className="text-foreground font-medium">{searchQuery}</span>"
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="group cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card/80 backdrop-blur-sm"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{categoryIcons[article.category]}</span>
                      <span>{article.category}</span>
                      <span className="text-border">•</span>
                      <span>{getArticleReadTime(article.content)} min read</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="text-sm mt-2 line-clamp-2">
                          {article.excerpt}
                        </CardDescription>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
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
              className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border-border shadow-2xl bg-card" 
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="border-b border-border bg-gradient-to-r from-card to-muted/20 shrink-0 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="gap-1.5 text-xs">
                        <span>{categoryIcons[selectedArticle.category]}</span>
                        {selectedArticle.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getArticleReadTime(selectedArticle.content)} min read
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {selectedArticle.excerpt}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedArticle(null)}
                    className="shrink-0 hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <HelpArticleRenderer 
                    content={selectedArticle.content} 
                    title={selectedArticle.title} 
                  />
                </div>
              </ScrollArea>

              {/* Modal Footer */}
              <div className="border-t border-border bg-muted/30 p-4 shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Was this article helpful? Let us know via the feedback widget.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedArticle(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
