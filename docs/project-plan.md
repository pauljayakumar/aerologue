# Project Plan

This document outlines how the features defined in `features.md` will be achieved.

## Numbering Convention
All items in this document use the format: **PLN-[NUMBER].[REVISION]**

Example: `PLN-001.0` (Plan item 1, initial version)

---

## Plan Items

### Platform Deployment

#### PLN-001.0 - Web Application (BaaS Testing Platform)
Deploy aerologue as a web application accessible via browsers.

**Strategic Role:** Non-Flutter web app developed first to validate BaaS before native app development.

**Why Web First:**
- Fastest iteration cycle for BaaS development and testing
- No app store approval delays during development
- Easier debugging and inspection of API calls
- Validates all backend services before Flutter/Unity investment
- Allows stakeholder demos without app installation

**Technology:**
- React/Vue/Next.js + MapLibre GL JS (non-Flutter)
- Same BaaS backend that Flutter apps will use
- Validates API contracts before native development

**Scope:**
- All features except Unity games (FEA-007.0, FEA-008.0)
- Flight tracking, maps, authentication, greetings, gamification, wallet
- Progressive Web App (PWA) capabilities

- Uses: CMP-024.0

#### PLN-002.0 - Windows Application (DLL)
Create a native Windows desktop application using Flutter.
- Output: Windows DLL for deployment on Microsoft Games and airplane consoles
- Built from unified Flutter codebase

#### PLN-003.0 - Android Application (Google Play)
Build and publish Android app to Google Play Store using Flutter.
- Built from unified Flutter codebase

#### PLN-004.0 - iOS Application (Apple App Store)
Build and publish iOS app to Apple App Store using Flutter.
- Built from unified Flutter codebase

---

### Technical Architecture

#### PLN-005.0 - Backend as a Service (BaaS) on AWS
Build serverless backend infrastructure on AWS to support all client applications.
- Supports: All features (FEA-001.0 through FEA-012.0)
- Uses: CMP-001.0 through CMP-007.0

---

### BaaS Implementation Details

#### PLN-008.0 - ADSB Data Integration
Integrate with paid ADSB data APIs with multiple provider redundancies for reliability.

**Provider Strategy:**

| Provider | Role | Tier | Status |
|----------|------|------|--------|
| ADS-B Exchange | Primary (MVP) | Basic → Global | Active |
| OpenSky Network | Fallback (Free) | Global coverage | Active |
| AirNav RadarBox | Secondary | Full global | Future |
| VariFlight | Regional | China/Asia | Future |
| Aireon | Premium | Space-based global | Future |

**OpenSky Network (Fallback):**
- **Role:** Free fallback when ADS-B Exchange is unavailable or rate-limited
- **API:** REST API with bounding box queries
- **Limitations:** Lower update frequency, less metadata (no registration/aircraft type)
- **Use cases:** Development, testing, graceful degradation
- **Note:** Automatically switches back to ADS-B Exchange when available

**ADS-B Exchange Implementation:**
- **Basic Tier (MVP - Current):** Location-based queries with `dist=3000` (3000nm radius)
  - Uses 8 strategic global query points for worldwide coverage:
    - Americas: New York (40,-74), San Francisco (37,-122), Sao Paulo (-23,-46)
    - Europe/Africa/Middle East: London (51,0), Dubai (25,55)
    - Asia/Pacific: Tokyo (35,140), Singapore (1,104), Sydney (-33,151)
  - Queries executed in parallel for ~2 second total response time
  - Deduplication by ICAO24 removes ~50% duplicate aircraft from overlapping regions
  - Typical yield: ~14,000-15,000 unique flights globally
  - API polling interval: Every 10 seconds
- **Global Tier (Post-MVP):** Single global query endpoint
  - Upgrade when usage justifies cost

**Admin-Controlled Provider Management:**
- Enable/disable providers from admin console
- Track subscription status: not_started, active, expired, removed
- Switch providers without code deployment
- Configuration via environment variables

**Environment Configuration:** See `.env.example` for provider setup

- Supports: FEA-001.0 (Flight Tracking)
- Uses: CMP-001.0

#### PLN-009.0 - Airport Data Integration
Integrate airport data sources for both static location data and live arrivals/departures.

**Provider Strategy:**

| Provider | Static Data | Live Schedules | Pricing | Role |
|----------|-------------|----------------|---------|------|
| AeroDataBox | ✓ | ✓ | $0.99-$150/mo | Primary |
| AirLabs | ✓ | ✓ | Free-$499/mo | Secondary |
| AirportDB | ✓ | - | Free | Static backup |

**Data Coverage:**

- **Static (FEA-002.0):** Location, runways, frequencies, terminals, facilities
- **Live (FEA-003.0):** Real-time arrivals/departures, delays, gate info

**Admin Console Controls:**
- **AeroDataBox on/off toggle** - Critical for cost control during testing
- Enable/disable individual providers
- Monitor credit/quota usage
- Set usage alerts

**Note:** AeroDataBox uses credits quickly during testing - admin must be able to disable it to preserve quota.

**Future Consideration:** FlightAware AeroAPI for predictive delay capabilities (Foresight ML)

- Supports: FEA-002.0, FEA-003.0
- Uses: CMP-002.0

#### PLN-010.0 - Real-Time Data Delivery Architecture
Implement dual-channel data delivery system:
- **WebSocket connections** - For real-time streaming data (live flight positions, flight crossings, greetings)
- **REST API endpoints** - For on-demand queries (historical data, airport info, user data)

**Suggested approach:** Use AWS API Gateway WebSocket APIs for persistent connections, with Lambda functions processing messages. REST endpoints via API Gateway HTTP APIs.

---

**WebSocket vs REST Decision Matrix**

