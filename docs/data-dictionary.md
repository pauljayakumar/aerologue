# Data Dictionary

This document contains the comprehensive data field mappings from external APIs to internal database schemas, including transformation rules.

## Numbering Convention
All items in this document use the format: **DAT-[NUMBER].[REVISION]**

Example: `DAT-001.0` (Data mapping 1, initial version)

---

## DAT-001.0 - Flight Position Data

**Sources:** ADS-B Exchange, OpenSky Network, AirNav RadarBox, VariFlight, Aireon
**Target:** Amazon Timestream (CMP-004.0)

### Field Mappings

| API Field | Normalized Field | Type | Description | Transform |
|-----------|------------------|------|-------------|-----------|
| `icao24` / `hex` / `mode_s` | `aircraft_id` | string | Unique aircraft identifier | Uppercase, trim |
| `flight` / `callsign` | `callsign` | string | Flight callsign | Uppercase, trim |
| `r` / `registration` | `registration` | string | Aircraft registration | Uppercase |
| `t` / `type` | `aircraft_type` | string | Aircraft type code | Map to standard |
| `lat` / `latitude` | `latitude` | double | Latitude | Validate range |
| `lon` / `longitude` | `longitude` | double | Longitude | Validate range |
| `alt_baro` / `altitude` | `altitude_ft` | int | Altitude in feet | Convert if meters |
| `gs` / `spd` / `speed` | `ground_speed_kts` | int | Ground speed | Convert if km/h |
| `track` / `heading` / `dir` | `heading_deg` | int | Heading degrees | Normalize 0-360 |
| `baro_rate` / `vs` | `vertical_rate` | int | Vertical speed ft/min | Standardize sign |
| `squawk` | `squawk` | string | Transponder code | Validate 4-digit |
| `on_ground` / `gnd` | `on_ground` | boolean | Aircraft on ground | Convert to bool |
| `timestamp` / `now` | `timestamp` | timestamp | Position time | Convert to UTC |
| `category` | `wake_category` | string | Wake turbulence cat | Map to standard |

### Provider-Specific Field Names

| Field | ADS-B Exchange | OpenSky Network | RadarBox | VariFlight | AirLabs |
|-------|----------------|-----------------|----------|------------|---------|
| Aircraft ID | `hex` | `states[0]` (icao24) | `mode_s` | `icao24` | `hex` |
| Callsign | `flight` | `states[1]` | `callsign` | `flight_number` | `flight_icao` |
| Latitude | `lat` | `states[6]` | `latitude` | `lat` | `lat` |
| Longitude | `lon` | `states[5]` | `longitude` | `lng` | `lng` |
| Altitude | `alt_baro` | `states[7]` (meters) | `altitude` | `alt` | `alt` |
| Speed | `gs` | `states[9]` (m/s) | `speed` | `spd` | `speed` |
| Heading | `track` | `states[10]` | `heading` | `dir` | `dir` |
| On Ground | N/A (derived) | `states[8]` | `on_ground` | `gnd` | `on_ground` |
| Vertical Rate | `baro_rate` | `states[11]` (m/s) | `vs` | `vs` | `vertical_rate` |
| Registration | `r` | N/A | `registration` | `reg` | `reg_number` |
| Aircraft Type | `t` | N/A | `type` | `aircraft_type` | `aircraft_type` |
| Squawk | `squawk` | N/A | `squawk` | `squawk` | `squawk` |
| Category | `category` | N/A | `category` | N/A | N/A |

**Note:** OpenSky Network returns data as an array of state vectors, not objects. Each state is an array where position 0 is icao24, position 1 is callsign, etc. OpenSky does not provide registration, aircraft type, squawk, or category data.

### Timestream Schema

```
Table: flight_positions
Dimensions: aircraft_id, callsign, registration
Measures: latitude, longitude, altitude_ft, ground_speed_kts, heading_deg, vertical_rate, on_ground
Time: timestamp
```

---

## DAT-002.0 - Static Airport Data

**Sources:** AeroDataBox, AirLabs, AirportDB
**Target:** Amazon Aurora PostgreSQL (CMP-017.0)

### Field Mappings

| API Field | DB Column | Type | Description | Transform |
|-----------|-----------|------|-------------|-----------|
| `iata` / `iata_code` | `iata_code` | char(3) | IATA airport code | Uppercase |
| `icao` / `icao_code` | `icao_code` | char(4) | ICAO airport code | Uppercase |
| `name` / `airport_name` | `name` | varchar | Airport name | Trim, title case |
| `city` / `municipality` | `city` | varchar | City name | Trim |
| `country` / `country_code` | `country_code` | char(2) | ISO country code | Uppercase |
| `lat` / `latitude` | `latitude` | decimal | Latitude | Validate |
| `lon` / `longitude` | `longitude` | decimal | Longitude | Validate |
| `elevation` / `alt` | `elevation_ft` | int | Elevation in feet | Convert if meters |
| `timezone` / `tz` | `timezone` | varchar | IANA timezone | Validate |
| `type` | `airport_type` | varchar | large/medium/small | Standardize |
| `runways` | `runways` | jsonb | Runway details | Parse array |
| `terminals` | `terminals` | jsonb | Terminal info | Parse array |
| `website` | `website` | varchar | Airport website | Validate URL |
| `phone` | `phone` | varchar | Contact phone | Format |

### PostgreSQL Schema

```sql
CREATE TABLE airports (
    icao_code CHAR(4) PRIMARY KEY,
    iata_code CHAR(3) UNIQUE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country_code CHAR(2) NOT NULL,
    location GEOGRAPHY(POINT, 4326),  -- PostGIS
    elevation_ft INT,
    timezone VARCHAR(50),
    airport_type VARCHAR(20),
    runways JSONB,
    terminals JSONB,
    website VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_airports_iata ON airports(iata_code);
CREATE INDEX idx_airports_location ON airports USING GIST(location);
CREATE INDEX idx_airports_country ON airports(country_code);
```

---

## DAT-003.0 - Live Airport Schedules

**Sources:** AeroDataBox, AirLabs
**Target:** Amazon DynamoDB (CMP-018.0)

### Field Mappings

| API Field | DB Attribute | Type | Description | Transform |
|-----------|--------------|------|-------------|-----------|
| `flight_iata` | `flight_number` | S | Flight number | Uppercase |
| `dep_iata` / `origin` | `origin_iata` | S | Origin airport | Uppercase |
| `arr_iata` / `destination` | `destination_iata` | S | Destination | Uppercase |
| `status` | `status` | S | Flight status | Map to enum |
| `dep_scheduled` | `scheduled_departure` | S | Scheduled dep | ISO 8601 UTC |
| `dep_estimated` | `estimated_departure` | S | Estimated dep | ISO 8601 UTC |
| `dep_actual` | `actual_departure` | S | Actual dep | ISO 8601 UTC |
| `arr_scheduled` | `scheduled_arrival` | S | Scheduled arr | ISO 8601 UTC |
| `arr_estimated` | `estimated_arrival` | S | Estimated arr | ISO 8601 UTC |
| `arr_actual` | `actual_arrival` | S | Actual arr | ISO 8601 UTC |
| `gate` / `dep_gate` | `departure_gate` | S | Departure gate | Trim |
| `terminal` | `terminal` | S | Terminal | Trim |
| `baggage` | `baggage_claim` | S | Baggage carousel | Trim |
| `delay` | `delay_minutes` | N | Delay in minutes | Parse int |
| `airline_iata` | `airline_iata` | S | Airline code | Uppercase |

### DynamoDB Schema

```
Table: airport_schedules

Primary Key:
  PK: airport_iata#date (e.g., "JFK#2024-01-15")
  SK: flight_number#scheduled_time (e.g., "AA100#2024-01-15T10:30:00Z")

GSI1 (by flight):
  PK: flight_number
  SK: date

TTL: ttl_timestamp (expire after 24 hours)
```

### Status Enum Mapping

| API Status | Normalized Status |
|------------|-------------------|
| `scheduled`, `on_time` | `SCHEDULED` |
| `delayed` | `DELAYED` |
| `departed`, `in_air`, `en_route` | `IN_FLIGHT` |
| `landed`, `arrived` | `ARRIVED` |
| `cancelled`, `canceled` | `CANCELLED` |
| `diverted` | `DIVERTED` |

---

## DAT-004.0 - Transformation Rules

### General Rules

| Category | Rule | Example |
|----------|------|---------|
| **Airport/Airline Codes** | Uppercase, trim whitespace | `"jfk "` → `"JFK"` |
| **Coordinates** | Validate range, 6 decimal precision | lat: -90 to 90, lon: -180 to 180 |
| **Altitude** | Convert to feet if meters | meters × 3.28084 |
| **Speed** | Convert to knots if km/h | km/h × 0.539957 |
| **Timestamps** | Convert to UTC ISO 8601 | `"2024-01-15T10:30:00Z"` |
| **Booleans** | Normalize to true/false | `1`, `"true"`, `"Y"` → `true` |
| **Nulls** | Handle missing data gracefully | Use defaults or skip field |
| **Duplicates** | Dedupe by aircraft_id + timestamp | Keep latest if within 1 second |

### Validation Rules

| Field | Validation | Action on Fail |
|-------|------------|----------------|
| `latitude` | -90 ≤ lat ≤ 90 | Reject record |
| `longitude` | -180 ≤ lon ≤ 180 | Reject record |
| `altitude_ft` | 0 ≤ alt ≤ 60000 | Flag as suspect |
| `ground_speed_kts` | 0 ≤ speed ≤ 700 | Flag as suspect |
| `heading_deg` | 0 ≤ heading < 360 | Normalize (mod 360) |
| `squawk` | 4 octal digits | Set to null |
| `iata_code` | 3 alpha chars | Reject record |
| `icao_code` | 4 alphanumeric | Reject record |

### Unit Conversions

| From | To | Formula |
|------|----|---------|
| Meters | Feet | × 3.28084 |
| Kilometers | Nautical Miles | × 0.539957 |
| km/h | Knots | × 0.539957 |
| m/s | ft/min | × 196.85 |
| hPa | inHg | × 0.02953 |

### Aircraft Type to Icon Mapping

Maps ICAO aircraft type codes to available icon assets (CMP-024.0).

| Icon | Aircraft Types Mapped |
|------|----------------------|
| `737` | B731-B739, B37M/B38M/B39M/B3XM (MAX), B752/B753, MD-80/81/82/83/87/88/90 |
| `747` | B741-B748, B74D/B74R/B74S, AN12, A124, A225, IL76 |
| `777` | B772/B773/B778/B779, B77L/B77W, B762-B764, A148, IL96 |
| `787` | B788/B789/B78X |
| `A320` | A318-A321, A19N/A20N/A21N (neo), BCS1/BCS3 (A220), E170-E295, CRJ1-CRJX, E135/E145 |
| `A340` | A342-A346, A306/A30B/A310, MD11, DC10, L101 |
| `A350` | A359/A35K, A332/A333/A338/A339 |
| `A380` | A388, A38F |
| `ATR72` | AT43-AT76, ATR, DH8A-DH8D, SF34/SB20, F50/F27 |

**Fallback Logic:**
- If exact match not found, try first 4 characters
- `B7x` → 777, `B3x` → 737, `A3x` → A320, `ATx` → ATR72
- Default: A320 (most common narrow-body silhouette)

