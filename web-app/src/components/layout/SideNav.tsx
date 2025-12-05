'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon'; // Import the new Icon component

interface SideNavProps {
  isOpen: boolean;
  toggleNav: () => void;
}

export default function SideNav({ isOpen, toggleNav }: SideNavProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleNav}
        ></div>
      )}

      {/* Side Navigation */}
      <nav
        className={`fixed inset-y-0 left-0 w-64 bg-surface-light dark:bg-surface-dark p-5 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-6">
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
          <button onClick={toggleNav} className="text-foreground-secondary hover:text-foreground">
            <Icon name="x-mark" className="w-6 h-6" />
          </button>
        </div>

        <ul className="space-y-2">
          <li>
            <Link
              href="/map"
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary hover:bg-primary-hover hover:text-primary transition-colors duration-200"
              onClick={toggleNav}
            >
              <Icon name="map" className="w-5 h-5" />
              <span>Live Map</span>
            </Link>
          </li>
          <li>
            <span
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon name="paper-airplane" className="w-5 h-5" />
              <span>Flights</span>
            </span>
          </li>
          <li>
            <span
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon name="arrows-right-left" className="w-5 h-5" />
              <span>Crossings</span>
            </span>
          </li>
          <li>
            <span
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon name="wallet" className="w-5 h-5" />
              <span>Wallet</span>
            </span>
          </li>
          <li>
            <span
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon name="arrow-left-on-rectangle" className="w-5 h-5" />
              <span>Login</span>
            </span>
          </li>
          <li>
            <span
              className="flex items-center space-x-3 p-2 rounded-lg text-foreground-secondary/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon name="user-plus" className="w-5 h-5" />
              <span>Sign Up</span>
            </span>
          </li>
        </ul>
      </nav>
    </>
  );
}
