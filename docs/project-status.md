# Aerologue Project Status

**Last Updated:** December 1, 2025

---

## TO BE CONTINUED - Next Session

### Immediate Priority: UI/UX Mockups
**User Decision:** Before proceeding with more software development, we need to create proper UI/UX mockups to ensure the design direction is correct. This should be done before deploying to production.

### Next Steps (In Order)

1. **UI/UX Mockups** (HIGH PRIORITY - User requested)
   - Create detailed mockups for all pages
   - Review user flows and interactions
   - Validate design before proceeding with development
   - Consider using Figma or similar tool for collaborative design
   - **Use Icons8 assets** (subscription available) - see Design Resources below

2. **Deploy to demo.aerologue.com**
   - Build Next.js app for production (`npm run build`)
   - Export static files and upload to S3 bucket `aerologue-web-app`
   - CloudFront distribution already configured
   - DNS already pointing to CloudFront (verified working)

3. **Set up Custom Domain for API**
   - Configure API Gateway custom domain for api.aerologue.com
   - Link ACM certificate (pending validation)
   - Currently accessible via: `https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod/health`

4. **Connect Real Flight Data**
   - Integrate ADS-B Exchange API (key stored in SSM)
   - Integrate AeroDataBox API (key stored in SSM)
   - Build Lambda functions for data processing

### Current DNS Status (Verified Working)
- `api.aerologue.com` → Resolving to API Gateway
- `demo.aerologue.com` → Resolving to CloudFront (returns 403 - bucket empty, needs deployment)
- Nameservers configured at registrar ✓

---

## Design Resources

### Icons8 (Subscription Available)
Platform-specific icon styles for native feel:

| Platform | Icons8 Style | Folder |
|----------|--------------|--------|
| Web (Next.js) | Fluency | `/public/icons/web/` |
| iOS (Flutter) | iOS 17 | `/public/icons/ios/` |
| Android (Flutter) | Material Rounded | `/public/icons/android/` |
| Unity Games | 3D Fluency / Lottie | `/public/icons/game/` |

**Icon component:** `src/components/ui/Icon.tsx`
**Icon checklist:** `public/icons/README.md`

### Unity (Cross-Platform Games)
Single codebase exports to:
- **WebGL** → Embed in Next.js web app
- **iOS** → Embed in Flutter or standalone
- **Android** → Embed in Flutter or standalone

Use `react-unity-webgl` package for Next.js integration.

Games planned:
- GeoQuiz - Geography trivia based on flight position
- Spot the Plane - Aircraft identification game

---

## AWS Infrastructure

### Route53 Hosted Zones
| Domain | Hosted Zone ID | Purpose |
|--------|---------------|---------|
| aerologue.com | Z08926321NCBV44AMA9KL | Corporate site, API endpoints |
| aerologue.app | Z030151534JSPWAFH5N0Q | Production web application |

### Cognito (Authentication)
| Resource | Value |
|----------|-------|
| User Pool ID | `us-east-1_Y9cTSJeIm` |
| User Pool Client ID | `4r4muf65b9298l0hn70v1082mu` |
| Region | us-east-1 |

### DynamoDB Tables
| Table Name | Partition Key | Sort Key | Purpose |
|------------|--------------|----------|---------|
| aerologue-user-profiles | user_id | - | User profile data |
| aerologue-user-sessions | user_id | session_id | Active sessions |
| aerologue-flights | flight_id | timestamp | Flight tracking data |
| aerologue-tracked-flights | user_id | flight_id | User's tracked flights |
| aerologue-crossings | crossing_id | timestamp | Flight crossing events |
| aerologue-messages | crossing_id | message_id | Crossing chat messages |
| aerologue-wallet | user_id | item_id | Digital collectibles |
| aerologue-gamification | user_id | - | Points, achievements |

### S3 Buckets
| Bucket Name | Purpose |
|-------------|---------|
| aerologue-media-prod | User uploads, media storage |
| aerologue-web-app | Static web app hosting |
| aerologue-ads-media | Advertisement assets |

