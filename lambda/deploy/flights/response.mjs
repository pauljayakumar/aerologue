/**
 * Aerologue API - Standardized Response Envelope
 *
 * All API responses follow this format:
 * {
 *   success: boolean,
 *   data: any | null,
 *   error: { code: string, message: string } | null,
 *   meta: { timestamp: string, requestId: string, ... }
 * }
 */

// CORS headers for all responses
export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/**
 * Creates a successful response
 * @param {any} data - The response data
 * @param {object} meta - Additional metadata (pagination, counts, etc.)
 * @param {number} statusCode - HTTP status code (default 200)
 */
export function success(data, meta = {}, statusCode = 200) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    }),
  };
}

/**
 * Creates an error response
 * @param {string} code - Error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR')
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {object} details - Additional error details
 */
export function error(code, message, statusCode = 400, details = null) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      success: false,
      data: null,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    }),
  };
}

/**
 * Common error responses
 */
export const errors = {
  badRequest: (message = 'Bad request', details = null) =>
    error('BAD_REQUEST', message, 400, details),

  unauthorized: (message = 'Unauthorized') =>
    error('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Forbidden') =>
    error('FORBIDDEN', message, 403),

  notFound: (resource = 'Resource') =>
    error('NOT_FOUND', `${resource} not found`, 404),

  methodNotAllowed: () =>
    error('METHOD_NOT_ALLOWED', 'Method not allowed', 405),

  conflict: (message = 'Resource already exists') =>
    error('CONFLICT', message, 409),

  tooManyRequests: (message = 'Rate limit exceeded') =>
    error('RATE_LIMIT_EXCEEDED', message, 429),

  internal: (message = 'Internal server error') =>
    error('INTERNAL_ERROR', message, 500),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    error('SERVICE_UNAVAILABLE', message, 503),
};

/**
 * CORS preflight response
 */
export function corsResponse() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: '',
  };
}

/**
 * Extracts request context from Lambda event
 * @param {object} event - Lambda event object
 */
export function getRequestContext(event) {
  return {
    method: event.requestContext?.http?.method || event.httpMethod || 'GET',
    path: event.requestContext?.http?.path || event.path || '/',
    pathParams: event.pathParameters || {},
    queryParams: event.queryStringParameters || {},
    headers: event.headers || {},
    body: event.body ? JSON.parse(event.body) : null,
    requestId: event.requestContext?.requestId || null,
    // JWT claims from Cognito authorizer
    claims: event.requestContext?.authorizer?.jwt?.claims || null,
    userId: event.requestContext?.authorizer?.jwt?.claims?.sub || null,
  };
}

/**
 * Validates required fields in request body
 * @param {object} body - Request body
 * @param {string[]} required - Required field names
 * @returns {object|null} - Error response if validation fails, null if valid
 */
export function validateRequired(body, required) {
  const missing = required.filter(field => !body || body[field] === undefined);
  if (missing.length > 0) {
    return errors.badRequest(`Missing required fields: ${missing.join(', ')}`, { missing });
  }
  return null;
}
