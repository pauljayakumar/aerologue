'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { searchAirports } from '@/lib/airports';
import { useFlightStore } from '@/store/useFlightStore';
import type { Airport } from '@/types/airport';
import type { FlightPosition } from '@/types';

interface SearchResult {
  type: 'flight' | 'airport';
  id: string;
  title: string;
  subtitle: string;
  secondaryInfo?: string;  // Additional info like airline name
  data: FlightPosition | Airport;
  score: number;  // For sorting relevance
}

interface SearchBarProps {
  onSelectAirport?: (airport: Airport) => void;
  onSelectFlight?: (flight: FlightPosition) => void;
}

// IATA to ICAO airline code mappings with names
const AIRLINE_MAP: Record<string, { icao: string[]; name: string }> = {
  'BA': { icao: ['BAW'], name: 'British Airways' },
  'AA': { icao: ['AAL'], name: 'American Airlines' },
  'UA': { icao: ['UAL'], name: 'United Airlines' },
  'DL': { icao: ['DAL'], name: 'Delta' },
  'AF': { icao: ['AFR'], name: 'Air France' },
  'LH': { icao: ['DLH'], name: 'Lufthansa' },
  'EK': { icao: ['UAE'], name: 'Emirates' },
  'QF': { icao: ['QFA'], name: 'Qantas' },
  'SQ': { icao: ['SIA'], name: 'Singapore Airlines' },
  'CX': { icao: ['CPA'], name: 'Cathay Pacific' },
  'NH': { icao: ['ANA'], name: 'All Nippon Airways' },
  'JL': { icao: ['JAL'], name: 'Japan Airlines' },
  'KL': { icao: ['KLM'], name: 'KLM' },
  'VS': { icao: ['VIR'], name: 'Virgin Atlantic' },
  'EY': { icao: ['ETD'], name: 'Etihad' },
  'QR': { icao: ['QTR'], name: 'Qatar Airways' },
  'TK': { icao: ['THY'], name: 'Turkish Airlines' },
  'IB': { icao: ['IBE', 'IBS'], name: 'Iberia' },
  'AY': { icao: ['FIN'], name: 'Finnair' },
  'SK': { icao: ['SAS'], name: 'SAS' },
  'LX': { icao: ['SWR'], name: 'Swiss' },
  'OS': { icao: ['AUA'], name: 'Austrian' },
  'SN': { icao: ['BEL'], name: 'Brussels Airlines' },
  'TP': { icao: ['TAP'], name: 'TAP Portugal' },
  'AZ': { icao: ['ITY', 'AZA'], name: 'ITA Airways' },
  'EI': { icao: ['EIN'], name: 'Aer Lingus' },
  'U2': { icao: ['EZY'], name: 'easyJet' },
  'FR': { icao: ['RYR'], name: 'Ryanair' },
  'W6': { icao: ['WZZ'], name: 'Wizz Air' },
  'VY': { icao: ['VLG'], name: 'Vueling' },
  'AC': { icao: ['ACA'], name: 'Air Canada' },
  'WN': { icao: ['SWA'], name: 'Southwest' },
  'B6': { icao: ['JBU'], name: 'JetBlue' },
  'AS': { icao: ['ASA'], name: 'Alaska Airlines' },
  'NK': { icao: ['NKS'], name: 'Spirit Airlines' },
  'F9': { icao: ['FFT'], name: 'Frontier' },
  'WS': { icao: ['WJA'], name: 'WestJet' },
  'LA': { icao: ['LAN'], name: 'LATAM' },
  'AM': { icao: ['AMX'], name: 'Aeromexico' },
  'AV': { icao: ['AVA'], name: 'Avianca' },
  'CM': { icao: ['CMP'], name: 'Copa Airlines' },
  'CA': { icao: ['CCA'], name: 'Air China' },
  'MU': { icao: ['CES'], name: 'China Eastern' },
  'CZ': { icao: ['CSN'], name: 'China Southern' },
  'HU': { icao: ['CHH'], name: 'Hainan Airlines' },
  'KE': { icao: ['KAL'], name: 'Korean Air' },
  'OZ': { icao: ['AAR'], name: 'Asiana' },
  'TG': { icao: ['THA'], name: 'Thai Airways' },
  'MH': { icao: ['MAS'], name: 'Malaysia Airlines' },
  'GA': { icao: ['GIA'], name: 'Garuda Indonesia' },
  'PR': { icao: ['PAL'], name: 'Philippine Airlines' },
  'CI': { icao: ['CAL'], name: 'China Airlines' },
  'BR': { icao: ['EVA'], name: 'EVA Air' },
  'VN': { icao: ['HVN'], name: 'Vietnam Airlines' },
  'AI': { icao: ['AIC'], name: 'Air India' },
  'ET': { icao: ['ETH'], name: 'Ethiopian Airlines' },
  'SA': { icao: ['SAA'], name: 'South African Airways' },
  'MS': { icao: ['MSR'], name: 'EgyptAir' },
  'RJ': { icao: ['RJA'], name: 'Royal Jordanian' },
  'GF': { icao: ['GFA'], name: 'Gulf Air' },
  'WY': { icao: ['OMA'], name: 'Oman Air' },
  'SV': { icao: ['SVA'], name: 'Saudi Arabian' },
  'NZ': { icao: ['ANZ'], name: 'Air New Zealand' },
  'FJ': { icao: ['FJI'], name: 'Fiji Airways' },
  'JQ': { icao: ['JST'], name: 'Jetstar' },
  'VA': { icao: ['VOZ'], name: 'Virgin Australia' },
  'QX': { icao: ['QXE'], name: 'Horizon Air' },
  'HA': { icao: ['HAL'], name: 'Hawaiian Airlines' },
  'FX': { icao: ['FDX'], name: 'FedEx' },
  '5X': { icao: ['UPS'], name: 'UPS' },
  'K4': { icao: ['CKS'], name: 'Kalitta Air' },
  'CV': { icao: ['CLX'], name: 'Cargolux' },
  'OO': { icao: ['SKW'], name: 'SkyWest' },
  'MQ': { icao: ['ENY'], name: 'Envoy Air' },
  '9E': { icao: ['EDV'], name: 'Endeavor Air' },
  'FZ': { icao: ['FDB'], name: 'flydubai' },
  'G9': { icao: ['ABY'], name: 'Air Arabia' },
  '6E': { icao: ['IGO'], name: 'IndiGo' },
  'AK': { icao: ['AXM'], name: 'AirAsia' },
  'TR': { icao: ['TGW'], name: 'Scoot' },
  '5J': { icao: ['CEB'], name: 'Cebu Pacific' },
  'VJ': { icao: ['VJC'], name: 'VietJet Air' },
  'JT': { icao: ['LNI'], name: 'Lion Air' },
};

