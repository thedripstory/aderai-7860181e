import React from "react";
import { cn } from "@/lib/utils";

const ADERAI_LOGO_URL = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png";

interface AderaiLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  href?: string;
  showHoverEffect?: boolean;
}

const sizeClasses = {
  xs: "h-4",
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
  xl: "h-12",
  "2xl": "h-16",
};

export const AderaiLogo: React.FC<AderaiLogoProps> = ({
  size = "md",
  className,
  href,
  showHoverEffect = true,
}) => {
  const logoElement = (
    <img
      src={ADERAI_LOGO_URL}
      alt="Aderai"
      className={cn(
        sizeClasses[size],
        "dark:invert",
        showHoverEffect && "hover:scale-105 transition-transform duration-300",
        className
      )}
      loading="lazy"
    />
  );

  if (href) {
    return (
      <a href={href} className="inline-block group">
        {logoElement}
      </a>
    );
  }

  return logoElement;
};

export { ADERAI_LOGO_URL };
