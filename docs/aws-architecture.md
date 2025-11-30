# AWS Architecture

This document defines the AWS infrastructure for Aerologue, starting with a single-region deployment and provisions for future global scaling.

## Numbering Convention
All items in this document use the format: **ARC-[NUMBER].[REVISION]**

Example: `ARC-001.0` (Architecture item 1, initial version)

---

## ARC-001.0 - Architecture Overview

### Design Principles

1. **Start Simple, Scale Later** - Single region initially, designed for easy expansion
2. **Serverless-First** - Minimize operational overhead, pay-per-use
3. **Offline-First Client** - Backend supports intermittent connectivity
4. **Cost-Optimized** - Use appropriate service tiers for MVP
5. **Security by Default** - Encryption, least privilege, audit logging

### Initial Deployment: Single Region

**Primary Region:** `us-east-1` (N. Virginia)

**Rationale:**
- Lowest latency to North America and Europe
- Most AWS services available
- Best pricing for many services
- Good starting point for global expansion

---

## ARC-002.0 - High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐    │
│  │   Web   │  │ Android │  │   iOS   │  │ Windows │  │  Admin Console  │    │
│  │  (PWA)  │  │  (APK)  │  │  (IPA)  │  │  (DLL)  │  │     (Web)       │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘    │
│       └────────────┴────────────┴────────────┴────────────────┘              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTPS / WSS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS CLOUD (us-east-1)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         EDGE / CDN LAYER                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐    │  │
│  │  │   CloudFront    │  │    Route 53     │  │   WAF / Shield      │    │  │
│  │  │   (CDN/Cache)   │  │   (DNS/Health)  │  │   (Protection)      │    │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘    │  │
│  └───────────┼────────────────────┼──────────────────────┼───────────────┘  │
│              │                    │                      │                   │
│  ┌───────────┼────────────────────┼──────────────────────┼───────────────┐  │
│  │           ▼                    ▼                      ▼    API LAYER  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    API Gateway                                   │  │  │
│  │  │  ┌─────────────────┐        ┌─────────────────────────────┐     │  │  │
│  │  │  │  HTTP API       │        │  WebSocket API               │     │  │  │
│  │  │  │  (REST)         │        │  (Real-time)                 │     │  │  │
│  │  │  └────────┬────────┘        └─────────────┬───────────────┘     │  │  │
│  │  └───────────┼───────────────────────────────┼─────────────────────┘  │  │
│  └──────────────┼───────────────────────────────┼────────────────────────┘  │
│                 │                               │                            │
│  ┌──────────────┼───────────────────────────────┼────────────────────────┐  │
│  │              ▼                               ▼         COMPUTE LAYER  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      AWS Lambda                                  │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │  │
│  │  │  │  REST    │ │ WebSocket│ │  ETL     │ │ Crossing │           │  │  │
│  │  │  │ Handlers │ │ Handlers │ │ Pipeline │ │ Detector │           │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │  │
│  │  │  │  Auth    │ │ Gaming   │ │ Greeting │ │  Admin   │           │  │  │
│  │  │  │ Handler  │ │ Handler  │ │ Handler  │ │ Handler  │           │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────┼───────────────────────────────────┐  │
│  │                                   ▼                     DATA LAYER    │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │  │
│  │  │    Timestream   │ │ Aurora Postgres │ │       DynamoDB          │  │  │
│  │  │  (Time-Series)  │ │  (Relational)   │ │      (Document)         │  │  │
│  │  │                 │ │                 │ │                         │  │  │
│  │  │ - Flight pos    │ │ - Users         │ │ - Sessions              │  │  │
│  │  │ - Trails        │ │ - Airports      │ │ - Crossings             │  │  │
│  │  │                 │ │ - Gamification  │ │ - Messages              │  │  │
│  │  │                 │ │ - Wallet        │ │ - Vlogs                 │  │  │
│  │  │                 │ │ - Achievements  │ │ - Context               │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │  │
│  │  │   ElastiCache   │ │       S3        │ │    Secrets Manager      │  │  │
│  │  │    (Redis)      │ │   (Storage)     │ │    (Credentials)        │  │  │
│  │  │                 │ │                 │ │                         │  │  │
│  │  │ - Session cache │ │ - Map tiles     │ │ - API keys              │  │  │
│  │  │ - Leaderboard   │ │ - Media files   │ │ - DB credentials        │  │  │
│  │  │ - Rate limiting │ │ - Backups       │ │ - OAuth secrets         │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           SUPPORTING SERVICES                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │ Cognito  │ │   SQS    │ │EventBridg│ │CloudWatch│ │   SNS    │    │  │
│  │  │  (Auth)  │ │ (Queues) │ │(Scheduler)│ │(Logging) │ │ (Notify) │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ARC-003.0 - Network Architecture

