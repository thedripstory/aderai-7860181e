export const EmailFooter = () => {
  return (
    <footer className="px-4 py-8 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Klaviyo AI Segmentation</h3>
          <p className="text-sm text-muted-foreground">
            Enterprise-level email segmentation for growing brands
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Support
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>
        
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>© 2025 Klaviyo AI Segmentation. Powered by Klaviyo.</p>
          <p className="text-xs">
            You're receiving this because you signed up for product updates.{" "}
            <a href="#" className="text-primary hover:underline">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
