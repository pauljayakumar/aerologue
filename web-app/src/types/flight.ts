// Flight-related type definitions

export interface FlightPosition {
  icao24: string;              // Aircraft ICAO 24-bit address
  callsign: string | null;     // Flight callsign
  registration?: string | null; // Aircraft registration (e.g., N12345)
  aircraftType?: string | null; // Aircraft type code (e.g., B738, A320)
  latitude: number;
  longitude: number;
  altitude: number | null;     // Altitude in feet
  heading: number | null;      // Track angle in degrees
  velocity?: number | null;    // Ground speed in knots
  verticalRate?: number | null; // Vertical rate in ft/min
  squawk?: string | null;      // Transponder squawk code
  emergency?: string | null;   // Emergency status
  category?: string | null;    // Aircraft category
  onGround: boolean;
  lastUpdate: number;          // Unix timestamp
  source?: 'adsb-exchange' | 'opensky'; // Data provider
}

export interface Flight {
  id: string;
  callsign: string;
  aircraft: {
    icao24: string;
    registration?: string;
    type?: string;
    model?: string;
  };
  origin?: {
    icao: string;
    iata?: string;
    name?: string;
  };
  destination?: {
    icao: string;
    iata?: string;
    name?: string;
  };
  status: 'scheduled' | 'active' | 'landed' | 'cancelled';
  position?: FlightPosition;
  lastUpdated: string;
}

export interface TrackedFlight extends Flight {
  trackedAt: string;
  userId: string;
  notifications: {
    departure: boolean;
    arrival: boolean;
    delays: boolean;
  };
}

export interface FlightSearchResult {
  flights: Flight[];
  total: number;
  query: string;
}
