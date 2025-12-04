// Aerologue Trail Get Lambda
// Retrieves flight trail data from S3 for visualization

import { success, errors, corsResponse } from './response.mjs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const s3 = new S3Client({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

const TRAILS_BUCKET = 'aerologue-trails';
const INDEX_TABLE = 'aerologue-trail-index';

export const handler = async (event) => {
  console.log('Trail get request:', JSON.stringify(event, null, 2));

  const method = event.requestContext?.http?.method || event.httpMethod;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    // Get aircraft_id from path parameter
    const pathParams = event.pathParameters || {};
    const aircraftId = pathParams.aircraft_id || pathParams.aircraftId;

    if (!aircraftId) {
      return errors.badRequest('aircraft_id is required');
    }

    // Get query parameters for time range
    const queryParams = event.queryStringParameters || {};
    const hours = parseInt(queryParams.hours) || 1; // Default 1 hour
    const maxHours = 24; // Maximum 24 hours of trail

    const hoursToFetch = Math.min(hours, maxHours);

    // Get trail data
    const trail = await getTrail(aircraftId.toUpperCase(), hoursToFetch);

    return success({
      aircraft_id: aircraftId.toUpperCase(),
      trail: trail.positions,
      point_count: trail.positions.length,
      hours_fetched: hoursToFetch,
      callsign: trail.callsign
    });

  } catch (error) {
    console.error('Error:', error);
    return errors.internal(error.message);
  }
};

async function getTrail(aircraftId, hours) {
  const now = new Date();
  const positions = [];
  let callsign = null;

  // Generate date_hour keys for the requested time range
  const dateHours = [];
  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const dateStr = time.toISOString().split('T')[0];
    const hourStr = time.getUTCHours().toString().padStart(2, '0');
    dateHours.push(`${dateStr}#${hourStr}`);
  }

  // Query the index to get S3 keys
  const indexEntries = [];
  for (const dateHour of dateHours) {
    try {
      const response = await dynamodb.send(new QueryCommand({
        TableName: INDEX_TABLE,
        KeyConditionExpression: 'aircraft_id = :aid AND date_hour = :dh',
        ExpressionAttributeValues: {
          ':aid': { S: aircraftId },
          ':dh': { S: dateHour }
        }
      }));

      if (response.Items && response.Items.length > 0) {
        const item = unmarshall(response.Items[0]);
        indexEntries.push(item);
        if (item.callsign && item.callsign !== 'UNKNOWN') {
          callsign = item.callsign;
        }
      }
    } catch (error) {
      console.error(`Error querying index for ${dateHour}:`, error.message);
    }
  }

  // Fetch S3 objects in parallel
  const s3Fetches = indexEntries.map(async (entry) => {
    try {
      const response = await s3.send(new GetObjectCommand({
        Bucket: TRAILS_BUCKET,
        Key: entry.s3_key
      }));
      const body = await response.Body.transformToString();
      const data = JSON.parse(body);
      return data.positions || [];
    } catch (error) {
      console.error(`Error fetching S3 ${entry.s3_key}:`, error.message);
      return [];
    }
  });

  const results = await Promise.all(s3Fetches);

  // Merge all positions
  for (const positionArray of results) {
    positions.push(...positionArray);
  }

  // Sort by timestamp and remove duplicates
  positions.sort((a, b) => new Date(a.ts) - new Date(b.ts));

  // Deduplicate by timestamp (keep first occurrence)
  const seen = new Set();
  const uniquePositions = positions.filter(pos => {
    const key = pos.ts;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    positions: uniquePositions,
    callsign
  };
}