| Data Type | Protocol | Rationale |
|-----------|----------|-----------|
| Live flight positions | **WebSocket only** | Real-time streaming, server pushes every 10 seconds |
| Flight crossing alerts | **WebSocket only** | Instant notification when crossing detected |
| Greeting messages | **WebSocket only** | Real-time message delivery |
| Airport arrivals/departures | REST | Changes slowly, on-demand fetch |
| User profile | REST | One-time load per session |
| Gamification stats | REST | Infrequent updates |
| Flight search | REST | User-initiated query |
| Leaderboard | REST | Periodic refresh |
| Wallet data | REST | On-demand access |
| Vlog content | REST | Static content fetch |

**Design Decision: No REST Fallback for Real-Time Data**
- WebSocket is the sole channel for flight positions
- Simpler architecture, fewer edge cases
- If WebSocket fails, user sees stale data with "Reconnecting..." indicator
- Automatic reconnection with exponential backoff

**Platform Consistency:**
- Web app uses WebSocket (same as native apps)
- Validates WebSocket infrastructure during BaaS testing phase
- Ensures consistent behavior across all platforms

---

**Flight Position Update Strategy**

**Server Push Interval:** Every 10 seconds

**Client-Side Interpolation (Smooth Movement):**
Between server updates, client predicts aircraft position using:
- Last known position (lat, lon)
- Ground speed (knots)
- Heading (degrees)
- Vertical rate (ft/min)

```
Interpolation Algorithm (Implemented):
1. Use requestAnimationFrame for 60fps animation loop
2. Calculate actual delta time between frames (not assumed 1/60s)
3. Cap delta time to 100ms to prevent huge jumps if tab was inactive
4. For each aircraft with velocity > 30 knots:
   a. Convert heading to radians
   b. Calculate distance in degrees: speed × KNOTS_TO_DEG_PER_SEC × deltaTime
   c. Project latitude: lat += distance × cos(heading)
   d. Project longitude: lon += distance × sin(heading) / cos(lat)
   e. Apply correction toward actual position: 3× deltaTime factor
5. For stationary aircraft (velocity <= 30 knots):
   - Lerp to actual position with 6× deltaTime factor
6. Update GeoJSON source with new positions each frame
```

**Constants:**
```javascript
// 1 knot = 1.852 km/h = 0.0005144 km/s
// 1 degree latitude ≈ 111 km
// So: knots × 0.0005144 / 111 = degrees/second
const KNOTS_TO_DEG_PER_SEC = 0.0005144 / 111;
```

**Position Correction Handling:**
- **Moving aircraft (>30 knots):** Dead reckoning + 3% correction per frame toward actual
- **Stationary aircraft (≤30 knots):** 6% lerp per frame to actual position
- **Tab inactive:** Delta time capped at 100ms to prevent large position jumps
- **Frame-rate independent:** All movement scaled by actual elapsed time

**Benefits of 10-Second + Interpolation:**
- 6x less bandwidth than 2-second updates
- 6x fewer API calls to backend
- Smooth visual experience (appears real-time)
- Lower battery consumption on mobile
- Reduced server load

**Initial Load Optimization:**
- Default map center: London (-0.1276, 51.5074)
- Default zoom level: 5 (regional view with aircraft detail)
- Rationale: Immediate visibility of aircraft without waiting for global load
- Future enhancement: Default to user's registered location or geolocation

**Data Payload per Update (~200 bytes):**
```json
{
  "id": "ABC123",
  "lat": 40.7128,
  "lon": -74.0060,
  "alt": 35000,
  "spd": 450,
  "hdg": 270,
  "vr": 0,
  "ts": 1705320600
}
```

---

**Context-Aware Data Filtering (Data Economy)**

Server-side filtering before broadcast - users only receive data relevant to their current context.

**Filter by Feature/Context:**

| Feature | Data Needed | Filter Strategy |
|---------|-------------|-----------------|
| Flight Tracking | Full flight details, trail | Flight ID subscription |
| Airport View | Arrivals/departures for airport | Airport ICAO filter |
| On-Plane | Own flight + nearby for crossings | Geo-radius filter (20 miles) |
| Map Browsing | Flights in viewport | Bounding box filter |
| Gaming | Minimal position data | Lightweight payload |
| Greetings | Nearby crossing flights only | Proximity filter (20 miles) |
| Vlog Map | Flights near vlog locations | Geo-point filter |

**Subscription Model:**

Users subscribe to data based on active feature:
- Subscriptions managed per WebSocket connection
- Update subscriptions when user switches features
- Server filters full data stream per user
- Send only matching data points

**Data Payload Optimization:**

| Context | Payload | Fields Included |
|---------|---------|-----------------|
| Full | ~500 bytes | All position + metadata |
| Standard | ~200 bytes | Position + basic info |
| Minimal | ~50 bytes | Position only |
| Event | Variable | Crossing/greeting events |

**Benefits:**
- Reduced bandwidth (GB → MB per hour)
- Lower device battery consumption
- Faster app performance
- API costs paid once, filtered for many users

---

**Map Rendering Optimization (WebGL Symbol Layer)**

For displaying thousands of aircraft on the map, we use MapLibre's WebGL-based symbol layer instead of individual DOM markers. This provides ~10x better performance.

**Architecture:**

| Approach | DOM Markers | WebGL Symbol Layer |
|----------|-------------|-------------------|
| Rendering | Individual HTML elements | Single WebGL draw call |
| Memory per flight | ~50KB | ~0.5KB |
| CPU usage | High (DOM updates) | Low (GPU rendering) |
| Max flights | ~500 before lag | 10,000+ smooth |

**Implementation:**

