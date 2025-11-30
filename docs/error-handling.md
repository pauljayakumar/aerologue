# Error Handling Patterns

**Document ID:** ERR-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## ERR-001.0 - Overview

This document defines consistent error handling patterns across all Aerologue services.

### Principles

1. **Fail Fast** - Detect and report errors early
2. **Fail Gracefully** - Degrade functionality rather than crash
3. **Be Informative** - Provide actionable error messages
4. **Be Secure** - Never expose sensitive information in errors
5. **Be Consistent** - Same error format everywhere

---

## ERR-002.0 - Error Response Format

### Standard Error Response

All API errors return this structure:

```json
{
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "The requested flight could not be found",
    "details": "Flight AA123 is not currently active or does not exist",
    "requestId": "req_abc123def456",
    "timestamp": "2025-11-26T10:30:45.123Z",
    "path": "/api/v1/flights/AA123",
    "suggestions": [
      "Verify the flight number is correct",
      "Check if the flight is currently active"
    ]
  }
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `code` | Yes | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `message` | Yes | Human-readable summary (1 sentence) |
| `details` | No | Additional context (2-3 sentences max) |
| `requestId` | Yes | Unique request identifier for support/debugging |
| `timestamp` | Yes | ISO 8601 timestamp |
| `path` | Yes | Request path that caused error |
| `suggestions` | No | Actionable hints to resolve the error |

---

## ERR-003.0 - Error Code Catalog

### HTTP Status Code Mapping

| HTTP Status | Category | When to Use |
|-------------|----------|-------------|
| 400 | Bad Request | Invalid input, validation failures |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource state conflict (duplicate, etc.) |
| 422 | Unprocessable | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server errors |
| 502 | Bad Gateway | Upstream service failure |
| 503 | Service Unavailable | Temporary overload or maintenance |
| 504 | Gateway Timeout | Upstream service timeout |

### Application Error Codes

#### Authentication Errors (AUTH_*)

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | No token provided |
| `AUTH_TOKEN_EXPIRED` | 401 | Token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Token is malformed or invalid |
| `AUTH_TOKEN_REVOKED` | 401 | Token has been revoked |
| `AUTH_CREDENTIALS_INVALID` | 401 | Wrong username/password |
| `AUTH_MFA_REQUIRED` | 401 | Multi-factor auth needed |
| `AUTH_MFA_INVALID` | 401 | MFA code incorrect |
| `AUTH_SESSION_EXPIRED` | 401 | Session has timed out |
| `AUTH_ACCOUNT_LOCKED` | 403 | Too many failed attempts |
| `AUTH_ACCOUNT_DISABLED` | 403 | Account has been disabled |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email verification required |

#### Authorization Errors (AUTHZ_*)

| Code | HTTP | Description |
|------|------|-------------|
| `AUTHZ_INSUFFICIENT_ROLE` | 403 | User role cannot perform action |
| `AUTHZ_RESOURCE_ACCESS_DENIED` | 403 | No access to specific resource |
| `AUTHZ_FEATURE_DISABLED` | 403 | Feature not available for user tier |
| `AUTHZ_GUEST_NOT_ALLOWED` | 403 | Action requires authenticated user |

#### Validation Errors (VAL_*)

| Code | HTTP | Description |
|------|------|-------------|
| `VAL_REQUIRED_FIELD` | 400 | Required field is missing |
| `VAL_INVALID_FORMAT` | 400 | Field format is incorrect |
| `VAL_OUT_OF_RANGE` | 400 | Value outside allowed range |
| `VAL_INVALID_ENUM` | 400 | Value not in allowed set |
| `VAL_TOO_LONG` | 400 | String exceeds max length |
| `VAL_TOO_SHORT` | 400 | String below min length |
| `VAL_INVALID_EMAIL` | 400 | Email format invalid |
| `VAL_INVALID_PHONE` | 400 | Phone format invalid |
| `VAL_INVALID_DATE` | 400 | Date format or value invalid |
| `VAL_INVALID_COORDINATES` | 400 | Lat/long values invalid |

#### Resource Errors (RES_*)

| Code | HTTP | Description |
|------|------|-------------|
| `RES_NOT_FOUND` | 404 | Resource doesn't exist |
| `RES_ALREADY_EXISTS` | 409 | Resource already exists |
| `RES_DELETED` | 410 | Resource was deleted |
| `RES_LOCKED` | 423 | Resource is locked |
| `RES_CONFLICT` | 409 | Conflicting state |

#### Flight-Specific Errors (FLIGHT_*)

| Code | HTTP | Description |
|------|------|-------------|
| `FLIGHT_NOT_FOUND` | 404 | Flight doesn't exist or not active |
| `FLIGHT_NOT_TRACKABLE` | 422 | Flight cannot be tracked (no ADS-B) |
| `FLIGHT_DATA_STALE` | 503 | Flight data temporarily unavailable |
| `FLIGHT_ALREADY_TRACKING` | 409 | User already tracking this flight |
| `FLIGHT_TRACKING_LIMIT` | 429 | Max concurrent tracking reached |

#### Crossing Errors (CROSSING_*)

| Code | HTTP | Description |
|------|------|-------------|
| `CROSSING_NOT_FOUND` | 404 | Crossing record not found |
| `CROSSING_EXPIRED` | 410 | Crossing window has closed |
| `CROSSING_NO_PARTICIPANTS` | 422 | No other participants available |

#### Greeting Errors (GREETING_*)

| Code | HTTP | Description |
|------|------|-------------|
| `GREETING_NOT_ALLOWED` | 403 | User cannot send greetings |
| `GREETING_WINDOW_CLOSED` | 410 | Greeting window expired |
| `GREETING_RECIPIENT_BLOCKED` | 403 | Recipient has blocked sender |
| `GREETING_RATE_LIMITED` | 429 | Too many greetings sent |

#### Rate Limit Errors (RATE_*)

| Code | HTTP | Description |
|------|------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit |
| `RATE_LIMIT_API` | 429 | API requests per minute |
| `RATE_LIMIT_AUTH` | 429 | Login attempts |
| `RATE_LIMIT_UPLOAD` | 429 | File uploads |

#### System Errors (SYS_*)

| Code | HTTP | Description |
|------|------|-------------|
| `SYS_INTERNAL_ERROR` | 500 | Unexpected error |
| `SYS_DATABASE_ERROR` | 500 | Database operation failed |
| `SYS_CACHE_ERROR` | 500 | Cache operation failed |
| `SYS_EXTERNAL_SERVICE` | 502 | Third-party API failure |
| `SYS_TIMEOUT` | 504 | Operation timed out |
| `SYS_MAINTENANCE` | 503 | Scheduled maintenance |
| `SYS_OVERLOADED` | 503 | System at capacity |

---

## ERR-004.0 - Validation Error Details

For validation errors, include field-level details:

```json
{
  "error": {
    "code": "VAL_INVALID_INPUT",
    "message": "Request validation failed",
    "requestId": "req_abc123",
    "timestamp": "2025-11-26T10:30:45Z",
    "path": "/api/v1/users/register",
    "validationErrors": [
      {
        "field": "email",
        "code": "VAL_INVALID_EMAIL",
        "message": "Email format is invalid",
        "value": "not-an-email"
      },
      {
        "field": "password",
        "code": "VAL_TOO_SHORT",
        "message": "Password must be at least 8 characters",
        "constraint": {"minLength": 8}
      },
      {
        "field": "birthDate",
        "code": "VAL_INVALID_DATE",
        "message": "Date must be in ISO 8601 format (YYYY-MM-DD)",
        "value": "26/11/2025"
      }
    ]
  }
}
```

---

## ERR-005.0 - Error Handling by Layer

### API Gateway Layer

```javascript
// API Gateway error handler (Lambda authorizer)
exports.handler = async (event) => {
  try {
    const token = extractToken(event);
    if (!token) {
      return generatePolicy('Deny', event.methodArn, {
        errorCode: 'AUTH_TOKEN_MISSING',
        message: 'Authorization header is required'
      });
    }
    // ... validate token
  } catch (error) {
    console.error('Auth error:', error);
    return generatePolicy('Deny', event.methodArn, {
      errorCode: 'AUTH_TOKEN_INVALID',
      message: 'Token validation failed'
    });
  }
};
```

### Lambda Function Layer

```javascript
// Standard Lambda error handling
exports.handler = async (event) => {
  const requestId = event.requestContext?.requestId || uuidv4();

  try {
    // Business logic
    const result = await processRequest(event);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return handleError(error, requestId, event.path);
  }
};

