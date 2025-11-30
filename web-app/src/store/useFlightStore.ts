// Flight Store using Zustand
import { create } from 'zustand';
import type { Flight, FlightPosition, TrackedFlight } from '@/types';
import awsConfig from '@/lib/aws-config';

// Always use AWS API Gateway (static export doesn't have local API routes)
const FLIGHTS_API_URL = `${awsConfig.api.baseUrl}/flights`;

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
      const response = await fetch(FLIGHTS_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
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
