# Features

This document contains the broad features of the project.

## Numbering Convention
All items in this document use the format: **FEA-[NUMBER].[REVISION]**

Example: `FEA-001.0` (Feature 1, initial version)

---

## Target Users

- Air travelers
- Plane tracking enthusiasts
- Vlog watchers
- Friends/family tracking travelers
- Fans tracking public figures/celebrities

---

## Target Platforms

#### FEA-017.0 - Multi-Platform Support
Aerologue will be available on multiple platforms to maximize reach.

**Platforms:**
| Platform | Technology | Unity Games | Output |
|----------|------------|-------------|--------|
| Web (Browser) | React/Vue/Next.js + MapLibre GL JS | No | Web app |
| Windows | Flutter (single codebase) | Yes | DLL |
| Android | Flutter (single codebase) | Yes | APK/AAB |
| iOS | Flutter (single codebase) | Yes | IPA |

**Web Platform (Non-Flutter):**
- Developed first to validate BaaS before native investment
- Accessible via modern browsers (Chrome, Firefox, Safari, Edge)
- PWA capabilities for offline support
- All features except Unity games (FEA-007.0, FEA-008.0)
- Standalone product in addition to native apps

**Native Platforms (Flutter - Single Codebase):**
- One Flutter codebase builds all three native platforms
- Full feature set including Unity games
- Windows DLL for Microsoft Games and airplane consoles
- Android and iOS for app stores

---

## Feature List

### Authentication & Account Features

#### FEA-016.0 - User Authentication
**IMPORTANT: Apple Sign-in required for App Store compliance.**

User registration, login, and session management:
- **Sign-in methods:**
  - Email/password
  - Apple Sign-in (REQUIRED for iOS App Store if other social logins offered)
  - Google Sign-in
  - Optional: Phone/SMS
- **Account features:**
  - Registration with email verification
  - Password reset
  - Session persistence across app restarts
  - Multi-device support
- **Guest mode:** Allow limited app usage without login
- **Profile:** Basic user profile for social features (greetings, gamification)

**Guest Mode Capability Matrix:**

| Feature | Guest Access | Notes |
|---------|--------------|-------|
| FEA-001.0 - Flight Tracking | ✓ Yes | Can track any flight |
| FEA-002.0 - Airport Information | ✓ Yes | View-only |
| FEA-003.0 - Airport Live Info | ✓ Yes | View-only |
| FEA-004.0 - Vlog Map | ✓ Yes | Can view, cannot create |
| FEA-005.0 - Greetings | ✗ No | Requires account for messaging |
| FEA-006.0 - Live Geo News | ✓ Yes | View-only |
| FEA-007.0 - Airplane Games | ✓ Yes | Can play, scores not saved to cloud |
| FEA-008.0 - Geoquiz | ✓ Yes | Can play, scores not saved to cloud |
| FEA-009.0 - Gamification | ✗ No | Points/achievements require account |
| FEA-010.0 - Wallet | ✗ No | Requires account |

**Guest Limitations:**
- No cloud save for game progress or scores
- No participation in leaderboards
- No social features (greetings, profile)
- No wallet or document storage
- Prompted to create account after engaging with features (soft conversion)

**Conversion Strategy:**
- After playing 3 games, prompt: "Create account to save your scores!"
- After tracking 5 flights, prompt: "Create account to save your favorites!"
- Non-intrusive, dismissible prompts

**App Store Requirements:**
- Apple requires Apple Sign-in if app offers any third-party social login
- Must be presented as equal or more prominent option than other methods

---

### Core Tracking Features

#### FEA-001.0 - Flight Tracking
Track flights in real-time, view flight paths, status, and details.

#### FEA-002.0 - Airport Information
View static airport information (facilities, terminals, services, etc.).

#### FEA-003.0 - Airport Live Information
View real-time airport data (arrivals, departures, delays, weather, etc.).

---

### Social & Content Features

