export const EmailFooter = () => {
  return (
    <footer className="px-4 py-8 border-t border-border bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-playfair font-bold mb-2">
            aderai<span className="text-accent">.</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered segmentation for Klaviyo
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          <a href="#" className="text-muted-foreground hover:text-foreground transition">
            Features
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition">
            Pricing
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition">
            Support
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
