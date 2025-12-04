// Aerologue Flights Lambda Function
// Fetches global flight data from ADS-B Exchange API

import { success, errors, corsResponse } from './response.mjs';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const USAGE_TABLE = 'aerologue-api-usage';

// Track API usage
async function trackApiUsage(apiName, callCount = 1, successCount = 1, errorCount = 0) {
  const today = new Date().toISOString().split('T')[0];
  try {
    await dynamodb.send(new UpdateItemCommand({
      TableName: USAGE_TABLE,
      Key: {
        api_name: { S: apiName },
        date: { S: today }
      },
      UpdateExpression: 'ADD #calls :inc, #success :suc, #errors :err',
      ExpressionAttributeNames: {
        '#calls': 'total_calls',
        '#success': 'successful_calls',
        '#errors': 'error_calls'
      },
      ExpressionAttributeValues: {
        ':inc': { N: callCount.toString() },
        ':suc': { N: successCount.toString() },
        ':err': { N: errorCount.toString() }
      }
    }));
  } catch (error) {
    console.error('Failed to track API usage:', error.message);
  }
}

// Global regions for worldwide coverage with dist=3000 (3000nm radius)
const GLOBAL_REGIONS = [
  { lat: 40, lon: -74, name: 'New York' },
  { lat: 37, lon: -122, name: 'San Francisco' },
  { lat: -23, lon: -46, name: 'Sao Paulo' },
  { lat: 51, lon: 0, name: 'London' },
  { lat: 25, lon: 55, name: 'Dubai' },
  { lat: 35, lon: 140, name: 'Tokyo' },
  { lat: 1, lon: 104, name: 'Singapore' },
  { lat: -33, lon: 151, name: 'Sydney' },
];

// OpenSky fallback regions
const OPENSKY_REGIONS = [
  { lamin: 25, lamax: 50, lomin: -130, lomax: -60 },
  { lamin: 35, lamax: 60, lomin: -10, lomax: 40 },
  { lamin: 10, lamax: 45, lomin: 100, lomax: 150 },
  { lamin: 10, lamax: 40, lomin: 40, lomax: 100 },
  { lamin: -45, lamax: -10, lomin: 110, lomax: 180 },
  { lamin: -55, lamax: 10, lomin: -80, lomax: -35 },
];

/**
 * Deduplicates flights by ICAO24
 */
function deduplicateFlights(flights) {
  const flightMap = new Map();

  for (const flight of flights) {
    const existing = flightMap.get(flight.icao24);

    if (!existing) {
      flightMap.set(flight.icao24, flight);
    } else {
      const timeDiff = Math.abs(flight.lastUpdate - existing.lastUpdate);
      if (timeDiff <= 1) {
        if (flight.source === 'adsb-exchange' && existing.source === 'opensky') {
          flightMap.set(flight.icao24, flight);
        } else if (flight.source === existing.source && flight.lastUpdate > existing.lastUpdate) {
          flightMap.set(flight.icao24, flight);
        }
      } else if (flight.lastUpdate > existing.lastUpdate) {
        flightMap.set(flight.icao24, flight);
      }
    }
  }

  return Array.from(flightMap.values());
}

/**
 * Fetch from ADS-B Exchange API
 */
