import { AderaiLogo } from "@/components/AderaiLogo";

export const EmailFooter = () => {
  return (
    <footer className="px-4 py-8 border-t border-border bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <AderaiLogo size="lg" showHoverEffect={false} />
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered segmentation for Klaviyo
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition">
            How it works
          </a>
          <a href="/affiliate" className="text-muted-foreground hover:text-foreground transition">
            Become an Affiliate
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition">
            Contact
          </a>
        </div>
        
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>© 2025 Aderai. Powered by Klaviyo.</p>
          <p className="text-xs">
            You're receiving this because you signed up for updates.{" "}
            <a href="#" className="text-foreground hover:underline">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