```javascript
// 1. Load aircraft icons as map images (once at startup)
const iconNames = ['737', '747', '777', '787', 'A320', 'A340', 'A350', 'A380', 'ATR72'];
for (const name of iconNames) {
  const img = new Image();
  img.src = `/aircraft/optimized/${name}.png`;
  mapInstance.addImage(name, img);
}

// 2. Create GeoJSON source for all flights
mapInstance.addSource('flights', {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] }
});

// 3. Add symbol layer with dynamic icon selection and rotation
mapInstance.addLayer({
  id: 'flights-layer',
  type: 'symbol',
  source: 'flights',
  layout: {
    'icon-image': ['get', 'icon'],           // Dynamic icon per aircraft type
    'icon-size': 0.42,
    'icon-rotate': ['get', 'heading'],       // Rotate to heading
    'icon-rotation-alignment': 'map',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true
  }
});

// 4. Update by replacing entire GeoJSON (efficient for WebGL)
source.setData({
  type: 'FeatureCollection',
  features: flights.map(f => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [f.lon, f.lat] },
    properties: { icon: getAircraftIcon(f.type), heading: f.heading }
  }))
});
```

**Key Optimizations:**

1. **Single source, single layer**: All aircraft in one GeoJSON source
2. **GPU-side rotation**: `icon-rotate` expression handled by GPU
3. **Dynamic icon mapping**: `['get', 'icon']` expression selects correct aircraft silhouette
4. **Batch updates**: Replace entire dataset instead of individual updates
5. **Icon atlas**: MapLibre automatically creates texture atlas from loaded images

**Aircraft Icon Mapping:**

Icons in `/public/aircraft/optimized/` (48×48px PNGs):
- Boeing: 737, 747, 777, 787
- Airbus: A320, A340, A350, A380
- Regional: ATR72

Mapping utility (`src/lib/aircraftIcons.ts`) maps 100+ ICAO type codes to these 9 icons.

---

**WebSocket Connection Management**

**Reconnection Strategy:**
```
On disconnect:
1. Show "Reconnecting..." indicator to user
2. Attempt reconnect immediately
3. If fail: Wait 1s, retry
4. If fail: Wait 2s, retry
5. If fail: Wait 4s, retry (exponential backoff)
6. Max backoff: 30 seconds
7. After 5 minutes of failures: Show "Connection lost" with manual retry button
8. On reconnect: Re-subscribe to previous subscriptions, fetch missed data
```

**Heartbeat/Keep-Alive:**
- Client sends ping every 30 seconds
- Server responds with pong
- If no pong in 10 seconds, assume disconnected, trigger reconnect

**Connection Lifecycle:**
```
App Launch → Connect WebSocket → Authenticate → Subscribe → Receive Data
                     ↓
              On Background → Keep connection (mobile) or Disconnect (web)
                     ↓
              On Foreground → Reconnect if needed → Re-subscribe
                     ↓
              App Close → Disconnect cleanly
```

- Uses: CMP-003.0, CMP-020.0

#### PLN-011.0 - Database Architecture
Implement multi-database architecture for all data persistence needs.

**Three-Database Strategy:**

| Database | AWS Service | Purpose |
|----------|-------------|---------|
| Time-Series | Amazon Timestream | Flight positions, historical trails |
| Relational | Amazon Aurora PostgreSQL | Users, airports, wallet, gamification |
| Document/NoSQL | Amazon DynamoDB | Crossings, messages, sessions, vlogs |

---

**Amazon Timestream (Time-Series)**

| Data | Description |
|------|-------------|
| Live flight positions | High-volume ingestion from ADSB APIs |
| Historical flight trails | Archived positions for replay/analytics |

Features: Auto-tiering (memory → magnetic → S3), retention policies, SQL-like queries

---

**Amazon Aurora PostgreSQL (Relational)**

| Data | Why Relational |
|------|----------------|
| Static airport info | Structured, joins, PostGIS for geospatial |
| User accounts & settings | Security-critical, authentication |
| Gamification | Ranking queries, leaderboards (ORDER BY) |
| Wallet/transactions | ACID compliance required |

Features: PostGIS extension, Aurora Serverless v2 for cost optimization

---

**Amazon DynamoDB (NoSQL/Document)**

| Data | Why DynamoDB |
|------|--------------|
| Planes crossing info | Real-time, TTL for auto-expiration, geohashing |
| Users on plane | Session data, fast lookups by user/flight |
| Messages exchanged | Document-like, linked to crossings |
| Vlog map content | Flexible schema, media metadata |
| Admin/system config | Key-value settings |
| Notifications/alerts | Queue-like, delivery tracking |

Features: TTL for auto-cleanup, Global Tables for multi-region, DAX for caching

---

**Additional Storage:**
- **Amazon S3** - Long-term archival, media files (vlog content)

- Supports: All features
- Uses: CMP-004.0, CMP-017.0, CMP-018.0

#### PLN-023.0 - Data Transformation Pipeline (ETL)
Implement data transformation service for normalizing API data before database storage.

**Pipeline Stages:**
1. **Fetch** - Pull data from enabled API providers
2. **Parse** - Extract fields using provider-specific mappings
3. **Normalize** - Convert to unified internal schema
4. **Transform** - Apply unit conversions, formatting
5. **Validate** - Check data quality, ranges
6. **Deduplicate** - Remove duplicates by key + timestamp
7. **Route** - Direct to appropriate database
8. **Store** - Insert/update with error handling

**Key Transformations:**
- Provider-specific field name mappings (see `data-dictionary.md`)
- Unit conversions (meters→feet, km/h→knots)
- Timestamp normalization to UTC ISO 8601
- Code standardization (uppercase airport/airline codes)
- Data validation and sanitization