async function fetchFromADSBExchange(lat, lon, dist) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.ADSB_EXCHANGE_HOST || 'adsbexchange-com1.p.rapidapi.com';

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  const response = await fetch(
    `https://${host}/v2/lat/${lat}/lon/${lon}/dist/${dist}/`,
    {
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ADS-B Exchange API error: ${response.status}`);
  }

  const data = await response.json();

  return data.ac
    .filter((ac) => ac.lat !== undefined && ac.lon !== undefined)
    .map((ac) => ({
      icao24: ac.hex,
      callsign: ac.flight?.trim() || ac.hex.toUpperCase(),
      registration: ac.r || null,
      aircraftType: ac.t || null,
      latitude: ac.lat,
      longitude: ac.lon,
      altitude: ac.alt_baro || ac.alt_geom || null,
      velocity: ac.gs ? Math.round(ac.gs) : null,
      heading: ac.track ? Math.round(ac.track) : null,
      verticalRate: ac.baro_rate || null,
      squawk: ac.squawk || null,
      emergency: ac.emergency !== 'none' ? ac.emergency : null,
      category: ac.category || null,
      onGround: ac.alt_baro !== undefined && ac.alt_baro < 100,
      lastUpdate: Date.now() / 1000 - (ac.seen || 0),
      source: 'adsb-exchange',
    }));
}

/**
 * Fetch from OpenSky Network (fallback)
 */
async function fetchFromOpenSky(lamin, lamax, lomin, lomax) {
  const response = await fetch(
    `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
    {
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.states) {
    return [];
  }

  return data.states
    .filter((state) => state[6] !== null && state[5] !== null)
    .map((state) => ({
      icao24: state[0],
      callsign: state[1]?.trim() || state[0].toUpperCase(),
      registration: null,
      aircraftType: null,
      latitude: state[6],
      longitude: state[5],
      altitude: state[7] ? Math.round(state[7] * 3.28084) : null,
      velocity: state[9] ? Math.round(state[9] * 1.94384) : null,
      heading: state[10] ? Math.round(state[10]) : null,
      verticalRate: state[11] ? Math.round(state[11] * 196.85) : null,
      squawk: null,
      emergency: null,
      category: null,
      onGround: state[8],
      lastUpdate: state[4],
      originCountry: state[2],
      source: 'opensky',
    }));
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const provider = queryParams.provider || 'adsb-exchange';
    const global = queryParams.global !== 'false';
    const dist = parseInt(queryParams.dist || '3000');

    let allFlights = [];
    let usedProvider = provider;

    if (provider === 'adsb-exchange') {
      try {
        if (global) {
          console.log(`Fetching from ${GLOBAL_REGIONS.length} global regions...`);
          const regionPromises = GLOBAL_REGIONS.map(region =>
            fetchFromADSBExchange(region.lat, region.lon, dist)
              .catch(err => {
                console.warn(`Failed to fetch ${region.name}:`, err.message);
                return [];
              })
          );

          const regionResults = await Promise.all(regionPromises);
          allFlights = regionResults.flat();
          console.log(`Total flights before dedup: ${allFlights.length}`);
        } else {
          const lat = parseFloat(queryParams.lat || '40');
          const lon = parseFloat(queryParams.lon || '-95');
          allFlights = await fetchFromADSBExchange(lat, lon, dist);
        }
      } catch (error) {
        console.error('ADS-B Exchange failed, falling back to OpenSky:', error);
        usedProvider = 'opensky';

        if (global) {
          const regionPromises = OPENSKY_REGIONS.map(region =>
            fetchFromOpenSky(region.lamin, region.lamax, region.lomin, region.lomax)
              .catch(err => {
                console.warn(`OpenSky region failed:`, err.message);
                return [];
              })
          );
          const regionResults = await Promise.all(regionPromises);
          allFlights = regionResults.flat();
        } else {
          const lamin = parseFloat(queryParams.lamin || '20');
          const lamax = parseFloat(queryParams.lamax || '60');
          const lomin = parseFloat(queryParams.lomin || '-140');
          const lomax = parseFloat(queryParams.lomax || '40');
          allFlights = await fetchFromOpenSky(lamin, lamax, lomin, lomax);
        }
      }
    } else {
      usedProvider = 'opensky';
      if (global) {
        const regionPromises = OPENSKY_REGIONS.map(region =>
          fetchFromOpenSky(region.lamin, region.lamax, region.lomin, region.lomax)
            .catch(err => {
              console.warn(`OpenSky region failed:`, err.message);
              return [];
            })
        );
        const regionResults = await Promise.all(regionPromises);
        allFlights = regionResults.flat();
      } else {
        const lamin = parseFloat(queryParams.lamin || '20');
        const lamax = parseFloat(queryParams.lamax || '60');
        const lomin = parseFloat(queryParams.lomin || '-140');
        const lomax = parseFloat(queryParams.lomax || '40');
        allFlights = await fetchFromOpenSky(lamin, lamax, lomin, lomax);
      }
    }

    // Deduplicate
    const deduplicatedFlights = deduplicateFlights(allFlights);
    const duplicatesRemoved = allFlights.length - deduplicatedFlights.length;

    console.log(`Flights after dedup: ${deduplicatedFlights.length} (removed ${duplicatesRemoved} duplicates)`);

    // Track API usage (count regions as individual calls)
    const regionsQueried = global ? (usedProvider === 'adsb-exchange' ? GLOBAL_REGIONS.length : OPENSKY_REGIONS.length) : 1;
    await trackApiUsage(usedProvider === 'adsb-exchange' ? 'adsb-exchange' : 'opensky', regionsQueried, regionsQueried, 0);

    return success(
      { flights: deduplicatedFlights },
      {
        count: deduplicatedFlights.length,
        provider: usedProvider,
        regionsQueried: global ? (usedProvider === 'adsb-exchange' ? GLOBAL_REGIONS.length : OPENSKY_REGIONS.length) : 1,
        ...(duplicatesRemoved > 0 && { duplicatesRemoved }),
      }
    );
  } catch (error) {
    console.error('Failed to fetch flights:', error);
    return errors.internal('Failed to fetch flight data');
  }
};
