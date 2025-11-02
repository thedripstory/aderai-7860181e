interface CircleDoodleProps {
  children: React.ReactNode;
  delay?: string;
}

export const CircleDoodle = ({ children, delay = "0s" }: CircleDoodleProps) => {
  return (
    <span className="relative inline-block px-6 py-2">
      {children}
      <svg
        className="absolute opacity-0 animate-fade-in pointer-events-none"
        style={{ 
          animationDelay: delay, 
          animationFillMode: "forwards",
          left: "-12%",
          top: "-20%",
          width: "124%",
          height: "140%"
        }}
        viewBox="0 0 120 60"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="60"
          cy="30"
          rx="56"
          ry="27"
          stroke="hsl(var(--accent))"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-3 60 30)"
        />
      </svg>
    </span>
  );
};
