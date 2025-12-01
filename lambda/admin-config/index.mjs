// Aerologue Admin Config Lambda
// Manages API controls and kill switches

import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const TABLE_NAME = 'aerologue-admin-config';
const CONFIG_KEY = 'api_controls';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event) => {
  console.log('Admin config request:', JSON.stringify(event, null, 2));

  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.requestContext?.http?.path || event.path;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // GET /admin/config - Get current API controls
    if (method === 'GET' && path.includes('/config')) {
      return await getConfig();
    }

    // PUT /admin/config - Update API controls
    if (method === 'PUT' && path.includes('/config')) {
      const body = JSON.parse(event.body || '{}');
      return await updateConfig(body);
    }

    // PUT /admin/config/master - Quick toggle for master switch
    if (method === 'PUT' && path.includes('/master')) {
      const body = JSON.parse(event.body || '{}');
      return await updateMasterSwitch(body.enabled);
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

async function getConfig() {
  const response = await dynamodb.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: { config_type: { S: CONFIG_KEY } }
  }));

  if (!response.Item) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Config not found' })
    };
  }

  const config = unmarshall(response.Item);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data: {
        master_enabled: config.master_enabled,
        adsb_exchange_enabled: config.adsb_exchange_enabled,
        aerodatabox_enabled: config.aerodatabox_enabled,
        opensky_enabled: config.opensky_enabled,
        trail_storage_enabled: config.trail_storage_enabled,
        updated_at: config.updated_at,
        updated_by: config.updated_by
      }
    })
  };
}

async function updateConfig(updates) {
  // Validate input - only allow specific fields to be updated
  const allowedFields = [
    'master_enabled',
    'adsb_exchange_enabled',
    'aerodatabox_enabled',
    'opensky_enabled',
    'trail_storage_enabled'
  ];

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const field of allowedFields) {
    if (typeof updates[field] === 'boolean') {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = { BOOL: updates[field] };
    }
  }

  if (updateExpressions.length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'No valid fields to update' })
    };
  }

  // Add timestamp
  updateExpressions.push('#updated_at = :updated_at');
  expressionAttributeNames['#updated_at'] = 'updated_at';
  expressionAttributeValues[':updated_at'] = { S: new Date().toISOString() };

  // Add updater (would come from auth in production)
  updateExpressions.push('#updated_by = :updated_by');
  expressionAttributeNames['#updated_by'] = 'updated_by';
  expressionAttributeValues[':updated_by'] = { S: updates.updated_by || 'admin' };

  await dynamodb.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { config_type: { S: CONFIG_KEY } },
    UpdateExpression: 'SET ' + updateExpressions.join(', '),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }));

  // Return updated config
  return await getConfig();
}

async function updateMasterSwitch(enabled) {
  if (typeof enabled !== 'boolean') {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'enabled must be a boolean' })
    };
  }

  await dynamodb.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { config_type: { S: CONFIG_KEY } },
    UpdateExpression: 'SET #master = :master, #updated_at = :updated_at, #updated_by = :updated_by',
    ExpressionAttributeNames: {
      '#master': 'master_enabled',
      '#updated_at': 'updated_at',
      '#updated_by': 'updated_by'
    },
    ExpressionAttributeValues: {
      ':master': { BOOL: enabled },
      ':updated_at': { S: new Date().toISOString() },
      ':updated_by': { S: 'admin_quick_toggle' }
    }
  }));

  return await getConfig();
}

// Helper function for other Lambdas to check if API is enabled
// Export for use by other Lambda functions
export async function isApiEnabled(apiName) {
  try {
    const response = await dynamodb.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: { config_type: { S: CONFIG_KEY } }
    }));

    if (!response.Item) {
      console.warn('Admin config not found, defaulting to enabled');
      return true;
    }

    const config = unmarshall(response.Item);

    // Master switch overrides everything
    if (!config.master_enabled) {
      return false;
    }

    // Check specific API
    const fieldName = `${apiName}_enabled`;
    if (typeof config[fieldName] === 'boolean') {
      return config[fieldName];
    }

    // Default to enabled if not found
    return true;
  } catch (error) {
    console.error('Error checking API status:', error);
    // Default to enabled on error to avoid breaking functionality
    return true;
  }
}
