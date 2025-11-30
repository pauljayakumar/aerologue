# Monitoring & Alerting

**Document ID:** MON-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

This document expands on [ARC-010.0](aws-architecture.md#arc-0100---monitoring--logging) with detailed monitoring, alerting, and incident response procedures.

---

## MON-001.0 - Monitoring Strategy Overview

### Three Pillars of Observability

```
┌─────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY                            │
├───────────────────┬───────────────────┬─────────────────────┤
│      METRICS      │       LOGS        │       TRACES        │
│   (CloudWatch)    │   (CloudWatch)    │      (X-Ray)        │
├───────────────────┼───────────────────┼─────────────────────┤
│ - Request count   │ - Error details   │ - Request flow      │
│ - Latency (p50,   │ - Stack traces    │ - Service map       │
│   p95, p99)       │ - User actions    │ - Bottleneck        │
│ - Error rates     │ - Audit events    │   identification    │
│ - Resource usage  │ - Debug info      │ - Dependency        │
│ - Custom KPIs     │                   │   analysis          │
└───────────────────┴───────────────────┴─────────────────────┘
```

### Monitoring Layers

| Layer | What We Monitor | Primary Tool |
|-------|-----------------|--------------|
| Infrastructure | AWS resources, capacity, costs | CloudWatch |
| Application | API performance, errors, throughput | CloudWatch + X-Ray |
| Business | User activity, conversions, engagement | CloudWatch Custom Metrics |
| Security | Auth failures, suspicious activity | CloudTrail + GuardDuty |

---

## MON-002.0 - Key Performance Indicators (KPIs)

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Availability | 99.9% | Successful requests / Total requests |
| API Latency (p95) | < 500ms | 95th percentile response time |
| API Latency (p99) | < 2s | 99th percentile response time |
| WebSocket Uptime | 99.9% | Connection success rate |
| Flight Position Freshness | < 15s | Time since last update |
| Error Rate | < 0.1% | 5xx errors / Total requests |

### Business KPIs

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Active Users (DAU) | Daily unique logins | Drop > 20% |
| Flights Tracked | Concurrent tracked flights | Drop > 30% |
| WebSocket Connections | Active connections | Drop > 25% |
| Crossings Detected | Flight crossings per hour | Drop > 50% |
| Greetings Sent | Messages between users | N/A (monitoring only) |
| Game Sessions | Active game sessions | N/A (monitoring only) |

---

## MON-003.0 - CloudWatch Dashboards

### Main Operations Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AEROLOGUE OPERATIONS DASHBOARD                    │
├─────────────────────────────┬───────────────────────────────────────┤
│  API Health                 │  WebSocket Connections                │
│  ┌───────────────────────┐  │  ┌───────────────────────────────┐   │
│  │ ████████████░░ 98.5%  │  │  │ Current: 1,234                │   │
│  │ Requests: 45.2K/min   │  │  │ Peak: 2,456                   │   │
│  │ Errors: 0.02%         │  │  │ ████████░░░░░░░ 50% capacity  │   │
│  └───────────────────────┘  │  └───────────────────────────────┘   │
├─────────────────────────────┼───────────────────────────────────────┤
│  Latency Distribution       │  Active Flights                       │
│  ┌───────────────────────┐  │  ┌───────────────────────────────┐   │
│  │ p50: 45ms             │  │  │ Tracked: 12,456               │   │
│  │ p95: 234ms            │  │  │ Updates/sec: 1,245            │   │
│  │ p99: 456ms            │  │  │ Crossings/hr: 89              │   │
│  └───────────────────────┘  │  └───────────────────────────────┘   │
├─────────────────────────────┼───────────────────────────────────────┤
│  Lambda Invocations         │  Database Health                      │
│  ┌───────────────────────┐  │  ┌───────────────────────────────┐   │
│  │ █████████████████     │  │  │ Aurora: 2.1 ACU (25%)         │   │
│  │ 123K invocations      │  │  │ DynamoDB: 45 RCU, 12 WCU      │   │
│  │ Duration avg: 89ms    │  │  │ Timestream: 234 writes/s      │   │
│  └───────────────────────┘  │  └───────────────────────────────┘   │
└─────────────────────────────┴───────────────────────────────────────┘
```

### Dashboard JSON Template

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "API Gateway - Request Count",
        "metrics": [
          ["AWS/ApiGateway", "Count", "ApiName", "aerologue-api"]
        ],
        "period": 60,
        "stat": "Sum"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "API Gateway - Latency",
        "metrics": [
          ["AWS/ApiGateway", "Latency", "ApiName", "aerologue-api", {"stat": "p50"}],
          ["...", {"stat": "p95"}],
          ["...", {"stat": "p99"}]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Lambda - Errors",
        "metrics": [
          ["AWS/Lambda", "Errors", "FunctionName", "aerologue-flight-processor"],
          ["...", "aerologue-crossing-detector"],
          ["...", "aerologue-websocket-handler"]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "WebSocket Connections",
        "metrics": [
          ["Aerologue", "ActiveWebSocketConnections"]
        ]
      }
    }
  ]
}
```

---

## MON-004.0 - Alerting Configuration

### Alert Severity Levels

| Severity | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| P1 - Critical | Service down, data loss risk | Immediate | PagerDuty + SMS + Slack |
| P2 - High | Degraded service, user impact | 15 minutes | Slack + Email |
| P3 - Medium | Performance issues, potential problems | 1 hour | Slack |
| P4 - Low | Informational, trends | Next business day | Email digest |

### Alert Definitions

#### P1 - Critical Alerts

| Alert Name | Condition | Action |
|------------|-----------|--------|
| `API_DOWN` | 0 successful requests for 2 min | Page on-call |
| `DATABASE_UNREACHABLE` | Aurora connection failures > 50% | Page on-call |
| `WEBSOCKET_MASS_DISCONNECT` | >50% connections dropped in 1 min | Page on-call |
| `SECURITY_BREACH_DETECTED` | GuardDuty high severity finding | Page on-call + Security |
| `DATA_LOSS_RISK` | S3/DynamoDB deletion events | Page on-call |

#### P2 - High Alerts

| Alert Name | Condition | Action |
|------------|-----------|--------|
| `API_ERROR_RATE_HIGH` | 5xx errors > 5% for 5 min | Slack #alerts |
| `API_LATENCY_DEGRADED` | p99 > 3s for 5 min | Slack #alerts |
| `FLIGHT_DATA_STALE` | No position updates for 2 min | Slack #alerts |
| `LAMBDA_THROTTLING` | Throttle count > 100 in 5 min | Slack #alerts |
| `DATABASE_CPU_HIGH` | Aurora CPU > 85% for 10 min | Slack #alerts |

#### P3 - Medium Alerts

| Alert Name | Condition | Action |
|------------|-----------|--------|
| `API_LATENCY_WARNING` | p95 > 1s for 10 min | Slack #ops |
| `DISK_SPACE_WARNING` | Any storage > 70% capacity | Slack #ops |
| `CACHE_HIT_RATE_LOW` | Redis hit rate < 80% | Slack #ops |
| `WEBSOCKET_CAPACITY_WARNING` | Connections > 70% limit | Slack #ops |
| `COST_SPIKE_DETECTED` | Daily cost > 150% of average | Slack #ops |

#### P4 - Low Alerts

| Alert Name | Condition | Action |
|------------|-----------|--------|
| `DAILY_ACTIVE_USERS_CHANGE` | DAU change > 20% | Daily digest |
| `NEW_ERROR_TYPE` | New error pattern detected | Daily digest |
| `CERTIFICATE_EXPIRY_30D` | SSL cert expires in 30 days | Weekly digest |
| `DEPENDENCY_UPDATE` | Security patch available | Weekly digest |

### CloudWatch Alarm Terraform

```hcl
# Critical: API Gateway 5xx errors
resource "aws_cloudwatch_metric_alarm" "api_5xx_critical" {
  alarm_name          = "aerologue-api-5xx-critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "API Gateway returning high 5xx errors"

  dimensions = {
    ApiName = "aerologue-api"
  }

  alarm_actions = [
    aws_sns_topic.critical_alerts.arn
  ]

  ok_actions = [
    aws_sns_topic.critical_alerts.arn
  ]
}

# High: API Latency p99
resource "aws_cloudwatch_metric_alarm" "api_latency_high" {
  alarm_name          = "aerologue-api-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 3000  # 3 seconds
  alarm_description   = "API p99 latency exceeds 3s"

  dimensions = {
    ApiName = "aerologue-api"
  }

  alarm_actions = [
    aws_sns_topic.high_alerts.arn
  ]
}

# SNS Topics
resource "aws_sns_topic" "critical_alerts" {
  name = "aerologue-critical-alerts"
}

resource "aws_sns_topic" "high_alerts" {
  name = "aerologue-high-alerts"
}
```

---

## MON-005.0 - Log Management

### Log Structure

All logs follow a consistent JSON format:

```json
{
  "timestamp": "2025-11-26T10:30:45.123Z",
  "level": "INFO|WARN|ERROR|DEBUG",
  "service": "flight-processor",
  "requestId": "abc-123-def",
  "userId": "user_456",
  "action": "processFlightPosition",
  "duration": 45,
  "metadata": {
    "flightId": "AA123",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "error": null
}
```

### Log Groups and Retention

| Log Group | Retention (Dev) | Retention (Prod) | Purpose |
|-----------|-----------------|------------------|---------|
| `/aws/lambda/aerologue-*` | 7 days | 30 days | Lambda execution logs |
| `/aws/apigateway/aerologue-*` | 7 days | 30 days | API access logs |
| `/aerologue/application` | 7 days | 90 days | Application-level logs |
| `/aerologue/audit` | 30 days | 365 days | Security audit events |
| `/aerologue/errors` | 30 days | 90 days | Error aggregation |

### CloudWatch Logs Insights Queries

```sql
-- Top errors in last hour
fields @timestamp, @message, error.message
| filter level = "ERROR"
| stats count(*) as errorCount by error.message
| sort errorCount desc
| limit 20

-- Slow API requests
fields @timestamp, action, duration, userId
| filter duration > 1000
| sort duration desc
| limit 50

-- User activity timeline
fields @timestamp, action, metadata.flightId
| filter userId = "user_123"
| sort @timestamp asc

-- WebSocket connection issues
fields @timestamp, @message
| filter service = "websocket-handler" and level = "ERROR"
| sort @timestamp desc
| limit 100
```

---

## MON-006.0 - Distributed Tracing (X-Ray)

### Trace Sampling Rules

| Rule Name | Match Criteria | Sampling Rate |
|-----------|----------------|---------------|
| Health Checks | `GET /health` | 0% (excluded) |
| High-Value Endpoints | `POST /api/greetings/*` | 100% |
| Flight Updates | `POST /api/flights/position` | 5% |
| Default | Everything else | 10% |

### X-Ray Service Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│ API Gateway │────▶│   Lambda    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │   Aurora    │           │  DynamoDB   │           │  Timestream │
             │ (user data) │           │  (flights)  │           │ (positions) │
             └─────────────┘           └─────────────┘           └─────────────┘
                    │
                    ▼
             ┌─────────────┐
             │    Redis    │
             │   (cache)   │
             └─────────────┘
```

### Trace Analysis Queries

```javascript
// Find slow database calls
aws xray get-trace-summaries \
  --start-time $(date -d '1 hour ago' -u +%s) \
  --end-time $(date -u +%s) \
  --filter-expression 'service(id(name: "Aurora")) AND responseTime > 0.5'

// Find error traces
aws xray get-trace-summaries \
  --filter-expression 'error = true'
```

---

## MON-007.0 - Synthetic Monitoring

### Health Check Endpoints

| Endpoint | Check Interval | Timeout | Expected |
|----------|----------------|---------|----------|
| `GET /health` | 30 seconds | 5s | 200 OK |
| `GET /api/health/deep` | 5 minutes | 30s | 200 + all services OK |
| `WSS /ws/health` | 1 minute | 10s | Connection + ping/pong |

### Deep Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-26T10:30:45Z",
  "version": "1.2.3",
  "services": {
    "aurora": {"status": "healthy", "latency": 12},
    "dynamodb": {"status": "healthy", "latency": 8},
    "timestream": {"status": "healthy", "latency": 15},
    "redis": {"status": "healthy", "latency": 2},
    "adsb_api": {"status": "healthy", "latency": 145}
  }
}
```

### Synthetic Canary (CloudWatch Synthetics)

```javascript
// Canary script for critical user flow
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const flowCheck = async function() {
  const page = await synthetics.getPage();

  // Step 1: Load homepage
  await synthetics.executeStep('loadHomepage', async function() {
    await page.goto('https://aerologue.app');
    await page.waitForSelector('#flight-map');
  });

  // Step 2: Search for a flight
  await synthetics.executeStep('searchFlight', async function() {
    await page.type('#flight-search', 'AA123');
    await page.click('#search-button');
    await page.waitForSelector('.flight-result');
  });

  // Step 3: Track flight
  await synthetics.executeStep('trackFlight', async function() {
    await page.click('.track-button');
    await page.waitForSelector('.tracking-active');
  });

  log.info('All steps completed successfully');
};

exports.handler = async () => {
  return await flowCheck();
};
```

---

## MON-008.0 - Incident Response

### Incident Severity Classification

| Severity | Definition | Examples |
|----------|------------|----------|
| SEV-1 | Complete outage, all users affected | API down, database unreachable |
| SEV-2 | Major feature broken, many users affected | Flight tracking failing, auth broken |
| SEV-3 | Minor feature broken, some users affected | Slow performance, UI glitches |
| SEV-4 | Cosmetic issues, minimal impact | Typos, minor UI inconsistencies |

### Incident Response Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT DETECTED                             │
│              (Alert fires or user report)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. ACKNOWLEDGE (< 5 min for SEV-1/2)                           │
│     - Claim incident in PagerDuty/Slack                         │
│     - Initial severity assessment                                │
│     - Start incident channel #inc-YYYYMMDD-brief                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. TRIAGE (< 15 min for SEV-1/2)                               │
│     - Identify affected components                               │
│     - Check recent deployments                                   │
│     - Review dashboards and logs                                 │
│     - Escalate if needed                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. MITIGATE                                                     │
│     - Apply immediate fix or workaround                          │
│     - Rollback if deployment-related                             │
│     - Scale resources if capacity issue                          │
│     - Communicate status to stakeholders                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. RESOLVE                                                      │
│     - Confirm service restored                                   │
│     - Monitor for recurrence (30 min)                            │
│     - Close incident channel                                     │
│     - Schedule postmortem for SEV-1/2                            │
└─────────────────────────────────────────────────────────────────┘
```

### Runbooks

Quick reference for common incidents:

#### API High Latency
```
1. Check CloudWatch dashboard for latency metrics
2. Check X-Ray for slow traces → identify bottleneck
3. If database:
   - Check Aurora ACU utilization
   - Review slow query logs
   - Consider scaling ACUs
4. If Lambda:
   - Check cold start frequency
   - Review memory allocation
   - Check concurrent executions
5. If external API (ADSB):
   - Check third-party status
   - Enable circuit breaker / fallback
```

#### WebSocket Mass Disconnect
```
1. Check API Gateway WebSocket metrics
2. Check Lambda websocket-handler logs
3. Common causes:
   - Lambda timeout → increase timeout
   - Memory exhaustion → increase memory
   - Connection limit → scale or implement sharding
4. Verify client reconnection logic working
5. Check for DDoS patterns in WAF
```

#### Database Connection Exhaustion
```
1. Check Aurora connection count
2. Identify connection leaks:
   - Review recent deployments
   - Check Lambda function code
3. Immediate mitigation:
   - Increase max connections
   - Scale Aurora ACUs
4. Long-term fix:
   - Implement connection pooling
   - Review connection lifecycle
```

---

## MON-009.0 - Cost Monitoring

### Budget Alerts

| Budget | Monthly Limit | Alert at |
|--------|---------------|----------|
| Total AWS | $300 | 50%, 80%, 100% |
| Lambda | $50 | 80%, 100% |
| Database | $100 | 80%, 100% |
| Data Transfer | $30 | 80%, 100% |

### Cost Anomaly Detection

AWS Cost Anomaly Detection enabled with:
- Daily monitoring
- Email alerts for >20% deviation
- Service-level breakdown

### Right-Sizing Recommendations

Monthly review of:
- Lambda memory allocation vs actual usage
- Aurora ACU utilization
- DynamoDB capacity vs actual throughput
- ElastiCache node size

---

## MON-010.0 - Security Monitoring

### AWS GuardDuty

Enabled for:
- EC2 instance compromise detection
- S3 data exfiltration attempts
- IAM credential compromise
- Cryptocurrency mining detection

### CloudTrail Analysis

```sql
-- Failed login attempts
SELECT eventTime, sourceIPAddress, errorMessage
FROM cloudtrail_logs
WHERE eventName = 'ConsoleLogin' AND errorMessage IS NOT NULL
ORDER BY eventTime DESC

-- IAM policy changes
SELECT eventTime, userIdentity.arn, eventName, requestParameters
FROM cloudtrail_logs
WHERE eventName LIKE '%Policy%' OR eventName LIKE '%Role%'
ORDER BY eventTime DESC
```

### Security Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| Brute Force Auth | >10 failed logins in 5 min | Block IP + Alert |
| Unusual API Pattern | Request pattern anomaly | Alert + Review |
| Privilege Escalation | IAM policy modification | Alert + Audit |
| Data Access Anomaly | Unusual S3/DynamoDB access | Alert + Review |

---

## References

- [ARC-010.0](aws-architecture.md#arc-0100---monitoring--logging) - AWS Monitoring Overview
- [CICD-010.0](cicd-pipeline.md#cicd-0100-rollback-procedure) - Deployment Rollback
- AWS Well-Architected: Operational Excellence Pillar