**Error Handling:**
- API timeout: Retry with backoff, switch to fallback
- Invalid data: Log, skip record, continue
- DB write fail: Retry, dead-letter queue

**Data Retention:** Automatic tiering and TTL per data type

- Supports: PLN-008.0, PLN-009.0, PLN-011.0
- Uses: CMP-019.0
- Reference: `data-dictionary.md` for complete field mappings

#### PLN-012.0 - User Context Detection
Detect user's physical context based on device location and flight data:
- At airport (within airport geofence)
- On plane (matched to specific flight)
- Flight phase: pre-departure, taxiing, takeoff, cruise, descent, landed
- Supports: FEA-005.0 (context-aware greetings), FEA-009.0 (gamification triggers)
- Uses: CMP-005.0

#### PLN-013.0 - Flight Crossing Detection
Real-time monitoring of all live flights to detect when flight paths cross or come into proximity.
- Basis for greeting exchange feature (FEA-005.0)
- Trigger for social interactions between users on crossing flights
- Uses: CMP-006.0

**Proximity Threshold:**
- **Horizontal distance:** 20 miles (~32 km) radius
- **Vertical distance:** 5,000 feet (~1,500 m) altitude difference
- Both conditions must be met for a "crossing" event

**Detection Algorithm:**

```
For each flight with an active Aerologue user:
  1. Get current position (lat, lon, altitude)
  2. Query nearby flights within 20-mile radius (spatial index)
  3. Filter by altitude: |alt1 - alt2| ≤ 5000 ft
  4. Filter by flight phase: Both must be in "cruise" (not takeoff/landing)
  5. Check if other flight has active Aerologue user
  6. If match found → Create crossing event
```

**Spatial Indexing Strategy:**
- Use GeoHash for efficient proximity queries
- Partition flights by GeoHash prefix (e.g., 4-character = ~20km cells)
- Only compare flights in same or adjacent cells

**Flight Phase Filter:**
Only detect crossings when both aircraft are in cruise phase:
- Altitude > 10,000 ft
- Vertical rate < 500 ft/min (level flight)
- Not within 50 miles of origin or destination airport

**Crossing Event Data:**
```json
{
  "crossing_id": "uuid",
  "flight1_id": "AA100",
  "flight2_id": "UA200",
  "user1_id": "abc123",
  "user2_id": "def456",
  "distance_miles": 15.3,
  "altitude_diff_ft": 2000,
  "crossing_point": {"lat": 40.5, "lon": -73.2},
  "detected_at": "2024-01-15T10:30:00Z",
  "status": "active",
  "greeting_sent": false,
  "ttl": 1705320600  // 1 hour expiry
}
```

**Performance Considerations:**
- Run detection every 10 seconds for active user flights
- Cache recent crossing events to avoid duplicates
- Use DynamoDB TTL for automatic cleanup (1 hour)
- Expected crossings per user per flight: 0-5 (most flights have none)

---

### Authentication Implementation

#### PLN-020.0 - AWS Cognito Authentication (Phase 1)
Implement authentication using AWS Cognito as initial solution.

**Why Cognito for MVP:**
- Fast implementation with AWS Amplify
- Built-in support for Apple Sign-in, Google Sign-in
- Integrates with existing AWS BaaS (PLN-005.0)
- Handles security, token refresh, MFA
- Cost-effective at MVP scale

**Implementation:**
- User pools for authentication
- Identity pools for AWS resource access
- Social identity providers (Apple, Google)
- Email/password with verification
- Supports: FEA-016.0
- Uses: CMP-014.0

#### PLN-021.0 - Custom Authentication System (Phase 2 - Post-Funding)
Migrate from Cognito to custom authentication system for full control.

**Rationale for migration:**
- Reduce AWS dependency and costs at scale
- Custom user management features
- Full control over auth flow and data
- Avoid Cognito pricing at high user volumes

**Key Design Decision: Cognito-Compatible Schema**

The custom auth system will use the same schema structure as Cognito to ensure seamless migration:

```
Custom Auth Schema (mirrors Cognito):
├── user_id (sub)        → Same UUID format as Cognito 'sub'
├── email                → Same field
├── email_verified       → Same field
├── phone_number         → Same field (optional)
├── phone_verified       → Same field
├── name                 → Maps to display_name
├── picture              → Maps to avatar_url
├── identities           → Social provider links (Apple, Google)
├── created_at           → Same as Cognito UserCreateDate
├── updated_at           → Same as Cognito UserLastModifiedDate
└── custom:*             → Any custom attributes we add in Cognito
```

**Why Cognito-Compatible Schema:**
- Zero changes to user_profiles table during migration
- user_id (Cognito 'sub') remains the primary key everywhere
- All foreign key relationships preserved
- No data transformation needed
- Can switch auth provider without touching application data

**Migration Strategy:**

```
Phase 2a: Build Custom Auth (Parallel)
├── Deploy custom auth service alongside Cognito
├── Same API interface as Cognito (drop-in replacement)
├── Custom service validates both Cognito tokens AND custom tokens
└── No user-facing changes yet

Phase 2b: Gradual User Migration
├── New signups → Custom auth system
├── Existing users → Still use Cognito
├── On next login, migrate user record to custom system
├── User gets new token from custom system (transparent)
└── Cognito record marked as "migrated"

Phase 2c: Cognito Sunset
├── All active users migrated
├── Disable new Cognito authentications
├── Keep Cognito read-only for 90 days (stragglers)
├── Full cutover to custom system
└── Decommission Cognito
```

**Token Compatibility:**
- Custom system issues JWTs with same claims as Cognito
- Backend validates tokens from either source during transition
- Client SDK abstraction handles token source transparently

