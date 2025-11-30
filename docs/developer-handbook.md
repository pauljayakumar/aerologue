# Developer Handbook

**Document ID:** DEV-001.0
**Last Updated:** 2025-11-27
**Status:** Draft

This document covers analytics, feature flags, code style, PR process, and SLAs.

---

## DEV-001.0 - Analytics Implementation

### Analytics Strategy

**Primary Tool:** AWS CloudWatch + Custom Metrics (start simple)
**Future:** Consider Mixpanel, Amplitude, or PostHog as user base grows

### Event Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Engagement** | User activity | screen_view, button_click, search |
| **Conversion** | Key actions | signup_complete, flight_tracked, greeting_sent |
| **Retention** | Return behavior | session_start, feature_used_again |
| **Performance** | Technical health | api_latency, error_occurred |
| **Business** | Revenue/growth | subscription_started, purchase_made |

### Core Events to Track

```javascript
// User Lifecycle
analytics.track('user_registered', { method: 'email' | 'google' | 'apple' });
analytics.track('user_logged_in', { method: 'email' | 'google' | 'apple' });
analytics.track('user_logged_out');
analytics.track('user_deleted_account');

// Flight Tracking
analytics.track('flight_searched', { query: 'AA123', results_count: 3 });
analytics.track('flight_tracked', { flight_id: 'AA123', is_on_flight: true });
analytics.track('flight_untracked', { flight_id: 'AA123' });

// Crossings & Social
analytics.track('crossing_detected', { crossing_id: 'xxx', distance_miles: 12 });
analytics.track('greeting_sent', { crossing_id: 'xxx', message_type: 'preset' | 'custom' });
analytics.track('greeting_received', { crossing_id: 'xxx' });

// Gaming
analytics.track('game_started', { game_type: 'quiz', difficulty: 'medium' });
analytics.track('game_completed', { game_type: 'quiz', score: 180, duration_sec: 120 });

// Vlogs
analytics.track('vlog_created', { stopover_count: 3 });
analytics.track('vlog_viewed', { vlog_id: 'xxx', is_own: false });

// Errors
analytics.track('error_occurred', { code: 'FLIGHT_NOT_FOUND', screen: 'search' });
```

### Implementation Pattern

```javascript
// Unified analytics wrapper
class Analytics {
  private providers: AnalyticsProvider[] = [];

  track(event: string, properties?: Record<string, any>) {
    const enrichedProps = {
      ...properties,
      timestamp: new Date().toISOString(),
      platform: getPlatform(), // web, ios, android, windows, unity
      app_version: getAppVersion(),
      user_id: getUserId(), // anonymized
      session_id: getSessionId(),
    };

    // Send to all configured providers
    this.providers.forEach(p => p.track(event, enrichedProps));
  }

  // Screen views
  screen(name: string, properties?: Record<string, any>) {
    this.track('screen_view', { screen_name: name, ...properties });
  }

  // Identify user (post-login)
  identify(userId: string, traits?: Record<string, any>) {
    this.providers.forEach(p => p.identify(userId, traits));
  }
}
```

### Privacy Compliance

```javascript
// Respect user consent
if (userConsent.analytics) {
  analytics.track('event_name', { ... });
}

// Anonymize by default
// - No PII in event properties
// - Use hashed/anonymized user IDs
// - IP addresses truncated/anonymized
// - Location at city level only (if needed)
```

### CloudWatch Custom Metrics

```javascript
// Lambda function to log custom metrics
const cloudwatch = new CloudWatchClient({});

async function logMetric(name: string, value: number, dimensions: Dimension[]) {
  await cloudwatch.send(new PutMetricDataCommand({
    Namespace: 'Aerologue',
    MetricData: [{
      MetricName: name,
      Value: value,
      Unit: 'Count',
      Dimensions: dimensions,
    }],
  }));
}

// Usage
await logMetric('FlightsTracked', 1, [
  { Name: 'Environment', Value: 'prod' },
]);
```

---

## DEV-002.0 - Feature Flag System

### Overview

Feature flags enable:
- Gradual rollouts (1% → 10% → 50% → 100%)
- A/B testing
- Kill switches for problematic features
- Beta testing with select users

### Recommended Service

**MVP:** AWS AppConfig (included with AWS, low cost)
**Scale:** LaunchDarkly or Split.io (more features)

### Flag Types

| Type | Use Case | Example |
|------|----------|---------|
| **Release** | Hide incomplete features | `new_map_ui` |
| **Experiment** | A/B testing | `checkout_flow_v2` |
| **Ops** | Operational toggles | `maintenance_mode` |
| **Permission** | User-based access | `beta_tester` |

### Implementation

