// Aerologue Trail Store Lambda
// Fetches flight positions and stores them in S3 for trail visualization
// Triggered every 30 seconds by EventBridge

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const s3 = new S3Client({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const ssm = new SSMClient({ region: 'us-east-1' });

const TRAILS_BUCKET = 'aerologue-trails';
const INDEX_TABLE = 'aerologue-trail-index';
const CONFIG_TABLE = 'aerologue-admin-config';

// Cache for API key and config
let cachedApiKey = null;
let cachedConfig = null;
let configLastFetched = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

export const handler = async (event) => {
  console.log('Trail store triggered:', new Date().toISOString());

  try {
    // Check if trail storage is enabled
    const config = await getAdminConfig();
    if (!config.master_enabled || !config.trail_storage_enabled) {
      console.log('Trail storage disabled by admin config');
      return { statusCode: 200, body: 'Trail storage disabled' };
    }

    // Check if ADS-B API is enabled
    if (!config.adsb_exchange_enabled) {
      console.log('ADS-B Exchange API disabled by admin config');
      return { statusCode: 200, body: 'ADS-B API disabled' };
    }

    // Get API key
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.error('No API key available');
      return { statusCode: 500, body: 'No API key' };
    }

    // Fetch flights from all regions
    const flights = await fetchAllFlights(apiKey);
    console.log(`Fetched ${flights.length} flights`);

    if (flights.length === 0) {
      return { statusCode: 200, body: 'No flights to store' };
    }

    // Store positions in S3
    const stored = await storePositions(flights);
    console.log(`Stored positions for ${stored} aircraft`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        flights_fetched: flights.length,
        positions_stored: stored,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in trail store:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
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
    trail_storage_enabled: true,
    adsb_exchange_enabled: true
  };
}

async function getApiKey() {
  if (cachedApiKey) return cachedApiKey;

  try {
    const response = await ssm.send(new GetParameterCommand({
      Name: 'aerologue-rapidapi-key',
      WithDecryption: true
    }));
    cachedApiKey = response.Parameter.Value;
    return cachedApiKey;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}

async function fetchAllFlights(apiKey) {
  // Define global regions for comprehensive coverage
  const regions = [
    { name: 'North America', bounds: { lat1: 25, lon1: -130, lat2: 50, lon2: -65 } },
    { name: 'Europe', bounds: { lat1: 35, lon1: -10, lat2: 60, lon2: 40 } },
    { name: 'Asia Pacific', bounds: { lat1: 10, lon1: 100, lat2: 45, lon2: 145 } },
    { name: 'Middle East', bounds: { lat1: 15, lon1: 30, lat2: 40, lon2: 65 } },
    { name: 'South America', bounds: { lat1: -55, lon1: -80, lat2: 15, lon2: -35 } },
    { name: 'Africa', bounds: { lat1: -35, lon1: -20, lat2: 40, lon2: 55 } },
    { name: 'Australia', bounds: { lat1: -45, lon1: 110, lat2: -10, lon2: 155 } },
    { name: 'Atlantic', bounds: { lat1: 30, lon1: -60, lat2: 60, lon2: -10 } }
  ];

  const allFlights = new Map(); // Use Map to dedupe by ICAO24

  // Fetch from ADS-B Exchange for each region
  for (const region of regions) {
    try {
      const { lat1, lon1, lat2, lon2 } = region.bounds;
      const url = `https://adsbexchange-com1.p.rapidapi.com/v2/lat/${(lat1 + lat2) / 2}/lon/${(lon1 + lon2) / 2}/dist/500/`;

      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'adsbexchange-com1.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ac && Array.isArray(data.ac)) {
          for (const aircraft of data.ac) {
            if (aircraft.hex && aircraft.lat && aircraft.lon) {
              // Normalize the data
              allFlights.set(aircraft.hex.toUpperCase(), {
                aircraft_id: aircraft.hex.toUpperCase(),
                callsign: aircraft.flight?.trim() || null,
                lat: aircraft.lat,
                lon: aircraft.lon,
                alt: aircraft.alt_baro || aircraft.alt_geom || 0,
                hdg: aircraft.track || 0,
                spd: aircraft.gs || 0,
                vr: aircraft.baro_rate || 0,
                on_ground: aircraft.alt_baro === 'ground' || aircraft.on_ground || false,
                ts: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${region.name}:`, error.message);
    }

    // Small delay between regions to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return Array.from(allFlights.values());
}

async function storePositions(flights) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourStr = now.getUTCHours().toString().padStart(2, '0');
  const dateHour = `${dateStr}#${hourStr}`;

  let storedCount = 0;

  // Group flights into batches for efficient storage
  // Store each aircraft's position in its own file (append to existing)
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < flights.length; i += batchSize) {
    batches.push(flights.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(async (flight) => {
      try {
        const s3Key = `${dateStr}/${hourStr}/${flight.aircraft_id}.json`;

        // Try to get existing data for this hour
        let existingData = { positions: [] };
        try {
          const existing = await s3.send(new GetObjectCommand({
            Bucket: TRAILS_BUCKET,
            Key: s3Key
          }));
          const body = await existing.Body.transformToString();
          existingData = JSON.parse(body);
        } catch (e) {
          // File doesn't exist yet, use empty array
        }

        // Add new position
        existingData.positions.push({
          ts: flight.ts,
          lat: flight.lat,
          lon: flight.lon,
          alt: flight.alt,
          hdg: flight.hdg,
          spd: flight.spd
        });

        // Keep only last 120 positions per hour (1 hour at 30-sec intervals)
        if (existingData.positions.length > 120) {
          existingData.positions = existingData.positions.slice(-120);
        }

        // Store updated data
        await s3.send(new PutObjectCommand({
          Bucket: TRAILS_BUCKET,
          Key: s3Key,
          Body: JSON.stringify(existingData),
          ContentType: 'application/json'
        }));

        // Update index
        await dynamodb.send(new PutItemCommand({
          TableName: INDEX_TABLE,
          Item: {
            aircraft_id: { S: flight.aircraft_id },
            date_hour: { S: dateHour },
            s3_key: { S: s3Key },
            callsign: { S: flight.callsign || 'UNKNOWN' },
            point_count: { N: existingData.positions.length.toString() },
            last_lat: { N: flight.lat.toString() },
            last_lon: { N: flight.lon.toString() },
            last_alt: { N: flight.alt.toString() },
            updated_at: { S: flight.ts }
          }
        }));

        storedCount++;
      } catch (error) {
        console.error(`Error storing ${flight.aircraft_id}:`, error.message);
      }
    }));
  }

  return storedCount;
}
