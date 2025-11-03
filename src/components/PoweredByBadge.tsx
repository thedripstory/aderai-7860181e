const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export const PoweredByBadge = () => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
      <span className="text-sm text-muted-foreground">Powered by</span>
      <img src={klaviyoLogo} alt="Klaviyo" className="h-[1em] inline-block relative top-[0.1em]" />
    </div>
  );
};