#### FEA-004.0 - Vlog Map
Interactive map displaying travel vlogs and content tied to geographic locations.

**Content Sources (Phased Approach):**

*Phase 1 (MVP) - Embedded External Content:*
- YouTube video embeds
- Instagram post embeds
- TikTok video embeds
- Users submit URLs, system validates and embeds

*Phase 2 (Post-Funding) - Native Content Creation:*
- In-app video recording
- Photo uploads with captions
- Native media storage (S3)
- Full content ownership

**Content Validation Strategy:**

*For Embedded Content (Phase 1):*

| Platform | Validation Method | How It Works |
|----------|------------------|--------------|
| YouTube | oEmbed API | Validate URL via `youtube.com/oembed?url=...` returns metadata if valid |
| Instagram | oEmbed API | Validate via `graph.facebook.com/instagram_oembed?url=...` (requires app token) |
| TikTok | oEmbed API | Validate via `tiktok.com/oembed?url=...` returns metadata if valid |

**Validation Flow:**
1. User submits URL + location + title
2. Backend calls platform's oEmbed API
3. If valid: Extract thumbnail, title, duration → store metadata
4. If invalid: Reject with error message
5. Content displayed via official embed (iframe) - platform handles their own moderation

**Benefits of Embed-First Approach:**
- Platforms handle their own content moderation (NSFW, copyright, etc.)
- No storage costs for video files
- Content stays on original platform (creator benefits)
- If platform removes content, our embed fails gracefully
- Lower liability for Aerologue

**Content Moderation (Our Layer):**

Even with embeds, we need moderation for:
- Spam submissions (same user posting repeatedly)
- Irrelevant content (not travel/aviation related)
- Misleading locations (content placed at wrong coordinates)
- Abusive titles/descriptions (user-provided text)

**Moderation Approach:**
1. **Automated:**
   - Rate limiting (max 5 submissions per day per user)
   - Text filtering for profanity/spam in titles/descriptions
   - Duplicate URL detection
   - Location plausibility check (is this location accessible?)

2. **Community:**
   - Report button on each vlog
   - After X reports, auto-hide pending review

3. **Manual (Admin Console):**
   - Review queue for reported content
   - Approve/reject/remove actions
   - User warning/suspension for violations

*For Native Content (Phase 2):*

| Check | Method | When |
|-------|--------|------|
| NSFW Detection | AWS Rekognition Content Moderation | On upload |
| Violence Detection | AWS Rekognition Content Moderation | On upload |
| Text in Images | AWS Rekognition + text filter | On upload |
| Audio Analysis | AWS Transcribe + text filter | On upload (for video) |
| Virus/Malware | AWS S3 virus scanning | On upload |

**Native Content Flow:**
1. User uploads video/image
2. Stored in S3 with "pending" status
3. Automated moderation runs (Rekognition)
4. If passes: Status → "approved", visible on map
5. If flagged: Status → "review", queued for manual check
6. Admin approves/rejects in Admin Console

**Content Removal:**
- Users can delete their own content anytime
- Admins can remove any content
- DMCA takedown process for copyright claims
- Removed content is soft-deleted (recoverable for appeals)

**App Store Compliance:**
- Must have clear content policy (Terms of Service)
- Must have reporting mechanism
- Must respond to reports within reasonable time
- Age-appropriate content only (13+ rating target)

#### FEA-005.0 - Greetings Between Planes
Allow users to send greetings/messages between planes in proximity or on similar routes.

#### FEA-006.0 - Live Geo Factoids (News Phase 2)
Gamified location-based information system that displays interesting factoids as the plane flies over notable locations.

**Strategy:**
- **Phase 1 (MVP):** Geo Factoids - AI-generated interesting facts about locations
- **Phase 2 (Post-Authority):** Live Geo News - real-time news integration (requires app store authority)

