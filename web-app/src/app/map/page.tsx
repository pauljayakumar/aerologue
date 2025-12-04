'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FlightMap, { type FlightMapRef } from '@/components/map/FlightMap';
import FlightPanel from '@/components/map/FlightPanel';
import SearchBar from '@/components/map/SearchBar';
import { useFlightStore } from '@/store/useFlightStore';
import type { FlightPosition } from '@/types';
import type { Airport } from '@/types/airport';

export default function MapPage() {
  const [selectedFlight, setSelectedFlight] = useState<FlightPosition | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchFlights, flights } = useFlightStore();
  const mapRef = useRef<FlightMapRef | null>(null);

  useEffect(() => {
    // Simulate initial data load
    const loadData = async () => {
      setIsLoading(true);
      // In production, this would fetch real flight data
      await fetchFlights();
      setIsLoading(false);
    };
    loadData();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchFlights();
    }, 10000); // Update every 10 seconds with real data

    return () => clearInterval(interval);
  }, [fetchFlights]);

  const handleFlightClick = useCallback((flight: FlightPosition) => {
    setSelectedFlight(flight);
    setIsPanelOpen(true);
    // Show trail for selected flight
    if (mapRef.current) {
      mapRef.current.showTrail(flight.icao24);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Hide trail when closing panel
    if (mapRef.current) {
      mapRef.current.hideTrail();
    }
    setTimeout(() => setSelectedFlight(null), 300);
  }, []);

  // Handle search result selection - fly to flight
  const handleSelectFlight = useCallback((flight: FlightPosition) => {
    // Navigate map to flight position
    if (mapRef.current && flight.longitude && flight.latitude) {
      mapRef.current.flyTo(flight.longitude, flight.latitude, 8);
      // Show trail for selected flight
      mapRef.current.showTrail(flight.icao24);
    }
    // Open flight panel
    setSelectedFlight(flight);
    setIsPanelOpen(true);
  }, []);

  // Handle search result selection - fly to airport
  const handleSelectAirport = useCallback((airport: Airport) => {
    // Navigate map to airport
    if (mapRef.current) {
      mapRef.current.flyTo(airport.lon, airport.lat, 12);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Full-screen map */}
      <FlightMap
        ref={mapRef}
        className="absolute inset-0"
        onFlightClick={handleFlightClick}
      />

      {/* Search overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <SearchBar
          onSelectFlight={handleSelectFlight}
          onSelectAirport={handleSelectAirport}
        />
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-surface/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-6 shadow-xl border border-border">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span className="text-sm text-secondary">Live</span>
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="text-sm">
            <span className="text-secondary">Tracking </span>
            <span className="font-bold text-foreground">{flights.size.toLocaleString()}</span>
            <span className="text-secondary"> flights</span>
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="text-sm text-secondary">
            Updated: <span className="text-foreground">Just now</span>
          </div>
        </div>
      </div>

      {/* Company footer */}
      <div className="absolute bottom-2 left-0 right-0 z-10">
        <div className="text-center text-xs text-secondary">
          <span className="font-semibold text-foreground">Aerologue Ltd</span>
          <span className="mx-2">·</span>
          <span>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</span>
          <span className="mx-2">·</span>
          <span>Company No. 16876117</span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-map border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-secondary">Loading flight data...</p>
          </div>
        </div>
      )}

      {/* Flight detail panel */}
      <FlightPanel
        flight={selectedFlight}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
