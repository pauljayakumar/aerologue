# MVP Architecture Decisions

**Document ID:** MVP-ARCH-001.0
**Last Updated:** 2025-12-01
**Status:** Active

This document records the MVP architecture decisions made for cost-effectiveness and rapid development. Each decision includes the full implementation path for future reference.

---

## Overview

The MVP prioritizes:
1. **Cost efficiency** - Minimize AWS spend during development/demo phase
2. **Speed to market** - Get features working quickly for investor demos
3. **Scalability path** - Clear upgrade path when needed

---

## 1. Flight Position Updates

### MVP Decision
**Update Interval:** 30 seconds

| Aspect | Value |
|--------|-------|
| API poll frequency | Every 30 seconds |
| Storage per day | ~5.8 GB |
| Trail point spacing | ~4-7 miles at cruise |
| Monthly cost impact | ~$9/month |

### Rationale
- 6x reduction in data volume vs 5-second updates
- Acceptable trail smoothness for demo purposes
- Significant cost savings (~$9 vs ~$45/month for storage)

### Future Upgrade
When smooth real-time tracking is needed:
- Reduce to 5-second intervals
- Increase storage budget to ~$45/month
- Consider Timestream for sub-100ms queries

---

## 2. Flight Trail Storage

### MVP Decision
**Storage:** S3 + DynamoDB Hybrid

```
Architecture:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Flights    │ ──► │  Lambda     │ ──► │  S3 Bucket  │
│  Lambda     │     │  (Store)    │     │  (Trails)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  DynamoDB   │
                    │  (Index)    │
                    └─────────────┘
```

| Component | Purpose | Cost |
|-----------|---------|------|
| S3 Bucket | Store position JSON files | ~$4/month |
| DynamoDB | Index for fast lookup | ~$2/month |
| Lambda | Process and store positions | ~$2/month |
| **Total** | | **~$9/month** |

### Data Structure

**S3 Key Format:**
```
aerologue-trails/
  └── {date}/
      └── {hour}/
          └── {aircraft_id}.json
```

**Position Record:**
```json
{
  "aircraft_id": "ABC123",
  "positions": [
    {
      "ts": "2024-01-15T10:30:00Z",
      "lat": 40.7128,
      "lon": -74.0060,
      "alt": 35000,
      "hdg": 270,
      "spd": 450
    }
  ]
}
```

**DynamoDB Index:**
```
Table: aerologue-trail-index
PK: aircraft_id
SK: date#hour
Attributes:
  - s3_key: S3 object path
  - point_count: Number of positions
  - first_ts: First position timestamp
  - last_ts: Last position timestamp
```

### Trail Retrieval Flow
1. User clicks aircraft on map
2. Query DynamoDB for recent S3 keys (last 1-24 hours)
3. Fetch S3 objects in parallel
4. Merge and return trail points
5. Latency: ~200-500ms

### Future Upgrade
When real-time analytics needed:
- Migrate to Amazon Timestream (~$615/month)
- Direct time-series queries
- Sub-100ms latency

---

## 3. Airport Data

### MVP Decision
**Storage:** Static JSON file

| Aspect | Value |
|--------|-------|
| Data source | OurAirports/OpenFlights (public domain) |
| Airport count | ~500-1000 major airports |
| File size | ~200-500 KB |
| Location | Bundled in web app |

### Data Structure
```json
{
  "airports": [
    {
      "icao": "KJFK",
      "iata": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "US",
      "lat": 40.6413,
      "lon": -73.7781,
      "type": "large_airport"
    }
  ]
}
```

### Usage
- **Search:** Client-side filter on airport name/code
- **Map markers:** Show at appropriate zoom levels
- **Flight routes:** Lookup origin/destination coordinates

### Future Upgrade
When full airport database needed:
- Aurora PostgreSQL with PostGIS (~$50-100/month)
- Full 50,000 airport database
- Geospatial queries (nearby airports)
- Real-time schedule integration

---

## 4. Origin/Destination Data

### MVP Decision
**Source:** AeroDataBox API (on-demand)

| Aspect | Value |
|--------|-------|
| When called | User clicks specific aircraft |
| Data returned | Route, schedule, aircraft details |
| Cost | RapidAPI credits per call |
| Caching | Cache response for 5 minutes |

### API Call Flow
```
User clicks aircraft
       │
       ▼
┌─────────────────┐
│ Check cache     │
│ (DynamoDB/Redis)│
└────────┬────────┘
         │ Cache miss
         ▼
┌─────────────────┐
│ Call AeroDataBox│
│ /flights/{id}   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cache response  │
│ TTL: 5 minutes  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return to UI    │
└─────────────────┘
```

