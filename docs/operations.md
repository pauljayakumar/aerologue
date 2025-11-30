# Operations Guide

**Document ID:** OPS-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

This document consolidates operational procedures including API versioning, database migrations, backup/recovery, and performance benchmarks.

---

## OPS-001.0 - API Versioning Strategy

### Versioning Approach

**URL Path Versioning**: `/api/v1/flights`, `/api/v2/flights`

### Version Lifecycle

| Phase | Duration | Support Level |
|-------|----------|---------------|
| Current | Indefinite | Full support, new features |
| Deprecated | 6 months | Bug fixes only, deprecation warnings |
| Sunset | 3 months | Read-only, no fixes |
| Retired | - | Returns 410 Gone |

### Breaking vs Non-Breaking Changes

**Non-Breaking (No version bump):**
- Adding new optional fields
- Adding new endpoints
- Adding new query parameters
- Relaxing validation rules
- Performance improvements

**Breaking (Version bump required):**
- Removing or renaming fields
- Changing field types
- Removing endpoints
- Tightening validation
- Changing authentication

### Deprecation Headers

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Mar 2026 00:00:00 GMT
Link: <https://api.aerologue.app/v2/flights>; rel="successor-version"
```

### Version Negotiation

```javascript
// Client can request specific version
GET /api/flights HTTP/1.1
Accept: application/vnd.aerologue.v1+json

// Or use URL path (preferred)
GET /api/v1/flights HTTP/1.1
```

---

## OPS-002.0 - Database Migration Strategy

### Migration Principles

1. **Backward Compatible** - New schema works with old code
2. **Zero Downtime** - No service interruption
3. **Reversible** - Can rollback if needed
4. **Tested** - Run on staging first

### Migration Types

| Type | Risk | Approach |
|------|------|----------|
| Add column (nullable) | Low | Direct migration |
| Add column (non-null) | Medium | Add nullable → backfill → add constraint |
| Remove column | Medium | Stop using → migrate → remove |
| Rename column | High | Add new → copy data → update code → remove old |
| Change type | High | Add new → convert → update code → remove old |

### Migration Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. Create Migration Script
   └── migrations/2025-11-26-add-user-timezone.sql

2. Test on Local
   └── Run against local database copy

3. Review
   └── Code review by another developer

4. Test on Staging
   └── Deploy to staging environment
   └── Verify application works
   └── Run integration tests

5. Schedule Production
   └── During low-traffic window
   └── Notify team

6. Deploy to Production
   └── Run migration
   └── Monitor for errors
   └── Verify application health

7. Cleanup
   └── Remove deprecated columns (after grace period)
```

### Example Migration

```sql
-- migrations/2025-11-26-add-user-timezone.sql
-- Add timezone to user profiles (backward compatible)

-- Up
ALTER TABLE user_profiles
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';

-- Backfill existing users (run separately if large dataset)
UPDATE user_profiles
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Down (rollback)
ALTER TABLE user_profiles
DROP COLUMN timezone;
```

### DynamoDB Migrations

For DynamoDB, migrations typically involve:
1. Add new attributes (schemaless, no migration needed)
2. Create GSI (can be done online)
3. Data transformation (Lambda-based batch jobs)

---

## OPS-003.0 - Backup and Recovery

### Backup Schedule

| Data Store | Backup Type | Frequency | Retention |
|------------|-------------|-----------|-----------|
| Aurora | Automated snapshot | Daily | 7 days |
| Aurora | Manual snapshot | Weekly | 30 days |
| DynamoDB | Point-in-time recovery | Continuous | 35 days |
| DynamoDB | On-demand backup | Weekly | 90 days |
| S3 | Versioning | Continuous | 30 days |
| S3 | Cross-region replication | Continuous | Same as source |
| Timestream | N/A (managed) | N/A | Retention policy |

### Recovery Procedures

#### Aurora Recovery

```bash
# Restore from automated backup (point-in-time)
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier aerologue-prod \
  --db-cluster-identifier aerologue-restored \
  --restore-to-time "2025-11-26T10:30:00Z" \
  --use-latest-restorable-time

# Restore from snapshot
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier aerologue-restored \
  --snapshot-identifier aerologue-weekly-2025-11-26
```

#### DynamoDB Recovery

```bash
# Restore to point in time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name user_profiles \
  --target-table-name user_profiles_restored \
  --restore-date-time "2025-11-26T10:30:00Z"

# Restore from backup
aws dynamodb restore-table-from-backup \
  --target-table-name user_profiles_restored \
  --backup-arn arn:aws:dynamodb:us-east-1:123456789:table/user_profiles/backup/xxx
```

#### S3 Recovery

```bash
# Restore specific version
aws s3api get-object \
  --bucket aerologue-assets \
  --key important-file.json \
  --version-id abc123 \
  restored-file.json
```

### Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Single table corruption | 1 hour | 15 minutes |
| Database failure | 2 hours | 1 hour |
| Region failure | 4 hours | 1 hour |
| Full disaster | 24 hours | 24 hours |

### Disaster Recovery Runbook