**Social Provider Migration:**
- Apple Sign-in: Re-link to custom system (Apple provides same user ID)
- Google Sign-in: Re-link to custom system (Google provides same user ID)
- Users don't need to re-authenticate - provider IDs are portable

**Rollback Plan:**
- If custom auth has issues, route traffic back to Cognito
- User records kept in sync during parallel run
- Can rollback within minutes

- Uses: CMP-015.0

**Note:** Design CMP-014.0 with abstraction layer to ease future migration. All auth calls go through abstraction, never directly to Cognito.

#### PLN-022.0 - App Store Authentication Compliance
Ensure authentication meets all app store requirements.

**Apple App Store (CRITICAL):**
- Must include Apple Sign-in if offering Google/social login
- Apple Sign-in must be equal or more prominent than other options
- Privacy: Minimize data collection, support "Hide My Email"

**Google Play:**
- Support Google Sign-in for seamless Android experience
- Comply with data safety section requirements

**Common:**
- Secure token storage
- Proper session handling
- Privacy policy compliance

---

#### PLN-026.0 - Development Sequence Strategy
Define the order of platform development to minimize risk and maximize validation.

**Development Order:**
```
1. Web App (PLN-001.0) - Non-Flutter
   ├── Validates: BaaS, APIs, WebSockets, Auth, Database
   ├── Technology: React/Vue/Next.js + MapLibre GL JS
   ├── Timeline: First
   └── Output: Working backend, tested APIs, web product

2. Flutter Apps (PLN-002.0, PLN-003.0, PLN-004.0) - Single Codebase
   ├── Builds: Windows DLL, Android APK, iOS IPA
   ├── Technology: Flutter + Unity
   ├── Timeline: After web validates BaaS
   └── Output: Native apps with full features including games
```

**Risk Mitigation:**
- Web app catches backend bugs before Flutter/Unity investment
- API contracts proven before native development
- Authentication flow validated with real users
- Database schema stress-tested
- WebSocket scalability confirmed

**Shared Backend:**
- Same BaaS serves both web and Flutter apps
- Same API endpoints, same data formats
- Web app acts as integration test suite for backend

#### PLN-006.0 - Flutter Cross-Platform Development
Use Flutter framework to create unified codebase for Windows, Android, and iOS apps.
- **Single codebase** produces all three native platforms:
  - Windows: DLL for Microsoft Games / airplane consoles
  - Android: APK/AAB for Google Play
  - iOS: IPA for Apple App Store
- Enables: PLN-002.0, PLN-003.0, PLN-004.0

#### PLN-007.0 - Unity Game Engine Integration
Develop gaming features in Unity and integrate into Flutter applications using ongoing runtime integration.

**Integration Approach:**
- **Runtime Integration** (NOT one-time build):
  - Unity module embedded as view/widget within Flutter app
  - Both run simultaneously during app usage
  - Bidirectional real-time communication via message channels
  - Unity renders continuously (3D globe, animations, games)

**Build Process:**
- Unity exports as library module:
  - iOS: Framework
  - Android: AAR (Android Archive)
  - Windows: DLL
- Flutter imports these libraries during app compilation
- End result: Single app package with Unity embedded

**Data Flow (Real-time):**
```
User taps "Play Game" in Flutter
    ↓
Flutter loads Unity scene
    ↓
Flutter sends flight data → Unity (via SendMessage)
    ↓
Unity renders globe, updates aircraft positions
    ↓
User completes game in Unity
    ↓
Unity sends score → Flutter (via UnityMessage callback)
    ↓
Flutter updates gamification stats in backend
```

**Communication Architecture:**
- Flutter acts as **data gateway** - all network calls happen in Flutter
- Unity receives data via message passing (JSON format)
- Static data bundled in Unity, dynamic data from Flutter
- No direct network calls from Unity module

- Supports: FEA-007.0, FEA-008.0, FEA-009.0
- Uses: CMP-012.0, CMP-021.0, CMP-022.0

#### PLN-025.0 - Unity Game Module Architecture
Detailed architecture for Unity-based globe map and gaming features.

**Globe Map Implementation: Hybrid Approach (Option C)**

**Layer Structure:**
```
┌─────────────────────────────────────┐
│  Vector Overlays (Dynamic)          │  ← Flight paths, airports, borders
│  - Flight paths (animated lines)    │
│  - Airport pins (3D markers)        │
│  - Country highlights               │
├─────────────────────────────────────┤
│  Base Texture (Static)               │  ← Earth surface from NASA/Natural Earth
│  - Ocean/terrain rendering          │
│  - Baked into Unity asset           │
│  - LOD system (3 levels)            │
└─────────────────────────────────────┘
```

**Asset Budget Breakdown:**
- Base globe texture: 20-30MB (compressed, NASA Blue Marble or Natural Earth)
- Airport database: 8-10MB (~50K airports with coordinates)
- Aircraft silhouettes: 12-15MB (~200 aircraft types)
- Vector data (borders/coasts): 5-8MB
- Game UI assets: 15-20MB
- **Total Unity module: 80-100MB** (within PLN-024.0 budget)

**Data Requirements & Sources:**

| Data Type | Size | Source | Online Required? | Update Frequency |
|-----------|------|--------|------------------|------------------|
| Airport locations | 10MB | Bundled in Unity | No | App updates |
| Aircraft catalog | 15MB | Bundled in Unity | No | App updates |
| Country polygons | 8MB | Bundled in Unity | No | App updates |
| Live flight positions | Streaming | Flutter → Unity | Yes | 2-5 seconds |
| User flight context | <1KB | Flutter → Unity | No (cached) | On change |
| Leaderboard data | Streaming | Backend API | Yes (graceful fail) | On demand |