function handleError(error, requestId, path) {
  // Log full error for debugging
  console.error('Error:', {
    requestId,
    error: error.message,
    stack: error.stack,
    code: error.code
  });

  // Known application errors
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
          timestamp: new Date().toISOString(),
          path
        }
      })
    };
  }

  // Unknown errors - don't expose details
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: {
        code: 'SYS_INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
        timestamp: new Date().toISOString(),
        path
      }
    })
  };
}
```

### Custom Error Classes

```javascript
// Base application error
class AppError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Specific error types
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(
      'RES_NOT_FOUND',
      `${resource} not found`,
      404,
      `${resource} with ID '${id}' does not exist`
    );
  }
}

class ValidationError extends AppError {
  constructor(validationErrors) {
    super(
      'VAL_INVALID_INPUT',
      'Request validation failed',
      400
    );
    this.validationErrors = validationErrors;
  }
}

class AuthenticationError extends AppError {
  constructor(code, message) {
    super(code, message, 401);
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests',
      429,
      `Please retry after ${retryAfter} seconds`
    );
    this.retryAfter = retryAfter;
  }
}

// Usage
throw new NotFoundError('Flight', 'AA123');
throw new ValidationError([
  { field: 'email', code: 'VAL_INVALID_EMAIL', message: 'Invalid format' }
]);
```

---

## ERR-006.0 - Client-Side Error Handling

### Web/Flutter Error Handler

```javascript
// Centralized API error handler
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      handleApiError(error);
    } else {
      // Network error
      handleNetworkError(error);
    }
    throw error;
  }
}