**Rationale:** Google Play and Apple App Store have strict requirements for news aggregation apps. Building with factoids first establishes the app, then news can be added once authority is established.

---

**Core Experience:**

```
┌─────────────────────────────────────────┐
│  ✈️ Flying over: Lake Tahoe, CA         │
│  ─────────────────────────────────────  │
│                                         │
│  🏔️ Did you know?                       │
│                                         │
│  Lake Tahoe is so clear you can see     │
│  objects 70 feet below the surface.     │
│  It contains enough water to cover      │
│  California in 14 inches of water!      │
│                                         │
│  [More Facts]  [Add to Collection] [✕]  │
│                                         │
│  🎯 +10 pts  📍 12/50 places discovered │
└─────────────────────────────────────────┘
```

**Info Spot Trigger:**
- Proximity: ~20 miles from notable location
- Auto-popup when plane enters trigger zone
- Next factoid only appears after current one is closed
- Queue system for multiple nearby locations

---

**Location Types:**

| Category | Examples | Icon |
|----------|----------|------|
| Cities | Major cities, capitals, notable towns | 🏙️ |
| Countries/Borders | Border crossings, country facts | 🌍 |
| Natural Landmarks | Mountains, volcanoes, canyons | 🏔️ |
| Water Features | Lakes, rivers, waterfalls | 💧 |
| Ocean Features | Currents, trenches, ridges, reefs | 🌊 |
| Islands | Notable islands, archipelagos | 🏝️ |
| Historical Sites | Battlefields, ancient ruins, monuments | 🏛️ |
| Aviation Points | Famous airports, airspace boundaries | ✈️ |
| Unique Places | World records, unusual geography | ⭐ |

---

**Gamification:**

| Element | Description |
|---------|-------------|
| **Discovery Points** | Earn points for each new location discovered |
| **Collection** | Build a collection of places spotted |
| **Achievements** | "Crossed the Atlantic", "50 Countries", "Ocean Explorer" |
| **Quiz Tie-in** | "You're flying over X... [Quiz Question]" |
| **Streaks** | Consecutive flights with discoveries |
| **Leaderboards** | Most places discovered (weekly/all-time) |

**Point Values:**
- Common city: 5 pts
- Notable landmark: 10 pts
- Country border crossing: 15 pts
- Ocean feature: 20 pts
- Rare/remote location: 25 pts
- First discovery (no one else found it): 50 pts bonus

---

**User Controls:**

**Delivery Level (user-configurable):**

| Level | Description | Approx Frequency |
|-------|-------------|------------------|
| **Minimal** | Major landmarks only | 2-5 per flight |
| **Normal** | Notable places | 5-15 per flight |
| **Detailed** | Everything interesting | 15-30 per flight |
| **Off** | Disabled | None |

**Topic Filters (user-selectable, default all):**
- [ ] Cities & Towns
- [ ] Natural Landmarks
- [ ] Water Features
- [ ] Ocean Features
- [ ] Historical Sites
- [ ] Aviation Points
- [ ] Country Facts

**Notification Style:**
- Auto-popup (default)
- Badge only (tap to reveal)
- Silent collection (auto-collect, review later)

---

**Content Generation (AI-Powered):**

**Claude API Integration:**
- Generate factoids for geographic regions worldwide
- Multiple facts per location (variety on repeat visits)
- Categorized by topic for filtering
- Quality scoring for relevance and interest

**Factoid Structure:**
```json
{
  "location_id": "lake_tahoe_ca",
  "location_name": "Lake Tahoe",
  "location_type": "water_feature",
  "coordinates": {"lat": 39.0968, "lon": -120.0324},
  "trigger_radius_miles": 20,
  "factoids": [
    {
      "factoid_id": "lt_001",
      "category": "geography",
      "headline": "Crystal Clear Waters",
      "short_text": "Lake Tahoe is so clear you can see 70 feet down.",
      "expanded_text": "Lake Tahoe's exceptional clarity is due to...",
      "source": "ai_generated",
      "quality_score": 0.92
    }
  ],
  "points_value": 10,
  "rarity": "common"
}
```

