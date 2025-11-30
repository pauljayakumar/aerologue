# Components

This document lists reusable components that will be used across different parts of the project.

## Numbering Convention
All items in this document use the format: **CMP-[NUMBER].[REVISION]**

Example: `CMP-001.0` (Component 1, initial version)

---

## Component List

### Backend Services

#### CMP-001.0 - ADSB Data Service
Service layer for consuming ADSB data from multiple paid API providers.
- Handles provider failover and redundancy
- Normalizes data from different providers into unified format
- Used by: PLN-008.0

#### CMP-002.0 - Airport Data Service
Service layer for airport information aggregation.
- Static data: location, facilities, terminals, services
- Live data: arrivals, departures, delays, weather
- Used by: PLN-009.0

#### CMP-003.0 - Real-Time Communication Service
WebSocket and REST API gateway for client communication.
- WebSocket channels for live data streaming
- REST endpoints for on-demand queries
- Connection management and authentication
- Used by: PLN-010.0

#### CMP-004.0 - Flight Data Repository (Timestream)
Data access layer for flight position storage and historical queries.
- Database: Amazon Timestream
- Write path: high-throughput position data ingestion
- Read path: time-range queries, aircraft trail reconstruction
- Data lifecycle management (hot/warm/cold storage)
- Used by: PLN-011.0

#### CMP-017.0 - Relational Data Repository (Aurora PostgreSQL)
Data access layer for structured relational data.
- Database: Amazon Aurora PostgreSQL Serverless v2
- PostGIS extension for geospatial queries
- Data stored:
  - Static airport information
  - User accounts and settings
  - Gamification (points, achievements, leaderboards)
  - Wallet and transactions
- ACID compliance for financial data
- Used by: PLN-011.0

#### CMP-018.0 - Document Data Repository (DynamoDB)
Data access layer for flexible document/key-value data.
- Database: Amazon DynamoDB
- Data stored:
  - Planes crossing information
  - Users on plane (session data)
  - Messages exchanged
  - Vlog map content
  - Admin/system config
  - Notifications/alerts
- TTL for auto-expiration of ephemeral data
- DAX caching for hot data
- Used by: PLN-011.0

#### CMP-019.0 - Data Transformation Service
ETL service for normalizing API data before database storage.
- Provider-specific field mappings
- Unit conversions (meters→feet, km/h→knots)
- Timestamp normalization to UTC ISO 8601
- Data validation and sanitization
- Deduplication logic
- Error handling and dead-letter queue
- Reference: `data-dictionary.md` for complete mappings
- Used by: CMP-001.0, CMP-002.0, PLN-023.0

#### CMP-020.0 - Data Subscription & Filtering Service
Context-aware data filtering for WebSocket broadcast optimization.
- Manages user subscriptions per WebSocket connection
- Filters full data stream based on user context/feature
- Filter types:
  - Flight ID subscription (tracking)
  - Airport ICAO (arrivals/departures)
  - Geo-radius (nearby flights)
  - Bounding box (map viewport)
  - Proximity (crossings/greetings)
- Payload optimization (full/standard/minimal)
- Updates subscriptions when user switches features
- Reduces bandwidth from GB to MB per hour
- Used by: PLN-010.0, CMP-003.0

#### CMP-005.0 - User Context Service
Service for detecting and tracking user physical context.

**Auto-detection (Production mode):**
- Geofencing logic for airport detection
- Flight matching algorithm (user location → flight assignment)
- Flight phase determination (takeoff, cruise, landed, etc.)

**Manual check-in (Test mode):**
- User can manually select airport/flight
- Simulate any location/flight for testing
- Flag as "manual" in database for analytics
- Enables demo scenarios without physical presence

**Mode-aware behavior:**
- Checks system mode from admin console
- Test mode: Allow manual check-in
- Production mode: Auto-detection only
- Hybrid: Could allow manual as fallback when auto fails

- Used by: PLN-012.0

#### CMP-006.0 - Flight Crossing Detector
Real-time spatial analysis service for flight path intersections.
- Monitors all active flights
- Calculates proximity and crossing events
- Triggers greeting opportunities
- Used by: PLN-013.0

