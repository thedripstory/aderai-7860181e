interface CircleDoodleProps {
  children: React.ReactNode;
  delay?: string;
}

export const CircleDoodle = ({ children, delay = "0s" }: CircleDoodleProps) => {
  return (
    <span className="relative inline-block px-2">
      {children}
      <svg
        className="absolute inset-0 w-full h-full opacity-0 animate-fade-in pointer-events-none"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
        viewBox="0 0 120 60"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="60"
          cy="30"
          rx="55"
          ry="25"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-5 60 30)"
        />
      </svg>
    </span>
  );
};
