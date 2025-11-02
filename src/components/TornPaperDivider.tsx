interface TornPaperDividerProps {
  className?: string;
  flip?: boolean;
}

export const TornPaperDivider = ({ className = "", flip = false }: TornPaperDividerProps) => {
  return (
    <div className={`w-full relative ${className} ${flip ? 'rotate-180' : ''}`} style={{ marginTop: '-1px', marginBottom: '-1px' }}>
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-20 md:h-32 lg:h-40 block"
        style={{ display: 'block' }}
      >
        <path
          d="M0,45 L15,38 L28,52 L42,35 L58,48 L72,40 L88,55 L102,42 L118,58 L135,45 L152,62 L168,48 L185,65 L202,50 L218,68 L235,52 L252,70 L268,55 L285,72 L302,58 L318,75 L335,60 L352,78 L368,62 L385,80 L402,65 L418,82 L435,68 L452,85 L468,70 L485,88 L502,72 L518,90 L535,75 L552,92 L568,78 L585,95 L602,80 L618,98 L635,82 L652,100 L668,85 L685,102 L702,88 L718,105 L735,90 L752,108 L768,92 L785,110 L802,95 L818,112 L835,98 L852,115 L868,100 L885,118 L902,102 L918,120 L935,105 L952,118 L968,108 L985,115 L1002,100 L1018,112 L1035,98 L1052,110 L1068,95 L1085,108 L1102,92 L1118,105 L1135,90 L1152,102 L1168,88 L1185,100 L1202,85 L1218,98 L1235,82 L1252,95 L1268,80 L1285,92 L1302,78 L1318,90 L1335,75 L1352,88 L1368,72 L1385,85 L1402,70 L1418,82 L1435,68 L1440,75 L1440,120 L0,120 Z"
          fill="currentColor"
          className="text-orange-500 drop-shadow-2xl"
          style={{ 
            filter: 'drop-shadow(0 4px 20px rgba(249, 115, 22, 0.4))'
          }}
        />
      </svg>
    </div>
  );
};