**Real-time vs Historical Data Strategy:**

*When Connected (WiFi/In-flight WiFi):*
```
Flutter → Unity Pipeline (Real-time):
1. Flutter receives live flight positions via WebSocket (CMP-003.0)
2. Flutter filters relevant flights based on game context
3. Flutter sends JSON to Unity every 2-5 seconds:
   {
     "flights": [
       {"id": "ABC123", "lat": 40.7, "lon": -74.0, "alt": 35000, "heading": 90},
       ...
     ],
     "userFlight": {...}
   }
4. Unity updates globe aircraft positions
5. Unity triggers game events (proximity quiz, spot-the-plane)
```

*When Offline (No connectivity):*
```
Historical Data Mode:
1. Flutter checks connectivity → offline
2. Flutter loads cached flight routes from local DB
3. Flutter sends historical snapshot to Unity
4. Unity renders "replay mode" or uses simulated data
5. Games use static airport/geography data only
6. Score/progress saved locally, synced when reconnected
```

**Globe Style Matching Strategy:**

*Phase 1 (MVP):*
- Use similar color palette to Flutter map (from PLN-017.0)
- Earth texture: NASA Blue Marble (natural look)
- Vector overlays: Match Flutter's line styles (orange flight paths, teal accents)
- "Good enough" visual consistency for demo/MVP

*Phase 2 (Post-funding):*
- Hire 3D artist to create custom globe texture
- Exact match to Flutter aesthetic
- Brand-specific styling

**Style Parameters (Match to Flutter):**
```
Color Palette:
- Ocean: #1A4D7C (deep blue)
- Land: Natural Earth tones
- Flight paths: #FF6B35 (orange - brand color)
- Airports: #4ECDC4 (teal accent)
- UI elements: Match Flutter theme
```

**Content Safety (All Ages):**
- No geopolitical content (disputed territories displayed neutrally)
- Generic aircraft only (no military)
- Educational focus (geography, aviation facts)
- Positive messaging

**Unity Core Components:**
```
Unity Game Module
├── Globe Renderer
│   ├── Earth sphere with base texture
│   ├── Atmosphere shader
│   ├── Airport markers (3D pins)
│   ├── Flight path lines (animated)
│   └── Aircraft models (simplified 3D)
│
├── Data Manager
│   ├── Flutter bridge interface
│   ├── Airport database (ScriptableObjects)
│   ├── Aircraft catalog
│   └── Cache manager
│
├── Game Engine
│   ├── Quiz engine (multiple choice, map tap)
│   ├── Timer system
│   ├── Scoring system
│   └── Hint system
│
└── UI System
    ├── Game menus
    ├── Question display
    ├── Score/leaderboard
    └── Results screen
```

**Mobile Optimization:**
- LOD system for globe (reduce polygons when zoomed out)
- Texture compression (ASTC for mobile)
- Object pooling for flight markers
- Shader optimization for battery life
- **Target**: 60fps on mid-range devices

- Supports: FEA-007.0, FEA-008.0, FEA-009.0
- Uses: CMP-021.0, CMP-022.0, CMP-023.0

---

### MVP & App Store Strategy

#### PLN-014.0 - MVP Feature Scope
Define minimal viable product scope that demonstrates core value proposition while being app-store ready.

**MVP Features (Phase 1):**
- FEA-016.0 - User Authentication (AWS Cognito - required for social features, Apple Sign-in for App Store)
- FEA-001.0 - Flight Tracking (core differentiator)
- FEA-002.0 - Airport Information (essential utility)
- FEA-003.0 - Airport Live Information (real-time value)
- FEA-004.0 - Vlog Map (marketing channel - enables influencer partnerships)
- FEA-005.0 - Greetings Between Planes (unique social hook - simplified version)
- FEA-009.0 - Gamification (basic points/achievements to drive engagement)
- FEA-010.0 - Wallet Features (placeholder UI - demonstrates future monetization path)
- Game PoC - Simple Unity integration test (plane takeoff animation with logo)
  - Validates PLN-007.0 Unity-Flutter integration approach
  - Uses: CMP-012.0

**Post-Funding Features (Phase 2):**
- FEA-006.0 - Live Geo News
- FEA-007.0 - Airplane Games (full Unity games)
- FEA-008.0 - Geoquiz
- FEA-010.0 - Wallet Features (full implementation)
- FEA-011.0 - Admin Monitoring (expanded)
- FEA-012.0 - Ad Serving

**Rationale:** MVP demonstrates unique value (greetings + tracking + vlog for marketing) while validating technical approach (Unity integration). Wallet placeholder shows monetization vision to investors. Gamification provides stickiness. Phase 2 expands depth after validation.

#### PLN-015.0 - App Store Compliance Requirements
Ensure apps meet all store requirements for approval.

**Google Play Requirements:**
- Complete privacy policy
- Accurate content rating (likely "Everyone" or "Teen 13+")
- Minimal permissions (location only when needed)
- No placeholder/stub features
- Proper data handling disclosure

**Apple App Store Requirements:**
- All MVP features fully functional (no "coming soon")
- Privacy nutrition labels
- App tracking transparency compliance
- No crashes or major bugs in review flows
- Clear value proposition in first session

**Common Requirements:**
- Professional UI/UX polish
- Offline graceful degradation
- Clear onboarding flow
- Terms of service

#### PLN-024.0 - App Store Size Limits & Optimization
Manage app size to stay within store limits and optimize user download experience.

**Apple App Store (iOS) Limits:**
- **Cellular download limit**: 200MB (users can override in settings)
- **Total app size**: Maximum 4GB uncompressed
- **Executable limit**: 500MB
- **Target**: Keep initial download < 200MB to avoid user friction

