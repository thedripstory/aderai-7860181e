interface TornPaperDividerProps {
  className?: string;
  fillColor?: string;
}

export const TornPaperDivider = ({ className = "", fillColor = "currentColor" }: TornPaperDividerProps) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-8 md:h-12"
      >
        <path
          d="M0,0 L0,36 Q30,28 60,32 T120,36 Q150,40 180,34 T240,32 Q270,36 300,30 T360,34 Q390,28 420,36 T480,32 Q510,34 540,28 T600,36 Q630,32 660,36 T720,30 Q750,34 780,32 T840,36 Q870,30 900,34 T960,32 Q990,36 1020,30 T1080,34 Q1110,28 1140,36 T1200,32 Q1230,34 1260,30 T1320,36 Q1350,32 1380,34 T1440,30 L1440,0 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};