### VPC Configuration

```
VPC: aerologue-vpc
CIDR: 10.0.0.0/16 (65,536 IPs)

┌─────────────────────────────────────────────────────────────────┐
│                        VPC (10.0.0.0/16)                         │
│                                                                  │
│  Availability Zone A              Availability Zone B            │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ Public Subnet A     │          │ Public Subnet B     │       │
│  │ 10.0.1.0/24         │          │ 10.0.2.0/24         │       │
│  │ - NAT Gateway       │          │ - (Standby NAT)     │       │
│  │ - ALB nodes         │          │ - ALB nodes         │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                  │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ Private Subnet A    │          │ Private Subnet B    │       │
│  │ 10.0.10.0/24        │          │ 10.0.11.0/24        │       │
│  │ - Lambda (VPC)      │          │ - Lambda (VPC)      │       │
│  │ - Aurora Primary    │          │ - Aurora Replica    │       │
│  │ - ElastiCache       │          │ - ElastiCache       │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                  │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ Isolated Subnet A   │          │ Isolated Subnet B   │       │
│  │ 10.0.20.0/24        │          │ 10.0.21.0/24        │       │
│  │ - Database only     │          │ - Database only     │       │
│  │ - No internet       │          │ - No internet       │       │
│  └─────────────────────┘          └─────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Security Groups

| Security Group | Inbound | Outbound | Purpose |
|----------------|---------|----------|---------|
| `sg-alb` | 443 from 0.0.0.0/0 | All to VPC | Load balancer |
| `sg-lambda` | None | All | Lambda functions |
| `sg-aurora` | 5432 from sg-lambda | None | Aurora PostgreSQL |
| `sg-elasticache` | 6379 from sg-lambda | None | Redis cache |
| `sg-admin` | 443 from admin IPs | All | Admin console |

---

## ARC-004.0 - Compute Layer (Lambda)

### Lambda Functions

| Function | Runtime | Memory | Timeout | Trigger | Purpose |
|----------|---------|--------|---------|---------|---------|
| `api-rest-handler` | Node.js 20 | 512MB | 30s | API Gateway HTTP | REST API endpoints |
| `api-ws-connect` | Node.js 20 | 256MB | 10s | API Gateway WS | WebSocket connect |
| `api-ws-disconnect` | Node.js 20 | 256MB | 10s | API Gateway WS | WebSocket disconnect |
| `api-ws-message` | Node.js 20 | 512MB | 30s | API Gateway WS | WebSocket messages |
| `etl-flight-data` | Node.js 20 | 1024MB | 60s | EventBridge (10s) | Fetch flight positions |
| `etl-airport-data` | Node.js 20 | 512MB | 60s | EventBridge (1h) | Fetch airport data |
| `crossing-detector` | Node.js 20 | 1024MB | 30s | EventBridge (10s) | Detect flight crossings |
| `ws-broadcast` | Node.js 20 | 512MB | 30s | SQS | Broadcast to WebSocket clients |
| `auth-triggers` | Node.js 20 | 256MB | 10s | Cognito | Auth event handlers |
| `scheduled-cleanup` | Node.js 20 | 256MB | 60s | EventBridge (daily) | TTL cleanup, maintenance |

### Lambda Layers

| Layer | Contents | Size |
|-------|----------|------|
| `common-utils` | Shared utilities, logging, error handling | ~5MB |
| `aws-sdk-optimized` | Trimmed AWS SDK | ~10MB |
| `geo-utils` | GeoHash, distance calculations | ~2MB |

### Concurrency Limits

| Function | Reserved Concurrency | Reason |
|----------|---------------------|--------|
| `etl-flight-data` | 10 | Prevent API rate limiting |
| `crossing-detector` | 20 | CPU intensive |
| `ws-broadcast` | 100 | Handle burst traffic |
| Others | Unreserved | Scale with demand |

---

## ARC-005.0 - Database Layer

### Amazon Timestream (Flight Positions)

```
Database: aerologue-flights

