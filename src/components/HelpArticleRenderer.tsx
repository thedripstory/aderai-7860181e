import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Info, Lightbulb, 
  ArrowRight, Zap, Shield, Settings, Key, 
  BarChart3, Users, Target, Sparkles, Clock,
  RefreshCw, XCircle, HelpCircle
} from 'lucide-react';

interface HelpArticleRendererProps {
  content: string;
  title: string;
}

export const HelpArticleRenderer: React.FC<HelpArticleRendererProps> = ({ content, title }) => {
  // Parse and render content with custom styling
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let stepCounter = 0;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        elements.push(
          <div key={`list-${elements.length}`} className="space-y-2 my-4">
            {currentList.map((item, idx) => {
              const isCheck = item.startsWith('✅');
              const isX = item.startsWith('❌');
              const cleanItem = item.replace(/^[✅❌]\s*/, '').replace(/^[-•]\s*/, '');
              
              return (
                <div key={idx} className="flex items-start gap-3 group">
                  {isCheck ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  ) : isX ? (
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  ) : listType === 'ol' ? (
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                  <span className="text-muted-foreground leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: formatInlineText(cleanItem) }} 
                  />
                </div>
              );
            })}
          </div>
        );
        currentList = [];
        listType = null;
      }
    };

    const formatInlineText = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">$1</code>')
        .replace(/→/g, '<span class="text-primary mx-1">→</span>');
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip the main title (we show it in header)
      if (trimmedLine.startsWith('# ') && index < 3) {
        return;
      }

      // H2 Headers - Section titles with icons
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const headerText = trimmedLine.replace('## ', '');
        const icon = getSectionIcon(headerText);
        stepCounter = 0;
        
        elements.push(
          <div key={`h2-${index}`} className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              {icon}
            </div>
            <h2 className="text-xl font-bold text-foreground">{headerText}</h2>
          </div>
        );
        return;
      }

      // H3 Headers - Subsections
      if (trimmedLine.startsWith('### ')) {
        flushList();
        const headerText = trimmedLine.replace('### ', '');
        const isStep = headerText.match(/^(\d+)\./);
        const isIssue = headerText.toLowerCase().includes('issue') || headerText.toLowerCase().includes('error');
        const isSolution = headerText.toLowerCase().includes('solution');
        
        if (isStep) {
          stepCounter++;
          elements.push(
            <div key={`h3-${index}`} className="mt-6 mb-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {stepCounter}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{headerText.replace(/^\d+\.\s*/, '')}</h3>
              </div>
            </div>
          );
        } else if (isIssue) {
          elements.push(
            <div key={`h3-${index}`} className="mt-6 mb-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-foreground">{headerText}</h3>
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={`h3-${index}`} className="mt-6 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{headerText}</h3>
            </div>
          );
        }
        return;
      }

      // Ordered list items (1. 2. 3.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s*/, ''));
        return;
      }

      // Unordered list items (- or • or ✅ or ❌)
      if (/^[-•✅❌]\s/.test(trimmedLine)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(trimmedLine);
        return;
      }

      // Paragraphs
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        flushList();
        
        // Special callouts
        if (trimmedLine.includes('**Symptoms:**') || trimmedLine.includes('**Cause:**')) {
          elements.push(
            <div key={`callout-${index}`} className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <span dangerouslySetInnerHTML={{ __html: formatInlineText(trimmedLine) }} />
            </div>
          );
          return;
        }
        
        if (trimmedLine.includes('**Solutions:**')) {
          elements.push(
            <div key={`solutions-${index}`} className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Solutions</span>
            </div>
          );
          return;
        }

        elements.push(
          <p key={`p-${index}`} className="text-muted-foreground leading-relaxed my-3" 
            dangerouslySetInnerHTML={{ __html: formatInlineText(trimmedLine) }} 
          />
        );
      }
    });

    flushList();
    return elements;
  };

  const getSectionIcon = (text: string): React.ReactNode => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('step 1') || lowerText.includes('get') || lowerText.includes('api key')) 
      return <Key className="w-5 h-5 text-primary" />;
    if (lowerText.includes('step 2') || lowerText.includes('add') || lowerText.includes('portal')) 
      return <Settings className="w-5 h-5 text-primary" />;
    if (lowerText.includes('step 3') || lowerText.includes('configure') || lowerText.includes('settings')) 
      return <Settings className="w-5 h-5 text-primary" />;
    if (lowerText.includes('method') || lowerText.includes('choose')) 
      return <Target className="w-5 h-5 text-primary" />;
    if (lowerText.includes('next') || lowerText.includes('happen')) 
      return <ArrowRight className="w-5 h-5 text-primary" />;
    if (lowerText.includes('best') || lowerText.includes('practice') || lowerText.includes('tip')) 
      return <Lightbulb className="w-5 h-5 text-primary" />;
    if (lowerText.includes('benefit')) 
      return <Sparkles className="w-5 h-5 text-primary" />;
    if (lowerText.includes('bundle')) 
      return <Users className="w-5 h-5 text-primary" />;
    if (lowerText.includes('what') || lowerText.includes('overview')) 
      return <Info className="w-5 h-5 text-primary" />;
    if (lowerText.includes('categor')) 
      return <BarChart3 className="w-5 h-5 text-primary" />;
    if (lowerText.includes('how') || lowerText.includes('work')) 
      return <Zap className="w-5 h-5 text-primary" />;
    if (lowerText.includes('limit') || lowerText.includes('usage')) 
      return <Clock className="w-5 h-5 text-primary" />;
    if (lowerText.includes('permission') || lowerText.includes('security')) 
      return <Shield className="w-5 h-5 text-primary" />;
    if (lowerText.includes('error') || lowerText.includes('issue') || lowerText.includes('problem')) 
      return <AlertTriangle className="w-5 h-5 text-primary" />;
    if (lowerText.includes('sync') || lowerText.includes('real-time')) 
      return <RefreshCw className="w-5 h-5 text-primary" />;
    return <HelpCircle className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-1">
      {renderContent()}
    </div>
  );
};