**Google Play Store (Android) Limits:**
- **Android App Bundle** (required since Aug 2021): 200MB compressed download per device
- **Legacy APK**: 100MB (only for pre-Aug 2021 apps)
- **Expansion files**: Up to 2×2GB if needed via Play Asset Delivery
- **Requirement**: Must use Android App Bundle format for new apps

**Aerologue Size Budget:**
```
Component                Size (Compressed)
─────────────────────────────────────────
Flutter app code         30-50 MB
Unity game module        80-100 MB
Map tiles (bundled)      10 MB
Assets & resources       20-30 MB
─────────────────────────────────────────
Total Estimate           140-190 MB ✓
```

**Optimization Strategy:**
- Use aggressive asset compression (ASTC for textures, JPEG for photos)
- Implement texture LOD system in Unity
- Use Android App Bundle for per-device optimization
- Consider on-demand resources for iOS (non-critical game assets)
- Strip unused code and assets during build
- Monitor size with each build to prevent bloat

**Reference:**
- [Apple App Store Maximum Build File Sizes](https://developer.apple.com/help/app-store-connect/reference/maximum-build-file-sizes/)
- [Google Play App Size Limits](https://support.google.com/googleplay/android-developer/answer/9859372)

#### PLN-016.0 - Funding Pitch Demo Strategy
Optimize MVP for investor demonstrations.

**Key Demo Flows:**
1. **Flight tracking** - Show real-time plane on map with smooth performance
2. **Greeting exchange** - Demonstrate the "magic moment" of connecting with another flight
3. **Gamification** - Show engagement loop and retention mechanics
4. **Scalability story** - Backend architecture slides

**Demo Environment:**
- Pre-seeded data for reliable demonstrations
- Demo mode toggle for controlled scenarios
- Recorded fallback for live demo failures

---

### Map Performance Solution

#### PLN-017.0 - Altitude-Aware Map System
Implement intelligent map loading strategy optimized for in-flight connectivity constraints.

**Problem:** OpenStreetMap tiles load too slowly on aircraft with limited connectivity.

**Solution: Multi-Layer Altitude-Aware Map**

**Layer 1 - Bundled Base Map (Always Available)** ✓ SELECTED
- Lightweight vector world map bundled in app (~10MB)
- Source: Natural Earth MBTiles (Public Domain - no licensing issues)
- Contains: Country borders, coastlines, major water bodies, major cities
- Renders instantly with zero network dependency
- Uses: CMP-008.0

**Layer 2 - Altitude-Optimized Tiles**
- **Cruise altitude (>10,000ft):** Ultra-simplified tiles
  - Only show: continents, countries, oceans, flight path
  - Tile size: ~80% smaller than standard
  - Custom tile style generated from OSM data
- **Medium altitude (takeoff/landing):** Simplified tiles
  - Add: major cities, airports, major roads
- **Ground level:** Standard OSM detail
  - Full detail for airport navigation
- Uses: CMP-009.0

**Layer 3 - Route Pre-Caching**
- When user selects/boards flight, cache tiles along route
- Download during boarding (airport WiFi)
- Continue caching during flight when connectivity available
- Include 50km buffer zone around flight path
- Cache multiple zoom levels
- Uses: CMP-010.0

**Layer 4 - Progressive Enhancement**
- Show bundled map immediately (0ms)
- Overlay cached tiles when available
- Fetch live tiles when connectivity detected (including in-flight WiFi)
- Seamless transitions between layers
- Continuously monitor connectivity and upgrade/downgrade display accordingly

**UI Indicators (IMPORTANT - See FEA-013.0, FEA-014.0)**
- Always show connectivity status (none/poor/good/excellent)
- Always show current map source (Offline/Cached/Live)
- Uses: CMP-013.0

---

**Map Layer Switching Logic (Automatic)**

The map system automatically selects the best available layer based on connectivity and context.

**Decision Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│                    MAP LAYER SELECTOR                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Check connectivity status                                │
│     ├── NONE → Use Layer 1 (Bundled) or Layer 3 (Cached)    │
│     ├── POOR → Use Layer 3 (Cached) if available            │
│     ├── GOOD → Use Layer 2 (Altitude-Optimized)             │
│     └── EXCELLENT → Use Live OSM tiles                       │
│                                                              │
│  2. Check altitude (if user on flight)                       │
│     ├── > 10,000 ft → Cruise tiles (simplified)             │
│     ├── 1,000 - 10,000 ft → Medium tiles                    │
│     └── < 1,000 ft → Ground tiles (full detail)             │
│                                                              │
│  3. Check cache availability                                 │
│     ├── Route cached → Prefer cached over live (faster)     │
│     └── Not cached → Fall back to bundled + live fetch      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Switching Rules:**

| Connectivity | Altitude | Cache Status | Selected Layer | UI Indicator |
|--------------|----------|--------------|----------------|--------------|
| None | Any | Has cache | Cached Route | "Cached Route" |
| None | Any | No cache | Bundled | "Offline Map" |
| Poor (<100kbps) | Any | Has cache | Cached Route | "Cached Route" |
| Poor (<100kbps) | Any | No cache | Bundled | "Offline Map" |
| Good (100kbps-1Mbps) | >10,000ft | Any | Altitude-Optimized (Cruise) | "Live Map" |
| Good (100kbps-1Mbps) | <10,000ft | Any | Altitude-Optimized (Ground) | "Live Map" |
| Excellent (>1Mbps) | Any | Any | Full OSM Live | "Live Map" |

**Connectivity Detection:**
- Monitor network status every 5 seconds
- Measure actual throughput with small test requests
- Classify: None (0), Poor (<100kbps), Good (100kbps-1Mbps), Excellent (>1Mbps)

**Switching Behavior:**
- **Upgrade (offline → live):** Immediate when connectivity detected
- **Downgrade (live → offline):** After 10 seconds of failed tile requests
- **Hysteresis:** Avoid rapid switching - require stable state for 5 seconds before switch
- **User override:** Allow manual "Force Offline" toggle in settings

**Transition Animation:**
- Fade between layers over 300ms
- Never show blank/missing tiles - always have fallback visible
- Show loading indicator only if tile fetch takes >2 seconds

**Cache Management:**
- **Max cache size:** 500MB (configurable)
- **Eviction policy:** LRU (Least Recently Used)
- **Cache priority:** Current route > Recently viewed > Old tiles
- **Pre-fetch trigger:** When user selects/boards a flight
- **Background fetch:** Continue caching when on WiFi, even if app backgrounded

**Implementation Approach:**
- Use MapLibre GL (open-source Mapbox GL fork) for vector tile rendering
- Custom tile server to generate simplified high-altitude tiles
- Offline-first architecture
- Connectivity-aware layer switching

#### PLN-018.0 - Map Tile Generation Pipeline
Generate custom simplified tile sets for different altitude levels.

- Process OpenStreetMap data to create altitude-specific styles
- Host on CloudFront CDN for fast global delivery
- Automated pipeline to update tiles periodically
- Uses: CMP-009.0

#### PLN-019.0 - Bundled Map Tile Investigation

**Question:** Can we bundle high-level map tiles directly in the app package?

**Answer:** YES - This is technically feasible and recommended.

---

**Technical Feasibility: CONFIRMED**

Vector tiles in MBTiles format can be bundled directly into mobile apps:
- MapLibre GL supports offline MBTiles on iOS, Android, and desktop
- Flutter plugins available for MBTiles reading
- Natural Earth provides pre-rendered vector tiles specifically for this use case

**Estimated Bundle Sizes:**

| Data Source | Zoom Levels | Estimated Size | Contents |
|-------------|-------------|----------------|----------|
| Natural Earth Vector | 0-6 | 5-15 MB | Countries, coastlines, major cities |
| Simplified OSM | 0-5 | 10-25 MB | Above + major roads, airports |
| Full OSM (low zoom) | 0-6 | 50-100 MB | Full detail at low zoom |

**Recommendation:** Natural Earth Vector tiles (5-15MB) - optimal for high-altitude cruise view.

---

**Data Source Options & Licensing:**

**Option 1: Natural Earth (RECOMMENDED)**
- **License:** Public Domain (PDDL v1.0)
- **Attribution:** Not required (but appreciated)
- **Commercial use:** Fully permitted
- **Pros:**
  - Zero licensing concerns
  - Specifically designed for small-scale maps
  - Pre-rendered tiles available
  - Very small file size
- **Cons:**
  - Limited detail (but perfect for cruise altitude)
- **Source:** https://github.com/lukasmartinelli/naturalearthtiles

**Option 2: OpenStreetMap Extract**
- **License:** Open Database License (ODbL)
- **Attribution:** Required - "© OpenStreetMap contributors"
- **Commercial use:** Permitted with attribution
- **Share-alike:** Must share derivative databases under ODbL
- **Pros:**
  - More detail available
  - Regularly updated
- **Cons:**
  - Attribution required in app
  - Larger file size
  - Cannot use tile.openstreetmap.org for bulk download (violates ToS)
  - Must self-host or use commercial provider
- **Note:** Tiles are "Produced Works" under ODbL, so can apply own terms but must attribute

**Option 3: Commercial Providers (MapTiler, Mapbox)**
- **License:** Proprietary
- **Cost:** Subscription-based
- **Offline:** Some allow with specific licenses
- **Cons:** Cannot bundle without explicit commercial agreement

---

**Alternative Solutions:**

**Alternative A: SVG World Map**
- Single vector file (~1-2MB)
- Infinite scalability
- Very fast rendering
- Limited interactivity
- Good for absolute minimal fallback

**Alternative B: Pre-rendered PNG Tiles**
- Larger file size (~20-50MB for z0-6)
- Simpler rendering (no vector processing)
- Fixed resolution per zoom level
- Good for older/slower devices

**Alternative C: Hybrid Approach** ✓ SELECTED
- Bundle Natural Earth MBTiles for instant display
- Cache OSM tiles along route during boarding
- Progressive enhancement when online
- Best of both worlds

---

**Implementation Recommendation:**

1. **Bundle:** Natural Earth vector tiles (z0-6, ~10MB)
   - Public domain - no licensing issues
   - Perfect for cruise altitude view
   - Instant render, zero network dependency

2. **Attribution:** Add "Map data © Natural Earth" in credits (optional but good practice)

3. **Format:** MBTiles with MVT (Mapbox Vector Tile) encoding
   - Use MapLibre GL for rendering
   - Supports custom styling

4. **Build Process:**
   - Download from naturalearthtiles GitHub releases
   - Include in app assets
   - Load as offline source in MapLibre

5. **Update Strategy:**
   - Natural Earth updates infrequently (country borders rarely change)
   - Can update with app releases
   - No real-time update needed

---

**Action Items (Complete before deprecating PLN-019.0):**
- [ ] Download Natural Earth MBTiles from GitHub releases
- [ ] Test rendering with MapLibre GL in Flutter (and React/Vue for web app)
- [ ] Measure actual bundle size impact
- [ ] Create custom style matching aerologue branding
- [ ] Integrate with CMP-008.0 (Bundled Base Map)

**Status:** INVESTIGATION COMPLETE - Hybrid Approach (Alternative C) selected.
Once action items above are completed, this plan item can be marked as **DEPRECATED** with implementation moving to CMP-008.0.