Table: flight_positions
  Dimensions: aircraft_id, callsign, registration
  Measures: latitude, longitude, altitude_ft, ground_speed_kts,
            heading_deg, vertical_rate, on_ground

Memory Retention: 1 hour
Magnetic Retention: 7 days

Estimated Storage: ~10GB/month at MVP scale
```

### Amazon Aurora PostgreSQL Serverless v2

```
Cluster: aerologue-aurora
Engine: PostgreSQL 15
Min ACU: 0.5 (can scale to 0 when idle)
Max ACU: 16 (scale up under load)

Tables:
  - airports (~50,000 rows, ~50MB)
  - user_profiles
  - user_gamification
  - user_achievements
  - achievements
  - user_wallets
  - wallet_transactions
  - greeting_presets

Extensions:
  - PostGIS (geospatial)
  - pg_trgm (text search)
```

### Amazon DynamoDB

```
Tables (On-Demand Capacity):

1. user_sessions
   - PK: user_id, SK: session_id
   - GSI: device_id
   - TTL: 30 days

2. user_context
   - PK: user_id
   - GSI: flight_id, airport_icao
   - TTL: 24 hours

3. flight_crossings
   - PK: user_id, SK: crossing_id
   - GSI: user_flight_id, crossed_flight_id, region
   - TTL: 7 days

4. crossing_participants
   - PK: crossing_id, SK: user_id
   - GSI: user_id (for history)

5. crossing_messages
   - PK: crossing_id, SK: message_id
   - GSI: to_user_id, from_user_id
   - TTL: 30 days

6. vlog_journeys
   - PK: creator_id, SK: journey_id
   - GSI: visibility#status, country_code

7. vlog_stopovers
   - PK: journey_id, SK: stopover_order#stopover_id

8. vlog_pinned_media
   - PK: journey_id#stopover_id, SK: media_order#media_id

9. websocket_connections
   - PK: connection_id
   - GSI: user_id
   - TTL: 24 hours

10. airport_schedules
    - PK: airport_iata#date, SK: flight_number#time
    - TTL: 24 hours

11. wallet_documents
    - PK: user_id, SK: document_type#document_id
    - TTL: expiry + 30 days

12. admin_audit_log
    - PK: date, SK: timestamp#user_id
    - TTL: 5 years
```

### Amazon ElastiCache (Redis)

```
Cluster: aerologue-cache
Node Type: cache.t4g.micro (MVP), scale to cache.r6g.large
Nodes: 1 (MVP), 2 with replica for production

Usage:
  - WebSocket connection registry
  - Rate limiting counters
  - Leaderboard cache
  - Session tokens
  - Flight position cache (hot data)
```

### Amazon S3

```
Buckets:

1. aerologue-static-assets
   - Map tiles (Natural Earth)
   - App assets
   - CloudFront origin

2. aerologue-user-content
   - Vlog thumbnails
   - User avatars
   - Wallet documents
   - Lifecycle: Move to IA after 90 days

3. aerologue-data-archive
   - Flight position archives
   - Backup data
   - Lifecycle: Move to Glacier after 30 days

4. aerologue-logs
   - Application logs
   - Access logs
   - Lifecycle: Delete after 90 days
```

---

## ARC-006.0 - API Gateway Configuration

### HTTP API (REST)

```
API: aerologue-rest-api

Stages:
  - prod (production)
  - staging (testing)
  - dev (development)

