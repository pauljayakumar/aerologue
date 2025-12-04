'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/aerologue_name.png"
              alt="Aerologue"
              width={180}
              height={40}
              className="h-8 w-auto"
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
            <span
              className="text-foreground-secondary/50 cursor-not-allowed flex items-center gap-1"
              title="Coming soon"
            >
              Flights
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span
              className="text-foreground-secondary/50 cursor-not-allowed flex items-center gap-1"
              title="Coming soon"
            >
              Crossings
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span
              className="text-foreground-secondary/50 cursor-not-allowed flex items-center gap-1"
              title="Coming soon"
            >
              Wallet
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
          </nav>

          {/* Right side: Theme toggle + Auth (temporarily disabled) */}
          <div className="flex items-center space-x-4">
            <ThemeToggleCompact />

            {/* Auth buttons temporarily disabled */}
            <div className="flex items-center space-x-2">
              <span
                className="text-sm text-foreground-secondary/50 cursor-not-allowed flex items-center gap-1"
                title="Coming soon"
              >
                Login
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span
                className="text-sm text-foreground-secondary/50 cursor-not-allowed flex items-center gap-1 px-4 py-2 rounded-lg border border-border/50"
                title="Coming soon"
              >
                Sign Up
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
