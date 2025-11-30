'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Crossing {
  id: string;
  timestamp: string;
  myFlight: {
    callsign: string;
    origin: string;
    destination: string;
  };
  otherFlight: {
    callsign: string;
    origin: string;
    destination: string;
  };
  location: {
    lat: number;
    lon: number;
    altitude: number;
    nearestCity: string;
    country: string;
  };
  distance: number;
  messageCount: number;
  hasUnread: boolean;
}

// Mock data for demo
const mockCrossings: Crossing[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:32:00Z',
    myFlight: { callsign: 'UA123', origin: 'SFO', destination: 'JFK' },
    otherFlight: { callsign: 'BA456', origin: 'LHR', destination: 'LAX' },
    location: {
      lat: 42.3601,
      lon: -71.0589,
      altitude: 38000,
      nearestCity: 'Boston',
      country: 'United States',
    },
    distance: 2.4,
    messageCount: 5,
    hasUnread: true,
  },
  {
    id: '2',
    timestamp: '2024-01-14T09:15:00Z',
    myFlight: { callsign: 'DL789', origin: 'ATL', destination: 'CDG' },
    otherFlight: { callsign: 'AF012', origin: 'CDG', destination: 'MIA' },
    location: {
      lat: 51.5074,
      lon: -0.1278,
      altitude: 41000,
      nearestCity: 'London',
      country: 'United Kingdom',
    },
    distance: 5.8,
    messageCount: 12,
    hasUnread: false,
  },
  {
    id: '3',
    timestamp: '2024-01-12T22:45:00Z',
    myFlight: { callsign: 'AA456', origin: 'LAX', destination: 'NRT' },
    otherFlight: { callsign: 'JL789', origin: 'NRT', destination: 'SFO' },
    location: {
      lat: 35.6762,
      lon: 139.6503,
      altitude: 36000,
      nearestCity: 'Tokyo',
      country: 'Japan',
    },
    distance: 8.2,
    messageCount: 3,
    hasUnread: false,
  },
];

export default function CrossingsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredCrossings = mockCrossings.filter(
    (crossing) => filter === 'all' || crossing.hasUnread
  );

  const totalUnread = mockCrossings.filter((c) => c.hasUnread).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <span>Flight Crossings</span>
              {totalUnread > 0 && (
                <span className="bg-crossing text-white text-sm px-2.5 py-1 rounded-full">
                  {totalUnread} new
                </span>
              )}
            </h1>
            <p className="text-secondary mt-1">Connect with fellow travelers you&apos;ve crossed paths with</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-crossing/20 to-crossing/5 rounded-2xl border border-crossing/30 p-4">
            <div className="text-3xl font-bold text-crossing">{mockCrossings.length}</div>
            <div className="text-sm text-secondary">Total Crossings</div>
          </div>
          <div className="bg-gradient-to-br from-messages/20 to-messages/5 rounded-2xl border border-messages/30 p-4">
            <div className="text-3xl font-bold text-messages">
              {mockCrossings.reduce((sum, c) => sum + c.messageCount, 0)}
            </div>
            <div className="text-sm text-secondary">Messages Exchanged</div>
          </div>
          <div className="bg-gradient-to-br from-games/20 to-games/5 rounded-2xl border border-games/30 p-4">
            <div className="text-3xl font-bold text-games">
              {new Set(mockCrossings.map((c) => c.location.country)).size}
            </div>
            <div className="text-sm text-secondary">Countries</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              filter === 'all'
                ? 'bg-crossing text-white'
                : 'bg-surface-alt text-secondary hover:text-foreground border border-border'
            }`}
          >
            All Crossings
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl font-medium transition flex items-center space-x-2 ${
              filter === 'unread'
                ? 'bg-crossing text-white'
                : 'bg-surface-alt text-secondary hover:text-foreground border border-border'
            }`}
          >
            <span>Unread</span>
            {totalUnread > 0 && (
              <span className="bg-crossing/30 text-crossing text-xs px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* Crossings list */}
        <div className="space-y-4">
          {filteredCrossings.map((crossing) => (
            <CrossingCard key={crossing.id} crossing={crossing} />
          ))}
        </div>

        {/* Empty state */}
        {filteredCrossings.length === 0 && (
          <div className="text-center py-12 card">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              {filter === 'unread' ? 'All caught up!' : 'No crossings yet'}
            </h3>
            <p className="text-secondary mb-6">
              {filter === 'unread'
                ? "You've read all your crossing messages"
                : 'Track a flight to discover when you cross paths with others'}
            </p>
            <Link
              href="/map"
              className="btn btn-crossing"
            >
              Open Live Map
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CrossingCard({ crossing }: { crossing: Crossing }) {
  const timeAgo = getTimeAgo(crossing.timestamp);

  return (
    <Link href={`/crossings/${crossing.id}`}>
      <div
        className={`card p-6 cursor-pointer ${
          crossing.hasUnread
            ? 'border-crossing/50 hover:border-crossing'
            : 'hover:border-border-hover'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-crossing to-messages rounded-xl flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <div className="font-bold text-foreground flex items-center space-x-2">
                <span>{crossing.otherFlight.callsign}</span>
                {crossing.hasUnread && (
                  <span className="w-2 h-2 bg-crossing rounded-full"></span>
                )}
              </div>
              <div className="text-sm text-secondary">
                {crossing.otherFlight.origin} → {crossing.otherFlight.destination}
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-secondary">{timeAgo}</div>
            <div className="text-muted">{crossing.distance.toFixed(1)} km apart</div>
          </div>
        </div>

        {/* Flight routes visualization */}
        <div className="bg-surface-alt rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted mb-1">Your flight</div>
              <div className="flex items-center space-x-2 text-foreground">
                <span className="font-medium">{crossing.myFlight.origin}</span>
                <span className="text-border">→</span>
                <span className="font-medium">{crossing.myFlight.destination}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Crossed with</div>
              <div className="flex items-center space-x-2 text-foreground">
                <span className="font-medium">{crossing.otherFlight.origin}</span>
                <span className="text-border">→</span>
                <span className="font-medium">{crossing.otherFlight.destination}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and messages */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-secondary">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{crossing.location.nearestCity}, {crossing.location.country}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>{crossing.location.altitude.toLocaleString()} ft</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-messages" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-secondary">{crossing.messageCount} messages</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