#### CMP-007.0 - Notification Service
Push notification and in-app messaging service.
- Flight crossing alerts
- Greeting notifications
- Gamification event triggers
- Used by: FEA-005.0, FEA-009.0

---

### Authentication Components

#### CMP-014.0 - Authentication Service (Cognito)
AWS Cognito-based authentication for Phase 1 (MVP).
- User pool management
- Social identity providers (Apple, Google)
- Email/password authentication
- Token management and refresh
- **Abstraction layer:** Design with interface to allow future migration
- Supports: FEA-016.0
- Used by: PLN-020.0

#### CMP-015.0 - Custom Authentication Service (Future)
Custom-built authentication service for Phase 2 (post-funding).
- Replace Cognito dependency
- Full control over user data and auth flows
- Custom token generation and validation
- Same interface as CMP-014.0 for seamless migration
- Used by: PLN-021.0

#### CMP-016.0 - Auth UI Components
Reusable authentication UI components for Flutter.
- Login screen with social buttons
- Apple Sign-in button (must be prominent per App Store rules)
- Google Sign-in button
- Email/password forms
- Registration flow
- Password reset flow
- Guest mode entry
- Consistent styling across platforms
- Supports: FEA-016.0

---

### Map & Visualization Components

#### CMP-008.0 - Bundled Base Map
Lightweight vector world map bundled within the application.
- Source: Natural Earth MBTiles (Public Domain - PDDL v1.0)
- Format: MBTiles with MVT encoding, zoom levels 0-6
- Size: ~10MB
- Contents: Country borders, coastlines, oceans, major cities
- Renders instantly with zero network latency
- Fallback when no connectivity available
- Download: github.com/lukasmartinelli/naturalearthtiles
- Used by: PLN-017.0

#### CMP-009.0 - Altitude-Optimized Tile Server
Custom tile server generating simplified tiles for different altitude levels.
- Processes OpenStreetMap data into altitude-specific styles
- Cruise tiles: Ultra-simplified (~80% smaller)
- Medium tiles: Simplified with major features
- Ground tiles: Standard detail
- Hosted on CloudFront CDN
- Used by: PLN-017.0, PLN-018.0

#### CMP-010.0 - Route Tile Cache Manager
Client-side component for intelligent tile caching along flight routes.
- Pre-downloads tiles when flight selected
- Calculates optimal zoom levels to cache
- Manages cache storage and expiration
- Background download during airport WiFi
- Used by: PLN-017.0

#### CMP-011.0 - Map Renderer
Client-side map rendering engine.
- Based on MapLibre GL (open-source)
- Handles layer blending (bundled → cached → live)
- Altitude detection for automatic style switching
- Flight path overlay rendering
- Smooth transitions between detail levels
- Aircraft icon markers with heading rotation (see CMP-024.0)
- Used by: FEA-001.0, PLN-017.0

#### CMP-024.0 - Aircraft Icon System
Aircraft type-specific icons for map visualization.
- **Available Icons**: 737, 747, 777, 787, A320, A340, A350, A380, ATR72
- **Sizes**: sm (32×32), md (48×48), lg (64×64) - all square for proper rotation
- **Format**: PNG with transparency, gold/amber silhouettes
- **Location**: `public/aircraft/optimized/`
- **Mapping Utility**: `src/lib/aircraftIcons.ts`
  - Maps 100+ ICAO aircraft type codes to available icons
  - Covers Boeing, Airbus, Embraer, Bombardier, ATR, regional jets
  - Smart fallback for unknown types based on manufacturer prefix
- **Integration**: FlightMap component uses icons based on `aircraftType` field
- **File sizes**: 1-4KB per icon (optimized from 5MB originals)
- Used by: CMP-011.0, FEA-001.0

---

### Game & Animation Components

#### CMP-012.0 - Game PoC (Unity Integration Test)
Minimal Unity module to validate Flutter-Unity integration approach.
- Plane takeoff animation with aerologue logo
- Proves Unity can be embedded in Flutter app
- Tests build pipeline for all platforms (Windows, Android, iOS)
- Foundation for future full game development (FEA-007.0, FEA-008.0)
- Used by: PLN-007.0, PLN-014.0

