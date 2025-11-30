/**
 * Aircraft Type to Icon Mapping
 *
 * Maps ICAO aircraft type codes to our available aircraft icons.
 * We have icons for: 737, 747, 777, 787, A320, A340, A350, A380, ATR72
 *
 * The mapping groups similar aircraft types together:
 * - Narrow-body jets -> A320 or 737
 * - Wide-body jets -> 777, 787, A350, etc.
 * - Regional turboprops -> ATR72
 * - Jumbo jets -> 747, A380
 */

// Available icon names (matches files in /public/aircraft/optimized/)
type AircraftIconName = '737' | '747' | '777' | '787' | 'A320' | 'A340' | 'A350' | 'A380' | 'ATR72';

// Default icon for unknown aircraft
const DEFAULT_ICON: AircraftIconName = 'A320';

// Mapping of ICAO type codes to our icons
const AIRCRAFT_TYPE_MAP: Record<string, AircraftIconName> = {
  // Boeing 737 family
  'B731': '737',
  'B732': '737',
  'B733': '737',
  'B734': '737',
  'B735': '737',
  'B736': '737',
  'B737': '737',
  'B738': '737',
  'B739': '737',
  'B37M': '737',  // 737 MAX 7
  'B38M': '737',  // 737 MAX 8
  'B39M': '737',  // 737 MAX 9
  'B3XM': '737',  // 737 MAX 10

  // Boeing 747 family
  'B741': '747',
  'B742': '747',
  'B743': '747',
  'B744': '747',
  'B748': '747',
  'B74D': '747',
  'B74R': '747',
  'B74S': '747',

  // Boeing 757 (use 737 silhouette - narrow body)
  'B752': '737',
  'B753': '737',

  // Boeing 767 (use 777 silhouette - wide body)
  'B762': '777',
  'B763': '777',
  'B764': '777',

  // Boeing 777 family
  'B772': '777',
  'B773': '777',
  'B778': '777',
  'B779': '777',
  'B77L': '777',
  'B77W': '777',

  // Boeing 787 Dreamliner family
  'B788': '787',
  'B789': '787',
  'B78X': '787',

  // Airbus A220 (use A320 - narrow body)
  'BCS1': 'A320',  // A220-100
  'BCS3': 'A320',  // A220-300

  // Airbus A300/A310 (use A340 - older wide body)
  'A306': 'A340',
  'A30B': 'A340',
  'A310': 'A340',

  // Airbus A318/A319/A320/A321 family
  'A318': 'A320',
  'A319': 'A320',
  'A320': 'A320',
  'A321': 'A320',
  'A19N': 'A320',  // A319neo
  'A20N': 'A320',  // A320neo
  'A21N': 'A320',  // A321neo

  // Airbus A330 family (use A350 silhouette)
  'A332': 'A350',
  'A333': 'A350',
  'A338': 'A350',
  'A339': 'A350',

  // Airbus A340 family
  'A342': 'A340',
  'A343': 'A340',
  'A345': 'A340',
  'A346': 'A340',

  // Airbus A350 family
  'A359': 'A350',
  'A35K': 'A350',

  // Airbus A380
  'A388': 'A380',
  'A38F': 'A380',

  // ATR turboprops
  'AT43': 'ATR72',
  'AT45': 'ATR72',
  'AT46': 'ATR72',
  'AT72': 'ATR72',
  'AT73': 'ATR72',
  'AT75': 'ATR72',
  'AT76': 'ATR72',
  'ATR': 'ATR72',

  // De Havilland Dash 8 / Bombardier Q series (use ATR72)
  'DH8A': 'ATR72',
  'DH8B': 'ATR72',
  'DH8C': 'ATR72',
  'DH8D': 'ATR72',

  // Embraer E-Jets (use A320 - narrow body)
  'E170': 'A320',
  'E175': 'A320',
  'E190': 'A320',
  'E195': 'A320',
  'E290': 'A320',
  'E295': 'A320',

  // Embraer ERJ (use A320 - regional jet)
  'E135': 'A320',
  'E145': 'A320',
  'E35L': 'A320',
  'E45X': 'A320',

  // Bombardier CRJ (use A320)
  'CRJ1': 'A320',
  'CRJ2': 'A320',
  'CRJ7': 'A320',
  'CRJ9': 'A320',
  'CRJX': 'A320',

  // Saab turboprops (use ATR72)
  'SF34': 'ATR72',
  'SB20': 'ATR72',

  // Fokker (use A320 for jets, ATR72 for props)
  'F100': 'A320',
  'F70': 'A320',
  'F50': 'ATR72',
  'F27': 'ATR72',

  // MD-80/90 series (use 737)
  'MD80': '737',
  'MD81': '737',
  'MD82': '737',
  'MD83': '737',
  'MD87': '737',
  'MD88': '737',
  'MD90': '737',

  // MD-11 / DC-10 (use A340 - tri-jet)
  'MD11': 'A340',
  'DC10': 'A340',

  // Lockheed L-1011 TriStar (use A340)
  'L101': 'A340',

  // Antonov (cargo) - use 747 for large, 777 for medium
  'AN12': '747',
  'A124': '747',
  'A225': '747',
  'A148': '777',

  // Ilyushin
  'IL76': '747',
  'IL96': '777',
};

