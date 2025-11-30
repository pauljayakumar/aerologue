// AeroDataBox API Client
// Documentation: https://doc.aerodatabox.com/

const BASE_URL = process.env.AERODATABOX_BASE_URL || 'https://prod.api.market/api/v1/aedbx/aerodatabox';
const API_KEY = process.env.AERODATABOX_API_KEY;

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
}

async function fetchAeroDataBox<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error('AERODATABOX_API_KEY is not configured');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'x-api-market-key': API_KEY,
      'Accept': 'application/json',
    },
    cache: options.cache,
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    if (response.status === 204) {
      return null as T;
    }
    throw new Error(`AeroDataBox API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Types
export interface Airport {
  icao: string;
  iata: string;
  shortName: string;
  fullName: string;
  municipalityName: string;
  location: {
    lat: number;
    lon: number;
  };
  elevation: {
    feet: number;
    meter: number;
  };
  country: {
    code: string;
    name: string;
  };
  continent: {
    code: string;
    name: string;
  };
  timeZone: string;
  urls?: {
    webSite?: string;
    wikipedia?: string;
    flightRadar?: string;
  };
}

export interface Aircraft {
  id: string;
  reg: string;
  icao24: string;
  typeName: string;
  productionLine: string;
  airlineName?: string;
  airlineIcao?: string;
  airlineIata?: string;
  image?: {
    url: string;
    webUrl: string;
    author: string;
    title: string;
  };
}

export interface FlightStatus {
  number: string;
  callSign: string;
  status: string;
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  aircraft?: {
    reg: string;
    model: string;
  };
  departure: {
    airport: {
      icao: string;
      iata: string;
      name: string;
    };
    scheduledTimeLocal: string;
    actualTimeLocal?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: {
      icao: string;
      iata: string;
      name: string;
    };
    scheduledTimeLocal: string;
    actualTimeLocal?: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
  };
}

// API Functions

/**
 * Get airport information by ICAO or IATA code
 */
export async function getAirport(code: string, codeType: 'icao' | 'iata' = 'icao'): Promise<Airport | null> {
  return fetchAeroDataBox<Airport>(`/airports/${codeType}/${code}`, { revalidate: 86400 }); // Cache for 24h
}

/**
 * Search airports by location
 */
export async function searchAirportsByLocation(lat: number, lon: number, radiusKm: number = 50): Promise<Airport[]> {
  return fetchAeroDataBox<Airport[]>(`/airports/search/location?lat=${lat}&lon=${lon}&radiusKm=${radiusKm}`, { revalidate: 86400 });
}

/**
 * Search airports by term
 */
export async function searchAirports(term: string, limit: number = 10): Promise<Airport[]> {
  return fetchAeroDataBox<Airport[]>(`/airports/search/term?q=${encodeURIComponent(term)}&limit=${limit}`, { revalidate: 3600 });
}

/**
 * Get aircraft information by registration, ICAO24, or ID
 */
export async function getAircraft(param: string, searchBy: 'reg' | 'icao24' | 'id' = 'reg'): Promise<Aircraft | null> {
  const searchByCode = searchBy === 'reg' ? '1' : searchBy === 'icao24' ? '2' : '0';
  return fetchAeroDataBox<Aircraft>(`/aircrafts/${searchByCode}/${param}?withImage=true`, { revalidate: 3600 });
}

/**
 * Get flight status by flight number
 */
export async function getFlightStatus(flightNumber: string, date?: string): Promise<FlightStatus[] | null> {
  const dateParam = date || new Date().toISOString().split('T')[0];
  return fetchAeroDataBox<FlightStatus[]>(`/flights/number/${flightNumber}/${dateParam}`, { revalidate: 60 });
}

/**
 * Get flights at an airport
 */
export async function getAirportFlights(
  code: string,
  fromTime: string,
  toTime: string,
  codeType: 'icao' | 'iata' = 'icao',
  direction: 'Departure' | 'Arrival' | 'Both' = 'Both'
): Promise<{ departures?: FlightStatus[]; arrivals?: FlightStatus[] } | null> {
  return fetchAeroDataBox(
    `/flights/airports/${codeType}/${code}/${fromTime}/${toTime}?direction=${direction}&withCancelled=false`,
    { revalidate: 60 }
  );
}

export default {
  getAirport,
  searchAirportsByLocation,
  searchAirports,
  getAircraft,
  getFlightStatus,
  getAirportFlights,
};
