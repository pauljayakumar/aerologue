'use client';

import Image from 'next/image';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Icon component using Icons8 assets
 *
 * Usage:
 * <Icon name="airplane" />
 * <Icon name="map" size={32} />
 * <Icon name="badge" className="text-blue-500" />
 *
 * Icons should be placed in /public/icons/web/ as SVG files
 * Downloaded from Icons8 (Fluency style for web)
 */
export default function Icon({ name, size = 24, className = '', alt }: IconProps) {
  return (
    <Image
      src={`/icons/web/${name}.svg`}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * Icon with fallback to emoji if SVG not found
 * Useful during development before all icons are downloaded
 */
export function IconWithFallback({
  name,
  size = 24,
  className = '',
  fallbackEmoji
}: IconProps & { fallbackEmoji: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.8 }}
    >
      {fallbackEmoji}
    </span>
  );
}

/**
 * Predefined icon mappings with emoji fallbacks
 * Use these during development, replace with actual Icons8 assets later
 */
export const iconMap = {
  // Navigation
  home: { emoji: '🏠', file: 'home' },
  map: { emoji: '🗺️', file: 'map' },
  airplane: { emoji: '✈️', file: 'airplane' },
  search: { emoji: '🔍', file: 'search' },
  menu: { emoji: '☰', file: 'menu' },

  // Flight
  takeoff: { emoji: '🛫', file: 'takeoff' },
  landing: { emoji: '🛬', file: 'landing' },
  altitude: { emoji: '📈', file: 'altitude' },
  speed: { emoji: '💨', file: 'speed' },
  compass: { emoji: '🧭', file: 'compass' },

  // Social
  crossing: { emoji: '✨', file: 'crossing' },
  message: { emoji: '💬', file: 'message' },
  wave: { emoji: '👋', file: 'wave' },
  notification: { emoji: '🔔', file: 'notification' },
  user: { emoji: '👤', file: 'user' },

  // Wallet & Gamification
  wallet: { emoji: '👛', file: 'wallet' },
  badge: { emoji: '🎖️', file: 'badge' },
  trophy: { emoji: '🏆', file: 'trophy' },
  star: { emoji: '⭐', file: 'star' },
  gem: { emoji: '💎', file: 'gem' },
  gift: { emoji: '🎁', file: 'gift' },

  // Actions
  add: { emoji: '➕', file: 'add' },
  close: { emoji: '✕', file: 'close' },
  settings: { emoji: '⚙️', file: 'settings' },
  share: { emoji: '📤', file: 'share' },
  filter: { emoji: '🔽', file: 'filter' },

  // Status
  success: { emoji: '✅', file: 'success' },
  error: { emoji: '❌', file: 'error' },
  warning: { emoji: '⚠️', file: 'warning' },
  info: { emoji: 'ℹ️', file: 'info' },
} as const;

export type IconName = keyof typeof iconMap;