---

## DAT-005.0 - Data Pipeline Architecture

### Flow Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  API Fetch  │ ──► │  Normalize   │ ──► │  Validate   │ ──► │  Store   │
│  (CMP-001)  │     │  (CMP-019)   │     │  & Dedupe   │     │  (DBs)   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
       │                   │                    │                  │
       ▼                   ▼                    ▼                  ▼
   Raw JSON          Unified Schema       Clean Data         Timestream
   from APIs         Provider-agnostic    Ready to store     PostgreSQL
                                                             DynamoDB
```

### Processing Steps

1. **Fetch** - Pull data from enabled API providers
2. **Parse** - Extract fields using provider-specific mappings
3. **Normalize** - Convert to unified internal schema
4. **Transform** - Apply unit conversions, formatting
5. **Validate** - Check data quality, ranges
6. **Deduplicate** - Remove duplicates by key + timestamp
7. **Route** - Direct to appropriate database
8. **Store** - Insert/update with error handling

### Error Handling

| Error Type | Action |
|------------|--------|
| API timeout | Retry with backoff, switch to fallback provider |
| Invalid data | Log, skip record, continue processing |
| DB write fail | Retry, dead-letter queue if persistent |
| Rate limit | Throttle requests, queue overflow |

---

## DAT-006.0 - Data Retention Policies

### Automatic Retention (Time-Based)

| Data Type | Hot | Warm | Cold | Archive |
|-----------|-----|------|------|---------|
| Flight positions | 1 hour | 24 hours | 7 days | S3 (90 days) |
| Airport schedules | 24 hours | - | - | Delete |
| Crossing events | 1 hour | - | - | Delete |
| Messages | - | 30 days | 1 year | S3 |
| User data | - | - | Indefinite* | - |
| Gamification | - | - | Indefinite* | - |
| Vlogs | - | - | Indefinite* | - |
| Sessions | 30 days | - | - | Delete |
| Wallet documents | - | - | Until expiry + 30 days | Delete |
| Saved offers | - | - | Until expiry + 7 days | Delete |
| Audit logs | - | 1 year | 2 years | S3 (5 years) |

*\*Indefinite = No automatic expiry, but subject to user-initiated deletion (see GDPR section below)*

---

### GDPR & Privacy Compliance - User Data Deletion

**Legal Basis:** GDPR Article 17 "Right to Erasure" (Right to be Forgotten), CCPA, and similar regulations.

**Key Principle:** "Indefinite retention" means we don't auto-delete user data, but users CAN request full deletion at any time.

#### Deletion Request Process

1. **User initiates deletion** (via app settings or support request)
2. **Soft-delete immediately** (within 24 hours):
   - Mark `account_status = 'pending_deletion'`
   - Remove from all active queries and displays
   - User can no longer log in
3. **Grace period** (30 days):
   - User can cancel deletion and recover account
   - Data remains but is inaccessible
4. **Hard-delete** (after 30 days):
   - Permanently remove all personal data
   - Execute cascade deletion rules (see below)
   - Generate deletion confirmation record (anonymized)

#### Deletion Cascade Rules

| Data Type | Deletion Action | Rationale |
|-----------|-----------------|-----------|
| **user_profiles** | Hard delete | Primary PII |
| **Email, name, phone** | Hard delete | Direct identifiers |
| **user_sessions** | Hard delete | Personal data |
| **user_context** | Hard delete | Location data (sensitive) |
| **wallet_documents** | Hard delete | Sensitive travel documents |
| **wallet_transactions** | Anonymize user_id | Preserve financial records for audit |
| **user_wallets** | Hard delete | Personal financial data |
| **Messages sent** | Anonymize sender_id | Preserve for recipient's record |
| **Messages received** | Hard delete | Personal data |
| **Vlogs created** | Offer transfer or delete | User's content - give choice |
| **user_gamification** | Anonymize | Preserve leaderboard integrity |
| **user_achievements** | Hard delete | Personal progress data |
| **Crossing events (user involved)** | Anonymize user_id | Preserve aggregate stats |

#### Anonymization Strategy

For data that must be preserved (leaderboards, aggregate stats), replace personal identifiers:

```
Original: user_id = "abc123", display_name = "John Doe"
Anonymized: user_id = "DELETED_a1b2c3", display_name = "[Deleted User]"
```

- Generate unique anonymous ID to maintain referential integrity
- Remove all PII fields (email, name, avatar, etc.)
- Preserve non-identifying metrics (points, counts)

#### User Data Export (GDPR Article 20 - Data Portability)

Before deletion, users can request a full data export:

**Export Package Contents:**
- Profile information (JSON)
- All messages sent and received (JSON)
- Gamification history (JSON)
- Achievement list (JSON)
- Wallet transaction history (JSON)
- Wallet documents (original files + metadata)
- Vlogs created (metadata + links)
- Flight tracking history (JSON)

**Export Format:** ZIP file containing JSON files + original documents
**Delivery:** Secure download link (expires in 7 days)
**Timeline:** Within 30 days of request (GDPR requirement)

#### Implementation Requirements

**Database:**
- Add `deletion_requested_at` timestamp to user_profiles
- Add `deletion_scheduled_at` timestamp (request + 30 days)
- Add `anonymized_id` field for post-deletion references

**Background Job:**
- Daily job to process accounts past grace period
- Execute deletion cascade
- Generate audit log entry

**Audit Trail:**
- Log all deletion requests (who, when, IP)
- Log deletion execution (anonymized record)
- Retain audit logs for 5 years (legal compliance)

**Admin Console:**
- View pending deletion requests
- Cancel deletion (with user consent)
- Force immediate deletion (support escalation)
- View deletion audit log

#### Consent Management

**At Registration:**
- Clear consent checkbox for data processing
- Link to privacy policy
- Store `consent_given_at` timestamp

**Consent Fields (user_profiles):**
```sql
consent_given_at TIMESTAMP,
consent_version VARCHAR(20),  -- e.g., "v1.0"
marketing_consent BOOLEAN DEFAULT false,
analytics_consent BOOLEAN DEFAULT true,
```

**Consent Updates:**
- Users can withdraw consent anytime
- Withdrawal logged with timestamp
- Some features may be limited without consent

---

## DAT-007.0 - User Profile Data

**Source:** Application + Cognito
**Target:** Amazon Aurora PostgreSQL (CMP-017.0)

### User Profile Table

```sql
CREATE TABLE user_profiles (
    user_id VARCHAR(128) PRIMARY KEY,  -- From Cognito sub
    email VARCHAR(255),                 -- From Cognito (synced)
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),

    -- Settings
    default_greeting_message TEXT,
    language_code CHAR(2) DEFAULT 'en',
    timezone VARCHAR(50),
    distance_unit VARCHAR(10) DEFAULT 'km',  -- km or miles

    -- Privacy
    privacy_level VARCHAR(20) DEFAULT 'friends',  -- public, friends, private
    location_sharing BOOLEAN DEFAULT true,
    show_on_crossing BOOLEAN DEFAULT true,

    -- Notifications
    notify_crossings BOOLEAN DEFAULT true,
    notify_greetings BOOLEAN DEFAULT true,
    notify_achievements BOOLEAN DEFAULT true,
    notify_flight_updates BOOLEAN DEFAULT true,

    -- Status
    account_status VARCHAR(20) DEFAULT 'active',  -- active, suspended, deleted
    subscription_tier VARCHAR(20) DEFAULT 'free',  -- free, premium, pro

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,

    -- Cognito sync
    cognito_synced_at TIMESTAMP
);

CREATE INDEX idx_user_email ON user_profiles(email);
CREATE INDEX idx_user_status ON user_profiles(account_status);
CREATE INDEX idx_user_subscription ON user_profiles(subscription_tier);
```

### Cognito to Profile Mapping

| Cognito Attribute | Profile Column | Sync Direction |
|-------------------|----------------|----------------|
| `sub` | `user_id` | Cognito → DB |
| `email` | `email` | Cognito → DB |
| `email_verified` | - | Check only |
| `name` | `display_name` | Cognito ↔ DB |
| `picture` | `avatar_url` | Cognito ↔ DB |

---

## DAT-008.0 - User Session Data

**Source:** Application
**Target:** Amazon DynamoDB (CMP-018.0)

### User Session Table

```
Table: user_sessions

Primary Key:
  PK: user_id
  SK: session_id

Attributes:
  - user_id (S): Cognito user sub
  - session_id (S): Unique session identifier
  - device_id (S): Unique device identifier
  - device_type (S): ios, android, windows, web
  - device_model (S): Device model name
  - app_version (S): App version number
  - os_version (S): Operating system version
  - push_token (S): Push notification token
  - created_at (S): Session start time (ISO 8601)
  - last_active_at (S): Last activity time (ISO 8601)
  - ip_address (S): Client IP address
  - location_country (S): Country code from IP
  - ttl (N): TTL timestamp for auto-expiry

GSI1 (by device):
  PK: device_id
  SK: created_at

TTL: 30 days of inactivity
```

---

## DAT-009.0 - User Context Data

**Source:** Application (auto-detect or manual check-in)
**Target:** Amazon DynamoDB (CMP-018.0)

### User Context Table

```
Table: user_context

Primary Key:
  PK: user_id

Attributes:
  - user_id (S): Cognito user sub
  - context_type (S): none, at_airport, on_plane, in_flight
  - detection_method (S): auto, manual

  -- Airport context
  - airport_icao (S): Current airport ICAO code
  - terminal (S): Terminal if known

  -- Flight context
  - flight_id (S): Flight identifier
  - flight_number (S): Flight number (e.g., AA100)
  - aircraft_id (S): Aircraft ICAO24
  - origin_icao (S): Origin airport
  - destination_icao (S): Destination airport
  - flight_phase (S): boarding, taxiing, takeoff, cruise, descent, landed
  - seat (S): Seat number if provided

  -- Position
  - latitude (N): Current latitude
  - longitude (N): Current longitude
  - altitude_ft (N): Current altitude

  -- Timestamps
  - context_started_at (S): When context began
  - last_updated_at (S): Last position update
  - ttl (N): TTL for auto-cleanup

GSI1 (by flight):
  PK: flight_id
  SK: user_id
  -- For finding all users on a flight

GSI2 (by airport):
  PK: airport_icao
  SK: user_id
  -- For finding all users at an airport

TTL: 24 hours after flight lands or leaves airport
```

---

## DAT-010.0 - User Gamification Data

**Source:** Application
**Target:** Amazon Aurora PostgreSQL (CMP-017.0)

### Gamification Tables

```sql
-- User points and level
CREATE TABLE user_gamification (
    user_id VARCHAR(128) PRIMARY KEY REFERENCES user_profiles(user_id),
    total_points INT DEFAULT 0,
    current_level INT DEFAULT 1,
    flights_tracked INT DEFAULT 0,
    greetings_sent INT DEFAULT 0,
    greetings_received INT DEFAULT 0,
    crossings_count INT DEFAULT 0,
    airports_visited INT DEFAULT 0,
    countries_visited INT DEFAULT 0,
    distance_flown_km INT DEFAULT 0,
    time_in_air_minutes INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements earned
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES user_profiles(user_id),
    achievement_id VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    progress INT,  -- For partial achievements
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_id);