### Data Returned
- Origin airport (ICAO/IATA, name, city)
- Destination airport (ICAO/IATA, name, city)
- Scheduled departure/arrival times
- Aircraft registration, type details
- Airline information

### Admin Control
**CRITICAL:** AeroDataBox calls must be controllable via Admin Console:
- Global enable/disable toggle
- Per-request rate limiting
- Budget alerts when credits low

---

## 5. Admin Console API Controls

### MVP Decision
**Requirement:** Kill switches for all external APIs

| Control | Scope | Default |
|---------|-------|---------|
| Master Kill Switch | ALL external APIs | Enabled |
| ADS-B Exchange | Flight position data | Enabled |
| AeroDataBox | Route/schedule data | Enabled |
| Trail Storage | Position storage to S3 | Enabled |
| OpenSky (Fallback) | Backup flight data | Enabled |

### Implementation
**DynamoDB Table:** `aerologue-admin-config`

```
PK: CONFIG
SK: api_controls

Attributes:
  - master_enabled: boolean
  - adsb_exchange_enabled: boolean
  - aerodatabox_enabled: boolean
  - trail_storage_enabled: boolean
  - opensky_enabled: boolean
  - updated_at: timestamp
  - updated_by: admin_user_id
```

### Lambda Check Flow
```javascript
// Every Lambda checks config before external calls
const config = await getAdminConfig();

if (!config.master_enabled) {
  return { error: 'API calls disabled by admin' };
}

if (!config.aerodatabox_enabled) {
  return { error: 'AeroDataBox disabled' };
}

// Proceed with API call
```

### Admin Console UI
```
┌─────────────────────────────────────────────────┐
│  API Controls                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⚠️ MASTER KILL SWITCH     [████████] ON       │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ADS-B Exchange            [████████] ON       │
│  └─ Last call: 2 seconds ago                   │
│  └─ Calls today: 2,880                         │
│                                                 │
│  AeroDataBox               [████████] ON       │
│  └─ Last call: 5 minutes ago                   │
│  └─ Credits remaining: 450                     │
│  └─ ⚠️ Alert at: 100 credits                   │
│                                                 │
│  Trail Storage             [████████] ON       │
│  └─ Positions stored today: 5.2 GB             │
│                                                 │
│  OpenSky (Fallback)        [░░░░░░░░] OFF      │
│  └─ Only used when ADS-B fails                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 6. Search Implementation

### MVP Decision
**Approach:** Client-side search with API fallback

| Search Type | Source | Method |
|-------------|--------|--------|
| Airports | Static JSON | Client-side filter |
| Active Flights | Live API data | Client-side filter on callsign |
| Routes | Not MVP | Future: AeroDataBox search |

### Search Flow
```
User types in search bar
         │
         ▼
┌─────────────────┐
│ Debounce 300ms  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Airport│ │Flight │
│Search │ │Search │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
  Filter    Filter
  static    current
  JSON      flights
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│ Merge & Rank    │
│ Results         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display in      │
│ Dropdown        │
└─────────────────┘
```

---

## 7. Map Airport Markers

### MVP Decision
**Approach:** Major airports only, zoom-based display

| Zoom Level | Airports Shown |
|------------|----------------|
| 0-3 | None (too cluttered) |
| 4-6 | Top 50 busiest airports |
| 7-9 | Large airports (~200) |
| 10+ | All major airports (~500-1000) |

### Marker Style
- Small dot icon (not full airport diagram)
- IATA code label at higher zoom
- Click to see airport info
- Different color for origin/destination of selected flight

---

## Cost Summary

| Component | Monthly Cost |
|-----------|-------------|
| S3 (trails) | ~$4 |
| DynamoDB (index + config) | ~$5 |
| Lambda (processing) | ~$5 |
| AeroDataBox | Variable (credits) |
| **Base Infrastructure** | **~$15/month** |

*Note: This is in addition to existing costs (Cognito, API Gateway, CloudFront, etc.)*

---

## Implementation Priority

1. **Admin Console Controls** - Safety first, prevent runaway API costs
2. **Trail Storage** - S3 bucket + Lambda for storing positions
3. **Static Airport Data** - JSON file for search and markers
4. **Search Bar** - Connect to real data
5. **Flight Details** - AeroDataBox integration for route info
6. **Trail Visualization** - Show path on aircraft click
7. **Airport Markers** - Display on map

---

## References

- [AWS Setup](aws-setup.md) - Infrastructure details
- [Data Dictionary](data-dictionary.md) - Schema definitions
- [API Spec](api-spec.md) - Endpoint specifications
- [TODO](TODO.md) - Periodic review items