**Content Tiers:**
1. **Pre-generated bank** - Major locations worldwide (AI batch generation)
2. **Corridor cache** - Pre-download for booked flight path
3. **Live generation** - Real-time for unexpected locations (when online)

---

**Offline-First Architecture:**

```
PRE-FLIGHT (connectivity available):
├── User checks in flight (e.g., AA123 JFK→LAX)
├── App fetches flight path/corridor
├── Pre-downloads factoid bank for route
│   ├── All notable locations along corridor
│   ├── Multiple factoids per location (for variety)
│   └── Stored locally (SQLite/Hive)
└── Syncs user's "discovered locations" list

IN-FLIGHT (offline or patchy):
├── GPS provides real-time position (works offline)
├── App monitors proximity to cached locations
├── Triggers info spots from local cache
├── Tracks discoveries locally
└── Never repeats same factoid (variety on returns)

POST-FLIGHT (connectivity available):
├── Sync discoveries to cloud
├── Update collection and points
├── Unlock achievements
└── Contribute to leaderboards
```

---

**Non-Repetition Logic:**

| Scenario | Behavior |
|----------|----------|
| Same location, same flight | Show different factoid from bank |
| Same location, return flight | Show different factoid, acknowledge return |
| Same location, different trip | Can repeat after 30 days, or show new factoids |
| All factoids exhausted | Generate new ones via AI, or skip silently |

**Return Flight Special:**
```
┌─────────────────────────────────────────┐
│  ✈️ Welcome back to: Lake Tahoe         │
│  ─────────────────────────────────────  │
│                                         │
│  🔄 On your way out, you learned about  │
│  the lake's clarity. Here's more:       │
│                                         │
│  Lake Tahoe never freezes! Despite      │
│  harsh winters, its depth keeps the     │
│  water temperature above freezing.      │
│                                         │
└─────────────────────────────────────────┘
```

---

**Expandable Detail:**

**Collapsed View (auto-popup):**
- Location name + icon
- One-liner factoid
- Quick actions: [More] [Collect] [Dismiss]

**Expanded View (tap "More Facts"):**
- Full factoid with context
- Additional related facts
- Map snippet showing location relative to flight
- Wikipedia/source link (when online)
- Share button
- Related quiz question (optional)

---

**Queue System:**

When flying over multiple notable locations in quick succession:
1. Show first factoid immediately
2. Queue subsequent factoids
3. Show next only after user dismisses current
4. Badge shows queue count: "3 more nearby"
5. User can skip queue or view all

**Priority Order:**
1. Rarer locations (higher points)
2. User's preferred categories
3. Locations not yet discovered
4. Chronological (first triggered)

---

**Phase 2: News Integration (Future)**

Once app has store authority:
- Add "News" tab alongside "Factoids"
- Location-relevant news stories
- Curated, family-friendly content
- Partner with news aggregators
- Clear editorial policy for compliance

**Store Requirements to Address:**
- Editorial content policy
- News source attribution
- Content moderation
- Fact-checking standards
- Age-appropriate filtering

---

**References:**
- Data schema: DAT-017.0 (data-dictionary.md)
- Gamification integration: FEA-009.0
- Quiz tie-in: FEA-008.0
- Offline architecture: Similar to FEA-008.0

---

### Gaming & Entertainment Features

#### FEA-007.0 - Airplane Games
Guessing games and other airplane-themed entertainment (e.g., guess the destination, identify aircraft).

**Target Age Rating:** 13+ (Teen)
- Content appropriate for all ages
- Difficulty calibrated for teen+ audience
- Educational focus (geography, aviation)

**Implementation:** Unity-based 3D globe with real-time flight data integration (see PLN-025.0)

#### FEA-008.0 - Geoquiz
Geography-based quiz games dynamically generated based on aircraft location.