```javascript
// Feature flag client
class FeatureFlags {
  private flags: Map<string, FlagConfig>;

  async initialize() {
    // Fetch flags from AppConfig or provider
    this.flags = await fetchFlags();
  }

  isEnabled(flagName: string, context?: FlagContext): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Check kill switch
    if (flag.enabled === false) return false;

    // Check percentage rollout
    if (flag.percentage !== undefined) {
      const bucket = hashUserId(context?.userId) % 100;
      if (bucket >= flag.percentage) return false;
    }

    // Check user targeting
    if (flag.allowedUsers?.length) {
      if (!flag.allowedUsers.includes(context?.userId)) return false;
    }

    return true;
  }

  getValue<T>(flagName: string, defaultValue: T): T {
    const flag = this.flags.get(flagName);
    return flag?.value ?? defaultValue;
  }
}

// Usage
if (featureFlags.isEnabled('new_crossing_ui', { userId })) {
  return <NewCrossingUI />;
} else {
  return <LegacyCrossingUI />;
}
```

### Flag Naming Convention

```
Format: <category>_<feature>_<variant?>

Examples:
- release_flight_sharing
- experiment_onboarding_v2
- ops_rate_limit_strict
- permission_beta_vlogs
```

### Flag Lifecycle

```
1. Create flag (disabled by default)
2. Deploy code that checks flag
3. Enable for internal testing (1%)
4. Gradual rollout (10% → 50% → 100%)
5. Remove flag and old code path
6. Archive flag
```

### AppConfig Setup

```hcl
# Terraform for AppConfig
resource "aws_appconfig_application" "aerologue" {
  name = "aerologue"
}

resource "aws_appconfig_environment" "prod" {
  application_id = aws_appconfig_application.aerologue.id
  name           = "prod"
}

resource "aws_appconfig_configuration_profile" "feature_flags" {
  application_id = aws_appconfig_application.aerologue.id
  name           = "feature-flags"
  location_uri   = "hosted"
  type           = "AWS.AppConfig.FeatureFlags"
}
```

---

## DEV-003.0 - Code Style Guidelines

### General Principles

1. **Readability over cleverness** - Code is read more than written
2. **Consistency** - Follow existing patterns in the codebase
3. **Self-documenting** - Good names over comments
4. **Small functions** - Do one thing well

### TypeScript/JavaScript (Web, Lambda)

```javascript
// Use ESLint + Prettier with these rules:
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    // Naming
    "@typescript-eslint/naming-convention": [
      "error",
      { "selector": "variable", "format": ["camelCase", "UPPER_CASE"] },
      { "selector": "function", "format": ["camelCase"] },
      { "selector": "typeLike", "format": ["PascalCase"] },
      { "selector": "enumMember", "format": ["UPPER_CASE"] }
    ],

    // Best practices
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",

    // TypeScript
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn"
  }
}
```

**Naming Examples:**
```typescript
// Variables: camelCase
const flightId = 'AA123';
const isTracking = true;

// Constants: UPPER_CASE
const MAX_TRACKING_LIMIT = 10;
const API_BASE_URL = 'https://api.aerologue.app';

// Functions: camelCase, verb prefix
function getFlightById(id: string): Flight { }
function validateUserInput(input: UserInput): boolean { }
async function fetchCrossings(): Promise<Crossing[]> { }

// Classes/Types: PascalCase
interface FlightPosition { }
class FlightTracker { }
type CrossingStatus = 'active' | 'expired';

// Enums: PascalCase name, UPPER_CASE values
enum FlightStatus {
  SCHEDULED = 'scheduled',
  IN_FLIGHT = 'in_flight',
  LANDED = 'landed',
}
```

### Dart (Flutter)

```dart
// Use dart analyze + flutter_lints
// analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_final_fields
    - avoid_print
    - always_declare_return_types

// Naming: same as Effective Dart
// Classes: PascalCase
// Functions/variables: camelCase
// Constants: camelCase (Dart convention)
// Files: snake_case.dart
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── features/            # Feature modules
│   ├── flights/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── components/
│   └── ...
├── hooks/               # Shared hooks
├── utils/               # Utility functions
├── services/            # API clients, external services
├── types/               # Shared type definitions
└── constants/           # App-wide constants
```

### Comments

```typescript
// DO: Explain WHY, not WHAT
// The ADS-B API returns stale data for 30 seconds after flight lands,
// so we cache the "landed" status to prevent flickering
if (cachedStatus === 'landed') return cachedStatus;

// DON'T: State the obvious
// Increment counter by 1
counter++;

// DO: Document public APIs
/**
 * Detects if two flights are crossing within the threshold distance.
 * @param flight1 - First flight position
 * @param flight2 - Second flight position
 * @param thresholdMiles - Maximum distance to consider a crossing (default: 20)
 * @returns Crossing details if detected, null otherwise
 */
function detectCrossing(
  flight1: FlightPosition,
  flight2: FlightPosition,
  thresholdMiles = 20
): CrossingResult | null { }
```

