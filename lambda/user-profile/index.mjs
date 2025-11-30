// Aerologue User Profile Lambda
// Handles user profile CRUD operations with DynamoDB
// Also serves as Cognito Post Confirmation trigger

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'aerologue-user-profiles';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/**
 * Cognito Post Confirmation Trigger
 * Creates a new user profile in DynamoDB after email verification
 */
async function handleCognitoTrigger(event) {
  console.log('Cognito trigger event:', JSON.stringify(event));

  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const name = event.request.userAttributes.name || email.split('@')[0];

  const profile = {
    user_id: userId,
    email: email,
    display_name: name,
    avatar_url: null,
    settings: {
      language: 'en',
      timezone: 'UTC',
      distanceUnit: 'km',
      notifications: {
        crossings: true,
        greetings: true,
        achievements: true,
        flightUpdates: true,
      },
      privacy: {
        showOnCrossing: true,
        locationSharing: true,
        profileVisibility: 'friends',
      },
      factoids: {
        deliveryLevel: 'normal',
        categories: [],
      },
    },
    stats: {
      totalFlights: 0,
      totalCrossings: 0,
      totalMessages: 0,
      totalPoints: 0,
      level: 1,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: profile,
      ConditionExpression: 'attribute_not_exists(user_id)',
    }));
    console.log('Created user profile:', userId);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('User profile already exists:', userId);
    } else {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }

  // Return event unchanged for Cognito
  return event;
}

/**
 * Get user profile by ID
 */
async function getProfile(userId) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { user_id: userId },
  }));
  return result.Item || null;
}

/**
 * Update user profile
 */
async function updateProfile(userId, updates) {
  const updateExpressions = [];
  const expressionNames = {};
  const expressionValues = {};

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'user_id') {
      updateExpressions.push(`#${key} = :${key}`);
      expressionNames[`#${key}`] = key;
      expressionValues[`:${key}`] = value;
    }
  });

  updateExpressions.push('#updated_at = :updated_at');
  expressionNames['#updated_at'] = 'updated_at';
  expressionValues[':updated_at'] = new Date().toISOString();

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { user_id: userId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  }));

  return result.Attributes;
}

/**
 * Main handler
 */
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  // Handle Cognito trigger
  if (event.triggerSource) {
    return handleCognitoTrigger(event);
  }

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.requestContext?.http?.method || 'GET';
  const pathParams = event.pathParameters || {};
  const userId = pathParams.userId;

  try {
    switch (method) {
      case 'GET': {
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'userId is required' }),
          };
        }
        const profile = await getProfile(userId);
        if (!profile) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'User not found' }),
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(profile),
        };
      }

      case 'PUT': {
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'userId is required' }),
          };
        }
        const updates = JSON.parse(event.body || '{}');
        const updated = await updateProfile(userId, updates);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updated),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
