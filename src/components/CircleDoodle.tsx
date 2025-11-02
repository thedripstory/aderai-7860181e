interface CircleDoodleProps {
  children: React.ReactNode;
  delay?: string;
}

export const CircleDoodle = ({ children, delay = "0s" }: CircleDoodleProps) => {
  return (
    <span className="relative inline-block px-8 py-3">
      {children}
      <svg
        className="absolute opacity-0 animate-fade-in pointer-events-none"
        style={{ 
          animationDelay: delay, 
          animationFillMode: "forwards",
          left: "-18%",
          top: "-30%",
          width: "136%",
          height: "160%",
          filter: "url(#grunge)"
        }}
        viewBox="0 0 140 80"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="grunge">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <ellipse
          cx="70"
          cy="40"
          rx="64"
          ry="34"
          stroke="hsl(var(--accent))"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-8 70 40)"
        />
      </svg>
    </span>
  );
};