**Target Age Rating:** 13+ (Teen)

**Core Features:**
- AI-generated questions (Claude API) based on current flight position
- Location-aware content: geography, landmarks, cities, history, aviation facts
- User-selectable categories (default: all)
- Multiple difficulty levels
- Question non-repetition (especially important for return journeys)

**Question Categories:**
- Geography (mountains, rivers, countries, borders)
- Cities & Landmarks (famous structures, monuments)
- Aviation (nearby airports, airspace facts, airline trivia)
- History & Culture (historical events, cultural facts about regions)

**Offline-First Architecture:**
```
PRE-FLIGHT (connectivity available):
├── User checks in flight (e.g., AA123 JFK→LAX)
├── App fetches flight path/corridor
├── Pre-downloads region-based quiz bank
│   ├── Questions for all regions along route
│   └── Stored locally (SQLite/Hive)
└── Syncs user's "answered questions" list

IN-FLIGHT (offline or patchy):
├── GPS provides real-time position (works offline)
├── App matches position → serves local cached questions
├── Tracks answers locally
└── Never repeats previously answered questions

CONNECTIVITY AVAILABLE (in-flight WiFi):
├── Sync answered questions to cloud
├── Fetch fresh AI-generated "live" questions
├── Enable real-time contextual questions
└── Update question bank for remaining route
```

**AI Content Generation (Phase 1):**
- Claude API generates questions based on geographic regions
- Pre-generation for major flight corridors worldwide
- Batch generation for question bank population
- Real-time generation when connectivity allows

**User-Generated Content (Phase 2 - Future):**
- Community quiz creation tools
- Moderation/approval workflow
- Creator recognition and rewards
- Quality scoring system

**Implementation:** Unity-based with hybrid globe rendering (see PLN-025.0)

#### FEA-009.0 - Gamification Features
Points, achievements, leaderboards, challenges, and rewards system.

**Target Age Rating:** 13+ (Teen)
- Progression system with levels and achievements
- Social leaderboards
- Daily/weekly challenges
- Reward integration with wallet (FEA-010.0)

---

### Monetization & Utility Features

#### FEA-010.0 - Wallet Features
Comprehensive digital wallet for travel management and in-app transactions.

**In-App Currency:**
- Wallet balance (coins earned, purchased, received)
- Premium currency for special features
- Transaction history
- Rewards redemption

**Travel Documents Storage:**
- **Tickets:** Flight tickets with PNR, booking details
- **Boarding Passes:** Gate info, seat assignment, barcode/QR for scanning
- **E-Visas:** Visa documents with validity dates, country info
- Support for PDF/image uploads and structured data entry
- Document status tracking (active, used, expired)

**Bookings Management:**
- **Hotel Bookings:** Check-in/out dates, room details, confirmation numbers
- **Taxi/Transport Bookings:** Pickup/dropoff locations, provider info, fare details
- Integration with booking confirmations (manual entry or email parsing future)

**Saved Offers & Ads:**
- Save interesting ads and promotional offers
- Promo codes with validity tracking
- Quick access to saved deals
- Notification when offers expire soon

**References:**
- Data schema: DAT-011.0 (data-dictionary.md)

---

### Administration Features

#### FEA-011.0 - Admin Monitoring Module
Backend tools for system monitoring, user management, and analytics.

**Environment Mode Control:**
- **Test/Production mode toggle** - Switch entire system behavior
- **Test mode enables:**
  - Manual user check-in (simulate being at airport/on flight)
  - Test flight generator for demo scenarios
  - Relaxed validation rules
  - Free API tier usage where available
  - Demo data seeding
- **Production mode enforces:**
  - Auto-detection only (GPS + flight matching)
  - Strict validation
  - Full API access
  - Real data only

