// Flight Store using Zustand
import { create } from 'zustand';
import type { Flight, FlightPosition, TrackedFlight } from '@/types';

// In development, use local API routes; in production (static export), use AWS API Gateway
const getFlightsApiUrl = () => {
  if (typeof window === 'undefined') return '/api/flights'; // SSR fallback
  const isLocalhost = window.location.hostname === 'localhost';
  if (isLocalhost) {
    return '/api/flights'; // Local Next.js API route
  }
  // Production: AWS API Gateway (no /api prefix)
  const awsApi = process.env.NEXT_PUBLIC_API_URL || 'https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod';
  return `${awsApi}/flights`;
};

interface FlightStore {
  // State
  flights: Map<string, FlightPosition>;
  trackedFlights: TrackedFlight[];
  selectedFlight: Flight | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFlights: () => Promise<void>;
  setFlights: (flights: FlightPosition[]) => void;
  updateFlight: (flight: FlightPosition) => void;
  setTrackedFlights: (flights: TrackedFlight[]) => void;
  addTrackedFlight: (flight: TrackedFlight) => void;
  removeTrackedFlight: (flightId: string) => void;
  selectFlight: (flight: Flight | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFlights: () => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  // Initial state
  flights: new Map(),
  trackedFlights: [],
  selectedFlight: null,
  isLoading: false,
  error: null,

  // Fetch flights from API (AWS Lambda in prod, local in dev)
  fetchFlights: async () => {
    try {
      const url = getFlightsApiUrl();
      console.log('Fetching flights from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status, response.statusText);
      if (!response.ok) {
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error(`Failed to fetch flights: ${response.status}`);
      }
      const data = await response.json();

      const flightMap = new Map<string, FlightPosition>();
      data.flights?.forEach((flight: FlightPosition) => {
        flightMap.set(flight.icao24, flight);
      });
      set({ flights: flightMap, error: null });
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      set({ error: 'Failed to fetch flight data' });
    }
  },

  // Set all flights (from API response)
  setFlights: (flights: FlightPosition[]) => {
    const flightMap = new Map<string, FlightPosition>();
    flights.forEach((flight) => {
      flightMap.set(flight.icao24, flight);
    });
    set({ flights: flightMap });
  },

  // Update a single flight position
  updateFlight: (flight: FlightPosition) => {
    set((state) => {
      const newFlights = new Map(state.flights);
      newFlights.set(flight.icao24, flight);
      return { flights: newFlights };
    });
  },

  // Set tracked flights
  setTrackedFlights: (flights: TrackedFlight[]) => {
    set({ trackedFlights: flights });
  },

  // Add a tracked flight
  addTrackedFlight: (flight: TrackedFlight) => {
    set((state) => ({
      trackedFlights: [...state.trackedFlights, flight],
    }));
  },

  // Remove a tracked flight
  removeTrackedFlight: (flightId: string) => {
    set((state) => ({
      trackedFlights: state.trackedFlights.filter((f) => f.id !== flightId),
    }));
  },

  // Select a flight for details view
  selectFlight: (flight: Flight | null) => {
    set({ selectedFlight: flight });
  },

  // Loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Error state
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear all flights
  clearFlights: () => {
    set({ flights: new Map(), selectedFlight: null });
  },
}));
