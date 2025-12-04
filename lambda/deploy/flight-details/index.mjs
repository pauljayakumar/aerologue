// Aerologue Flight Details Lambda
// Fetches flight route information (origin/destination) from AeroDataBox API
// Uses API.Market endpoint (not RapidAPI)

import { success, errors, corsResponse } from './response.mjs';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const ssm = new SSMClient({ region: 'us-east-1' });

const CONFIG_TABLE = 'aerologue-admin-config';
const USAGE_TABLE = 'aerologue-api-usage';

// API.Market base URL for AeroDataBox
const API_MARKET_BASE_URL = 'https://prod.api.market/api/v1/aedbx/aerodatabox';

// Track API usage
async function trackApiUsage(apiName, success = true) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
        ':inc': { N: '1' },
        ':suc': { N: success ? '1' : '0' },
        ':err': { N: success ? '0' : '1' }
      }
    }));
  } catch (error) {
    console.error('Failed to track API usage:', error.message);
  }
}

// Cache for API key and config
let cachedApiKey = null;
let cachedConfig = null;
let configLastFetched = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

export const handler = async (event) => {
  console.log('Flight details request:', JSON.stringify(event, null, 2));

  const method = event.requestContext?.http?.method || event.httpMethod;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    // Check if AeroDataBox API is enabled
    const config = await getAdminConfig();
    if (!config.master_enabled) {
      return errors.serviceUnavailable('API temporarily disabled');
    }

    if (!config.aerodatabox_enabled) {
      return errors.serviceUnavailable('AeroDataBox API disabled by admin');
    }

    // Get aircraft_id (ICAO24) from path parameter
    const pathParams = event.pathParameters || {};
    const aircraftId = pathParams.aircraft_id || pathParams.aircraftId;

    if (!aircraftId) {
      return errors.badRequest('aircraft_id (ICAO24) is required');
    }

    // Get API key
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.error('No API key available');
      return errors.internal('API configuration error');
    }

    // Fetch flight details from AeroDataBox via API.Market
    const flightDetails = await fetchFlightDetails(aircraftId.toUpperCase(), apiKey);

    if (!flightDetails) {
      return errors.notFound('Flight');
    }

    return success(flightDetails);

  } catch (error) {
    console.error('Error:', error);
    return errors.internal(error.message);
  }
};

async function getAdminConfig() {
  const now = Date.now();
  if (cachedConfig && (now - configLastFetched) < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const response = await dynamodb.send(new GetItemCommand({
      TableName: CONFIG_TABLE,
      Key: { config_type: { S: 'api_controls' } }
    }));

    if (response.Item) {
      cachedConfig = unmarshall(response.Item);
      configLastFetched = now;
      return cachedConfig;
    }
  } catch (error) {
    console.error('Error fetching admin config:', error);
  }

  // Default to enabled if can't fetch config
  return {
    master_enabled: true,
    aerodatabox_enabled: true
  };
}

async function getApiKey() {
  if (cachedApiKey) return cachedApiKey;

  try {
    // Try API.Market key first, fall back to RapidAPI key
    const response = await ssm.send(new GetParameterCommand({
      Name: 'aerologue-apimarket-key',
      WithDecryption: true
    }));
    cachedApiKey = response.Parameter.Value;
    return cachedApiKey;
  } catch (error) {
    console.error('Error fetching API.Market key:', error);
    return null;
  }
}

async function fetchFlightDetails(icao24, apiKey) {
  try {
    // Search for flight by ICAO24 hex code using API.Market endpoint
    // Format: /flights/Icao24/{icao24}?withAircraftImage=false&withLocation=false
    const url = `${API_MARKET_BASE_URL}/flights/Icao24/${icao24}?withAircraftImage=false&withLocation=false`;

    console.log(`Fetching flight details for ICAO24: ${icao24}`);
    console.log(`URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'x-api-market-key': apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No flight found for ICAO24: ${icao24}`);
        return null;
      }
      const errorText = await response.text();
      console.error(`AeroDataBox API error: ${response.status} - ${errorText}`);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('AeroDataBox response:', JSON.stringify(data, null, 2));

    // Track successful API call
    await trackApiUsage('aerodatabox', true);

    // AeroDataBox returns an array of flights
    // Get the most recent/active flight
    const flights = Array.isArray(data) ? data : [data];

    if (flights.length === 0) {
      return null;
    }

    // Find the most relevant flight (active or most recent)
    const flight = flights.find(f => f.status === 'En-Route' || f.status === 'Active')
                   || flights[0];

    // Extract and normalize flight information
    return {
      aircraft_id: icao24,
      flight_number: flight.number || null,
      callsign: flight.callSign || null,
      airline: flight.airline ? {
        name: flight.airline.name,
        iata: flight.airline.iata,
        icao: flight.airline.icao
      } : null,
      aircraft: flight.aircraft ? {
        registration: flight.aircraft.reg,
        model: flight.aircraft.model,
        type: flight.aircraft.modeS
      } : null,
      departure: flight.departure ? {
        airport_iata: flight.departure.airport?.iata || null,
        airport_icao: flight.departure.airport?.icao || null,
        airport_name: flight.departure.airport?.name || null,
        scheduled: flight.departure.scheduledTime?.utc || null,
        actual: flight.departure.actualTime?.utc || null,
        terminal: flight.departure.terminal || null,
        gate: flight.departure.gate || null
      } : null,
      arrival: flight.arrival ? {
        airport_iata: flight.arrival.airport?.iata || null,
        airport_icao: flight.arrival.airport?.icao || null,
        airport_name: flight.arrival.airport?.name || null,
        scheduled: flight.arrival.scheduledTime?.utc || null,
        estimated: flight.arrival.estimatedTime?.utc || null,
        terminal: flight.arrival.terminal || null,
        gate: flight.arrival.gate || null
      } : null,
      status: flight.status || null,
      is_cargo: flight.isCargo || false,
      fetched_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching from AeroDataBox:', error);
    // Track failed API call
    await trackApiUsage('aerodatabox', false);
    throw error;
  }
}