---

## DEV-004.0 - PR/Review Process

### Branch Naming

```
Format: <type>/<ticket>-<short-description>

Types:
- feature/  - New features
- bugfix/   - Bug fixes
- hotfix/   - Urgent production fixes
- refactor/ - Code refactoring
- docs/     - Documentation
- test/     - Test additions/fixes

Examples:
- feature/PLN-042-flight-sharing
- bugfix/PLN-099-crossing-detection-edge-case
- hotfix/fix-auth-token-refresh
```

### Commit Messages

```
Format: <type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore

Examples:
- feat(flights): add flight sharing functionality
- fix(crossings): handle edge case when flights have same position
- docs(api): update authentication endpoint docs
- refactor(tracking): simplify position update logic
- test(greetings): add unit tests for message validation
```

### Pull Request Template

```markdown
## Summary
<!-- What does this PR do? -->

## Related Issues
<!-- Link to related tickets -->
Closes #123

## Changes
<!-- List of changes -->
- Added flight sharing API endpoint
- Created ShareFlightModal component
- Updated flight detail screen

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
<!-- If UI changes, add before/after screenshots -->

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No console.log or debug code
- [ ] No secrets or credentials
- [ ] Documentation updated (if needed)
```

### Review Guidelines

**For Authors:**
1. Keep PRs small (<400 lines ideal, <1000 max)
2. Write a clear description
3. Self-review before requesting review
4. Respond to feedback within 24 hours

**For Reviewers:**
1. Review within 24 hours (business days)
2. Be constructive, not critical
3. Approve when "good enough" (don't block for nitpicks)
4. Use comment prefixes:
   - `[blocking]` - Must fix before merge
   - `[suggestion]` - Consider this change
   - `[question]` - Need clarification
   - `[nit]` - Minor style preference

### Merge Requirements

| Branch Target | Requirements |
|---------------|--------------|
| `develop` | 1 approval, CI passing |
| `staging` | 1 approval, CI passing, QA sign-off |
| `main` | 2 approvals, CI passing, staging tested |

---

## DEV-005.0 - Service Level Agreements (SLAs)

### Availability SLAs

| Service | Target | Measurement |
|---------|--------|-------------|
| Web App | 99.9% | Monthly uptime |
| REST API | 99.9% | Monthly uptime |
| WebSocket | 99.5% | Connection success rate |
| Mobile Apps | N/A | Depends on device/network |

**99.9% = ~43 minutes downtime/month**

### Performance SLAs

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response (p95) | <500ms | >750ms |
| API Response (p99) | <2s | >3s |
| Page Load (web) | <3s | >5s |
| WebSocket Latency | <100ms | >200ms |
| Flight Position Freshness | <15s | >30s |

### Support SLAs

| Severity | Response Time | Resolution Time |
|----------|---------------|-----------------|
| P1 - Critical (outage) | 15 minutes | 4 hours |
| P2 - High (major bug) | 1 hour | 24 hours |
| P3 - Medium (minor bug) | 4 hours | 72 hours |
| P4 - Low (enhancement) | 24 hours | Best effort |

### Incident Communication

| Severity | Communication | Channel |
|----------|---------------|---------|
| P1 | Immediate | Status page, in-app banner, Twitter |
| P2 | Within 1 hour | Status page |
| P3 | Next update cycle | Release notes |
| P4 | N/A | N/A |

### SLA Exclusions

SLAs do not apply during:
- Scheduled maintenance (announced 48h in advance)
- Force majeure events
- Third-party service outages (AWS, ADS-B providers)
- Beta/preview features

### Monitoring for SLAs

```javascript
// CloudWatch alarm for SLA breach
{
  "AlarmName": "API-Availability-SLA",
  "MetricName": "5XXError",
  "Namespace": "AWS/ApiGateway",
  "Statistic": "Average",
  "Period": 300,
  "EvaluationPeriods": 3,
  "Threshold": 0.001, // 0.1% error rate = 99.9% availability
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": ["arn:aws:sns:..."]
}
```

---

## References

- [CICD-001.0](cicd-pipeline.md) - CI/CD Pipeline
- [MON-001.0](monitoring-alerting.md) - Monitoring & Alerting
- [TEST-001.0](testing-strategy.md) - Testing Strategy
- [OPS-004.0](operations.md#ops-0040---performance-benchmarks) - Performance Benchmarks