Routes:
  /api/v1/flights/*        → api-rest-handler
  /api/v1/airports/*       → api-rest-handler
  /api/v1/crossings/*      → api-rest-handler
  /api/v1/greetings/*      → api-rest-handler
  /api/v1/games/*          → api-rest-handler
  /api/v1/users/*          → api-rest-handler
  /api/v1/vlogs/*          → api-rest-handler
  /api/v1/wallet/*         → api-rest-handler
  /api/v1/leaderboards/*   → api-rest-handler
  /api/v1/health           → api-rest-handler

Throttling:
  - Default: 1000 requests/second
  - Burst: 2000 requests

CORS:
  - Origins: aerologue.app, *.aerologue.app, localhost:*
  - Methods: GET, POST, PUT, DELETE, OPTIONS
  - Headers: Authorization, Content-Type
```

### WebSocket API

```
API: aerologue-ws-api

Routes:
  $connect    → api-ws-connect
  $disconnect → api-ws-disconnect
  $default    → api-ws-message

Connection Timeout: 10 minutes (idle)
Max Message Size: 128 KB
Max Connections: 100,000 (soft limit, can request increase)
```

---

## ARC-007.0 - Authentication (Cognito)

### User Pool

```
Pool: aerologue-users

Password Policy:
  - Minimum 8 characters
  - Require uppercase, lowercase, number
  - No special character required (UX)

MFA: Optional (TOTP)

Attributes:
  - email (required, verified)
  - name (optional)
  - picture (optional)
  - custom:nationality (optional)
  - custom:language (optional)

Social Identity Providers:
  - Apple (Sign in with Apple)
  - Google (Google Sign-In)

Lambda Triggers:
  - Pre Sign-up: Validate email domain
  - Post Confirmation: Create user profile
  - Pre Token Generation: Add custom claims
```

### App Client

```
Client: aerologue-app

OAuth Flows:
  - Authorization Code (with PKCE)
  - Implicit (for legacy)

Scopes:
  - openid
  - email
  - profile
  - aws.cognito.signin.user.admin

Token Validity:
  - Access: 1 hour
  - ID: 1 hour
  - Refresh: 30 days
```

---

## ARC-008.0 - CDN & Edge (CloudFront)

### Distribution

```
Distribution: aerologue-cdn

Origins:
  1. API Gateway (api.aerologue.app)
     - Cache: Disabled (dynamic)
     - Compress: Yes

  2. S3 Static Assets (static.aerologue.app)
     - Cache: 1 year for versioned assets
     - Compress: Yes

  3. S3 Map Tiles (tiles.aerologue.app)
     - Cache: 30 days
     - Compress: Yes

Behaviors:
  /api/*      → API Gateway, no cache
  /ws/*       → WebSocket API, no cache
  /tiles/*    → S3 tiles, cache 30 days
  /static/*   → S3 assets, cache 1 year
  /*          → S3 web app, cache 1 hour

Price Class: PriceClass_100 (NA + EU) for MVP
             PriceClass_All for global

WAF: Enabled (see ARC-009.0)
```

---

## ARC-009.0 - Security

### WAF Rules

```
WebACL: aerologue-waf

Rules:
  1. AWS Managed - Common Rule Set
  2. AWS Managed - Known Bad Inputs
  3. AWS Managed - SQL Injection
  4. Rate Limit: 2000 requests/5min per IP
  5. Geo Block: None (global app)
  6. Bot Control: Challenge suspicious bots
```

### IAM Roles

```
Roles:

1. aerologue-lambda-execution
   Policies:
     - AWSLambdaBasicExecutionRole
     - AWSLambdaVPCAccessExecutionRole
     - Custom: DynamoDB access
     - Custom: Timestream access
     - Custom: Aurora access (via Secrets)
     - Custom: S3 access (specific buckets)
     - Custom: SQS access
     - Custom: API Gateway Management (WebSocket)

2. aerologue-api-gateway
   Policies:
     - Lambda invoke

3. aerologue-eventbridge
   Policies:
     - Lambda invoke
     - SQS send message

4. aerologue-cognito-triggers
   Policies:
     - Lambda invoke
```

### Secrets Manager

```
Secrets:

1. aerologue/db/aurora
   - host, port, username, password, database

2. aerologue/api/adsb-exchange
   - api_key

3. aerologue/api/aerodatabox
   - api_key

4. aerologue/api/airlabs
   - api_key

5. aerologue/oauth/apple
   - client_id, team_id, key_id, private_key

6. aerologue/oauth/google
   - client_id, client_secret

Rotation: 90 days for DB credentials
```

### Encryption

| Data | At Rest | In Transit |
|------|---------|------------|
| Aurora | AES-256 (KMS) | TLS 1.2+ |
| DynamoDB | AES-256 (AWS owned) | TLS 1.2+ |
| Timestream | AES-256 (AWS owned) | TLS 1.2+ |
| S3 | AES-256 (SSE-S3) | TLS 1.2+ |
| ElastiCache | AES-256 (KMS) | TLS 1.2+ |
| Secrets | AES-256 (KMS) | TLS 1.2+ |

---

## ARC-010.0 - Monitoring & Logging

### CloudWatch

```
Log Groups:
  /aws/lambda/aerologue-*
  /aws/apigateway/aerologue-*
  /aws/rds/cluster/aerologue-aurora

Retention: 30 days (MVP), 90 days (production)

Metrics Namespace: Aerologue

Custom Metrics:
  - ActiveWebSocketConnections
  - FlightPositionsProcessed
  - CrossingsDetected
  - GreetingsSent
  - APILatency (p50, p95, p99)
  - ErrorRate
```

### Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| API Error Rate | >5% for 5 min | SNS → Email |
| API Latency p99 | >2s for 5 min | SNS → Email |
| Lambda Errors | >10 in 5 min | SNS → Email |
| Aurora CPU | >80% for 10 min | SNS → Email |
| DynamoDB Throttles | Any | SNS → Email |
| WebSocket Connections | >80% limit | SNS → Email |

### X-Ray Tracing

```
Enabled for:
  - API Gateway
  - Lambda functions
  - External API calls (ADSB, etc.)

Sampling: 5% of requests (adjustable)
```

---

## ARC-011.0 - Cost Optimization

### Estimated Monthly Costs (MVP Scale)

| Service | Configuration | Est. Cost |
|---------|---------------|-----------|
| Lambda | 1M invocations, 512MB avg | $20 |
| API Gateway | 1M REST, 500K WS messages | $15 |
| Aurora Serverless | 0.5-4 ACU, 10GB | $50 |
| DynamoDB | On-demand, 10GB | $30 |
| Timestream | 10GB storage, 1M writes | $25 |
| ElastiCache | t4g.micro | $15 |
| S3 | 50GB, 1M requests | $5 |
| CloudFront | 100GB transfer | $10 |
| Cognito | 10K MAU (free tier) | $0 |
| Route 53 | 1 hosted zone | $1 |
| Secrets Manager | 10 secrets | $5 |
| CloudWatch | Basic monitoring | $10 |
| **Total** | | **~$186/month** |

### Cost Saving Strategies

1. **Aurora Serverless v2** - Scales to 0 ACU when idle
2. **DynamoDB On-Demand** - Pay per request, no provisioning
3. **Lambda ARM64** - 20% cheaper than x86
4. **S3 Lifecycle** - Move old data to cheaper tiers
5. **CloudFront Caching** - Reduce origin requests
6. **Reserved Capacity** - Commit for 1 year when stable

---

## ARC-012.0 - Future Global Scaling

### Multi-Region Architecture (Phase 2)

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │   (Geo DNS)     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   us-east-1     │ │   eu-west-1     │ │   ap-southeast-1│
│   (Primary)     │ │   (Europe)      │ │   (Asia)        │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ API Gateway     │ │ API Gateway     │ │ API Gateway     │
│ Lambda          │ │ Lambda          │ │ Lambda          │
│ DynamoDB Global │◄┼►DynamoDB Global │◄┼►DynamoDB Global │
│ Aurora Global   │◄┼►Aurora Replica  │◄┼►Aurora Replica  │
│ ElastiCache     │ │ ElastiCache     │ │ ElastiCache     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Global Services

| Service | Multi-Region Strategy |
|---------|----------------------|
| DynamoDB | Global Tables (automatic replication) |
| Aurora | Global Database (read replicas) |
| S3 | Cross-region replication |
| CloudFront | Already global |
| Route 53 | Geolocation routing |
| Cognito | Regional (users register in nearest) |

### Data Residency Considerations

- **Flight data**: Global (aircraft are global)
- **User data**: Store in user's region (GDPR)
- **Messages**: Store in sender's region, replicate
- **Vlogs**: Store where created, CDN for delivery

### Estimated Multi-Region Costs

| Region | Added Cost |
|--------|------------|
| EU (eu-west-1) | +$150/month |
| Asia (ap-southeast-1) | +$150/month |
| **Total 3-region** | ~$500/month |

---

## ARC-013.0 - Disaster Recovery

### Backup Strategy

| Data | Backup Frequency | Retention | Recovery Point |
|------|------------------|-----------|----------------|
| Aurora | Continuous | 7 days | Point-in-time |
| DynamoDB | On-demand | 35 days | Point-in-time |
| S3 | Versioning | 30 days | Any version |
| Timestream | N/A (TTL-based) | N/A | N/A |

### Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Lambda failure | <1 min | 0 |
| Database failure | <15 min | <5 min |
| Region failure | <1 hour | <5 min |
| Data corruption | <4 hours | <1 hour |

### Failover Procedures

1. **Database failover**: Aurora automatic failover to replica
2. **Region failover**: Route 53 health checks, automatic DNS failover
3. **Manual recovery**: Restore from backup, update DNS

---

## ARC-014.0 - Infrastructure as Code

### Terraform Structure

```
infrastructure/
├── environments/
│   ├── dev/
│   │   └── main.tf
│   ├── staging/
│   │   └── main.tf
│   └── prod/
│       └── main.tf
├── modules/
│   ├── vpc/
│   ├── aurora/
│   ├── dynamodb/
│   ├── lambda/
│   ├── api-gateway/
│   ├── cognito/
│   ├── cloudfront/
│   ├── s3/
│   └── monitoring/
├── main.tf
├── variables.tf
├── outputs.tf
└── backend.tf
```

### State Management

```
Backend: S3 + DynamoDB

Bucket: aerologue-terraform-state
DynamoDB Table: aerologue-terraform-locks

State Files:
  - dev/terraform.tfstate
  - staging/terraform.tfstate
  - prod/terraform.tfstate
```

### Deployment Pipeline

```
GitHub Actions:

1. On PR to main:
   - terraform plan
   - Post plan as PR comment

2. On merge to main:
   - terraform apply (staging)
   - Run integration tests
   - Manual approval gate
   - terraform apply (prod)
```

---

## ARC-015.0 - Environment Configuration

### Environment Variables

| Variable | Dev | Staging | Prod |
|----------|-----|---------|------|
| `ENVIRONMENT` | dev | staging | prod |
| `LOG_LEVEL` | debug | info | warn |
| `API_RATE_LIMIT` | 100/min | 500/min | 1000/min |
| `ADSB_PROVIDER` | mock | real | real |
| `ENABLE_ANALYTICS` | false | true | true |

### Feature Flags

Managed via DynamoDB `config` table:

| Flag | Dev | Staging | Prod |
|------|-----|---------|------|
| `crossing_detection` | true | true | true |
| `greeting_feature` | true | true | true |
| `vlog_native_upload` | true | true | false |
| `admin_manual_checkin` | true | true | false |

---

## Summary

This architecture provides:

1. **Scalable foundation** - Serverless compute, managed databases
2. **Cost-effective MVP** - ~$186/month estimated
3. **Security by default** - Encryption, WAF, least privilege
4. **Global-ready** - Clear path to multi-region
5. **Observable** - Comprehensive logging and monitoring
6. **Reproducible** - Infrastructure as Code with Terraform

