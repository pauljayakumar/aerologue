'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Amplify } from 'aws-amplify';
import awsExports from '@/lib/aws-config';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import SideNav from '@/components/layout/SideNav';
import { useState } from 'react';

Amplify.configure({ ...awsExports, ssr: true });

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header toggleNav={toggleNav} />
          <SideNav isOpen={isNavOpen} toggleNav={toggleNav} />
          <div className={`flex flex-col min-h-screen ${isNavOpen ? 'md:ml-64' : ''}`}> {/* Adjust main content based on nav state */}
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}