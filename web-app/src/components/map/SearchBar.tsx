'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchResult {
  type: 'flight' | 'airport' | 'route';
  id: string;
  title: string;
  subtitle: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search results for demo
  useEffect(() => {
    if (query.length > 1) {
      // In production, this would call an API
      const mockResults: SearchResult[] = ([
        { type: 'flight' as const, id: 'UA123', title: 'UA123', subtitle: 'San Francisco → New York' },
        { type: 'flight' as const, id: 'AA456', title: 'AA456', subtitle: 'Los Angeles → Chicago' },
        { type: 'airport' as const, id: 'SFO', title: 'SFO', subtitle: 'San Francisco International' },
      ] as SearchResult[]).filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(mockResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
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
            placeholder="Search flights, airports, or routes..."
            className="flex-1 bg-transparent text-foreground placeholder-muted focus:outline-none"
          />
          {query && (
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl overflow-hidden">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-surface-alt transition text-left"
              onClick={() => {
                // Handle result selection
                setQuery('');
              }}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                ${result.type === 'flight' ? 'bg-map/20 text-map' : ''}
                ${result.type === 'airport' ? 'bg-wallet/20 text-wallet' : ''}
                ${result.type === 'route' ? 'bg-games/20 text-games' : ''}
              `}>
                {result.type === 'flight' && '✈️'}
                {result.type === 'airport' && '🛫'}
                {result.type === 'route' && '🗺️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{result.title}</div>
                <div className="text-sm text-secondary truncate">{result.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isFocused && query.length > 1 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl p-4 text-center">
          <p className="text-secondary">No results found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