### API Gateway
| Resource | Value |
|----------|-------|
| API ID | `mazzuw3qr6` |
| Stage | prod |
| Endpoint | `https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod` |
| Health Check | `/health` |

### Lambda Functions
| Function | Runtime | Purpose |
|----------|---------|---------|
| aerologue-health | nodejs18.x | Health check endpoint |
| aerologue-flights | nodejs18.x | Global flight data (ADS-B Exchange, 8 regions) |
| aerologue-user-profile | nodejs18.x | User profile CRUD + Cognito post-confirmation trigger |

### CloudFront Distributions
| Domain | Distribution ID | Origin |
|--------|----------------|--------|
| aerologue.app | E1ZYMEXAMPLE | aerologue-web-app S3 |
| demo.aerologue.com | E2ZYMEXAMPLE | aerologue-web-app S3 |

### ACM Certificates
| Domain | Region | Status |
|--------|--------|--------|
| *.aerologue.app | us-east-1 | Pending validation |
| *.aerologue.com | us-east-1 | Pending validation |

### SSM Parameter Store (API Keys)
| Parameter Name | Service | Source |
|----------------|---------|--------|
| aerologue-rapidapi-key | ADS-B Exchange | RapidAPI |
| aerologue-claude-api-key | Anthropic Claude | Anthropic Console |
| aerologue-aerodatabox-api-key | AeroDataBox | API.market |

---

## Web Application

### Tech Stack
- **Framework:** Next.js 16.0.5 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Maps:** MapLibre GL
- **Auth:** AWS Amplify (Cognito)
- **HTTP Client:** Axios

