// User-related type definitions

export interface UserStats {
  totalFlights: number;
  totalCrossings: number;
  totalMessages: number;
  totalPoints: number;
  level: number;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  settings: UserSettings;
  stats?: UserStats;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSettings {
  language: string;
  timezone: string;
  distanceUnit: 'km' | 'miles';
  notifications: {
    crossings: boolean;
    greetings: boolean;
    achievements: boolean;
    flightUpdates: boolean;
  };
  privacy: {
    showOnCrossing: boolean;
    locationSharing: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  factoids: {
    deliveryLevel: 'minimal' | 'normal' | 'detailed' | 'off';
    categories: string[];
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export const defaultUserSettings: UserSettings = {
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  distanceUnit: 'km',
  notifications: {
    crossings: true,
    greetings: true,
    achievements: true,
    flightUpdates: true,
  },
  privacy: {
    showOnCrossing: true,
    locationSharing: true,
    profileVisibility: 'friends',
  },
  factoids: {
    deliveryLevel: 'normal',
    categories: ['cities', 'landmarks', 'water', 'ocean', 'history', 'aviation'],
  },
};
