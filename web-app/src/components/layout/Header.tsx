'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/aerologue.png"
              alt="Aerologue"
              width={260}
              height={78}
              className="h-[4.5rem] w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/map"
              className="text-foreground-secondary hover:text-map transition"
            >
              Live Map
            </Link>
            <Link
              href="/flights"
              className="text-foreground-secondary hover:text-map transition"
            >
              Flights
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/crossings"
                  className="text-foreground-secondary hover:text-crossing transition"
                >
                  Crossings
                </Link>
                <Link
                  href="/wallet"
                  className="text-foreground-secondary hover:text-wallet transition"
                >
                  Wallet
                </Link>
              </>
            )}
          </nav>

          {/* Right side: Theme toggle + Auth */}
          <div className="flex items-center space-x-4">
            <ThemeToggleCompact />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-secondary">
                  {user?.displayName || user?.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm text-secondary hover:text-foreground transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-map text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