// Reverse lookup: ICAO prefix to airline name
const ICAO_TO_AIRLINE: Record<string, string> = {};
for (const [, data] of Object.entries(AIRLINE_MAP)) {
  for (const icao of data.icao) {
    ICAO_TO_AIRLINE[icao] = data.name;
  }
}

// Get airline name from callsign
function getAirlineName(callsign: string): string | null {
  if (!callsign || callsign.length < 3) return null;
  return ICAO_TO_AIRLINE[callsign.slice(0, 3).toUpperCase()] || null;
}

// Format altitude
function formatAlt(alt: number | null | string | undefined): string {
  if (alt === null || alt === undefined || alt === 'ground') return 'Ground';
  const n = typeof alt === 'string' ? parseFloat(alt) : alt;
  if (isNaN(n) || n < 100) return 'Ground';
  return `${Math.round(n).toLocaleString()} ft`;
}

// Format speed
function formatSpd(vel: number | null | undefined): string {
  return vel ? `${Math.round(vel)} kts` : '';
}

export default function SearchBar({ onSelectAirport, onSelectFlight }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { flights } = useFlightStore();

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];
    const upperQuery = searchQuery.toUpperCase().trim();

    // Build ICAO variants for IATA airline code search
    const icaoVariants: string[] = [];
    for (const [iata, data] of Object.entries(AIRLINE_MAP)) {
      if (upperQuery.startsWith(iata)) {
        const flightNum = upperQuery.slice(iata.length);
        data.icao.forEach(icao => icaoVariants.push(icao + flightNum));
      }
    }

    // Search flights by multiple fields
    for (const flight of flights.values()) {
      const callsign = (flight.callsign || '').toUpperCase();
      const icao24 = (flight.icao24 || '').toUpperCase();
      const registration = (flight.registration || '').toUpperCase();
      const aircraftType = (flight.aircraftType || '').toUpperCase();

      let score = 0;

      // Score based on match type
      if (callsign === upperQuery) score = 100;
      else if (callsign.startsWith(upperQuery)) score = 90;
      else if (callsign.includes(upperQuery)) score = 80;
      else if (icaoVariants.some(v => callsign.startsWith(v))) score = 85;
      else if (registration === upperQuery) score = 95;
      else if (registration.startsWith(upperQuery)) score = 75;
      else if (registration.includes(upperQuery)) score = 65;
      else if (icao24.startsWith(upperQuery)) score = 60;
      else if (icao24.includes(upperQuery)) score = 50;
      else if (aircraftType.includes(upperQuery)) score = 40;

      if (score > 0) {
        const airline = getAirlineName(flight.callsign || '');
        const parts: string[] = [];
        if (flight.registration) parts.push(flight.registration);
        if (flight.aircraftType) parts.push(flight.aircraftType);
        parts.push(formatAlt(flight.altitude));
        if (flight.velocity) parts.push(formatSpd(flight.velocity));

        searchResults.push({
          type: 'flight',
          id: flight.icao24,
          title: flight.callsign || flight.icao24,
          subtitle: parts.join(' · '),
          secondaryInfo: airline || undefined,
          data: flight,
          score
        });
      }
    }

    // Search airports
    try {
      const airportResults = await searchAirports(searchQuery, 8);
      for (const result of airportResults) {
        const apt = result.airport;
        searchResults.push({
          type: 'airport',
          id: apt.icao || apt.iata,
          title: `${apt.iata}/${apt.icao} - ${apt.name}`,
          subtitle: `${apt.city}, ${apt.country}`,
          data: apt,
          score: result.score
        });
      }
    } catch (error) {
      console.error('Airport search error:', error);
    }

    // Sort by score, flights first
    searchResults.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.type !== b.type) return a.type === 'flight' ? -1 : 1;
      return 0;
    });

    setResults(searchResults.slice(0, 15));
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
            placeholder="Search flights, airports, registrations..."
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{result.title}</span>
                  {result.secondaryInfo && (
                    <span className="text-xs text-secondary bg-surface-alt px-1.5 py-0.5 rounded">
                      {result.secondaryInfo}
                    </span>
                  )}
                </div>
                <div className="text-sm text-secondary truncate">{result.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isFocused && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 z-50">
          <p className="text-secondary text-center">No results found for &quot;{query}&quot;</p>
          <p className="text-xs text-muted text-center mt-1">
            Try searching by callsign, registration, ICAO24, or airport code
          </p>
        </div>
      )}

      {/* Loading state */}
      {isFocused && query.length >= 2 && isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 text-center z-50">
          <p className="text-secondary">Searching...</p>
        </div>
      )}

      {/* Help hint when focused but no query */}
      {isFocused && query.length < 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 z-50">
          <p className="text-sm text-secondary">Search by:</p>
          <ul className="text-xs text-muted mt-2 space-y-1">
            <li>• <span className="text-foreground">Flight callsign</span> - BA123, UAL456, ASA789</li>
            <li>• <span className="text-foreground">Registration</span> - N12345, G-ABCD</li>
            <li>• <span className="text-foreground">Aircraft type</span> - B738, A320, B77W</li>
            <li>• <span className="text-foreground">Airport code</span> - LHR, JFK, LAX (IATA or ICAO)</li>
            <li>• <span className="text-foreground">City name</span> - London, New York</li>
          </ul>
        </div>
      )}
    </div>
  );
}
