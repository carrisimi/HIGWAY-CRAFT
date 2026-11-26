import type { UkSignId } from '../logic/theoryEngine';

interface UkRoadSignProps {
  signId: UkSignId;
  size?: number;
  className?: string;
}

export function UkRoadSign({ signId, size = 104, className = '' }: UkRoadSignProps) {
  switch (signId) {
    case 'national-speed':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK National Speed Limit sign">
          <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
          <line x1="20" y1="80" x2="80" y2="20" stroke="#0F172A" strokeWidth="14" />
        </svg>
      );
    case 'speed-30':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK 30 mph speed limit sign">
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" />
          <text x="50" y="61" textAnchor="middle" fill="#0F172A" fontSize="34" fontWeight="700" fontFamily="Outfit, sans-serif">
            30
          </text>
        </svg>
      );
    case 'speed-20':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK 20 mph speed limit sign">
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" />
          <text x="50" y="61" textAnchor="middle" fill="#0F172A" fontSize="34" fontWeight="700" fontFamily="Outfit, sans-serif">
            20
          </text>
        </svg>
      );
    case 'give-way':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Give Way sign">
          <polygon points="10,16 90,16 50,88" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" strokeLinejoin="round" />
        </svg>
      );
    case 'stop':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Stop sign">
          <polygon
            points="31,6 69,6 94,31 94,69 69,94 31,94 6,69 6,31"
            fill="#DC2626"
            stroke="#FFFFFF"
            strokeWidth="4"
          />
          <text x="50" y="59" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="700" fontFamily="Outfit, sans-serif">
            STOP
          </text>
        </svg>
      );
    case 'no-entry':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK No Entry sign">
          <circle cx="50" cy="50" r="46" fill="#DC2626" />
          <rect x="16" y="41" width="68" height="18" rx="2" fill="#FFFFFF" />
        </svg>
      );
    case 'clearway':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK No Stopping Clearway sign">
          <circle cx="50" cy="50" r="44" fill="#0B4F8A" stroke="#DC2626" strokeWidth="10" />
          <line x1="23" y1="23" x2="77" y2="77" stroke="#DC2626" strokeWidth="10" />
          <line x1="77" y1="23" x2="23" y2="77" stroke="#DC2626" strokeWidth="10" />
        </svg>
      );
    case 'motorway-red-x':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Smart Motorway Red X sign">
          <rect x="8" y="8" width="84" height="84" rx="10" fill="#0F172A" stroke="#334155" strokeWidth="3" />
          <line x1="28" y1="28" x2="72" y2="72" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
          <line x1="72" y1="28" x2="28" y2="72" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
        </svg>
      );
    case 'roundabout':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Roundabout ahead sign">
          <polygon points="50,10 92,86 8,86" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" strokeLinejoin="round" />
          <circle cx="50" cy="60" r="14" fill="none" stroke="#0F172A" strokeWidth="5" strokeDasharray="18 8" />
          <polygon points="50,41 57,48 45,50" fill="#0F172A" />
          <polygon points="65,67 57,72 59,60" fill="#0F172A" />
          <polygon points="35,67 39,58 45,68" fill="#0F172A" />
        </svg>
      );
    case 'minimum-speed':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Minimum 30 mph speed limit sign">
          <circle cx="50" cy="50" r="46" fill="#0B4F8A" stroke="#FFFFFF" strokeWidth="3" />
          <text x="50" y="61" textAnchor="middle" fill="#FFFFFF" fontSize="34" fontWeight="700" fontFamily="Outfit, sans-serif">
            30
          </text>
        </svg>
      );
    case 'dual-ends':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Dual carriageway ends sign">
          <polygon points="50,10 92,86 8,86" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" strokeLinejoin="round" />
          <path d="M40 78 L40 60 L47 45 L47 33" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 78 L60 60 L53 45 L53 33" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case 'keep-left':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Keep Left sign">
          <circle cx="50" cy="50" r="46" fill="#0B4F8A" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M68 32 L34 66 M34 66 L34 46 M34 66 L54 66" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'zebra-crossing':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Zebra crossing ahead sign">
          <polygon points="50,10 92,86 8,86" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" strokeLinejoin="round" />
          <rect x="33" y="72" width="6" height="6" fill="#0F172A" />
          <rect x="47" y="72" width="6" height="6" fill="#0F172A" />
          <rect x="61" y="72" width="6" height="6" fill="#0F172A" />
          <circle cx="50" cy="40" r="5" fill="#0F172A" />
          <path d="M50 46 L50 60 L42 70 M50 58 L58 70 M43 52 L57 52" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'school-patrol':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK School crossing patrol sign">
          <polygon points="50,10 92,86 8,86" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" strokeLinejoin="round" />
          <circle cx="43" cy="44" r="4.5" fill="#0F172A" />
          <path d="M43 50 L43 66 L37 78 M43 65 L49 78 M36 55 L52 54" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="53" r="3.5" fill="#0F172A" />
          <path d="M60 58 L60 78" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'no-overtaking':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK No Overtaking sign">
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" />
          <rect x="24" y="40" width="20" height="22" rx="4" fill="#DC2626" />
          <rect x="56" y="40" width="20" height="22" rx="4" fill="#0F172A" />
        </svg>
      );
    case 'box-junction':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="UK Yellow Box Junction diagram">
          <rect x="10" y="10" width="80" height="80" fill="#334155" rx="6" />
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#FACC15" strokeWidth="4" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="#FACC15" strokeWidth="4" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="#FACC15" strokeWidth="4" />
          <line x1="50" y1="20" x2="80" y2="50" stroke="#FACC15" strokeWidth="3" />
          <line x1="20" y1="50" x2="50" y2="80" stroke="#FACC15" strokeWidth="3" />
        </svg>
      );
  }
}
