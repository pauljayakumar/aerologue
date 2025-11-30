# Testing Strategy

**Document ID:** TEST-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## TEST-001.0 - Overview

This document defines the testing strategy for Aerologue across all platforms and services.

### Testing Pyramid

```
                    ┌───────────┐
                   /   E2E     \         5% of tests
                  /   Tests    \         Slow, expensive
                 /─────────────────\
                /   Integration    \     15% of tests
               /      Tests        \     Medium speed
              /─────────────────────────\
             /        Unit Tests        \  80% of tests
            /                            \ Fast, cheap
           └──────────────────────────────┘
```

### Quality Gates

| Gate | When | Tests Run | Pass Criteria |
|------|------|-----------|---------------|
| Pre-commit | Before commit | Unit tests (affected) | 100% pass |
| PR | Pull request | All unit + integration | 100% pass, coverage ≥80% |
| Staging | Pre-deploy | All tests + E2E | 100% pass |
| Production | Post-deploy | Smoke tests | 100% pass |

---

## TEST-002.0 - Unit Testing

### Coverage Requirements

| Component | Minimum Coverage | Target Coverage |
|-----------|------------------|-----------------|
| Business Logic | 90% | 95% |
| API Handlers | 85% | 90% |
| Data Models | 80% | 90% |
| Utilities | 90% | 95% |
| UI Components | 70% | 80% |

### Unit Test Guidelines

```javascript
// Good unit test characteristics:
// - Fast (< 100ms)
// - Isolated (no external dependencies)
// - Repeatable (same result every time)
// - Self-validating (pass/fail is clear)
// - Timely (written with the code)

// Example: Testing flight crossing detection
describe('FlightCrossingDetector', () => {
  describe('detectCrossing', () => {
    it('should detect crossing when flights are within 20 miles', () => {
      const flight1 = createMockFlight({ lat: 40.0, lon: -74.0, alt: 35000 });
      const flight2 = createMockFlight({ lat: 40.1, lon: -74.1, alt: 36000 });

      const result = detectCrossing(flight1, flight2);

      expect(result.isCrossing).toBe(true);
      expect(result.distance).toBeLessThan(20);
    });

    it('should not detect crossing when flights are beyond 20 miles', () => {
      const flight1 = createMockFlight({ lat: 40.0, lon: -74.0, alt: 35000 });
      const flight2 = createMockFlight({ lat: 41.0, lon: -75.0, alt: 36000 });

      const result = detectCrossing(flight1, flight2);

      expect(result.isCrossing).toBe(false);
    });

    it('should not detect crossing when altitude difference exceeds 5000ft', () => {
      const flight1 = createMockFlight({ lat: 40.0, lon: -74.0, alt: 35000 });
      const flight2 = createMockFlight({ lat: 40.05, lon: -74.05, alt: 41000 });

      const result = detectCrossing(flight1, flight2);

      expect(result.isCrossing).toBe(false);
    });
  });
});
```

### Mocking Strategy

| Dependency | Mocking Approach |
|------------|------------------|
| Database | In-memory mock / Test containers |
| External APIs | Mock server (MSW, nock) |
| Time | Fake timers (Jest) |
| Randomness | Seeded RNG |
| File system | Memory FS |

---

## TEST-003.0 - Integration Testing

### Integration Test Scope

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION TEST BOUNDARY                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │   Lambda Handler  ←→  Database (DynamoDB Local)            ││
│  │         ↓                                                   ││
│  │   Business Logic  ←→  Cache (Redis Test Container)         ││
│  │         ↓                                                   ││
│  │   External APIs   ←→  Mock Server (MSW)                    ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│  Real: Lambda, Business Logic, Data Access                      │
│  Mocked: External APIs, Third-party services                    │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Test Examples

```javascript
// API Integration Test
describe('POST /api/v1/flights/:id/track', () => {
  let testDb;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  it('should add flight to user tracking list', async () => {
    // Arrange
    const user = await testDb.createUser({ email: 'test@example.com' });
    const token = generateTestToken(user.id);

    // Act
    const response = await request(app)
      .post('/api/v1/flights/AA123/track')
      .set('Authorization', `Bearer ${token}`)
      .send();

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.tracking).toBe(true);

    const tracking = await testDb.getTracking(user.id, 'AA123');
    expect(tracking).toBeDefined();
  });

  it('should return 401 for unauthenticated request', async () => {
    const response = await request(app)
      .post('/api/v1/flights/AA123/track')
      .send();

    expect(response.status).toBe(401);
  });

  it('should return 429 when tracking limit exceeded', async () => {
    const user = await testDb.createUser({ email: 'test@example.com' });
    const token = generateTestToken(user.id);

    // Add max flights
    for (let i = 0; i < 10; i++) {
      await testDb.addTracking(user.id, `FL${i}`);
    }

    const response = await request(app)
      .post('/api/v1/flights/AA123/track')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('FLIGHT_TRACKING_LIMIT');
  });
});
```

