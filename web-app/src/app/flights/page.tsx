'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FlightEntry {
  id: string;
  callsign: string;
  airline: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'in_air' | 'landed' | 'arrived';
  aircraft: string;
}

// Mock data for demo
const mockFlights: FlightEntry[] = [
  {
    id: '1',
    callsign: 'UA123',
    airline: 'United Airlines',
    origin: 'SFO',
    originCity: 'San Francisco',
    destination: 'JFK',
    destinationCity: 'New York',
    departureTime: '2024-01-15T08:30:00',
    arrivalTime: '2024-01-15T17:15:00',
    status: 'in_air',
    aircraft: 'Boeing 787-9',
  },
  {
    id: '2',
    callsign: 'AA456',
    airline: 'American Airlines',
    origin: 'LAX',
    originCity: 'Los Angeles',
    destination: 'ORD',
    destinationCity: 'Chicago',
    departureTime: '2024-01-15T10:00:00',
    arrivalTime: '2024-01-15T16:30:00',
    status: 'scheduled',
    aircraft: 'Airbus A321neo',
  },
  {
    id: '3',
    callsign: 'DL789',
    airline: 'Delta Air Lines',
    origin: 'ATL',
    originCity: 'Atlanta',
    destination: 'LHR',
    destinationCity: 'London',
    departureTime: '2024-01-14T22:00:00',
    arrivalTime: '2024-01-15T11:30:00',
    status: 'landed',
    aircraft: 'Boeing 777-200LR',
  },
];

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-muted', textColor: 'text-muted' },
  boarding: { label: 'Boarding', color: 'bg-warning', textColor: 'text-warning' },
  departed: { label: 'Departed', color: 'bg-info', textColor: 'text-info' },
  in_air: { label: 'In Flight', color: 'bg-success', textColor: 'text-success' },
  landed: { label: 'Landed', color: 'bg-wallet', textColor: 'text-wallet' },
  arrived: { label: 'Arrived', color: 'bg-secondary', textColor: 'text-secondary' },
};

export default function FlightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredFlights = mockFlights.filter((flight) => {
    const matchesSearch =
      flight.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || flight.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flights</h1>
            <p className="text-secondary mt-1">Track and manage your flights</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-map">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Flight</span>
          </button>
        </div>

        {/* Filters and search */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flights, airports, airlines..."
                className="w-full bg-surface-alt border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-map focus:ring-2 focus:ring-map/20 transition"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-map focus:ring-2 focus:ring-map/20 transition"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_air">In Flight</option>
              <option value="landed">Landed</option>
              <option value="arrived">Arrived</option>
            </select>

            {/* View toggle */}
            <div className="flex bg-surface-alt rounded-xl border border-border p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-map text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-map text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Flights list/grid */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <FlightListCard key={flight.id} flight={flight} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlights.map((flight) => (
              <FlightGridCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredFlights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-medium mb-2 text-foreground">No flights found</h3>
            <p className="text-secondary mb-6">
              {searchQuery ? 'Try adjusting your search criteria' : 'Add your first flight to get started'}
            </p>
            <button className="btn btn-map">
              Add Flight
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FlightListCard({ flight }: { flight: FlightEntry }) {
  const status = statusConfig[flight.status];

  return (
    <Link href={`/flights/${flight.id}`}>
      <div className="card p-6 hover:border-map/50 cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Flight info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl font-bold text-foreground">{flight.callsign}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}/20 ${status.textColor}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-secondary">{flight.airline} • {flight.aircraft}</p>
          </div>

          {/* Route */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{flight.origin}</div>
              <div className="text-xs text-muted">{flight.originCity}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-px bg-border"></div>
              <span className="text-lg">✈️</span>
              <div className="w-8 h-px bg-border"></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{flight.destination}</div>
              <div className="text-xs text-muted">{flight.destinationCity}</div>
            </div>
          </div>

          {/* Times */}
          <div className="flex md:flex-col items-center md:items-end space-x-4 md:space-x-0 text-sm">
            <div>
              <span className="text-muted">Departs: </span>
              <span className="text-foreground">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-muted">Arrives: </span>
              <span className="text-foreground">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FlightGridCard({ flight }: { flight: FlightEntry }) {
  const status = statusConfig[flight.status];

  return (
    <Link href={`/flights/${flight.id}`}>
      <div className="card p-6 hover:border-map/50 cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-foreground">{flight.callsign}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}/20 ${status.textColor}`}>
            {status.label}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{flight.origin}</div>
            <div className="text-xs text-muted">{flight.originCity}</div>
          </div>
          <div className="flex-1 px-3">
            <div className="relative h-0.5 bg-border">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-lg">✈️</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{flight.destination}</div>
            <div className="text-xs text-muted">{flight.destinationCity}</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-secondary">
          <div>{flight.airline}</div>
          <div>{flight.aircraft}</div>
          <div className="flex justify-between pt-2 border-t border-border text-foreground">
            <span>{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