**API Provider Management:**
- **On/off toggles for each provider** - Enable/disable without code deployment
- **AeroDataBox quick toggle** - Critical for cost control (uses credits quickly during testing)
- Provider status dashboard (active, quota remaining, errors)
- Usage tracking and cost monitoring per provider
- Set usage alerts and limits
- Configure routing rules (primary, fallback, regional)

**System Monitoring:**
- Real-time system health
- Error rates and latency
- User activity analytics

**User Management:**
- User accounts and roles
- Subscription management
- Support tools

---

**Admin Console UI Requirements (High-Level):**

The Admin Console is a separate web application (not part of the main app) for administrators only.

**Screen 1: Dashboard**
- System health overview (green/yellow/red status)
- Active users count (real-time)
- API provider status summary (all providers at a glance)
- Current environment mode indicator (TEST/PRODUCTION - prominent)
- Recent alerts/errors list
- Quick action buttons (emergency provider disable, mode switch)

**Screen 2: Environment Mode**
- Large toggle: TEST ↔ PRODUCTION with confirmation dialog
- Current mode status and timestamp of last change
- Test mode settings:
  - Manual check-in enable/disable
  - Test flight generator controls
  - Demo data seeding trigger
- Mode change audit log

**Screen 3: API Providers**
- Provider cards (one per provider: ADS-B Exchange, AeroDataBox, etc.)
- Each card shows:
  - Enable/Disable toggle (with confirmation for disable)
  - Status: active/inactive/error
  - Quota/credits remaining (with visual bar)
  - Usage this period (calls, cost estimate)
  - Last successful call timestamp
  - Error count and last error
- Alert configuration per provider (threshold settings)
- Provider priority/routing configuration
- **AeroDataBox prominent quick-disable button** (cost protection)

**Screen 4: User Management**
- User search (by email, ID, username)
- User details view:
  - Profile information
  - Account status (active, suspended, deleted)
  - Subscription tier
  - Gamification stats
  - Session history
- Actions: Suspend, unsuspend, delete, reset password
- Role management (admin, support, user)

**Screen 5: Analytics**
- User activity graphs (DAU, MAU, retention)
- Feature usage breakdown
- API call volumes over time
- Cost tracking graphs
- Export functionality

**Screen 6: Audit Log**
- All admin actions logged
- Filterable by admin user, action type, date range
- Compliance and security review

**Technology:** Web-based (React/Vue), accessible via authenticated URL, separate from main app deployment.

#### FEA-012.0 - Ad Serving Module
Full-screen visual advertisement system with destination-aware targeting, wallet integration, and fair billing model.

**Core Philosophy:**
- Visual ads only (full-screen image or video - no text ads)
- Contextually targeted (user profile, travel purpose, destination)
- Locally managed (country heads sell/manage ads for their regions)
- Unified ad card format across all placements
- Fair billing: active ads bill on serve, passive wallet ads bill on engagement

---

**Unified Ad Card Format:**

All ads use a single-card format with consistent actions:

```
┌─────────────────────────────────────────┐
│                                         │
│         [FULL SCREEN IMAGE]             │
│                                         │
│         Hotel Marvelous Tokyo           │
│         20% off your first night        │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │Know More │ │  Save    │ │Continue │  │
│  │  (▶️)     │ │ (💾)     │ │  (→)    │  │
│  └──────────┘ └──────────┘ └─────────┘  │
│                                         │
│           [ ✕ Reject ]                  │
└─────────────────────────────────────────┘
```

**Ad Card Actions:**

| Action | Icon | Behavior | Billing Impact |
|--------|------|----------|----------------|
| **Know More** | ▶️ | Opens video/detailed view | Billable engagement |
| **Save to Wallet** | 💾 | Saves offer to wallet stack | Billable engagement |
| **Continue** | → | Dismiss, proceed to next screen | No additional charge |
| **Reject** | ✕ | Remove, never show this ad again | No charge, improves targeting |

---

**Dual Billing Model:**

