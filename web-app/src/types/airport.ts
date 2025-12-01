// Airport type definitions

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  tz: string | null;
}

export interface AirportSearchResult {
  airport: Airport;
  matchType: 'iata' | 'icao' | 'name' | 'city';
  score: number;
}