function handleApiError(error) {
  switch (error.code) {
    case 'AUTH_TOKEN_EXPIRED':
      // Attempt token refresh
      return refreshTokenAndRetry();

    case 'AUTH_SESSION_EXPIRED':
      // Redirect to login
      return redirectToLogin();

    case 'RATE_LIMIT_EXCEEDED':
      // Show rate limit message with retry time
      return showRateLimitMessage(error.retryAfter);

    case 'SYS_MAINTENANCE':
      // Show maintenance page
      return showMaintenancePage();

    default:
      // Show user-friendly error
      showErrorToast(error.message);
  }
}

function handleNetworkError(error) {
  if (!navigator.onLine) {
    showOfflineMessage();
  } else {
    showConnectionError();
  }
}
```

### User-Friendly Error Messages

| Error Code | Technical Message | User Message |
|------------|-------------------|--------------|
| `FLIGHT_NOT_FOUND` | Flight AA123 not found | We couldn't find that flight. It may have landed or the flight number may be incorrect. |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | You're doing that too fast. Please wait a moment and try again. |
| `SYS_INTERNAL_ERROR` | Database connection failed | Something went wrong on our end. Please try again in a few moments. |
| `AUTH_TOKEN_EXPIRED` | JWT token expired | Your session has expired. Please sign in again. |
| `GREETING_WINDOW_CLOSED` | Greeting window expired | This crossing has ended. Greetings can only be sent while flights are near each other. |

---

## ERR-007.0 - Retry Patterns

### Exponential Backoff

```javascript
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    retryableErrors = ['SYS_INTERNAL_ERROR', 'SYS_TIMEOUT', 'SYS_OVERLOADED']
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (!retryableErrors.includes(error.code)) {
        throw error;
      }

      // Don't retry after last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailure = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new AppError(
          'SYS_CIRCUIT_OPEN',
          'Service temporarily unavailable',
          503
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage for external APIs
const adsbCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000
});

async function getFlightData(flightId) {
  return adsbCircuitBreaker.execute(() =>
    adsbApi.getFlight(flightId)
  );
}
```

---

## ERR-008.0 - WebSocket Error Handling

### WebSocket Error Messages

```json
{
  "type": "error",
  "payload": {
    "code": "WS_SUBSCRIPTION_INVALID",
    "message": "Invalid subscription parameters",
    "originalMessage": {
      "type": "subscribe",
      "payload": {"flightId": "invalid"}
    },
    "timestamp": "2025-11-26T10:30:45Z"
  }
}
```

### WebSocket Error Codes

| Code | Description | Client Action |
|------|-------------|---------------|
| `WS_AUTH_REQUIRED` | Connection requires auth | Send auth message |
| `WS_AUTH_FAILED` | Authentication failed | Re-authenticate |
| `WS_SUBSCRIPTION_INVALID` | Bad subscription params | Fix and resend |
| `WS_SUBSCRIPTION_LIMIT` | Too many subscriptions | Remove some subscriptions |
| `WS_MESSAGE_INVALID` | Malformed message | Fix message format |
| `WS_RATE_LIMITED` | Sending too fast | Slow down |
| `WS_SERVER_ERROR` | Internal error | Reconnect with backoff |

### Client Reconnection Logic

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseReconnectDelay = 1000;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.authenticate();
    };

    this.ws.onclose = (event) => {
      if (event.code !== 1000) {  // Not clean close
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'error') {
        this.handleError(message.payload);
      } else {
        this.handleMessage(message);
      }
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.showReconnectFailed();
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  handleError(error) {
    switch (error.code) {
      case 'WS_AUTH_FAILED':
        this.refreshAuthAndReconnect();
        break;
      case 'WS_RATE_LIMITED':
        this.throttleMessages();
        break;
      default:
        console.warn('WebSocket error:', error);
    }
  }
}
```

---

## ERR-009.0 - Logging Errors

### Error Log Format

```json
{
  "level": "ERROR",
  "timestamp": "2025-11-26T10:30:45.123Z",
  "service": "flight-processor",
  "requestId": "req_abc123",
  "userId": "user_456",
  "error": {
    "code": "SYS_DATABASE_ERROR",
    "message": "Failed to save flight position",
    "stack": "Error: Connection timeout\n    at Connection.query...",
    "cause": {
      "code": "ETIMEDOUT",
      "message": "Connection timed out after 30000ms"
    }
  },
  "context": {
    "flightId": "AA123",
    "operation": "savePosition",
    "attempt": 2
  }
}
```

### What to Log

| Log Level | What to Include | Example |
|-----------|-----------------|---------|
| ERROR | Full stack, context, user ID | Database failures, unhandled exceptions |
| WARN | Message, context | Rate limits, validation failures |
| INFO | Operation, duration | Successful operations (sampled) |
| DEBUG | Full request/response | Development only |

### What NOT to Log

- Passwords or tokens
- Full credit card numbers
- Personal health information
- Session tokens
- Private keys

---

## References

- [API-001.0](api-spec.md) - API Specifications
- [MON-001.0](monitoring-alerting.md) - Monitoring & Alerting
- [WS-001.0](websocket-spec.md) - WebSocket Specifications