/**
 * Get the icon name for a given aircraft type code
 * @param aircraftType - ICAO aircraft type code (e.g., "B738", "A320", "A21N")
 * @returns Icon name to use (e.g., "737", "A320")
 */
export function getAircraftIconName(aircraftType: string | null | undefined): AircraftIconName {
  if (!aircraftType) {
    return DEFAULT_ICON;
  }

  // Normalize: uppercase and trim
  const normalizedType = aircraftType.toUpperCase().trim();

  // Direct lookup
  if (AIRCRAFT_TYPE_MAP[normalizedType]) {
    return AIRCRAFT_TYPE_MAP[normalizedType];
  }

  // Try partial matching for variations
  // E.g., "B738/W" should match "B738"
  const baseType = normalizedType.split('/')[0].substring(0, 4);
  if (AIRCRAFT_TYPE_MAP[baseType]) {
    return AIRCRAFT_TYPE_MAP[baseType];
  }

  // Fallback based on first character/manufacturer
  if (normalizedType.startsWith('B7')) return '777';  // Boeing wide-body
  if (normalizedType.startsWith('B3')) return '737';  // Boeing narrow-body
  if (normalizedType.startsWith('A3')) return 'A320'; // Airbus narrow-body
  if (normalizedType.startsWith('A38')) return 'A380'; // A380
  if (normalizedType.startsWith('AT')) return 'ATR72'; // ATR turboprop
  if (normalizedType.startsWith('E1') || normalizedType.startsWith('E2')) return 'A320'; // Embraer
  if (normalizedType.startsWith('CRJ')) return 'A320'; // CRJ

  return DEFAULT_ICON;
}

/**
 * Get the full path to an aircraft icon
 * @param aircraftType - ICAO aircraft type code
 * @param size - Icon size: 'sm' (32px), 'md' (48px), 'lg' (64px), or default (48px)
 * @returns Full path to the icon file
 */
export function getAircraftIconPath(
  aircraftType: string | null | undefined,
  size: 'sm' | 'md' | 'lg' | 'default' = 'default'
): string {
  const iconName = getAircraftIconName(aircraftType);
  const suffix = size === 'default' ? '' : `-${size}`;
  return `/aircraft/optimized/${iconName}${suffix}.png`;
}

/**
 * Get icon size in pixels based on size name
 * Sizes optimized for map markers (smaller for less clutter)
 */
export function getAircraftIconSize(size: 'sm' | 'md' | 'lg' | 'default' = 'default'): number {
  switch (size) {
    case 'sm': return 12;   // Tiny for very zoomed out
    case 'md': return 16;   // Default map marker size
    case 'lg': return 24;   // Zoomed in / selected
    case 'default':
    default: return 16;     // ~30% of original 48px
  }
}

// Export the list of available icons for reference
export const AVAILABLE_ICONS: AircraftIconName[] = [
  '737', '747', '777', '787', 'A320', 'A340', 'A350', 'A380', 'ATR72'
];
