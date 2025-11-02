interface TornPaperDividerProps {
  className?: string;
  flip?: boolean;
}

export const TornPaperDivider = ({ className = "", flip = false }: TornPaperDividerProps) => {
  return (
    <div className={`w-full relative ${className} ${flip ? 'rotate-180' : ''}`} style={{ marginTop: '-1px', marginBottom: '-1px' }}>
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-6 md:h-8 block"
        style={{ display: 'block' }}
      >
        <path
          d="M0,20 C40,25 80,15 120,22 C160,28 200,18 240,24 C280,30 320,20 360,26 C400,32 440,22 480,28 C520,34 560,24 600,30 C640,36 680,26 720,32 C760,38 800,28 840,34 C880,40 920,30 960,36 C1000,42 1040,32 1080,38 C1120,44 1160,34 1200,40 C1240,46 1280,36 1320,42 C1360,48 1400,38 1440,44 L1440,60 L0,60 Z"
          fill="currentColor"
          className="text-background"
        />
      </svg>
    </div>
  );
};
