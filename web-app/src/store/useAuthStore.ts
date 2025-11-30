// Authentication Store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signIn, signOut, signUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { User, AuthState } from '@/types';
import awsConfig from '@/lib/aws-config';

// Always use AWS API Gateway (static export doesn't have local API routes)
const USERS_API_URL = `${awsConfig.api.baseUrl}/users`;

// Fetch user profile from DynamoDB
async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${USERS_API_URL}/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch profile');
    }
    const profile = await response.json();
    return {
      id: profile.user_id,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      settings: profile.settings,
      stats: profile.stats,
      createdAt: profile.created_at,
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signIn({ username: email, password });
          if (result.isSignedIn) {
            const cognitoUser = await getCurrentUser();

            // Fetch user profile from DynamoDB
            const profile = await fetchUserProfile(cognitoUser.userId);

            const user: User = profile || {
              id: cognitoUser.userId,
              email: cognitoUser.signInDetails?.loginId || email,
              displayName: cognitoUser.signInDetails?.loginId?.split('@')[0],
              settings: {
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                distanceUnit: 'km',
                notifications: { crossings: true, greetings: true, achievements: true, flightUpdates: true },
                privacy: { showOnCrossing: true, locationSharing: true, profileVisibility: 'friends' },
                factoids: { deliveryLevel: 'normal', categories: [] },
              },
              createdAt: new Date().toISOString(),
            };

            set({
              isAuthenticated: true,
              user,
              isLoading: false,
            });
            return true;
          }
          return false;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut();
          set({ isAuthenticated: false, user: null, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Logout failed';
          set({ error: message, isLoading: false });
        }
      },

      // Register
      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          await signUp({
            username: email,
            password,
            options: {
              userAttributes: {
                email,
                name: name || email.split('@')[0],
              },
            },
          });
          set({ isLoading: false });
          // User needs to confirm email before logging in
          return true;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      // Check if user is authenticated
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const session = await fetchAuthSession();
          if (session.tokens) {
            const cognitoUser = await getCurrentUser();

            // Fetch user profile from DynamoDB
            const profile = await fetchUserProfile(cognitoUser.userId);

            const user: User = profile || {
              id: cognitoUser.userId,
              email: cognitoUser.signInDetails?.loginId || '',
              displayName: cognitoUser.signInDetails?.loginId?.split('@')[0],
              settings: {
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                distanceUnit: 'km',
                notifications: { crossings: true, greetings: true, achievements: true, flightUpdates: true },
                privacy: { showOnCrossing: true, locationSharing: true, profileVisibility: 'friends' },
                factoids: { deliveryLevel: 'normal', categories: [] },
              },
              createdAt: new Date().toISOString(),
            };

            set({
              isAuthenticated: true,
              user,
              isLoading: false,
            });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        } catch {
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return false;

        try {
          const response = await fetch(`${USERS_API_URL}/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              display_name: updates.displayName,
              avatar_url: updates.avatarUrl,
              settings: updates.settings,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          const updatedProfile = await response.json();
          set({
            user: {
              ...user,
              displayName: updatedProfile.display_name,
              avatarUrl: updatedProfile.avatar_url,
              settings: updatedProfile.settings,
            },
          });
          return true;
        } catch (error) {
          console.error('Failed to update profile:', error);
          return false;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'aerologue-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