```
DISASTER RECOVERY CHECKLIST

□ 1. Assess the situation
    □ Identify affected services
    □ Determine root cause if possible
    □ Estimate recovery time

□ 2. Communicate
    □ Notify stakeholders
    □ Update status page
    □ Inform support team

□ 3. Execute recovery
    □ Restore databases from backup
    □ Verify data integrity
    □ Deploy application

□ 4. Validate
    □ Run smoke tests
    □ Verify critical flows
    □ Check data consistency

□ 5. Resume operations
    □ Enable traffic
    □ Monitor closely
    □ Update status page

□ 6. Post-incident
    □ Document timeline
    □ Schedule postmortem
    □ Update procedures
```

---

## OPS-004.0 - Performance Benchmarks

### API Performance Targets

| Endpoint | p50 | p95 | p99 | Max |
|----------|-----|-----|-----|-----|
| GET /flights/:id | 50ms | 150ms | 300ms | 1s |
| GET /flights/search | 100ms | 300ms | 500ms | 2s |
| POST /flights/:id/track | 100ms | 250ms | 400ms | 1s |
| WebSocket connect | 100ms | 300ms | 500ms | 2s |
| WebSocket message | 10ms | 50ms | 100ms | 200ms |

### Database Performance Targets

| Operation | Target | Alert Threshold |
|-----------|--------|-----------------|
| Aurora query (simple) | <10ms | >50ms |
| Aurora query (complex) | <100ms | >500ms |
| DynamoDB read | <5ms | >20ms |
| DynamoDB write | <10ms | >50ms |
| Redis get | <1ms | >5ms |
| Redis set | <1ms | >5ms |

### Throughput Targets

| Metric | MVP | Growth | Scale |
|--------|-----|--------|-------|
| Requests/second | 50 | 500 | 5,000 |
| WebSocket connections | 100 | 2,000 | 20,000 |
| Messages/second | 100 | 2,000 | 20,000 |
| Flight updates/second | 50 | 500 | 5,000 |

### Load Testing Schedule

| Test Type | Frequency | Duration |
|-----------|-----------|----------|
| Smoke test | Daily | 5 minutes |
| Load test | Weekly | 30 minutes |
| Stress test | Monthly | 1 hour |
| Soak test | Quarterly | 24 hours |

### Performance Monitoring Queries

```sql
-- CloudWatch Logs Insights: Slow API requests
fields @timestamp, @message, duration
| filter duration > 500
| sort duration desc
| limit 50

-- Find p95 latency by endpoint
fields @timestamp, endpoint, duration
| stats percentile(duration, 95) as p95 by endpoint
| sort p95 desc
```

---

## OPS-005.0 - Accessibility Requirements

### Compliance Target

**WCAG 2.1 Level AA** for all user-facing applications.

### Core Requirements

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| Perceivable | Content accessible to all senses | Alt text, captions, color contrast |
| Operable | UI operable via all input methods | Keyboard nav, focus management |
| Understandable | Content and UI predictable | Clear labels, consistent layout |
| Robust | Works with assistive tech | Semantic HTML, ARIA labels |

### Specific Requirements

#### Visual
- Color contrast ratio ≥4.5:1 (normal text)
- Color contrast ratio ≥3:1 (large text)
- Text resizable to 200% without loss
- No content that flashes >3 times/second
- All images have alt text

#### Interactive
- All functionality available via keyboard
- Focus indicators visible
- Skip navigation links
- Logical tab order
- Touch targets ≥44x44 pixels

#### Content
- Page titles descriptive
- Headings hierarchical (h1 → h2 → h3)
- Form fields have labels
- Error messages descriptive
- Language specified in HTML

### Testing Checklist

```
ACCESSIBILITY TESTING CHECKLIST

□ Automated Scans
  □ Run axe-core on all pages
  □ Run Lighthouse accessibility audit
  □ Check color contrast with tools

□ Keyboard Testing
  □ Tab through all interactive elements
  □ Verify focus indicators visible
  □ Test skip links
  □ Test modal dialogs (trap focus)

□ Screen Reader Testing
  □ Test with NVDA (Windows)
  □ Test with VoiceOver (Mac/iOS)
  □ Test with TalkBack (Android)
  □ Verify all content announced
  □ Verify form labels read correctly

□ Visual Testing
  □ Test at 200% zoom
  □ Test with high contrast mode
  □ Test without images
  □ Test without CSS
```

### Implementation Examples

```html
<!-- Good: Accessible button -->
<button
  aria-label="Track flight AA123"
  aria-pressed="false"
  role="button">
  Track Flight
</button>

<!-- Good: Accessible form -->
<label for="flight-search">Search for a flight</label>
<input
  id="flight-search"
  type="text"
  aria-describedby="flight-search-hint"
  autocomplete="off">
<span id="flight-search-hint">
  Enter a flight number like AA123
</span>

<!-- Good: Accessible image -->
<img
  src="flight-map.png"
  alt="Map showing AA123 currently over the Atlantic Ocean">
```

### Flutter Accessibility

```dart
// Semantic labels for Flutter widgets
Semantics(
  label: 'Track flight AA123',
  button: true,
  child: TrackButton(),
)

// Accessibility for icons
Icon(
  Icons.flight,
  semanticLabel: 'Flight icon',
)
```

---

## References

- [API-001.0](api-spec.md) - API Specification
- [ARC-001.0](aws-architecture.md) - AWS Architecture
- [MON-001.0](monitoring-alerting.md) - Monitoring
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
