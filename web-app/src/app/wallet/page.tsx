'use client';

import { useState } from 'react';

interface WalletItem {
  id: string;
  type: 'badge' | 'collectible' | 'achievement';
  name: string;
  description: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imageEmoji: string;
  metadata?: {
    flight?: string;
    location?: string;
    altitude?: number;
  };
}

// Mock data for demo
const mockWalletItems: WalletItem[] = [
  {
    id: '1',
    type: 'badge',
    name: 'First Flight',
    description: 'Tracked your first flight',
    earnedAt: '2024-01-10T12:00:00Z',
    rarity: 'common',
    imageEmoji: '🎫',
  },
  {
    id: '2',
    type: 'achievement',
    name: 'Sky Socialite',
    description: 'Made your first connection at 35,000 feet',
    earnedAt: '2024-01-12T08:30:00Z',
    rarity: 'uncommon',
    imageEmoji: '🤝',
  },
  {
    id: '3',
    type: 'collectible',
    name: 'Atlantic Crossing',
    description: 'Crossed the Atlantic Ocean',
    earnedAt: '2024-01-14T22:00:00Z',
    rarity: 'rare',
    imageEmoji: '🌊',
    metadata: { flight: 'DL789', location: 'Atlantic Ocean', altitude: 41000 },
  },
  {
    id: '4',
    type: 'badge',
    name: 'Night Owl',
    description: 'Tracked a red-eye flight',
    earnedAt: '2024-01-14T04:00:00Z',
    rarity: 'uncommon',
    imageEmoji: '🦉',
  },
  {
    id: '5',
    type: 'achievement',
    name: 'Globe Trotter',
    description: 'Visited 5 different countries',
    earnedAt: '2024-01-15T10:00:00Z',
    rarity: 'epic',
    imageEmoji: '🌍',
  },
  {
    id: '6',
    type: 'collectible',
    name: 'Polar Route',
    description: 'Flew over the Arctic Circle',
    earnedAt: '2024-01-08T16:00:00Z',
    rarity: 'legendary',
    imageEmoji: '❄️',
    metadata: { flight: 'SQ21', location: 'Arctic Circle', altitude: 38000 },
  },
];

const rarityConfig = {
  common: { label: 'Common', color: 'from-muted to-secondary', border: 'border-muted', glow: '' },
  uncommon: { label: 'Uncommon', color: 'from-success to-games', border: 'border-success', glow: 'shadow-success/20' },
  rare: { label: 'Rare', color: 'from-info to-map', border: 'border-info', glow: 'shadow-info/20' },
  epic: { label: 'Epic', color: 'from-wallet to-messages', border: 'border-wallet', glow: 'shadow-wallet/30' },
  legendary: { label: 'Legendary', color: 'from-warning to-crossing', border: 'border-warning', glow: 'shadow-warning/40 shadow-lg' },
};

export default function WalletPage() {
  const [filter, setFilter] = useState<'all' | 'badge' | 'collectible' | 'achievement'>('all');
  const [selectedItem, setSelectedItem] = useState<WalletItem | null>(null);

  const filteredItems = mockWalletItems.filter(
    (item) => filter === 'all' || item.type === filter
  );

  const stats = {
    total: mockWalletItems.length,
    badges: mockWalletItems.filter((i) => i.type === 'badge').length,
    collectibles: mockWalletItems.filter((i) => i.type === 'collectible').length,
    achievements: mockWalletItems.filter((i) => i.type === 'achievement').length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Wallet</h1>
          <p className="text-secondary mt-1">Your collection of badges, achievements, and collectibles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Items" value={stats.total} icon="🎒" color="wallet" />
          <StatCard label="Badges" value={stats.badges} icon="🎫" color="map" />
          <StatCard label="Collectibles" value={stats.collectibles} icon="💎" color="crossing" />
          <StatCard label="Achievements" value={stats.achievements} icon="🏆" color="games" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'badge', 'collectible', 'achievement'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition capitalize ${
                filter === f
                  ? 'bg-wallet text-white'
                  : 'bg-surface-alt text-secondary hover:text-foreground border border-border'
              }`}
            >
              {f === 'all' ? 'All Items' : `${f}s`}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <WalletItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 card">
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-xl font-medium mb-2 text-foreground">No items yet</h3>
            <p className="text-secondary">
              Track flights and make connections to earn badges and collectibles
            </p>
          </div>
        )}

        {/* Item detail modal */}
        {selectedItem && (
          <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`card p-4 border-${color}/30`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-secondary">{label}</div>
        </div>
      </div>
    </div>
  );
}

function WalletItemCard({ item, onClick }: { item: WalletItem; onClick: () => void }) {
  const rarity = rarityConfig[item.rarity];

  return (
    <button
      onClick={onClick}
      className={`card ${rarity.border}/30 p-4 hover:border-opacity-100 transition text-left w-full ${rarity.glow}`}
    >
      {/* Item icon */}
      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${rarity.color} flex items-center justify-center text-3xl mb-3`}>
        {item.imageEmoji}
      </div>

      {/* Item info */}
      <div className="text-center">
        <div className="font-bold text-sm mb-1 truncate text-foreground">{item.name}</div>
        <div className={`text-xs px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${rarity.color} text-white`}>
          {rarity.label}
        </div>
      </div>
    </button>
  );
}

function ItemDetailModal({ item, onClose }: { item: WalletItem; onClose: () => void }) {
  const rarity = rarityConfig[item.rarity];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-surface rounded-3xl border ${rarity.border}/50 max-w-md w-full overflow-hidden ${rarity.glow}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-br ${rarity.color} p-8 text-center relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-6xl mb-4">{item.imageEmoji}</div>
            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            <div className="mt-2 inline-block px-3 py-1 bg-black/20 rounded-full text-sm text-white">
              {rarity.label} {item.type}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-secondary">{item.description}</p>

            {/* Metadata */}
            {item.metadata && (
              <div className="bg-surface-alt rounded-xl p-4 space-y-2">
                {item.metadata.flight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Flight</span>
                    <span className="text-foreground">{item.metadata.flight}</span>
                  </div>
                )}
                {item.metadata.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Location</span>
                    <span className="text-foreground">{item.metadata.location}</span>
                  </div>
                )}
                {item.metadata.altitude && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Altitude</span>
                    <span className="text-foreground">{item.metadata.altitude.toLocaleString()} ft</span>
                  </div>
                )}
              </div>
            )}

            {/* Earned date */}
            <div className="text-center text-sm text-muted">
              Earned on {new Date(item.earnedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Share button */}
            <button className="w-full btn btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