### Database Testing

```javascript
// DynamoDB Local for integration tests
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const testClient = new DynamoDBClient({
  endpoint: 'http://localhost:8000',  // DynamoDB Local
  region: 'local',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

const docClient = DynamoDBDocumentClient.from(testClient);
```

---

## TEST-004.0 - End-to-End Testing

### E2E Test Scope

| Flow | Priority | Frequency |
|------|----------|-----------|
| User registration | Critical | Every deploy |
| User login (email) | Critical | Every deploy |
| User login (social) | High | Daily |
| Flight search & track | Critical | Every deploy |
| Crossing detection | Critical | Every deploy |
| Send greeting | High | Every deploy |
| Quiz game play | Medium | Daily |
| Account deletion | High | Weekly |

### E2E Test Framework

**Web:** Playwright
**Mobile (Flutter):** Integration tests + Flutter Driver
**API:** Supertest + custom assertions

### Playwright E2E Example

```javascript
// tests/e2e/flight-tracking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flight Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('should search and track a flight', async ({ page }) => {
    // Search for flight
    await page.fill('[data-testid="flight-search"]', 'AA123');
    await page.click('[data-testid="search-button"]');

    // Verify search results
    await expect(page.locator('[data-testid="flight-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="flight-number"]')).toHaveText('AA123');

    // Track the flight
    await page.click('[data-testid="track-button"]');

    // Verify tracking started
    await expect(page.locator('[data-testid="tracking-status"]')).toHaveText('Tracking');
    await expect(page.locator('[data-testid="map-marker"]')).toBeVisible();
  });

  test('should display real-time position updates', async ({ page }) => {
    // Navigate to tracked flight
    await page.goto('/flights/AA123');

    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="ws-connected"]');

    // Capture initial position
    const initialLat = await page.locator('[data-testid="latitude"]').textContent();

    // Wait for update (mock server sends update every 2s in test mode)
    await page.waitForTimeout(3000);

    // Verify position changed
    const updatedLat = await page.locator('[data-testid="latitude"]').textContent();
    expect(updatedLat).not.toBe(initialLat);
  });
});
```

### Visual Regression Testing

```javascript
// Visual comparison for UI components
test('flight card should match snapshot', async ({ page }) => {
  await page.goto('/flights/AA123');

  const flightCard = page.locator('[data-testid="flight-card"]');
  await expect(flightCard).toHaveScreenshot('flight-card.png');
});
```

---

## TEST-005.0 - API Testing

### API Test Categories

| Category | Tools | Scope |
|----------|-------|-------|
| Contract Testing | Pact | API contracts between services |
| Load Testing | k6, Artillery | Performance under load |
| Security Testing | OWASP ZAP | Vulnerability scanning |
| Smoke Testing | Custom scripts | Basic health checks |

### Contract Testing Example

```javascript
// Pact consumer test
const { Pact } = require('@pact-foundation/pact');

describe('Flight API Consumer', () => {
  const provider = new Pact({
    consumer: 'WebApp',
    provider: 'FlightAPI',
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /api/v1/flights/:id', () => {
    beforeAll(() => {
      return provider.addInteraction({
        state: 'flight AA123 exists',
        uponReceiving: 'a request for flight AA123',
        withRequest: {
          method: 'GET',
          path: '/api/v1/flights/AA123',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            flightId: 'AA123',
            airline: 'American Airlines',
            origin: 'JFK',
            destination: 'LAX',
            status: 'in_flight',
          },
        },
      });
    });

    it('should return flight details', async () => {
      const response = await flightClient.getFlight('AA123');
      expect(response.flightId).toBe('AA123');
    });
  });
});
```

### Load Testing Example (k6)

```javascript
// load-tests/flight-tracking.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { WebSocket } from 'k6/experimental/websockets';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  // Search for flight
  const searchRes = http.get('https://api.aerologue.app/v1/flights/search?q=AA123');
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Get flight details
  const flightRes = http.get('https://api.aerologue.app/v1/flights/AA123');
  check(flightRes, {
    'flight status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## TEST-006.0 - Mobile Testing (Flutter)

### Test Types

| Type | Framework | When |
|------|-----------|------|
| Unit | flutter_test | Every commit |
| Widget | flutter_test | Every commit |
| Integration | integration_test | PR, Staging |
| Golden | golden_toolkit | Weekly |

### Flutter Test Example

```dart
// Unit test
void main() {
  group('FlightModel', () {
    test('fromJson parses correctly', () {
      final json = {
        'flightId': 'AA123',
        'latitude': 40.7128,
        'longitude': -74.0060,
      };

      final flight = FlightModel.fromJson(json);

      expect(flight.flightId, 'AA123');
      expect(flight.latitude, 40.7128);
    });
  });
}

