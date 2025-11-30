'use client';

import { useEffect } from 'react';
import { configureAmplify } from '@/lib/amplify';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Configure AWS Amplify
    configureAmplify();

    // Check if user is already authenticated
    checkAuth();

    // Initialize theme from localStorage/system preference
    initTheme();
  }, [checkAuth, initTheme]);

  return <>{children}</>;
}