#### CMP-021.0 - Unity Globe Renderer
3D globe visualization component with hybrid rendering approach.
- **Base layer**: Textured sphere with NASA Blue Marble or Natural Earth
- **Vector overlays**: Dynamic flight paths, airport markers, country borders
- **LOD system**: 3 levels of detail based on zoom/distance
- **Optimizations**: ASTC texture compression, object pooling
- **Performance target**: 60fps on mid-range mobile devices
- **Asset size**: ~30-40MB (textures + models)
- Used by: PLN-025.0, FEA-007.0, FEA-008.0

#### CMP-022.0 - Unity Data Manager
Handles data flow between Flutter and Unity game module.
- **Flutter Bridge Interface**: Receives JSON messages from Flutter via SendMessage
- **Airport Database**: ScriptableObjects containing ~50K airports (coordinates, ICAO, names)
- **Aircraft Catalog**: ~200 aircraft types with silhouettes and metadata
- **Cache Manager**: Local caching for offline mode, historical flight data
- **Message Protocol**: Standardized JSON format for flight positions, user context, game state
- **Data size**: ~20-25MB (airport + aircraft data)
- Supports: Real-time and offline game modes
- Used by: PLN-025.0, PLN-007.0

#### CMP-023.0 - Unity Game Engine Core
Core game logic and mechanics for aviation-themed games.
- **Quiz Engine**: Multiple choice and map-tap question types
- **Timer System**: Configurable countdown timers per question/game
- **Scoring System**: Points calculation, combo multipliers, accuracy tracking
- **Hint System**: Progressive hints (region → continent → country)
- **Game State Management**: Pause/resume, progress saving
- **Offline Support**: Games function without connectivity using bundled data
- Communicates scores/achievements back to Flutter via UnityMessage
- Used by: PLN-025.0, FEA-007.0, FEA-008.0, FEA-009.0

---

### Connectivity & Status Components

#### CMP-013.0 - Connectivity Monitor
**IMPORTANT: Core component for user transparency.**

Real-time connectivity monitoring and UI status display.
- Monitors network connectivity quality (none, poor, good, excellent)
- Detects connectivity changes (WiFi, cellular, in-flight WiFi)
- Triggers map layer switching based on connectivity
- Provides UI components for status display:
  - Connectivity indicator (always visible on map views)
  - Map source indicator (Offline/Cached/Live)
  - Dynamic attribution display (updates based on source - REQUIRED for OSM)
- Supports: FEA-013.0, FEA-014.0, FEA-015.0
- Used by: PLN-017.0, CMP-010.0, CMP-011.0

---

### Web Application Components

#### CMP-024.0 - Web Application (Non-Flutter)
Standalone web application for BaaS validation and browser-based access.

**Purpose:**
- Developed first to validate BaaS before Flutter/Unity investment
- Tests all backend APIs, WebSockets, authentication, database operations
- Standalone product in addition to native Flutter apps

**Technology Stack:**
- Framework: React, Vue.js, or Next.js
- Maps: MapLibre GL JS (matches Flutter's MapLibre approach)
- State: Redux/Zustand (React) or Pinia (Vue)
- Auth: AWS Amplify JS SDK (for Cognito integration)
- WebSocket: Native WebSocket API or Socket.io client

**Features Supported:**
- FEA-001.0 - Flight Tracking ✓
- FEA-002.0 - Airport Information ✓
- FEA-003.0 - Airport Live Information ✓
- FEA-004.0 - Vlog Map ✓
- FEA-005.0 - Greetings Between Planes ✓
- FEA-006.0 - Live Geo News ✓
- FEA-007.0 - Airplane Games ✗ (Unity - Flutter only)
- FEA-008.0 - Geoquiz ✗ (Unity - Flutter only)
- FEA-009.0 - Gamification ✓
- FEA-010.0 - Wallet Features ✓
- FEA-016.0 - User Authentication ✓

**PWA Capabilities:**
- Service worker for offline support
- Installable on desktop/mobile
- Push notifications
- Local storage caching

- Supports: FEA-017.0
- Used by: PLN-001.0, PLN-026.0

