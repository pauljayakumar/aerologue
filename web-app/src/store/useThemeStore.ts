'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme: Theme) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerologue-theme', theme);
    }

    // Resolve the actual theme
    let resolved: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    // Apply to document
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    set({ theme, resolvedTheme: resolved });
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;

    // Get saved theme or default to system
    const saved = localStorage.getItem('aerologue-theme') as Theme | null;
    const theme = saved || 'system';

    // Resolve the actual theme
    let resolved: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    // Apply to document
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    set({ theme, resolvedTheme: resolved });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = get().theme;
      if (currentTheme === 'system') {
        const newResolved = mediaQuery.matches ? 'dark' : 'light';
        if (newResolved === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        set({ resolvedTheme: newResolved });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  },
}));
