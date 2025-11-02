export const TrustLogos = () => {
  const logos = [
    { name: "TechCrunch", width: "w-32" },
    { name: "Forbes", width: "w-24" },
    { name: "Entrepreneur", width: "w-36" },
    { name: "Business Insider", width: "w-40" },
    { name: "Inc.", width: "w-16" }
  ];

  return (
    <div className="py-12 border-y border-border">
      <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">
        As featured in
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className={`${logo.width} h-8 bg-muted-foreground/10 rounded flex items-center justify-center`}
          >
            <span className="text-xs font-semibold text-muted-foreground">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