| Placement Context | When Billed | Rationale |
|-------------------|-------------|-----------|
| **Active Serving** | On serve | User must see it - fair to bill |
| **Wallet Stack** | On engagement | User chooses to view - only bill for real engagement |

**Active Serving Placements (Bill on Serve):**
- Post-crossing mini presentation
- Between games ("Brought to you by...")
- Post-landing consolidated view
- Interstitial screens

**Wallet Stack (Bill on Engagement):**
Engagement = any of:
- Open ad + 3 second view
- Tap "Know More" (video/details)
- Tap "Save to Wallet" (explicit save)

---

**Wallet Ad Stack:**

Ads are automatically placed into a dedicated wallet stack section.

**Stack Structure:**
```
WALLET
├── 📄 Documents (tickets, boarding passes, visas)
├── 🏨 Bookings (hotels, transport)
├── 💰 Balance & Transactions
├── 📦 AD STACK (system-placed, destination-relevant)
│   ├── Max 15 ads total
│   ├── Max 3 per category
│   └── Organized by: Hotels, Restaurants, Attractions, Transport, Events
└── ⭐ SAVED OFFERS (user-saved from ads)
    └── Explicitly saved offers for later
```

**Stack Rules:**

| Rule | Value | Rationale |
|------|-------|-----------|
| Maximum ads in stack | 15 | Prevent clutter, maintain quality |
| Max per category | 3 | Diversity (taxi, hotel, restaurant, etc.) |
| Lifetime | Destination-based | City → Country → Trip duration |
| Unopened expiry | When trip context changes | Keep relevant to current journey |

**Categories:**
- Hotels & Accommodation
- Restaurants & Dining
- Attractions & Tours
- Transport (taxi, car rental)
- Events & Entertainment

**Lifecycle:**
```
AD ENTERS STACK:
├── System places ad based on destination targeting
├── Ad marked as "unopened" in stack
└── Visible in Wallet > Ad Stack

USER OPENS AD:
├── Full ad card displayed
├── 3-second timer starts
├── If 3s elapsed OR user taps action → billable engagement
└── User chooses: Know More | Save | Continue | Reject

ACTIONS:
├── Know More → Opens video, ad stays in stack
├── Save → Moves to "Saved Offers" section (permanent)
├── Continue → Ad marked as "viewed", stays in stack
└── Reject → Ad removed, never shown again

EXPIRY:
├── Destination changes (new city) → city-specific ads expire
├── Trip ends → trip-specific ads expire
└── Expired ads removed from stack
```

---

**Ad Placement Slots:**

| Slot | Trigger | Context | Billing |
|------|---------|---------|---------|
| Post-Crossing Mini | After each flight crossing | Mini stats presentation | On serve |
| Before Game | Game start | "Brought to you by..." | On serve |
| After Game | Game end | Post-game ad | On serve |
| Post-Landing | After landing stats view | Journey summary | On serve |
| Wallet Stack | System-placed | Passive browsing | On engagement |

**Placement Flow:**
```
FLIGHT CROSSING MOMENT:
├── Crossing detected notification
├── Mini presentation: "Crossed with flight from Paris!"
│   ├── Quick stats (nationality, language)
│   └── [AD CARD] - Full card with all actions (billed on serve)
│
GAMING:
├── [AD CARD] - "This game brought to you by..." (billed on serve)
├── Game plays
└── [AD CARD] - Post-game ad (billed on serve)

POST-LANDING CONSOLIDATED VIEW:
├── "Your Journey Summary" screen
│   ├── Total crossings: 12 flights
│   ├── Countries represented: 8
│   ├── Languages: 5
│   └── [AD CARDS] - 3-5 destination ads (billed on serve)

WALLET STACK (passive):
├── User opens wallet at their convenience
├── Browses Ad Stack section
├── Opens ad → 3s view → billed
└── Takes action (Know More/Save) → billed
```

---

