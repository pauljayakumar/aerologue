import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aerologue | Your Ultimate Air Travel Companion',
  description: 'The all-in-one air travel companion that transforms your journey. Smart trip planning, live flight updates, travel wallet, and rewards. Join the future of air travel.',
  keywords: 'air travel, travel companion, flight updates, trip planning, travel wallet, travel rewards, aviation, Web3',
  openGraph: {
    title: 'Aerologue | Your Ultimate Air Travel Companion',
    description: 'The all-in-one air travel companion that transforms your journey. Smart trip planning, live flight updates, and rewards.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