// Widget test
void main() {
  testWidgets('FlightCard displays flight info', (tester) async {
    final flight = FlightModel(
      flightId: 'AA123',
      airline: 'American Airlines',
      origin: 'JFK',
      destination: 'LAX',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: FlightCard(flight: flight),
      ),
    );

    expect(find.text('AA123'), findsOneWidget);
    expect(find.text('JFK → LAX'), findsOneWidget);
  });
}

// Integration test
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete flight tracking flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Login
    await tester.enterText(find.byKey(Key('email')), 'test@example.com');
    await tester.enterText(find.byKey(Key('password')), 'TestPass123!');
    await tester.tap(find.byKey(Key('loginButton')));
    await tester.pumpAndSettle();

    // Search flight
    await tester.enterText(find.byKey(Key('flightSearch')), 'AA123');
    await tester.tap(find.byKey(Key('searchButton')));
    await tester.pumpAndSettle();

    // Verify result
    expect(find.text('AA123'), findsOneWidget);
  });
}
```

---

## TEST-007.0 - Test Data Management

### Test Data Strategy

| Environment | Data Source | Refresh |
|-------------|-------------|---------|
| Unit tests | Factories/Fixtures | N/A |
| Integration | Seeded test database | Per test |
| E2E (Staging) | Anonymized prod copy | Weekly |
| Load testing | Generated data | Per run |

### Test Data Factory

```javascript
// factories/flight.factory.js
const { faker } = require('@faker-js/faker');

const createFlight = (overrides = {}) => ({
  flightId: faker.airline.flightNumber(),
  airline: faker.airline.airline().name,
  origin: faker.airline.airport().iataCode,
  destination: faker.airline.airport().iataCode,
  status: faker.helpers.arrayElement(['scheduled', 'in_flight', 'landed']),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude(),
  altitude: faker.number.int({ min: 20000, max: 45000 }),
  speed: faker.number.int({ min: 400, max: 600 }),
  ...overrides,
});

const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  displayName: faker.person.firstName(),
  createdAt: faker.date.past(),
  ...overrides,
});

module.exports = { createFlight, createUser };
```

---

## TEST-008.0 - CI/CD Integration

### Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      dynamodb:
        image: amazon/dynamodb-local
        ports:
          - 8000:8000
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    needs: [unit, integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Reporting

```javascript
// Jest configuration for reporting
module.exports = {
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'junit.xml',
    }],
    ['jest-html-reporters', {
      publicPath: 'reports/html',
      filename: 'report.html',
    }],
  ],
  coverageReporters: ['text', 'lcov', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## TEST-009.0 - Test Metrics

### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Code Coverage | ≥80% | Lines covered |
| Test Pass Rate | 100% | Passing / Total |
| Test Execution Time | <10 min | CI pipeline |
| Flaky Test Rate | <1% | Failures without code change |
| Bug Escape Rate | <5% | Bugs found in prod vs staging |

### Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST METRICS DASHBOARD                        │
├─────────────────────────────┬───────────────────────────────────┤
│  Code Coverage              │  Test Pass Rate                   │
│  ┌───────────────────────┐  │  ┌───────────────────────────┐   │
│  │ ████████████░░░ 85%   │  │  │ ████████████████ 100%    │   │
│  │ Target: 80%           │  │  │ 1,234 / 1,234 passed     │   │
│  └───────────────────────┘  │  └───────────────────────────┘   │
├─────────────────────────────┼───────────────────────────────────┤
│  CI Pipeline Time           │  Flaky Tests                      │
│  ┌───────────────────────┐  │  ┌───────────────────────────┐   │
│  │ Unit: 2m 34s          │  │  │ 3 tests flagged           │   │
│  │ Integration: 4m 12s   │  │  │ 0.2% flake rate           │   │
│  │ E2E: 8m 45s           │  │  │                           │   │
│  └───────────────────────┘  │  └───────────────────────────┘   │
└─────────────────────────────┴───────────────────────────────────┘
```

---

## References

- [CICD-001.0](cicd-pipeline.md) - CI/CD Pipeline
- [ERR-001.0](error-handling.md) - Error Handling
- Jest Documentation: https://jestjs.io/
- Playwright Documentation: https://playwright.dev/
- Flutter Testing: https://docs.flutter.dev/testing
