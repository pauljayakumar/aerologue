// Airport data loading and search utilities

import { Airport, AirportSearchResult } from '@/types/airport';

let airportsCache: Airport[] | null = null;
let airportsIndex: Map<string, Airport> | null = null; // IATA and ICAO lookup

// Load airports data from static JSON
export async function loadAirports(): Promise<Airport[]> {
  if (airportsCache) {
    return airportsCache;
  }

  try {
    const response = await fetch('/data/airports.min.json');
    if (!response.ok) {
      throw new Error(`Failed to load airports: ${response.status}`);
    }
    airportsCache = await response.json();

    // Build lookup index
    airportsIndex = new Map();
    for (const airport of airportsCache!) {
      airportsIndex.set(airport.iata.toUpperCase(), airport);
      airportsIndex.set(airport.icao.toUpperCase(), airport);
    }

    return airportsCache!;
  } catch (error) {
    console.error('Error loading airports:', error);
    return [];
  }
}

// Get airport by IATA or ICAO code
export async function getAirportByCode(code: string): Promise<Airport | null> {
  if (!airportsIndex) {
    await loadAirports();
  }
  return airportsIndex?.get(code.toUpperCase()) || null;
}

// Search airports by query (IATA, ICAO, name, or city)
export async function searchAirports(
  query: string,
  limit: number = 10
): Promise<AirportSearchResult[]> {
  if (!airportsCache) {
    await loadAirports();
  }

  if (!query || query.length < 2 || !airportsCache) {
    return [];
  }

  const q = query.toUpperCase();
  const results: AirportSearchResult[] = [];

  for (const airport of airportsCache) {
    let matchType: AirportSearchResult['matchType'] | null = null;
    let score = 0;

    // Exact IATA match (highest priority)
    if (airport.iata.toUpperCase() === q) {
      matchType = 'iata';
      score = 100;
    }
    // Exact ICAO match
    else if (airport.icao.toUpperCase() === q) {
      matchType = 'icao';
      score = 95;
    }
    // IATA starts with query
    else if (airport.iata.toUpperCase().startsWith(q)) {
      matchType = 'iata';
      score = 90;
    }
    // ICAO starts with query
    else if (airport.icao.toUpperCase().startsWith(q)) {
      matchType = 'icao';
      score = 85;
    }
    // City starts with query
    else if (airport.city.toUpperCase().startsWith(q)) {
      matchType = 'city';
      score = 80;
    }
    // Name contains query
    else if (airport.name.toUpperCase().includes(q)) {
      matchType = 'name';
      score = 70 - (airport.name.toUpperCase().indexOf(q) / 10);
    }
    // City contains query
    else if (airport.city.toUpperCase().includes(q)) {
      matchType = 'city';
      score = 60 - (airport.city.toUpperCase().indexOf(q) / 10);
    }

    if (matchType) {
      results.push({ airport, matchType, score });
    }
  }

  // Sort by score descending and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get airports within a bounding box (for map display)
export async function getAirportsInBounds(
  bounds: { north: number; south: number; east: number; west: number },
  limit: number = 100
): Promise<Airport[]> {
  if (!airportsCache) {
    await loadAirports();
  }

  if (!airportsCache) return [];

  return airportsCache
    .filter(
      airport =>
        airport.lat >= bounds.south &&
        airport.lat <= bounds.north &&
        airport.lon >= bounds.west &&
        airport.lon <= bounds.east
    )
    .slice(0, limit);
}

// Get major airports only (useful for low zoom levels)
// This is a simple heuristic based on common major airport IATA codes
const MAJOR_AIRPORT_CODES = new Set([
  // North America
  'JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'ATL', 'SFO', 'SEA', 'MIA', 'BOS',
  'IAH', 'EWR', 'LAS', 'PHX', 'MSP', 'DTW', 'CLT', 'MCO', 'PHL', 'DCA',
  'YYZ', 'YVR', 'YUL', 'YYC', 'MEX', 'CUN',
  // Europe
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'ZRH', 'VIE',
  'LGW', 'MAN', 'DUB', 'CPH', 'OSL', 'ARN', 'HEL', 'BRU', 'LIS', 'ATH',
  // Asia
  'HND', 'NRT', 'PEK', 'PVG', 'HKG', 'SIN', 'ICN', 'BKK', 'KUL', 'CGK',
  'DEL', 'BOM', 'DXB', 'DOH', 'IST', 'TLV',
  // Oceania
  'SYD', 'MEL', 'BNE', 'PER', 'AKL',
  // South America
  'GRU', 'GIG', 'EZE', 'SCL', 'LIM', 'BOG',
  // Africa
  'JNB', 'CAI', 'CPT', 'NBO', 'ADD', 'CMN'
]);

export async function getMajorAirports(): Promise<Airport[]> {
  if (!airportsCache) {
    await loadAirports();
  }

  if (!airportsCache) return [];

  return airportsCache.filter(airport =>
    MAJOR_AIRPORT_CODES.has(airport.iata)
  );
}
