interface AnimatedUnderlineProps {
  children: React.ReactNode;
  delay?: string;
}

export const AnimatedUnderline = ({ children, delay = "0s" }: AnimatedUnderlineProps) => {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="absolute -bottom-2 left-0 w-full h-3 opacity-0 animate-fade-in"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
      >
        <path
          d="M0,7 Q50,3 100,6 T200,7"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};