### Project Structure
```
web-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout
│   │   ├── providers.tsx       # Client providers
│   │   ├── globals.css         # Global styles
│   │   ├── map/
│   │   │   └── page.tsx        # Live flight map
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Registration page
│   │   ├── verify-email/
│   │   │   └── page.tsx        # Email verification
│   │   ├── flights/
│   │   │   └── page.tsx        # Flights list
│   │   ├── crossings/
│   │   │   └── page.tsx        # Flight crossings
│   │   └── wallet/
│   │       └── page.tsx        # Digital collectibles
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx      # Navigation header
│   │   └── map/
│   │       ├── FlightMap.tsx   # MapLibre flight map
│   │       ├── FlightPanel.tsx # Flight details panel
│   │       └── SearchBar.tsx   # Search component
│   ├── lib/
│   │   ├── aws-config.ts       # AWS configuration
│   │   ├── amplify.ts          # Amplify setup
│   │   ├── aerodatabox.ts      # AeroDataBox API client
│   │   └── aircraftIcons.ts    # Aircraft type to icon mapping
│   ├── services/
│   │   └── api.ts              # API client
│   ├── store/
│   │   ├── useAuthStore.ts     # Auth state (Zustand)
│   │   └── useFlightStore.ts   # Flight state (Zustand)
│   └── types/
│       ├── index.ts            # Type exports
│       ├── flight.ts           # Flight types
│       └── user.ts             # User types
├── public/
│   ├── aerologue.png           # App logo
│   └── aircraft/
│       └── optimized/          # Aircraft type icons (32-64px PNGs)
│           ├── 737.png, 747.png, 777.png, 787.png
│           ├── A320.png, A340.png, A350.png, A380.png
│           └── ATR72.png       # (+ sm/md/lg variants)
├── scripts/
│   └── process-aircraft-icons.mjs  # Icon optimization script
├── .env.local                  # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Pages Implemented

#### Homepage (`/`)
- Hero section with tagline
- Feature cards (Live Tracking, Crossings, Games)
- Call-to-action buttons
- Animated background decorations

#### Map (`/map`)
- Full-screen MapLibre map (dark theme)
- Aircraft-type-specific icons (9 silhouettes: 737, 747, 777, 787, A320, A340, A350, A380, ATR72)
- Icon rotation based on heading
- Hover glow effect on flight markers
- Search bar with typeahead
- Flight count stats bar
- Click-to-select flight details panel with:
  - Callsign, registration, aircraft type
  - Transponder data (ICAO24, squawk, category)
  - Flight status, altitude, speed, heading
  - Data source attribution (ADS-B Exchange / OpenSky)
- Loading overlay

#### Login (`/login`)
- Email/password form
- Password visibility toggle
- Forgot password link
- Social login buttons (Google, GitHub - UI only)
- Error handling display
- Loading state

#### Register (`/register`)
- Display name, email, password fields
- Password strength indicator (4 levels)
- Password confirmation with match validation
- Terms & conditions checkbox
- Social signup buttons

#### Verify Email (`/verify-email`)
- 6-digit code input with auto-focus
- Paste support for full code
- Resend code with 60s cooldown
- Email passed via URL parameter

#### Flights (`/flights`)
- Search by flight, airport, airline
- Status filter dropdown
- List/Grid view toggle
- Flight cards with route visualization
- Status badges (scheduled, in_air, landed, etc.)

#### Crossings (`/crossings`)
- Stats cards (total, messages, countries)
- All/Unread filter tabs
- Crossing cards with:
  - Both flight routes
  - Location and altitude
  - Message count
  - Time ago display
  - Unread indicator

#### Wallet (`/wallet`)
- Stats overview (total, badges, collectibles, achievements)
- Category filter tabs
- Item grid with rarity colors
- Detail modal with:
  - Gradient header based on rarity
  - Item metadata
  - Share button
- Rarity system: Common, Uncommon, Rare, Epic, Legendary

### Environment Variables
```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_Y9cTSJeIm
NEXT_PUBLIC_COGNITO_CLIENT_ID=4r4muf65b9298l0hn70v1082mu
NEXT_PUBLIC_API_URL=https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod
```

---

## Next Steps (Recommended)

### High Priority
1. **Implement real flight data fetching** - Connect to ADS-B Exchange API
2. **Build Lambda functions** for flight data processing
3. **Implement crossing detection algorithm**
4. **Add protected routes** for authenticated pages

### Medium Priority
5. **Build flight detail page** (`/flights/[id]`)
6. **Build crossing detail page** with chat (`/crossings/[id]`)
7. **Implement real-time updates** via WebSocket or polling
8. **Add user profile page** and settings

### Lower Priority
9. **Gamification engine** - Points, achievements, badges
10. **In-flight games** - Geography quizzes
11. **Factoid delivery system**
12. **Push notifications**

---

## API Endpoints

### Deployed (Live)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | /health | Health check | Live |
| GET | /flights | Global flight data (8 regions) | Live |
| GET | /users/{userId} | Get user profile | Live |
| PUT | /users/{userId} | Update user profile | Live |

### Planned
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /flights/:id | Flight details |
| POST | /flights/track | Track a flight |
| GET | /crossings | User's crossings |
| GET | /crossings/:id | Crossing details |
| POST | /crossings/:id/messages | Send message |
| GET | /wallet | User's collectibles |

---

## Running the Application

```bash
# Navigate to web app
cd web-app

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

---

## Domain Configuration Notes

**DNS Records Needed:**
- Update nameservers at domain registrar to point to Route53
- Add A/AAAA records for CloudFront distributions
- Validate ACM certificates via DNS

**Domains:**
- `aerologue.com` - Corporate/API
- `aerologue.app` - Production app
- `demo.aerologue.com` - MVP demo

---

## Session Log - November 28, 2025

### What Was Accomplished This Session

**AWS Infrastructure (Complete):**
- Created Route53 hosted zones for aerologue.com and aerologue.app
- Set up Cognito user pool for authentication
- Created 8 DynamoDB tables for all data storage needs
- Created 3 S3 buckets (media, web-app, ads)
- Deployed Lambda health check function
- Set up API Gateway with /health endpoint
- Configured CloudFront distributions for demo.aerologue.com
- Stored all API keys in SSM Parameter Store:
  - ADS-B Exchange (RapidAPI)
  - AeroDataBox (API.market)
  - Anthropic Claude

**Web Application (Complete - Functional Prototype):**
- Initialized Next.js 16 project with TypeScript and Tailwind
- Created all core pages with polished dark theme UI:
  - Homepage with hero and features
  - Live map with MapLibre GL
  - Login/Register with Cognito integration
  - Email verification flow
  - Flights list with search/filter
  - Crossings page with stats
  - Wallet with collectibles/badges