**Targeting Dimensions:**
- **User Profile:** Traveler type, age group, preferences
- **Travel Purpose:** Business, leisure, family, honeymoon
- **Destination:** City, country, region
- **Origin:** Where they're coming from
- **Flight Context:** Airline, class, duration
- **Time:** Season, day of week, local events

**Ad Frequency (Configurable):**
- Max ads per crossing presentation: 1
- Max ads per game session: 2 (before + after)
- Max ads in post-landing summary: 3-5
- Wallet stack: 15 max (3 per category)
- Minimum time between active ads: configurable
- Premium users: reduced/no active ads (future)

**Offline Delivery:**
- Pre-download destination ads before flight
- Cache ads based on flight destination + wallet stack
- Serve cached ads during flight
- Refresh when connectivity available
- Track impressions/engagements for sync when online

---

**Country Head Management Portal:**

| Feature | Description |
|---------|-------------|
| Ad Upload | Upload image/video ads with metadata |
| Targeting Setup | Define target audience, destinations |
| Scheduling | Set start/end dates, time windows |
| Inventory Management | Set impression limits, budget caps |
| Approval Workflow | Submit → Review → Approve → Live |
| Analytics Dashboard | Serves, engagements, saves, conversions |
| Revenue Reports | Earnings by billing type, payouts |

**Ad Scheduling:**
- Time-based campaigns (seasonal, event-driven)
- Inventory management (daily/total impression caps)
- Budget management (spend limits by billing type)
- Priority levels (premium placement)
- Geo-fencing (show only in certain regions)

**Ad Content Requirements:**
- Image: 1080x1920 (9:16) or 1920x1080 (16:9)
- Video: MP4, max 30 seconds, max 10MB
- Must include: headline, CTA, offer details
- Offer type: coupon, booking link, event ticket, etc.
- Moderation: No prohibited content, brand-safe

---

**Analytics Tracked:**

| Metric | Active Ads | Wallet Stack |
|--------|------------|--------------|
| Serves | ✓ (billable) | ✓ (not billable) |
| 3s Views | ✓ | ✓ (billable) |
| Know More taps | ✓ | ✓ (billable) |
| Save taps | ✓ | ✓ (billable) |
| Continue taps | ✓ | ✓ |
| Reject taps | ✓ | ✓ |
| Redemption rate | ✓ | ✓ |

**References:**
- Wallet integration: FEA-010.0
- Data schema: DAT-016.0 (data-dictionary.md)
- Country head portal: Part of FEA-011.0 Admin Module

---

### Cross-Cutting UI Requirements

#### FEA-013.0 - Connectivity Status Indicator
**IMPORTANT: Do not forget this requirement.**

Always display current connectivity status to the user:
- Connection quality (none, poor, good, excellent)
- Visual indicator always visible on map views
- Helps user understand data freshness and availability

#### FEA-014.0 - Map Data Source Indicator
**IMPORTANT: Do not forget this requirement.**

Always display the current map data source being used:
- "Offline Map" - Using bundled Natural Earth tiles
- "Cached Route" - Using pre-cached OSM tiles
- "Live Map" - Streaming live OSM tiles
- Visual indicator on map views showing which layer is active
- Helps user understand map detail level and data currency

**Rationale:** Users need transparency about what they're seeing, especially in variable connectivity environments like aircraft. This builds trust and sets appropriate expectations.

#### FEA-015.0 - Dynamic Map Attribution
**IMPORTANT: Do not forget this requirement - legal compliance.**

Display appropriate attribution based on current map data source:
- **Natural Earth tiles:** "Map data © Natural Earth" (optional but good practice)
- **OpenStreetMap tiles:** "© OpenStreetMap contributors" (REQUIRED by ODbL license)
- Attribution must be visible on map views
- Must link to appropriate license/copyright pages
- Attribution should update dynamically as map source changes

**Legal Note:** OSM attribution is legally required when using OSM data. Failure to comply violates the Open Database License.

