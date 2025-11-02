interface ArrowDoodleProps {
  direction?: "left" | "right" | "down";
  className?: string;
}

export const ArrowDoodle = ({ direction = "right", className = "" }: ArrowDoodleProps) => {
  const paths = {
    right: "M10,30 Q30,20 50,30 T90,30 M85,25 L95,30 L85,35",
    left: "M90,30 Q70,20 50,30 T10,30 M15,25 L5,30 L15,35",
    down: "M30,10 Q20,30 30,50 T30,90 M25,85 L30,95 L35,85"
  };

  return (
    <svg
      className={`inline-block opacity-0 animate-fade-in ${className}`}
      style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
      width={direction === "down" ? "60" : "100"}
      height={direction === "down" ? "100" : "60"}
      viewBox={direction === "down" ? "0 0 60 100" : "0 0 100 60"}
    >
      <path
        d={paths[direction]}
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
