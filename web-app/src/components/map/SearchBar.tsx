'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { searchAirports } from '@/lib/airports';
import { useFlightStore } from '@/store/useFlightStore';
import type { Airport, AirportSearchResult } from '@/types/airport';
import type { FlightPosition } from '@/types';

interface SearchResult {
  type: 'flight' | 'airport';
  id: string;
  title: string;
  subtitle: string;
  data: FlightPosition | Airport;
}

interface SearchBarProps {
  onSelectAirport?: (airport: Airport) => void;
  onSelectFlight?: (flight: FlightPosition) => void;
}

export default function SearchBar({ onSelectAirport, onSelectFlight }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { flights } = useFlightStore();

  // Search function with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];
    const upperQuery = searchQuery.toUpperCase();

    // Search flights by callsign or ICAO24
    const flightArray = Array.from(flights.values());
    const matchingFlights = flightArray
      .filter(f =>
        f.callsign?.toUpperCase().includes(upperQuery) ||
        f.icao24?.toUpperCase().includes(upperQuery)
      )
      .slice(0, 5); // Limit flight results

    for (const flight of matchingFlights) {
      searchResults.push({
        type: 'flight',
        id: flight.icao24,
        title: flight.callsign || flight.icao24,
        subtitle: `${flight.icao24} • Alt: ${Math.round(flight.altitude || 0).toLocaleString()} ft`,
        data: flight
      });
    }

    // Search airports
    try {
      const airportResults = await searchAirports(searchQuery, 5);
      for (const result of airportResults) {
        searchResults.push({
          type: 'airport',
          id: result.airport.iata,
          title: `${result.airport.iata} - ${result.airport.name}`,
          subtitle: `${result.airport.city}, ${result.airport.country}`,
          data: result.airport
        });
      }
    } catch (error) {
      console.error('Airport search error:', error);
    }

    setResults(searchResults);
    setIsLoading(false);
  }, [flights]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'flight' && onSelectFlight) {
      onSelectFlight(result.data as FlightPosition);
    } else if (result.type === 'airport' && onSelectAirport) {
      onSelectAirport(result.data as Airport);
    }
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div className={`
        relative bg-surface/90 backdrop-blur-sm rounded-xl border transition-all duration-200 shadow-xl
        ${isFocused ? 'border-map ring-2 ring-map/20' : 'border-border'}
      `}>
        <div className="flex items-center px-4 py-3">
          <svg
            className="w-5 h-5 text-muted mr-3"
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
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search flights or airports..."
            className="flex-1 bg-transparent text-foreground placeholder-muted focus:outline-none"
          />
          {isLoading && (
            <div className="animate-spin w-4 h-4 border-2 border-muted border-t-map rounded-full mr-2" />
          )}
          {query && !isLoading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-alt rounded-full transition"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {isFocused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-surface-alt transition text-left"
              onClick={() => handleResultClick(result)}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0
                ${result.type === 'flight' ? 'bg-map/20 text-map' : ''}
                ${result.type === 'airport' ? 'bg-wallet/20 text-wallet' : ''}
              `}>
                {result.type === 'flight' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                )}
                {result.type === 'airport' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{result.title}</div>
                <div className="text-sm text-secondary truncate">{result.subtitle}</div>
              </div>
              <div className="text-xs text-muted uppercase shrink-0">
                {result.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isFocused && query.length > 1 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 text-center z-50">
          <p className="text-secondary">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Loading state */}
      {isFocused && query.length > 1 && isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 text-center z-50">
          <p className="text-secondary">Searching...</p>
        </div>
      )}
    </div>
  );
}
