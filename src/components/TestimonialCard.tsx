import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  metric?: string;
}

export const TestimonialCard = ({ quote, author, role, company, metric }: TestimonialCardProps) => {
  return (
    <div className="bg-card rounded-xl p-8 border border-border shadow-sm h-full flex flex-col">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
        ))}
      </div>
      
      {metric && (
        <div className="text-3xl font-bold mb-4 text-accent">{metric}</div>
      )}
      
      <blockquote className="text-base mb-6 flex-1 leading-relaxed">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0" />
        <div>
          <div className="font-semibold">{author}</div>
          <div className="text-sm text-muted-foreground">{role}, {company}</div>
        </div>
      </div>
    </div>
  );
};