- Set up Zustand stores for auth and flight state
- Configured AWS Amplify for Cognito
- All pages tested and compiling successfully

**DNS Configuration:**
- User configured nameservers at registrar
- DNS propagation verified working
- demo.aerologue.com and api.aerologue.com resolving correctly

### What's Left To Do

1. **UI/UX Mockups** - User priority before more dev work
2. **Deploy web app** to S3/CloudFront
3. **API custom domain** setup
4. **Real flight data** integration
5. **Backend Lambda functions** for business logic
6. **Crossing detection** algorithm
7. **Real-time updates** implementation

### Local Development
```bash
cd web-app
npm run dev
# Access at http://localhost:3000
```

### Quick Links
- API Health: https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod/health
- Flights API: https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod/flights
- AWS Console: https://console.aws.amazon.com
- Cognito Users: https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_Y9cTSJeIm/users

---

## Session Log - December 1, 2025

### What Was Accomplished This Session

**Lambda Functions Deployed:**
1. **aerologue-flights** (`lambda/flights/index.mjs`)
   - Fetches global flight data from ADS-B Exchange API
   - Covers 8 global regions (NY, SF, Sao Paulo, London, Dubai, Tokyo, Singapore, Sydney)
   - Uses 3000nm radius per region for worldwide coverage
   - Falls back to OpenSky Network if ADS-B Exchange fails
   - Deduplicates overlapping flight data
   - API Route: `GET /flights`

2. **aerologue-user-profile** (`lambda/user-profile/index.mjs`)
   - Handles user profile CRUD operations
   - Serves as Cognito Post-Confirmation trigger
   - Automatically creates user profile in DynamoDB when email is verified
   - Stores: display_name, avatar_url, settings, stats
   - API Routes: `GET /users/{userId}`, `PUT /users/{userId}`

**Cognito Integration:**
- Configured Post-Confirmation Lambda trigger
- New users get profiles created automatically after email verification
- Profile includes default settings and initial stats (totalFlights: 0, etc.)

**Web App Updates:**
- `useAuthStore.ts` - Fetches user profile from DynamoDB on login
- Added `updateProfile()` action to persist settings changes
- `types/user.ts` - Added `UserStats` interface
- Created `/api/users/[userId]/route.ts` for development proxy

**API Gateway Routes Added:**
- `GET /flights` → aerologue-flights Lambda
- `GET /users/{userId}` → aerologue-user-profile Lambda
- `PUT /users/{userId}` → aerologue-user-profile Lambda
- `OPTIONS /users/{userId}` → CORS preflight

### Files Created/Modified

**New Lambda Functions:**
- `lambda/flights/index.mjs` - Global flight data fetcher
- `lambda/user-profile/index.mjs` - User profile management

**Web App Changes:**
- `src/store/useAuthStore.ts` - DynamoDB profile integration
- `src/store/useFlightStore.ts` - AWS API in production
- `src/types/user.ts` - Added UserStats type
- `src/app/api/users/[userId]/route.ts` - Development proxy

**Documentation:**
- `docs/project-status.md` - Updated Lambda functions, API endpoints

### Architecture Summary

```
User Registration Flow:
1. User signs up → Cognito creates account
2. User verifies email → Cognito triggers Lambda
3. Lambda creates profile in DynamoDB (aerologue-user-profiles)
4. User logs in → Web app fetches profile from DynamoDB
5. Profile updates → PUT to /users/{userId} → DynamoDB

Flight Data Flow:
1. Web app calls /flights (or /api/flights in dev)
2. Lambda fetches from 8 global ADS-B Exchange regions
3. Deduplicates overlapping flights
4. Returns unified global flight list
5. Web app stores in Zustand, renders on MapLibre
```

### What's Left To Do
1. End-to-end testing of user registration flow
2. Deploy web app to S3/CloudFront
3. Wire up remaining DynamoDB tables (crossings, sessions, etc.)
4. Implement crossing detection algorithm
5. Real-time updates via WebSocket or polling
