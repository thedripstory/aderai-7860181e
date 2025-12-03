import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div">;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  const logos: Logo[] = [
    { src: "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Magazines/TechCrunch-min.png", alt: "TechCrunch Logo" },
    { src: "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Magazines/Forbes-min.png", alt: "Forbes Logo" },
    { src: "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Magazines/Entrepreneur_logo.png", alt: "Entrepreneur Logo" },
    { src: "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Magazines/Business_Insider-min.png", alt: "Business Insider Logo" },
    { src: "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Magazines/Inc.-min.png", alt: "Inc. Logo" },
  ];

  return (
    <div
      className={cn(
        "relative grid grid-cols-2 border-x md:grid-cols-5",
        className
      )}
      {...props}
    >
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-border" />

      <LogoCard
        className="relative border-r border-b bg-secondary dark:bg-secondary/30"
        logo={logos[0]}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="border-b md:border-r"
        logo={logos[1]}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground hidden md:block"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="relative border-r border-b md:bg-secondary dark:md:bg-secondary/30"
        logo={logos[2]}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground hidden md:block"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="relative border-b md:border-r bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background"
        logo={logos[3]}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground hidden md:block"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="relative border-r md:border-r-0 border-b md:border-b-0 bg-background md:bg-secondary dark:md:bg-secondary/30 col-span-2 md:col-span-1"
        logo={logos[4]}
      />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-border" />
    </div>
  );
}

type LogoCardProps = React.ComponentProps<"div"> & {
  logo: Logo;
};

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background px-4 py-8 md:p-8 relative",
        className
      )}
      {...props}
    >
      <img
        alt={logo.alt}
        className="pointer-events-none h-5 md:h-6 select-none dark:brightness-0 dark:invert object-contain"
        height={logo.height || "auto"}
        src={logo.src}
        width={logo.width || "auto"}
      />
      {children}
    </div>
  );
}
