interface CircleDoodleProps {
  children: React.ReactNode;
  delay?: string;
}

export const CircleDoodle = ({ children, delay = "0s" }: CircleDoodleProps) => {
  return (
    <span className="relative inline-block px-3 py-1">
      {children}
      <svg
        className="absolute opacity-0 animate-fade-in pointer-events-none"
        style={{ 
          animationDelay: delay, 
          animationFillMode: "forwards",
          left: "-8%",
          top: "-12%",
          width: "116%",
          height: "124%"
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
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-5 60 30)"
          strokeDasharray="1,1"
          style={{ 
            filter: "url(#roughen)",
            animation: "dash 0.6s ease-in forwards"
          }}
        />
        <defs>
          <filter id="roughen">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>
      </svg>
    </span>
  );
};