-- Achievement definitions
CREATE TABLE achievements (
    achievement_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    points_value INT DEFAULT 0,
    category VARCHAR(50),  -- travel, social, milestone
    requirement_type VARCHAR(50),  -- count, streak, special
    requirement_value INT,
    is_active BOOLEAN DEFAULT true
);

-- Leaderboards (materialized view, refreshed periodically)
CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT
    user_id,
    display_name,
    total_points,
    current_level,
    RANK() OVER (ORDER BY total_points DESC) as rank
FROM user_gamification
JOIN user_profiles USING (user_id)
WHERE account_status = 'active'
ORDER BY total_points DESC
LIMIT 1000;

-- Index for fast refresh
CREATE UNIQUE INDEX idx_leaderboard_global_user ON leaderboard_global(user_id);
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_global(rank);
CREATE INDEX idx_gamification_points ON user_gamification(total_points DESC);
```

### Leaderboard Refresh Strategy

**TODO: Define detailed implementation during development phase**

**Options to Evaluate:**

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Materialized View + Scheduled Refresh** | Simple, efficient reads | Stale data between refreshes | Low-traffic apps |
| **Real-time Query + Redis Cache** | Fresh data, fast reads | Higher DB load, cache invalidation | High-traffic apps |
| **Event-driven Update** | Near real-time, efficient | Complex implementation | Gaming-focused apps |
| **Hybrid (MV + cache)** | Balance of freshness/performance | More moving parts | Medium-high traffic |

**Questions to Answer:**
- [ ] What refresh frequency is acceptable? (1 min? 5 min? 1 hour?)
- [ ] Do users need real-time rank updates or is periodic OK?
- [ ] How many concurrent leaderboard viewers expected?
- [ ] Should we have multiple leaderboards (daily, weekly, all-time)?
- [ ] Should we cache user's own rank separately for instant access?

**Initial Recommendation (MVP):**
- Materialized view refreshed every 15 minutes
- User's own rank cached in Redis (updated on point change)
- Re-evaluate after launch based on usage patterns

**Implementation Notes:**
```sql
-- Refresh command (run via scheduled Lambda/cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;

-- User's rank query (for real-time self-rank)
SELECT RANK() OVER (ORDER BY total_points DESC) as my_rank
FROM user_gamification
WHERE user_id = $1;
```

---

## DAT-011.0 - User Wallet Data

**Source:** Application
**Target:** Amazon Aurora PostgreSQL (CMP-017.0)

### Wallet Tables

```sql
-- User wallet balance
CREATE TABLE user_wallets (
    user_id VARCHAR(128) PRIMARY KEY REFERENCES user_profiles(user_id),
    balance_coins INT DEFAULT 0,        -- In-app currency
    balance_premium INT DEFAULT 0,      -- Premium currency
    lifetime_earned INT DEFAULT 0,
    lifetime_spent INT DEFAULT 0,
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction history
CREATE TABLE wallet_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(128) REFERENCES user_profiles(user_id),
    transaction_type VARCHAR(50) NOT NULL,  -- earn, spend, purchase, refund
    currency_type VARCHAR(20) NOT NULL,     -- coins, premium
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),  -- achievement, purchase, gift
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_transactions_date ON wallet_transactions(created_at);
CREATE INDEX idx_transactions_type ON wallet_transactions(transaction_type);
```

### Travel Documents (DynamoDB - CMP-018.0)

```
Table: wallet_documents

Primary Key:
  PK: user_id
  SK: document_type#document_id

Attributes:
  - user_id (S): Cognito user sub
  - document_id (S): Unique document identifier
  - document_type (S): ticket, boarding_pass, evisa, hotel, taxi
  - title (S): Display name
  - status (S): active, used, expired, cancelled

  -- Common fields
  - issue_date (S): When document was added
  - valid_from (S): Start validity
  - valid_until (S): End validity / expiry
  - reference_number (S): Booking/confirmation number

  -- Document-specific data (flexible schema)
  - document_data (M): Map containing type-specific fields

  -- Storage
  - file_url (S): S3 URL for PDF/image
  - file_type (S): pdf, png, jpg, pkpass
  - thumbnail_url (S): Thumbnail for display

  -- Metadata
  - source (S): manual, email_import, api_import
  - created_at (S): ISO 8601
  - updated_at (S): ISO 8601
  - ttl (N): Auto-delete after expiry + 30 days

GSI1 (by type and date):
  PK: user_id#document_type
  SK: valid_from
  -- For listing all tickets, all boarding passes, etc.

GSI2 (by status):
  PK: user_id#status
  SK: valid_until
  -- For showing active documents first
```

### Document Type Specific Fields

**Ticket (ticket)**
```json
{
  "flight_number": "AA100",
  "origin_iata": "JFK",
  "destination_iata": "LAX",
  "departure_time": "2024-01-15T10:30:00Z",
  "arrival_time": "2024-01-15T13:45:00Z",
  "passenger_name": "John Doe",
  "seat": "12A",
  "class": "economy",
  "airline_iata": "AA",
  "pnr": "ABC123"
}
```

**Boarding Pass (boarding_pass)**
```json
{
  "flight_number": "AA100",
  "origin_iata": "JFK",
  "destination_iata": "LAX",
  "departure_time": "2024-01-15T10:30:00Z",
  "gate": "B22",
  "boarding_time": "2024-01-15T09:45:00Z",
  "seat": "12A",
  "sequence": "042",
  "barcode_data": "M1DOE/JOHN...",
  "passenger_name": "John Doe"
}
```

**E-Visa (evisa)**
```json
{
  "country_code": "AE",
  "country_name": "United Arab Emirates",
  "visa_type": "tourist",
  "visa_number": "V123456789",
  "entries": "single",
  "duration_days": 30,
  "passport_number": "AB1234567"
}
```

**Hotel Booking (hotel)**
```json
{
  "hotel_name": "Grand Hotel",
  "address": "123 Main St, City",
  "city": "Dubai",
  "country_code": "AE",
  "check_in": "2024-01-15",
  "check_out": "2024-01-18",
  "room_type": "Deluxe King",
  "guests": 2,
  "confirmation_number": "HTL123456",
  "contact_phone": "+971-4-123-4567"
}
```

**Taxi/Transport Booking (taxi)**
```json
{
  "service_name": "Airport Transfer",
  "provider": "Uber",
  "pickup_location": "JFK Terminal 4",
  "pickup_time": "2024-01-15T14:00:00Z",
  "dropoff_location": "123 Main St, NYC",
  "vehicle_type": "sedan",
  "confirmation_number": "TXI789012",
  "driver_name": "TBD",
  "driver_phone": "TBD"
}
```

### Saved Offers & Ads (DynamoDB - CMP-018.0)

```
Table: wallet_saved_items

Primary Key:
  PK: user_id
  SK: item_type#item_id

Attributes:
  - user_id (S): Cognito user sub
  - item_id (S): Unique item identifier
  - item_type (S): offer, ad, coupon, deal
  - title (S): Display title
  - description (S): Item description
  - status (S): saved, redeemed, expired

  -- Offer details
  - merchant_name (S): Business name
  - merchant_logo_url (S): Logo image
  - discount_type (S): percentage, fixed, freebie
  - discount_value (S): "20%" or "$10"
  - terms (S): Terms and conditions
  - promo_code (S): Code to use

  -- Validity
  - valid_from (S): Start date
  - valid_until (S): Expiry date
  - usage_limit (N): Max uses
  - times_used (N): Current uses

  -- Source
  - campaign_id (S): Ad campaign reference
  - source (S): in_app, partner, location_based

  -- Timestamps
  - saved_at (S): When user saved it
  - redeemed_at (S): When used
  - ttl (N): Auto-delete after expiry + 7 days

GSI1 (active offers):
  PK: user_id#status
  SK: valid_until
```

---

## DAT-012.0 - Flight Crossings Data

**Purpose:** Record every flight that came within 20 miles of an aircraft where an Aerologue user is present. Used for gamification (achievements, stats, social features).

**Source:** Flight Crossing Detector (CMP-006.0)
**Target:** Amazon DynamoDB (CMP-018.0)

### Flight Crossings Table

```
Table: flight_crossings

Primary Key:
  PK: user_id                    # The user who experienced the crossing
  SK: crossing_id                # Unique crossing identifier (UUID)

Attributes:
  -- Crossing Identity
  - crossing_id (S): UUID for this crossing event
  - user_id (S): User who was on a flight during crossing
  - user_flight_id (S): User's flight identifier (e.g., "AA100")

  -- Crossed Flight Details
  - crossed_flight_id (S): The other flight's identifier
  - crossed_aircraft_id (S): ICAO24 hex code of crossed aircraft
  - crossed_callsign (S): Callsign of crossed flight
  - crossed_aircraft_type (S): Aircraft type (e.g., "B738", "A320")
  - crossed_airline_iata (S): Airline code (e.g., "UA", "DL")
  - crossed_origin_icao (S): Origin airport of crossed flight
  - crossed_destination_icao (S): Destination airport of crossed flight

  -- Crossing Location & Parameters
  - crossing_lat (N): Latitude where crossing detected
  - crossing_lon (N): Longitude where crossing detected
  - user_altitude_ft (N): User's aircraft altitude at crossing
  - crossed_altitude_ft (N): Crossed aircraft altitude
  - altitude_diff_ft (N): Absolute altitude difference
  - distance_miles (N): Horizontal distance between aircraft
  - user_heading_deg (N): User's aircraft heading
  - crossed_heading_deg (N): Crossed aircraft heading
  - relative_bearing_deg (N): Bearing from user to crossed aircraft
  - closing_speed_kts (N): Relative speed (approaching or separating)

  -- Context
  - user_flight_phase (S): User's flight phase (cruise, climb, descent)
  - crossed_flight_phase (S): Crossed flight's phase
  - region (S): Geographic region (e.g., "North Atlantic", "US Midwest")
  - country_code (S): Country airspace where crossing occurred

  -- Gamification Flags
  - is_rare_aircraft (BOOL): Crossed aircraft is rare type
  - is_international (BOOL): Crossed flight is international route
  - is_long_haul (BOOL): Crossed flight is long-haul (>6 hours)
  - points_earned (N): Gamification points awarded for this crossing
  - achievement_triggered (S): Achievement ID if this crossing triggered one

  -- Status
  - has_active_user (BOOL): Does crossed flight have an Aerologue user?
  - greeting_eligible (BOOL): Can users exchange greetings?
  - greeting_sent (BOOL): Was a greeting sent?
  - greeting_received (BOOL): Was a greeting received?

  -- Timestamps
  - detected_at (S): ISO 8601 timestamp of detection
  - created_at (S): Record creation time
  - ttl (N): TTL for auto-expiry (7 days for gamification history)

GSI1 (by flight - find all crossings for a flight):
  PK: user_flight_id
  SK: detected_at

GSI2 (by crossed flight - find if crossed flight has users):
  PK: crossed_flight_id
  SK: detected_at

GSI3 (by region - analytics):
  PK: region#date (e.g., "North Atlantic#2024-01-15")
  SK: detected_at

GSI4 (greeting eligible - find pairs for greetings):
  PK: crossing_id
  SK: user_id
  Condition: greeting_eligible = true AND greeting_sent = false
```

### Crossing Detection → Record Flow

```
1. User on flight AA100 detected at position (lat, lon, alt)
2. Nearby flights queried within 20-mile radius
3. Flight UA200 found at 15 miles, 2000ft altitude difference
4. Both in cruise phase → CROSSING DETECTED
5. Create crossing record for user on AA100
6. If UA200 has Aerologue user → Create crossing record for them too
7. If both have users → Mark greeting_eligible = true
8. Award gamification points based on crossing attributes
```

### Gamification Point Rules

| Crossing Type | Points | Condition |
|---------------|--------|-----------|
| Basic crossing | 10 | Any valid crossing |
| Close crossing | +5 | Distance < 10 miles |
| Very close | +10 | Distance < 5 miles |
| Rare aircraft | +15 | crossed A380, B747, etc. |
| International | +10 | Different country routes |
| Long-haul | +10 | Flight > 6 hours |
| Same destination | +20 | Both flights going to same airport |
| Greeting exchanged | +25 | Both users sent greetings |

---

## DAT-013.0 - Flight Crossing Messages (Passenger Exchange Data)

**Purpose:** Record passenger details when a crossing is detected between two Aerologue users, enabling greeting exchange and gamification. Links to DAT-012.0 crossings.

**Source:** Application + User Profiles
**Target:** Amazon DynamoDB (CMP-018.0)

### Data Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│                    CROSSING EVENT DETECTED                       │
│                      (crossing_id: UUID)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   flight_crossings      │     │   flight_crossings      │
│   (User A's record)     │     │   (User B's record)     │
│   PK: user_a_id         │     │   PK: user_b_id         │
│   SK: crossing_id       │     │   SK: crossing_id       │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ crossing_participants   │     │ crossing_participants   │
│ (User A's data for B)   │◄───►│ (User B's data for A)   │
│ PK: crossing_id         │     │ PK: crossing_id         │
│ SK: user_a_id           │     │ SK: user_b_id           │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
                  ┌─────────────────────┐
                  │  crossing_messages  │
                  │  (Greetings sent)   │
                  │  PK: crossing_id    │
                  │  SK: message_id     │
                  └─────────────────────┘
```

### Crossing Participants Table

```
Table: crossing_participants

Primary Key:
  PK: crossing_id              # The crossing event
  SK: user_id                  # Participant user ID

Attributes:
  -- Identity
  - crossing_id (S): Links to flight_crossings
  - user_id (S): Cognito user sub
  - participant_role (S): "user_a" or "user_b" (first detected vs second)

  -- Personal Details (from user profile, snapshot at crossing time)
  - display_name (S): User's display name
  - avatar_url (S): Profile picture URL
  - privacy_level (S): public, friends, private

  -- Demographic Data
  - nationality (S): Country code (e.g., "US", "GB", "IN")
  - home_country (S): Country of residence
  - age_range (S): "18-24", "25-34", "35-44", "45-54", "55+" (optional)
  - language_primary (S): Primary language code (e.g., "en", "es", "zh")
  - languages_spoken (SS): Set of language codes

  -- Flight Context (at time of crossing)
  - flight_id (S): Flight identifier
  - flight_number (S): Flight number (e.g., "AA100")
  - origin_icao (S): Departure airport
  - origin_city (S): Departure city name
  - origin_country (S): Departure country
  - destination_icao (S): Arrival airport
  - destination_city (S): Arrival city name
  - destination_country (S): Arrival country
  - seat_class (S): economy, premium_economy, business, first (optional)

  -- Greeting Preferences
  - preset_message_id (S): User's selected preset greeting
  - preset_message_text (S): The actual preset message
  - custom_message_allowed (BOOL): User allows custom messages
  - auto_greet_enabled (BOOL): Automatically send greeting on crossing

  -- Gamification Stats (snapshot)
  - user_level (N): User's gamification level
  - total_crossings (N): User's lifetime crossing count
  - badges (SS): Set of badge IDs user has earned

  -- Timestamps
  - created_at (S): When participant record created
  - greeting_sent_at (S): When user sent greeting (if any)
  - greeting_read_at (S): When other user read greeting (if any)

  -- Status
  - greeting_status (S): none, sent, received, both, blocked
  - is_blocked (BOOL): User has blocked the other participant
  - is_favorite (BOOL): User marked this crossing as favorite

GSI1 (user's crossing history):
  PK: user_id
  SK: created_at

GSI2 (by nationality - analytics/matching):
  PK: nationality
  SK: created_at

GSI3 (by language - for matching):
  PK: language_primary
  SK: created_at
```

### Crossing Messages Table

```
Table: crossing_messages

Primary Key:
  PK: crossing_id              # The crossing event
  SK: message_id               # Unique message ID (UUID)

Attributes:
  -- Message Identity
  - message_id (S): UUID
  - crossing_id (S): Links to crossing event

  -- Sender/Recipient
  - from_user_id (S): Sender user ID
  - to_user_id (S): Recipient user ID
  - from_display_name (S): Sender's name (snapshot)
  - from_avatar_url (S): Sender's avatar (snapshot)

  -- Message Content
  - message_type (S): preset, custom, emoji, image
  - preset_id (S): If preset message, which one
  - message_text (S): The message content
  - language (S): Language code of message
  - emoji_reactions (SS): Set of emoji reactions received

  -- Translation (if different languages)
  - original_language (S): Original message language
  - translated_text (S): Auto-translated version (if applicable)
  - translation_shown (BOOL): Was translation displayed?

  -- Status
  - status (S): sent, delivered, read, expired
  - sent_at (S): When sent
  - delivered_at (S): When delivered to device
  - read_at (S): When recipient opened

  -- Gamification
  - points_awarded (N): Points for sending/receiving
  - achievement_triggered (S): If message triggered achievement

  -- Timestamps
  - created_at (S): Record creation
  - ttl (N): Auto-expiry (30 days)

GSI1 (user's inbox):
  PK: to_user_id
  SK: sent_at

GSI2 (user's sent messages):
  PK: from_user_id
  SK: sent_at
```

### Preset Greeting Messages

```
Table: greeting_presets

Primary Key:
  PK: preset_id

Attributes:
  - preset_id (S): Unique ID (e.g., "WAVE_01", "HELLO_01")
  - category (S): friendly, formal, fun, emoji
  - text_en (S): English text
  - text_es (S): Spanish text
  - text_fr (S): French text
  - text_de (S): German text
  - text_zh (S): Chinese text
  - text_ja (S): Japanese text
  - text_ar (S): Arabic text
  - text_hi (S): Hindi text
  - emoji (S): Associated emoji
  - is_active (BOOL): Available for use
  - sort_order (N): Display order

Examples:
  - "👋 Hello from {origin_city}! Safe travels!"
  - "✈️ We just crossed paths at {altitude}ft! How cool is that?"
  - "🌍 Flying from {origin_country} to {destination_country} - what about you?"
  - "🎉 You're my {crossing_count}th crossing! High five!"
```

---

## DAT-014.0 - Vlogs Data (Journey-Based Content)

**Purpose:** Store travel vlogs as journeys with stopovers, paths, and pinned social media content.

**Source:** Application (User submissions)
**Target:** Amazon DynamoDB (CMP-018.0) + S3 for thumbnails

### Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         VLOG JOURNEY                             │
│                    (One complete trip)                           │
│              journey_id: "trip_europe_2024"                      │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  Stopover 1 │    │  Stopover 2 │    │  Stopover 3 │
   │   London    │───►│    Paris    │───►│   Rome      │
   │  (3 days)   │    │  (2 days)   │    │  (4 days)   │
   └─────────────┘    └─────────────┘    └─────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │ Pinned    │      │ Pinned    │      │ Pinned    │
   │ Media x3  │      │ Media x2  │      │ Media x4  │
   └───────────┘      └───────────┘      └───────────┘
```

### Vlog Journeys Table

```
Table: vlog_journeys

Primary Key:
  PK: creator_id               # User who created the vlog
  SK: journey_id               # Unique journey identifier

Attributes:
  -- Journey Identity
  - journey_id (S): UUID or slug (e.g., "europe-summer-2024")
  - creator_id (S): User ID of creator

  -- Journey Metadata
  - title (S): Journey title (e.g., "Summer in Europe 2024")
  - description (S): Journey description
  - cover_image_url (S): S3 URL for cover image
  - thumbnail_url (S): S3 URL for thumbnail

  -- Journey Scope
  - start_date (S): Journey start date
  - end_date (S): Journey end date
  - duration_days (N): Total trip duration
  - total_distance_km (N): Total distance traveled
  - countries_visited (SS): Set of country codes
  - cities_visited (SS): Set of city names

  -- Journey Path (ordered list of coordinates for map line)
  - path_coordinates (L): List of {lat, lon, timestamp} for journey line on map

  -- Statistics
  - stopover_count (N): Number of stopovers
  - media_count (N): Total pinned media items
  - flights_count (N): Number of flights in journey
  - view_count (N): Total views
  - like_count (N): Total likes
  - share_count (N): Total shares

  -- Status & Visibility
  - status (S): draft, published, archived, deleted
  - visibility (S): public, followers, private
  - is_featured (BOOL): Staff-picked featured journey
  - moderation_status (S): pending, approved, rejected

  -- Timestamps
  - created_at (S): When journey created
  - updated_at (S): Last update
  - published_at (S): When published

  -- Creator Info (snapshot)
  - creator_display_name (S): Creator's name
  - creator_avatar_url (S): Creator's avatar

GSI1 (public journeys by date):
  PK: visibility#status (e.g., "public#published")
  SK: published_at

GSI2 (journeys by country):
  PK: country_code (for each country in countries_visited)
  SK: published_at

GSI3 (featured journeys):
  PK: is_featured
  SK: published_at
```

### Vlog Stopovers Table

```
Table: vlog_stopovers

Primary Key:
  PK: journey_id               # Parent journey
  SK: stopover_order#stopover_id  # Order + ID for sorting

Attributes:
  -- Stopover Identity
  - stopover_id (S): UUID
  - journey_id (S): Parent journey
  - stopover_order (N): Order in journey (1, 2, 3...)

  -- Location
  - location_name (S): Place name (e.g., "Paris, France")
  - location_type (S): city, airport, landmark, hotel, other
  - latitude (N): Latitude
  - longitude (N): Longitude
  - country_code (S): Country code
  - city (S): City name
  - airport_icao (S): If airport stopover

  -- Stay Details
  - arrival_date (S): Arrival date
  - departure_date (S): Departure date
  - duration_days (N): Days at this stopover
  - arrival_flight (S): Flight number arriving (optional)
  - departure_flight (S): Flight number departing (optional)

  -- Content
  - description (S): Stopover description/notes
  - highlight (S): One-line highlight
  - media_count (N): Number of pinned media at this stopover

  -- Transport to Next Stopover
  - transport_to_next (S): flight, train, car, bus, ferry, walk
  - transport_details (S): Flight number, train name, etc.
  - distance_to_next_km (N): Distance to next stopover

  -- Timestamps
  - created_at (S): Record creation
  - updated_at (S): Last update

GSI1 (stopovers by location - find vlogs at a place):
  PK: country_code#city
  SK: arrival_date
```

### Vlog Pinned Media Table

```
Table: vlog_pinned_media

Primary Key:
  PK: journey_id#stopover_id   # Parent journey + stopover
  SK: media_order#media_id     # Order + ID for sorting

Attributes:
  -- Media Identity
  - media_id (S): UUID
  - journey_id (S): Parent journey
  - stopover_id (S): Parent stopover
  - media_order (N): Display order within stopover

  -- Source Platform
  - platform (S): youtube, instagram, tiktok, twitter, native
  - embed_url (S): Original URL for embedding
  - embed_id (S): Platform-specific ID (e.g., YouTube video ID)

  -- Validated Metadata (from oEmbed)
  - oembed_valid (BOOL): oEmbed validation passed
  - oembed_title (S): Title from oEmbed
  - oembed_author (S): Author from oEmbed
  - oembed_thumbnail_url (S): Thumbnail from platform
  - oembed_duration (N): Duration in seconds (for video)

  -- Location Pin
  - pin_latitude (N): Where to pin on map
  - pin_longitude (N): Where to pin on map
  - pin_label (S): Label for pin (e.g., "Eiffel Tower View")

  -- User-Provided Metadata
  - caption (S): User's caption for this media
  - tags (SS): User-added tags

  -- Native Media (Phase 2 - if uploaded directly)
  - native_s3_url (S): S3 URL for native uploads
  - native_thumbnail_s3 (S): S3 thumbnail URL
  - native_duration (N): Duration for native video
  - native_file_type (S): mp4, jpg, png
  - moderation_status (S): pending, approved, rejected

  -- Statistics
  - view_count (N): Views of this media item
  - like_count (N): Likes

  -- Status
  - status (S): active, hidden, deleted, broken_link
  - platform_removed (BOOL): Platform removed original content

  -- Timestamps
  - created_at (S): When added
  - updated_at (S): Last update
  - last_validated_at (S): Last oEmbed validation check

GSI1 (media by platform - analytics):
  PK: platform
  SK: created_at

GSI2 (media by location - find content near a point):
  PK: geohash_prefix (4-char geohash)
  SK: created_at
```

### Vlog Interactions Table

```
Table: vlog_interactions

Primary Key:
  PK: journey_id
  SK: interaction_type#user_id#timestamp

Attributes:
  - journey_id (S): Journey interacted with
  - user_id (S): User who interacted
  - interaction_type (S): view, like, share, save, comment
  - timestamp (S): When interaction occurred
  - ttl (N): Expire old view records (keep likes/saves)

GSI1 (user's interactions):
  PK: user_id
  SK: timestamp
```

---

## DAT-015.0 - Quiz Question Bank Data

**Purpose:** Store AI-generated and user-created quiz questions organized by geographic region for offline-first delivery.

**Related Features:** FEA-008.0 (Geoquiz)

### Geographic Regions Table

```
Table: quiz_regions
Storage: DynamoDB

Primary Key:
  PK: REGION                    # Literal "REGION"
  SK: region_id                 # Hierarchical: continent#country#state_or_area

Attributes:
  -- Identity
  - region_id (S): Unique region identifier (e.g., "NA#US#NORTHEAST")
  - region_name (S): Human-readable name (e.g., "Northeastern United States")
  - region_type (S): continent, country, state, area, corridor

  -- Geographic Bounds
  - bounds_north (N): Northern latitude boundary
  - bounds_south (N): Southern latitude boundary
  - bounds_east (N): Eastern longitude boundary
  - bounds_west (N): Western longitude boundary
  - center_lat (N): Center point latitude
  - center_lon (N): Center point longitude

  -- Content Stats
  - question_count (N): Total questions for this region
  - question_count_by_category (M): {geography: N, landmarks: N, aviation: N, history: N}
  - question_count_by_difficulty (M): {easy: N, medium: N, hard: N}
  - last_generated_at (S): Last AI generation run

  -- Hierarchy
  - parent_region_id (S): Parent region (e.g., "NA#US" for "NA#US#NORTHEAST")
  - child_region_ids (SS): Child regions

  -- Download Package
  - package_version (N): Version for cache invalidation
  - package_size_kb (N): Download size for this region
  - package_url (S): S3 URL for offline download package

GSI1 (regions by bounds - find region for a GPS point):
  PK: geohash_4char             # 4-character geohash covering region
  SK: region_id
```

### Quiz Questions Table

```
Table: quiz_questions
Storage: DynamoDB

Primary Key:
  PK: region_id                 # Geographic region
  SK: question_id               # UUID

Attributes:
  -- Identity
  - question_id (S): UUID
  - region_id (S): Primary region this question belongs to
  - additional_regions (SS): Other regions where this question is relevant

  -- Question Content
  - question_text (S): The question (max 500 chars)
  - question_type (S): multiple_choice, map_tap, true_false, fill_blank
  - category (S): geography, landmarks, aviation, history_culture
  - difficulty (S): easy, medium, hard
  - points (N): Points awarded for correct answer

  -- Answers
  - correct_answer (S): Correct answer text
  - correct_answer_index (N): For multiple choice (0-3)
  - options (L): List of answer options (for multiple_choice)
  - explanation (S): Why this answer is correct (shown after answering)

  -- For Map Tap Questions
  - tap_target_lat (N): Correct latitude
  - tap_target_lon (N): Correct longitude
  - tap_radius_km (N): Acceptable radius for correct answer

  -- Media (Optional)
  - image_url (S): Question image (landmark photo, map, etc.)
  - image_attribution (S): Image credit/source

  -- Generation Metadata
  - source (S): ai_generated, user_created, curated
  - ai_model (S): claude-3-sonnet, claude-3-haiku (if AI generated)
  - ai_prompt_version (S): Version of prompt used
  - generated_at (S): When AI created this
  - reviewed (BOOL): Human reviewed for accuracy
  - reviewer_id (S): Who reviewed

  -- Quality Metrics
  - times_served (N): How many times shown to users
  - times_correct (N): How many times answered correctly
  - accuracy_rate (N): Calculated correct/served ratio
  - avg_response_time_ms (N): Average time to answer
  - reported_count (N): Times reported as incorrect/inappropriate
  - quality_score (N): Computed quality score (0-100)

  -- Status
  - status (S): active, disabled, pending_review, reported
  - created_at (S): Record creation
  - updated_at (S): Last update

GSI1 (questions by category for selection):
  PK: region_id#category
  SK: difficulty#quality_score

GSI2 (questions pending review):
  PK: status
  SK: created_at

GSI3 (questions by source - find AI vs user created):
  PK: source
  SK: generated_at
```

### User Question History Table

```
Table: user_quiz_history
Storage: DynamoDB

Primary Key:
  PK: user_id                   # User
  SK: question_id               # Question answered

Attributes:
  -- Identity
  - user_id (S): User who answered
  - question_id (S): Question that was answered
  - region_id (S): Region of the question

  -- Answer Record
  - answered_at (S): Timestamp
  - was_correct (BOOL): Did they answer correctly
  - user_answer (S): What they answered
  - response_time_ms (N): How long they took
  - points_earned (N): Points awarded

  -- Context
  - flight_id (S): Flight they were on (if applicable)
  - session_id (S): Quiz session ID
  - device_offline (BOOL): Was device offline when answered

  -- TTL for storage management (optional)
  - ttl (N): Expire old records after 2 years

GSI1 (history by region - check what's been answered in an area):
  PK: user_id#region_id
  SK: answered_at

GSI2 (recent answers for sync):
  PK: user_id
  SK: answered_at
```

### Quiz Sessions Table

```
Table: quiz_sessions
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: session_id

Attributes:
  -- Session Identity
  - session_id (S): UUID
  - user_id (S): Player

  -- Session Config
  - categories (SS): Selected categories (or "all")
  - difficulty (S): easy, medium, hard, mixed
  - question_count (N): Number of questions in session
  - region_ids (SS): Regions being quizzed on

  -- Progress
  - status (S): in_progress, completed, abandoned
  - current_question_index (N): Where they are
  - questions_asked (L): List of question_ids in order
  - answers_given (L): List of {question_id, answer, correct, time_ms}

  -- Scoring
  - score (N): Current score
  - correct_count (N): Correct answers
  - streak (N): Current streak
  - best_streak (N): Best streak this session
  - time_bonus_earned (N): Bonus points for fast answers

  -- Flight Context
  - flight_id (S): Flight (if playing during flight)
  - started_lat (N): Starting position
  - started_lon (N): Starting position
  - started_offline (BOOL): Started while offline

  -- Timestamps
  - started_at (S): Session start
  - completed_at (S): Session end (if completed)
  - last_activity_at (S): Last interaction

  -- Sync
  - synced_to_cloud (BOOL): Has offline session been synced
  - local_answers_pending (N): Count of answers awaiting sync

GSI1 (active sessions):
  PK: status
  SK: last_activity_at
```

### Flight Corridor Cache Table

```
Table: flight_corridor_cache
Storage: DynamoDB

Primary Key:
  PK: route_hash                # Hash of origin#destination (e.g., MD5("JFK#LAX"))
  SK: CORRIDOR                  # Literal "CORRIDOR"

Attributes:
  -- Route Identity
  - route_hash (S): Unique route identifier
  - origin_iata (S): Origin airport (e.g., "JFK")
  - destination_iata (S): Destination airport (e.g., "LAX")
  - origin_city (S): Origin city name
  - destination_city (S): Destination city name

  -- Regions Along Route
  - region_ids (SS): Ordered list of regions along flight path
  - waypoints (L): Key waypoints [{lat, lon, region_id, name}]

  -- Pre-computed Download
  - total_questions (N): Total questions for this corridor
  - download_size_kb (N): Total download size
  - estimated_flight_time_min (N): Typical flight duration
  - questions_per_hour (N): Recommended pacing

  -- Package Info
  - package_version (N): Version for cache invalidation
  - package_url (S): S3 URL for combined corridor package
  - package_generated_at (S): When package was last built

  -- Usage Stats
  - times_downloaded (N): Download count
  - last_downloaded_at (S): Most recent download

  -- TTL for less common routes
  - ttl (N): Expire unused corridor caches after 90 days

GSI1 (routes by origin - find routes from an airport):
  PK: origin_iata
  SK: destination_iata

GSI2 (routes by popularity):
  PK: POPULAR                   # Literal
  SK: times_downloaded
```

### Offline Sync Queue Table

```
Table: quiz_sync_queue
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: sync_id                   # UUID + timestamp for ordering

Attributes:
  -- Sync Item
  - sync_id (S): UUID
  - user_id (S): User
  - sync_type (S): answer, session_complete, session_start
  - payload (S): JSON of data to sync

  -- Status
  - status (S): pending, synced, failed
  - created_at (S): When queued
  - synced_at (S): When successfully synced
  - retry_count (N): Failed sync attempts
  - last_error (S): Last error message

  -- TTL
  - ttl (N): Expire after 7 days (should be synced by then)

GSI1 (pending syncs):
  PK: status
  SK: created_at
```

### Local Storage Schema (SQLite/Hive - On Device)

```
-- Questions downloaded for offline use
CREATE TABLE local_questions (
  question_id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_json TEXT NOT NULL,  -- Full question object as JSON
  downloaded_at TEXT NOT NULL,
  package_version INTEGER NOT NULL
);

CREATE INDEX idx_local_questions_region ON local_questions(region_id);
CREATE INDEX idx_local_questions_category ON local_questions(region_id, category);

-- User's answered questions (for non-repetition)
CREATE TABLE local_answered (
  question_id TEXT PRIMARY KEY,
  answered_at TEXT NOT NULL,
  was_correct INTEGER NOT NULL,
  synced INTEGER DEFAULT 0
);

-- Pending sync items
CREATE TABLE local_sync_queue (
  sync_id TEXT PRIMARY KEY,
  sync_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0
);

-- Downloaded corridor packages
CREATE TABLE local_corridors (
  route_hash TEXT PRIMARY KEY,
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  package_version INTEGER NOT NULL,
  downloaded_at TEXT NOT NULL,
  question_count INTEGER NOT NULL
);
```

### AI Question Generation Prompt Template

```
Table: quiz_generation_prompts
Storage: DynamoDB

Primary Key:
  PK: PROMPT
  SK: prompt_version#category

Attributes:
  - prompt_version (S): Version identifier
  - category (S): geography, landmarks, aviation, history_culture
  - prompt_template (S): The prompt template with placeholders
  - system_prompt (S): System prompt for Claude
  - example_output (S): Example of expected JSON output
  - active (BOOL): Is this the current version
  - created_at (S): When created
  - created_by (S): Who created this prompt version
  - performance_metrics (M): {avg_quality_score, questions_generated}
```

---

## DAT-016.0 - Ad Serving Data

**Purpose:** Store and manage full-screen visual advertisements with destination-aware targeting, dual billing model (active vs wallet), and wallet stack integration.

**Related Features:** FEA-012.0 (Ad Serving Module), FEA-010.0 (Wallet)

### Billing Model Summary

| Placement | Billing Trigger | Table |
|-----------|-----------------|-------|
| Active (post-crossing, games, post-landing) | On serve | ad_impressions |
| Wallet Stack (passive browsing) | On engagement (3s view / action) | ad_wallet_stack, ad_stack_engagements |

### Advertisers Table

```
Table: advertisers
Storage: DynamoDB

Primary Key:
  PK: ADVERTISER
  SK: advertiser_id

Attributes:
  -- Identity
  - advertiser_id (S): UUID
  - business_name (S): Company/business name
  - business_type (S): hotel, restaurant, attraction, transport, retail, other
  - country_code (S): Primary country of operation

  -- Contact
  - contact_name (S): Primary contact person
  - contact_email (S): Contact email
  - contact_phone (S): Contact phone

  -- Account
  - status (S): pending_approval, active, suspended, inactive
  - country_head_id (S): Assigned country head (manager)
  - created_by (S): Who created this account
  - approved_by (S): Who approved this account
  - approved_at (S): Approval timestamp

  -- Billing
  - billing_email (S): Invoice recipient
  - billing_address (S): Billing address
  - payment_terms (S): prepaid, net30, net60
  - currency (S): Preferred currency

  -- Timestamps
  - created_at (S): Account creation
  - updated_at (S): Last update

GSI1 (advertisers by country head):
  PK: country_head_id
  SK: status#business_name

GSI2 (advertisers by country):
  PK: country_code
  SK: business_type#business_name
```

### Country Heads Table

```
Table: country_heads
Storage: DynamoDB

Primary Key:
  PK: COUNTRY_HEAD
  SK: country_head_id

Attributes:
  -- Identity
  - country_head_id (S): UUID (links to user_id)
  - user_id (S): Reference to user_profiles
  - display_name (S): Name shown to advertisers

  -- Territory
  - assigned_countries (SS): Countries they manage (e.g., ["JP", "KR"])
  - assigned_regions (SS): Sub-regions if applicable

  -- Permissions
  - can_approve_ads (BOOL): Can approve ad content
  - can_approve_advertisers (BOOL): Can approve new advertisers
  - can_set_pricing (BOOL): Can set ad pricing
  - max_approval_budget (N): Max campaign budget they can approve

  -- Performance
  - total_revenue (N): Lifetime revenue generated
  - active_advertisers (N): Current active advertiser count
  - active_campaigns (N): Current active campaign count

  -- Commission
  - commission_rate (N): Percentage commission (e.g., 0.15 for 15%)
  - commission_earned (N): Total commission earned

  -- Status
  - status (S): active, inactive, suspended
  - created_at (S): When assigned
  - updated_at (S): Last update

GSI1 (country heads by country):
  PK: country_code (from assigned_countries, replicated)
  SK: country_head_id
```

### Ad Campaigns Table

```
Table: ad_campaigns
Storage: DynamoDB

Primary Key:
  PK: advertiser_id
  SK: campaign_id

Attributes:
  -- Identity
  - campaign_id (S): UUID
  - advertiser_id (S): Parent advertiser
  - campaign_name (S): Internal name

  -- Targeting: Destinations
  - target_destinations (SS): Target destination countries/cities
  - target_destination_airports (SS): Specific airport codes (e.g., ["NRT", "HND"])
  - exclude_destinations (SS): Destinations to exclude

  -- Targeting: Origins
  - target_origins (SS): Where travelers are coming from
  - target_origin_regions (SS): Broader origin regions

  -- Targeting: User Profile
  - target_travel_purposes (SS): business, leisure, family, honeymoon
  - target_age_groups (SS): 18-24, 25-34, 35-44, 45-54, 55+
  - target_languages (SS): Preferred languages

  -- Targeting: Context
  - target_airlines (SS): Specific airlines (or empty for all)
  - target_flight_classes (SS): economy, business, first

  -- Scheduling
  - start_date (S): Campaign start (ISO date)
  - end_date (S): Campaign end (ISO date)
  - time_windows (L): [{day_of_week, start_hour, end_hour}] (local time)
  - timezone (S): Timezone for scheduling

  -- Budget & Inventory
  - budget_total (N): Total budget in cents
  - budget_daily (N): Daily budget cap in cents
  - budget_spent (N): Amount spent so far
  - impressions_total (N): Total impression cap
  - impressions_daily (N): Daily impression cap
  - impressions_delivered (N): Impressions delivered so far
  - cost_per_impression (N): CPM in cents (cost per 1000)

  -- Priority
  - priority (N): 1-10 (higher = more priority)
  - is_premium (BOOL): Premium placement

  -- Status
  - status (S): draft, pending_approval, approved, active, paused, completed, rejected
  - rejection_reason (S): If rejected, why
  - approved_by (S): Who approved
  - approved_at (S): When approved

  -- Timestamps
  - created_at (S): Campaign creation
  - updated_at (S): Last update

GSI1 (campaigns by status for delivery):
  PK: status
  SK: priority#campaign_id

GSI2 (campaigns by destination for matching):
  PK: target_destination (replicated per destination)
  SK: status#priority
```

### Ad Creatives Table

```
Table: ad_creatives
Storage: DynamoDB

Primary Key:
  PK: campaign_id
  SK: creative_id

Attributes:
  -- Identity
  - creative_id (S): UUID
  - campaign_id (S): Parent campaign
  - creative_name (S): Internal name

  -- Media
  - media_type (S): image, video
  - media_url (S): S3 URL for the creative
  - media_url_thumbnail (S): Thumbnail for preview
  - media_size_bytes (N): File size
  - media_duration_sec (N): Duration for video (null for image)
  - media_dimensions (M): {width: N, height: N}
  - media_orientation (S): portrait, landscape

  -- Content
  - headline (S): Ad headline (max 50 chars)
  - subheadline (S): Secondary text (max 100 chars)
  - cta_text (S): Call-to-action button text
  - cta_url (S): Click-through URL (for tracking)

  -- Offer Details (for wallet save)
  - offer_type (S): discount, booking, ticket, coupon
  - offer_code (S): Promo/discount code
  - offer_value (S): "20% off", "$50 off", etc.
  - offer_terms (S): Terms and conditions
  - offer_valid_from (S): Offer validity start
  - offer_valid_until (S): Offer validity end
  - offer_redemption_url (S): Where to redeem

  -- A/B Testing
  - variant (S): A, B, C, etc. (for A/B testing)
  - variant_weight (N): Traffic weight (0-100)

  -- Moderation
  - moderation_status (S): pending, approved, rejected
  - moderation_notes (S): Reviewer notes
  - moderated_by (S): Who reviewed
  - moderated_at (S): When reviewed

  -- Performance
  - impressions (N): Times shown
  - saves (N): Times saved to wallet
  - clicks (N): Click-throughs
  - redemptions (N): Times redeemed from wallet

  -- Status
  - status (S): active, paused, archived
  - created_at (S): Creative upload time
  - updated_at (S): Last update

GSI1 (creatives by moderation status):
  PK: moderation_status
  SK: created_at
```

### Ad Impressions Table (Active Placements - Billed on Serve)

```
Table: ad_impressions
Storage: DynamoDB (with TTL for cleanup)

Primary Key:
  PK: campaign_id#date (e.g., "camp_123#2025-11-27")
  SK: impression_id

Attributes:
  -- Identity
  - impression_id (S): UUID
  - campaign_id (S): Campaign
  - creative_id (S): Creative shown
  - advertiser_id (S): Advertiser

  -- User Context
  - user_id (S): User who saw ad (anonymized for analytics)
  - user_country (S): User's country
  - user_language (S): User's language

  -- Flight Context
  - flight_id (S): Flight (if applicable)
  - origin_airport (S): Flight origin
  - destination_airport (S): Flight destination
  - airline_code (S): Airline

  -- Placement
  - placement_slot (S): post_crossing, before_game, after_game, post_landing
  - placement_context (S): Additional context (e.g., crossing_id, game_id)

  -- Ad Card Actions
  - action (S): continue, know_more, save, reject
  - action_at (S): When action taken
  - viewed_duration_ms (N): How long ad was visible
  - video_viewed (BOOL): If know_more video was watched
  - video_duration_ms (N): Video watch time

  -- Device
  - device_type (S): ios, android, web, windows
  - was_offline (BOOL): Shown from cache

  -- Billing (Active = billed on serve)
  - billing_type (S): "on_serve"
  - cost_cents (N): Cost charged for this impression
  - billed (BOOL): Whether billing processed

  -- Timestamp
  - timestamp (S): When shown
  - ttl (N): Expire after 90 days

GSI1 (impressions by user for frequency capping):
  PK: user_id
  SK: timestamp

GSI2 (impressions by advertiser for reporting):
  PK: advertiser_id
  SK: date#timestamp
```

### Ad Saves (Wallet Integration) Table

```
Table: ad_saves
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: save_id

Attributes:
  -- Identity
  - save_id (S): UUID
  - user_id (S): User who saved

  -- Ad Reference
  - campaign_id (S): Campaign
  - creative_id (S): Creative saved
  - advertiser_id (S): Advertiser
  - impression_id (S): Source impression

  -- Offer Details (denormalized for offline access)
  - offer_type (S): discount, booking, ticket, coupon
  - offer_code (S): Promo code
  - offer_value (S): "20% off"
  - offer_terms (S): Terms
  - offer_valid_until (S): Expiry
  - offer_redemption_url (S): Redemption URL

  -- Display Info (denormalized)
  - advertiser_name (S): Business name
  - headline (S): Ad headline
  - thumbnail_url (S): Thumbnail for wallet display

  -- Status
  - status (S): saved, redeemed, expired, deleted
  - redeemed_at (S): When redeemed (if applicable)

  -- Timestamps
  - saved_at (S): When saved
  - expires_at (S): When offer expires

GSI1 (saves by expiry for notifications):
  PK: status
  SK: expires_at

GSI2 (saves by advertiser for analytics):
  PK: advertiser_id
  SK: saved_at
```

### Wallet Ad Stack Table (System-Placed Ads - Billed on Engagement)

```
Table: ad_wallet_stack
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: stack_entry_id

Attributes:
  -- Identity
  - stack_entry_id (S): UUID
  - user_id (S): User whose wallet

  -- Ad Reference
  - campaign_id (S): Campaign
  - creative_id (S): Creative
  - advertiser_id (S): Advertiser

  -- Category (for 3-per-category limit)
  - category (S): hotel, restaurant, attraction, transport, event

  -- Trip Context (for expiry)
  - destination_city (S): City this ad is relevant to
  - destination_country (S): Country
  - trip_id (S): Trip this ad belongs to (for trip-based expiry)
  - scope (S): city, country, trip

  -- Display Info (denormalized for offline)
  - advertiser_name (S): Business name
  - headline (S): Ad headline
  - subheadline (S): Secondary text
  - thumbnail_url (S): Thumbnail
  - media_url (S): Full media URL
  - media_type (S): image, video
  - offer_json (S): Full offer details as JSON

  -- Stack Status
  - status (S): unopened, opened, engaged, saved, rejected, expired
  - opened_at (S): When first opened
  - engaged_at (S): When engagement registered (3s or action)
  - expires_at (S): When this ad expires

  -- Priority
  - priority (N): Display priority in stack

  -- Timestamps
  - placed_at (S): When system placed this ad
  - ttl (N): Auto-expire based on trip context

GSI1 (stack by user + category for limits):
  PK: user_id#category
  SK: placed_at

GSI2 (stack by destination for management):
  PK: destination_city
  SK: user_id#placed_at

GSI3 (stack by status for cleanup):
  PK: status
  SK: expires_at
```

**Stack Rules (enforced at write time):**
- Max 15 total ads per user wallet stack
- Max 3 ads per category per user
- When new ad arrives and limit reached, oldest unopened ad of same category is replaced
- Rejected ads are never re-added

### Wallet Stack Engagements Table (Billable Events)

```
Table: ad_stack_engagements
Storage: DynamoDB

Primary Key:
  PK: campaign_id#date
  SK: engagement_id

Attributes:
  -- Identity
  - engagement_id (S): UUID
  - stack_entry_id (S): Reference to wallet stack entry
  - campaign_id (S): Campaign
  - creative_id (S): Creative
  - advertiser_id (S): Advertiser
  - user_id (S): User (anonymized)

  -- Engagement Type
  - engagement_type (S): view_3s, know_more, save_to_offers
  - engagement_at (S): When engagement occurred

  -- View Details (for view_3s type)
  - view_duration_ms (N): Actual view duration
  - view_completed (BOOL): Viewed full ad

  -- Know More Details (for know_more type)
  - video_watched (BOOL): If video was watched
  - video_duration_ms (N): Video watch time

  -- Billing
  - billing_type (S): "on_engagement"
  - cost_cents (N): Cost charged
  - billed (BOOL): Whether processed

  -- Context
  - device_type (S): ios, android, web, windows
  - was_offline (BOOL): Engagement from offline cache

  -- Timestamp
  - timestamp (S): Engagement time
  - ttl (N): Expire after 90 days

GSI1 (engagements by advertiser for reporting):
  PK: advertiser_id
  SK: date#timestamp

GSI2 (engagements by user for analytics):
  PK: user_id
  SK: timestamp
```

**Billing Logic:**
- First qualifying engagement per stack_entry_id triggers billing
- Subsequent engagements on same stack entry are tracked but not billed
- Engagement counts: view_3s (3+ seconds), know_more tap, save_to_offers tap

### Ad Delivery Schedule Table

```
Table: ad_delivery_schedule
Storage: DynamoDB

Primary Key:
  PK: destination_code#date (e.g., "NRT#2025-11-27")
  SK: slot#priority#campaign_id

Attributes:
  -- Schedule Identity
  - destination_code (S): Airport/city code
  - date (S): Delivery date
  - slot (S): post_crossing, between_games, post_landing

  -- Campaign Reference
  - campaign_id (S): Campaign to deliver
  - creative_ids (SS): Creatives to rotate
  - advertiser_id (S): Advertiser

  -- Delivery Targets
  - target_impressions (N): How many to deliver today
  - delivered_impressions (N): Delivered so far
  - remaining_impressions (N): Left to deliver

  -- Priority
  - priority (N): Delivery priority (higher = first)
  - is_exclusive (BOOL): Exclusive slot (no other ads)

  -- Status
  - status (S): scheduled, delivering, completed, paused

GSI1 (schedule by campaign for monitoring):
  PK: campaign_id
  SK: date
```

### Ad Frequency Caps Table

```
Table: ad_frequency_caps
Storage: DynamoDB

Primary Key:
  PK: user_id#campaign_id
  SK: CAP

Attributes:
  -- Identity
  - user_id (S): User
  - campaign_id (S): Campaign

  -- Caps
  - impressions_today (N): Impressions shown today
  - impressions_total (N): Total impressions to this user
  - last_impression_at (S): Last time shown
  - last_impression_date (S): Date of last impression (for daily reset)

  -- Limits
  - max_per_day (N): Max impressions per day (from campaign)
  - max_total (N): Max impressions total (from campaign)

  -- TTL
  - ttl (N): Expire after campaign ends
```

### Offline Ad Cache (Local Storage - SQLite/Hive)

```sql
-- Ads downloaded for offline display (active placements)
CREATE TABLE local_ads (
  creative_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  advertiser_id TEXT NOT NULL,
  category TEXT NOT NULL,  -- hotel, restaurant, attraction, transport, event
  media_type TEXT NOT NULL,
  media_local_path TEXT NOT NULL,  -- Local file path
  headline TEXT,
  subheadline TEXT,
  cta_text TEXT,
  offer_json TEXT,  -- Full offer details as JSON
  target_destinations TEXT,  -- Comma-separated
  priority INTEGER,
  valid_from TEXT,
  valid_until TEXT,
  downloaded_at TEXT NOT NULL
);

CREATE INDEX idx_local_ads_destination ON local_ads(target_destinations);
CREATE INDEX idx_local_ads_category ON local_ads(category);

-- Wallet ad stack (synced from cloud)
CREATE TABLE local_wallet_stack (
  stack_entry_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  creative_id TEXT NOT NULL,
  advertiser_id TEXT NOT NULL,
  category TEXT NOT NULL,
  destination_city TEXT,
  destination_country TEXT,
  scope TEXT NOT NULL,  -- city, country, trip
  advertiser_name TEXT,
  headline TEXT,
  subheadline TEXT,
  media_local_path TEXT,
  media_type TEXT,
  offer_json TEXT,
  status TEXT DEFAULT 'unopened',  -- unopened, opened, engaged, saved, rejected
  priority INTEGER,
  placed_at TEXT NOT NULL,
  expires_at TEXT,
  synced INTEGER DEFAULT 1  -- 1=synced from cloud, 0=local change pending sync
);

CREATE INDEX idx_local_stack_category ON local_wallet_stack(category);
CREATE INDEX idx_local_stack_status ON local_wallet_stack(status);

-- Pending impression syncs (active placements - billed on serve)
CREATE TABLE local_ad_impressions (
  impression_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  creative_id TEXT NOT NULL,
  placement_slot TEXT NOT NULL,  -- post_crossing, before_game, after_game, post_landing
  action TEXT,  -- continue, know_more, save, reject
  viewed_duration_ms INTEGER,
  video_viewed INTEGER DEFAULT 0,
  video_duration_ms INTEGER,
  timestamp TEXT NOT NULL,
  synced INTEGER DEFAULT 0
);

-- Pending stack engagement syncs (wallet - billed on engagement)
CREATE TABLE local_stack_engagements (
  engagement_id TEXT PRIMARY KEY,
  stack_entry_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  creative_id TEXT NOT NULL,
  engagement_type TEXT NOT NULL,  -- view_3s, know_more, save_to_offers
  view_duration_ms INTEGER,
  video_watched INTEGER DEFAULT 0,
  video_duration_ms INTEGER,
  timestamp TEXT NOT NULL,
  synced INTEGER DEFAULT 0
);

-- Saved offers (user-saved from ads)
CREATE TABLE local_saved_offers (
  save_id TEXT PRIMARY KEY,
  creative_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  advertiser_name TEXT,
  headline TEXT,
  thumbnail_path TEXT,
  offer_json TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  expires_at TEXT,
  status TEXT DEFAULT 'saved',  -- saved, redeemed, expired
  synced INTEGER DEFAULT 0
);
```

### Analytics Aggregates Table

```
Table: ad_analytics_daily
Storage: DynamoDB

Primary Key:
  PK: campaign_id
  SK: date

Attributes:
  -- Active Placement Metrics (billed on serve)
  - active_serves (N): Total active ad serves
  - active_unique_users (N): Unique users for active ads
  - active_continue (N): Continue action count
  - active_know_more (N): Know More action count
  - active_saves (N): Save to wallet from active ads
  - active_rejects (N): Reject action count
  - active_spend_cents (N): Revenue from active serves

  -- Wallet Stack Metrics (billed on engagement)
  - stack_placements (N): Ads placed in wallet stacks
  - stack_opens (N): Times users opened stack ads
  - stack_engagements (N): Billable engagements (3s view / action)
  - stack_know_more (N): Know More taps from stack
  - stack_saves (N): Saves to offers from stack
  - stack_rejects (N): Rejects from stack
  - stack_spend_cents (N): Revenue from stack engagements

  -- Combined Metrics
  - total_impressions (N): active_serves + stack_placements
  - total_engagements (N): All interactions
  - total_saves (N): All saves to wallet
  - total_redemptions (N): Offers redeemed
  - total_spend_cents (N): Total revenue

  -- By Placement Slot
  - metrics_by_slot (M): {
      post_crossing: {serves: N, saves: N},
      before_game: {serves: N, saves: N},
      after_game: {serves: N, saves: N},
      post_landing: {serves: N, saves: N},
      wallet_stack: {placements: N, engagements: N}
    }

  -- By Destination
  - metrics_by_destination (M): {NRT: {serves: N, engagements: N}, ...}

  -- By Category
  - metrics_by_category (M): {hotel: N, restaurant: N, attraction: N, ...}

  -- Rates (computed)
  - active_engagement_rate (N): (know_more + saves) / serves
  - stack_engagement_rate (N): engagements / placements
  - save_rate (N): total_saves / total_impressions
  - redemption_rate (N): redemptions / total_saves

GSI1 (analytics by advertiser):
  PK: advertiser_id
  SK: date

GSI2 (analytics by destination):
  PK: destination_code
  SK: date
```

---

## DAT-017.0 - Geo Factoids Data

**Purpose:** Store location data, AI-generated factoids, user discoveries, and support offline-first architecture for the Live Geo Factoids feature.

**Related Features:** FEA-006.0 (Live Geo Factoids), FEA-009.0 (Gamification)

### Notable Locations Table

```
Table: notable_locations
Storage: DynamoDB

Primary Key:
  PK: LOCATION
  SK: location_id

Attributes:
  -- Identity
  - location_id (S): Unique identifier (e.g., "lake_tahoe_ca", "mt_fuji_jp")
  - location_name (S): Display name
  - location_name_local (S): Name in local language (if applicable)

  -- Type & Category
  - location_type (S): city, country_border, natural_landmark, water_feature,
                       ocean_feature, island, historical_site, aviation_point, unique_place
  - category_icon (S): Emoji icon for display

  -- Geography
  - latitude (N): Center point latitude
  - longitude (N): Center point longitude
  - trigger_radius_miles (N): Radius for triggering factoid (default 20)
  - bounding_box (M): {min_lat, max_lat, min_lon, max_lon} for larger features
  - country_code (S): ISO country code
  - region (S): Geographic region (e.g., "North America", "Southeast Asia")

  -- Notability
  - notability_score (N): 1-100 (higher = more notable, affects delivery level)
  - population (N): For cities (helps determine notability)
  - is_capital (BOOL): National or state capital
  - is_world_heritage (BOOL): UNESCO World Heritage site
  - rarity (S): common, uncommon, rare, legendary

  -- Points
  - base_points (N): Points awarded for discovery (5-50)
  - first_discovery_bonus (N): Bonus if first user to discover (default 50)

  -- Content Status
  - factoid_count (N): Number of factoids available
  - last_factoid_generated (S): When last AI factoid was added
  - needs_more_factoids (BOOL): Flag for content generation queue

  -- Metadata
  - created_at (S): When location was added
  - updated_at (S): Last update
  - source (S): How location was added (seed_data, ai_generated, admin)

GSI1 (locations by type for filtering):
  PK: location_type
  SK: notability_score#location_id

GSI2 (locations by region for corridor caching):
  PK: region
  SK: location_type#notability_score

GSI3 (locations by country):
  PK: country_code
  SK: notability_score#location_id

-- Geospatial index for proximity queries (via separate service or ElasticSearch)
```

### Factoids Table

```
Table: factoids
Storage: DynamoDB

Primary Key:
  PK: location_id
  SK: factoid_id

Attributes:
  -- Identity
  - factoid_id (S): UUID
  - location_id (S): Parent location

  -- Content
  - category (S): geography, history, culture, science, aviation, trivia, records
  - headline (S): Short attention-grabber (max 50 chars)
  - short_text (S): One-liner for collapsed view (max 150 chars)
  - expanded_text (S): Full factoid for expanded view (max 500 chars)
  - source_citation (S): Attribution if from known source
  - related_links (SS): Wikipedia, official site URLs

  -- Quality
  - quality_score (N): 0.0-1.0 (AI confidence + human review)
  - is_verified (BOOL): Human-verified factoid
  - report_count (N): Times reported as inaccurate

  -- Generation
  - source (S): ai_generated, curated, user_submitted
  - ai_model (S): Model used (e.g., "claude-3-opus")
  - ai_prompt_id (S): Reference to generation prompt
  - generated_at (S): When AI generated this

  -- Usage Stats
  - times_shown (N): How many times displayed
  - times_collected (N): Times users added to collection
  - avg_view_duration_ms (N): Average time users spent viewing

  -- Status
  - status (S): active, flagged, retired
  - created_at (S): When added
  - updated_at (S): Last update

GSI1 (factoids by category for filtering):
  PK: location_id#category
  SK: quality_score#factoid_id

GSI2 (factoids needing review):
  PK: status
  SK: report_count#factoid_id
```

### User Discoveries Table

```
Table: user_discoveries
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: location_id

Attributes:
  -- Identity
  - user_id (S): User who discovered
  - location_id (S): Location discovered

  -- Discovery Context
  - flight_id (S): Flight during which discovered
  - discovered_at (S): Timestamp of first discovery
  - discovery_altitude_ft (N): Altitude when discovered
  - discovery_distance_miles (N): Distance from location when triggered

  -- Points
  - points_earned (N): Points awarded
  - was_first_discovery (BOOL): First user ever to discover this location
  - bonus_points (N): Any bonus points earned

  -- Factoid History
  - factoids_seen (SS): List of factoid_ids shown for this location
  - last_factoid_shown (S): Most recent factoid_id
  - last_shown_at (S): When last factoid was shown

  -- Interaction
  - times_visited (N): How many times flown over this location
  - added_to_collection (BOOL): User explicitly saved to collection
  - shared (BOOL): User shared this discovery

GSI1 (discoveries by date for recent activity):
  PK: user_id
  SK: discovered_at

GSI2 (discoveries by location for stats):
  PK: location_id
  SK: discovered_at
```

### User Factoid History Table

```
Table: user_factoid_history
Storage: DynamoDB

Primary Key:
  PK: user_id
  SK: factoid_id

Attributes:
  -- Identity
  - user_id (S): User
  - factoid_id (S): Factoid shown
  - location_id (S): Location of factoid

  -- Interaction
  - first_shown_at (S): When first shown
  - last_shown_at (S): When last shown (for 30-day repeat rule)
  - times_shown (N): Times this factoid shown to this user
  - expanded (BOOL): User tapped to expand
  - collected (BOOL): User added to collection
  - shared (BOOL): User shared

  -- For non-repetition
  - eligible_for_repeat_at (S): Date when can show again (30 days after last)

GSI1 (history by location for non-repetition):
  PK: user_id#location_id
  SK: last_shown_at
```

### Flight Corridor Cache Table

```
Table: factoid_corridor_cache
Storage: DynamoDB

Primary Key:
  PK: corridor_id (e.g., "JFK_LAX", "LHR_NRT")
  SK: METADATA

Attributes:
  -- Identity
  - corridor_id (S): Origin_Destination pair
  - origin_airport (S): Origin IATA code
  - destination_airport (S): Destination IATA code

  -- Corridor Path
  - waypoints (L): List of {lat, lon} points along typical route
  - corridor_width_miles (N): Width of corridor for location matching

  -- Cached Locations
  - location_ids (SS): All notable locations in this corridor
  - location_count (N): Number of locations
  - locations_by_level (M): {minimal: [ids], normal: [ids], detailed: [ids]}

  -- Cache Status
  - last_generated (S): When cache was built
  - needs_refresh (BOOL): Flag for regeneration
  - download_size_kb (N): Estimated download size

  -- Usage Stats
  - times_downloaded (N): How many times users downloaded this corridor
  - last_downloaded (S): Most recent download

GSI1 (corridors by origin for prefetch):
  PK: origin_airport
  SK: destination_airport

GSI2 (corridors needing refresh):
  PK: needs_refresh
  SK: last_generated
```

### Factoid Generation Queue Table

```
Table: factoid_generation_queue
Storage: DynamoDB

Primary Key:
  PK: QUEUE
  SK: queue_entry_id

Attributes:
  -- Identity
  - queue_entry_id (S): UUID
  - location_id (S): Location needing factoids

  -- Request
  - requested_count (N): How many factoids to generate
  - categories_needed (SS): Which categories to generate
  - priority (N): 1-10 (higher = process first)

  -- Status
  - status (S): pending, processing, completed, failed
  - created_at (S): When queued
  - started_at (S): When processing started
  - completed_at (S): When finished

  -- Result
  - factoids_generated (N): How many successfully created
  - error_message (S): If failed, why

GSI1 (queue by status for processing):
  PK: status
  SK: priority#created_at
```

### Factoid Generation Prompts Table

```
Table: factoid_prompts
Storage: DynamoDB

Primary Key:
  PK: PROMPT
  SK: prompt_id

Attributes:
  -- Identity
  - prompt_id (S): UUID
  - prompt_name (S): Descriptive name
  - prompt_version (S): Version number

  -- Content
  - location_type (S): Which location types this prompt handles
  - category (S): Which factoid category this generates
  - system_prompt (S): System prompt for Claude
  - user_prompt_template (S): Template with {placeholders}
  - output_format (S): Expected JSON structure

  -- Quality Control
  - temperature (N): AI temperature setting
  - max_tokens (N): Max response tokens
  - required_fields (SS): Fields that must be in response

  -- Status
  - is_active (BOOL): Currently in use
  - created_at (S): When created
  - updated_at (S): Last update

GSI1 (prompts by location type):
  PK: location_type
  SK: category#prompt_id
```

### Offline Factoid Cache (Local Storage - SQLite/Hive)

```sql
-- Notable locations for offline display
CREATE TABLE local_locations (
  location_id TEXT PRIMARY KEY,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  category_icon TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  trigger_radius_miles REAL DEFAULT 20,
  notability_score INTEGER,
  rarity TEXT,
  base_points INTEGER,
  country_code TEXT,
  downloaded_at TEXT NOT NULL
);

CREATE INDEX idx_local_locations_type ON local_locations(location_type);
CREATE INDEX idx_local_locations_coords ON local_locations(latitude, longitude);

-- Factoids for offline display
CREATE TABLE local_factoids (
  factoid_id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  short_text TEXT NOT NULL,
  expanded_text TEXT,
  quality_score REAL,
  downloaded_at TEXT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES local_locations(location_id)
);

CREATE INDEX idx_local_factoids_location ON local_factoids(location_id);

-- User's discovery history (for non-repetition)
CREATE TABLE local_discoveries (
  location_id TEXT PRIMARY KEY,
  discovered_at TEXT NOT NULL,
  factoids_seen TEXT,  -- JSON array of factoid_ids
  last_factoid_shown TEXT,
  times_visited INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

-- Factoid display history (for non-repetition)
CREATE TABLE local_factoid_history (
  user_factoid_key TEXT PRIMARY KEY,  -- "{location_id}_{factoid_id}"
  location_id TEXT NOT NULL,
  factoid_id TEXT NOT NULL,
  last_shown_at TEXT NOT NULL,
  times_shown INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

CREATE INDEX idx_local_history_location ON local_factoid_history(location_id);

-- Pending discovery syncs
CREATE TABLE local_discovery_queue (
  queue_id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  factoid_id TEXT,
  flight_id TEXT,
  discovered_at TEXT NOT NULL,
  points_earned INTEGER,
  interaction_type TEXT,  -- discovered, expanded, collected, shared
  synced INTEGER DEFAULT 0
);

-- Factoid display queue (for sequential display)
CREATE TABLE local_factoid_queue (
  queue_position INTEGER PRIMARY KEY,
  location_id TEXT NOT NULL,
  factoid_id TEXT NOT NULL,
  triggered_at TEXT NOT NULL,
  priority INTEGER,
  status TEXT DEFAULT 'pending'  -- pending, showing, dismissed
);
```

### Global Discovery Stats Table

```
Table: global_discovery_stats
Storage: DynamoDB

Primary Key:
  PK: location_id
  SK: STATS

Attributes:
  -- Discovery Stats
  - total_discoveries (N): Total users who discovered this
  - first_discovered_by (S): User who found it first
  - first_discovered_at (S): When first discovered
  - discoveries_today (N): Discoveries in last 24h
  - discoveries_this_week (N): Discoveries in last 7 days

  -- Engagement Stats
  - total_factoids_shown (N): All factoid views
  - total_collections (N): Times added to collection
  - total_shares (N): Times shared
  - avg_view_duration_ms (N): Average engagement time

  -- Trending
  - trending_score (N): Computed trending score
  - last_trending_calc (S): When score was calculated

GSI1 (locations by discovery count for leaderboards):
  PK: GLOBAL
  SK: total_discoveries#location_id

GSI2 (trending locations):
  PK: GLOBAL
  SK: trending_score#location_id
```

---

