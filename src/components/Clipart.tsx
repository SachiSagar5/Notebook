import type { ClipartKind } from '../types';

export const CLIPART_KINDS: ClipartKind[] = [
  'arrow',
  'arrow-curve',
  'cloud',
  'star',
  'heart',
  'circle',
  'check',
  'lightbulb',
  'flag',
  'bookmark',
];

export function Clipart({ kind, color }: { kind: ClipartKind; color: string }) {
  const common = {
    width: '100%',
    height: '100%',
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'none' as const,
  };
  switch (kind) {
    case 'arrow':
      return (
        <svg {...common} style={{ overflow: 'visible' }}>
          <g stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="50" x2="80" y2="50" />
            <polyline points="60,26 90,50 60,74" fill={color} stroke={color} />
          </g>
        </svg>
      );
    case 'arrow-curve':
      return (
        <svg {...common}>
          <g stroke={color} strokeWidth={7} fill="none" strokeLinecap="round">
            <path d="M10 80 Q 20 20 70 30" />
            <polyline points="52,16 75,28 60,48" fill="none" />
          </g>
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <path
            d="M28 70 a18 18 0 0 1 2 -35 a22 22 0 0 1 42 4 a16 16 0 0 1 -4 31 z"
            fill={color}
            opacity={0.92}
          />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <polygon
            points="50,8 61,38 94,38 67,58 77,90 50,70 23,90 33,58 6,38 39,38"
            fill={color}
          />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common}>
          <path
            d="M50 84 C 10 56 10 22 32 22 C 44 22 50 32 50 36 C 50 32 56 22 68 22 C 90 22 90 56 50 84 Z"
            fill={color}
          />
        </svg>
      );
    case 'circle':
      return (
        <svg {...common}>
          <ellipse cx="50" cy="50" rx="44" ry="40" fill="none" stroke={color} strokeWidth={7} />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline
            points="14,52 40,78 88,20"
            fill="none"
            stroke={color}
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg {...common}>
          <path
            d="M50 12 a26 26 0 0 1 16 46 c-3 3 -4 6 -4 10 h-24 c0 -4 -1 -7 -4 -10 a26 26 0 0 1 16 -46 z"
            fill={color}
            opacity={0.9}
          />
          <rect x="40" y="74" width="20" height="8" rx="3" fill={color} />
          <rect x="43" y="84" width="14" height="6" rx="3" fill={color} />
        </svg>
      );
    case 'flag':
      return (
        <svg {...common}>
          <line x1="22" y1="10" x2="22" y2="92" stroke={color} strokeWidth={7} strokeLinecap="round" />
          <path d="M22 14 H78 L66 30 L78 46 H22 Z" fill={color} />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M26 10 H74 V90 L50 70 L26 90 Z" fill={color} />
        </svg>
      );
    default:
      return null;
  }
}
