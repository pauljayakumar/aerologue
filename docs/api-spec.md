# API Specification

This document defines the REST API and WebSocket endpoints for the Aerologue platform.

## Numbering Convention
All items in this document use the format: **API-[NUMBER].[REVISION]**

Example: `API-001.0` (API endpoint 1, initial version)

---

## Design Principles

### Data Optimization
- **Context-aware responses:** Only return data relevant to the request context
- **Pagination:** All list endpoints support pagination (limit/offset or cursor)
- **Field selection:** Support `fields` parameter to request specific fields only
- **Compression:** All responses gzip compressed
- **Caching:** ETags and Cache-Control headers for cacheable data

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123",
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "Flight with callsign ABC123 not found",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Authentication
- Bearer token in Authorization header: `Authorization: Bearer <jwt_token>`
- Tokens issued by AWS Cognito (Phase 1) or custom auth (Phase 2)
- Some endpoints allow guest access (marked as `Auth: Optional`)

---

## API-001.0 - Flight Tracking Endpoints

### GET /api/v1/flights/live
Get live flights in a geographic area (for map view).

**Auth:** Optional (guests can view)

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `bounds` | string | Yes | Bounding box: `sw_lat,sw_lon,ne_lat,ne_lon` |
| `zoom` | int | No | Map zoom level (affects detail returned) |
| `limit` | int | No | Max flights to return (default: 100, max: 500) |
| `fields` | string | No | Comma-separated fields to include |

**Response (optimized for map):**
```json
{
  "success": true,
  "data": {
    "flights": [
      {
        "id": "ABC123",
        "lat": 40.7128,
        "lon": -74.0060,
        "alt": 35000,
        "hdg": 270,
        "spd": 450,
        "type": "B738",
        "airline": "AA"
      }
    ],
    "count": 87,
    "bounds_overflow": false
  }
}
```

**Notes:**
- At low zoom levels, returns simplified data (fewer fields)
- At high zoom levels, returns full flight details
- If too many flights in bounds, returns `bounds_overflow: true` and suggests zoom in

---

### GET /api/v1/flights/{callsign}
Get detailed information for a specific flight.

**Auth:** Optional

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `callsign` | string | Flight callsign (e.g., "AA100") |

**Response:**
```json
{
  "success": true,
  "data": {
    "flight": {
      "callsign": "AA100",
      "aircraft_id": "A1B2C3",
      "aircraft_type": "B738",
      "aircraft_registration": "N12345",
      "airline": {
        "iata": "AA",
        "name": "American Airlines",
        "logo_url": "..."
      },
      "route": {
        "origin": {
          "icao": "JFK",
          "iata": "JFK",
          "name": "John F. Kennedy International",
          "city": "New York",
          "country": "US"
        },
        "destination": {
          "icao": "LAX",
          "iata": "LAX",
          "name": "Los Angeles International",
          "city": "Los Angeles",
          "country": "US"
        }
      },
      "schedule": {
        "departure_scheduled": "2024-01-15T10:00:00Z",
        "departure_actual": "2024-01-15T10:15:00Z",
        "arrival_scheduled": "2024-01-15T13:30:00Z",
        "arrival_estimated": "2024-01-15T13:45:00Z"
      },
      "position": {
        "lat": 40.7128,
        "lon": -74.0060,
        "altitude_ft": 35000,
        "ground_speed_kts": 450,
        "heading_deg": 270,
        "vertical_rate_fpm": 0,
        "on_ground": false,
        "timestamp": "2024-01-15T11:30:00Z"
      },
      "status": "IN_FLIGHT",
      "flight_phase": "cruise",
      "progress_percent": 45,
      "distance_remaining_nm": 1200,
      "time_remaining_minutes": 135
    }
  }
}
```

---

### GET /api/v1/flights/{callsign}/trail
Get historical positions for flight path visualization.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `duration` | int | No | Minutes of history (default: 60, max: 480) |
| `simplify` | bool | No | Simplify path for rendering (default: true) |

**Response:**
```json
{
  "success": true,
  "data": {
    "callsign": "AA100",
    "trail": [
      {"lat": 40.6, "lon": -73.8, "alt": 5000, "ts": 1705312200},
      {"lat": 40.7, "lon": -74.0, "alt": 15000, "ts": 1705312500},
      {"lat": 40.8, "lon": -74.3, "alt": 35000, "ts": 1705313100}
    ],
    "point_count": 120,
    "simplified": true
  }
}
```

---

### GET /api/v1/flights/search
Search for flights by various criteria.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (callsign, flight number, route) |
| `origin` | string | Origin airport ICAO/IATA |
| `destination` | string | Destination airport ICAO/IATA |
| `airline` | string | Airline IATA code |
| `aircraft_type` | string | Aircraft type code |
| `status` | string | Flight status filter |
| `limit` | int | Results limit (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "flights": [
      {
        "callsign": "AA100",
        "flight_number": "AA100",
        "origin": "JFK",
        "destination": "LAX",
        "status": "IN_FLIGHT",
        "departure_time": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "meta": {
    "pagination": { "total": 5, "limit": 20, "offset": 0 }
  }
}
```

---

## API-002.0 - Airport Endpoints

### GET /api/v1/airports/{icao}
Get airport information.

**Auth:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "airport": {
      "icao": "JFK",
      "iata": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "US",
      "timezone": "America/New_York",
      "location": {
        "lat": 40.6413,
        "lon": -73.7781
      },
      "elevation_ft": 13,
      "type": "large_airport",
      "website": "https://www.jfkairport.com",
      "terminals": ["1", "2", "4", "5", "7", "8"],
      "runways": [
        {"id": "04L/22R", "length_ft": 11351, "surface": "asphalt"}
      ]
    }
  }
}
```

---

### GET /api/v1/airports/{icao}/arrivals
Get arrival flights for an airport.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `time_range` | string | "now", "1h", "3h", "6h", "12h", "24h" (default: "3h") |
| `status` | string | Filter by status |
| `limit` | int | Results limit (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "airport_icao": "JFK",
    "arrivals": [
      {
        "flight_number": "BA178",
        "origin": "LHR",
        "origin_city": "London",
        "scheduled_arrival": "2024-01-15T14:30:00Z",
        "estimated_arrival": "2024-01-15T14:25:00Z",
        "status": "ON_TIME",
        "terminal": "7",
        "gate": "B42",
        "baggage_claim": "5"
      }
    ]
  }
}
```

---

### GET /api/v1/airports/{icao}/departures
Get departure flights for an airport. (Similar structure to arrivals)

---

### GET /api/v1/airports/nearby
Get airports near a location.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | float | Yes | Latitude |
| `lon` | float | Yes | Longitude |
| `radius_km` | int | No | Search radius (default: 100, max: 500) |
| `type` | string | No | Filter by airport type |
| `limit` | int | No | Results limit (default: 10) |

---

## API-003.0 - Crossing & Greeting Endpoints

### GET /api/v1/crossings
Get user's crossing history.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `flight_id` | string | Filter by specific flight |
| `from_date` | string | Start date (ISO 8601) |
| `to_date` | string | End date (ISO 8601) |
| `has_greeting` | bool | Filter by greeting status |
| `limit` | int | Results limit (default: 20) |
| `cursor` | string | Pagination cursor |

**Response:**
```json
{
  "success": true,
  "data": {
    "crossings": [
      {
        "crossing_id": "uuid-123",
        "detected_at": "2024-01-15T11:30:00Z",
        "user_flight": {
          "flight_number": "AA100",
          "origin": "JFK",
          "destination": "LAX"
        },
        "crossed_flight": {
          "flight_number": "UA200",
          "aircraft_type": "A320",
          "origin": "ORD",
          "destination": "SFO"
        },
        "crossing_location": {
          "lat": 39.5,
          "lon": -98.0,
          "region": "US Midwest"
        },
        "distance_miles": 12.5,
        "altitude_diff_ft": 2000,
        "points_earned": 25,
        "greeting_eligible": true,
        "greeting_sent": false,
        "greeting_received": false,
        "other_user": {
          "display_name": "TravelFan42",
          "avatar_url": "...",
          "nationality": "GB"
        }
      }
    ]
  }
}
```

---

### POST /api/v1/crossings/{crossing_id}/greetings
Send a greeting for a crossing.

**Auth:** Required

**Request Body:**
```json
{
  "message_type": "preset",
  "preset_id": "WAVE_01",
  "custom_text": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": "msg-uuid-123",
    "sent_at": "2024-01-15T11:35:00Z",
    "points_awarded": 25,
    "achievement_unlocked": null
  }
}
```

---

### GET /api/v1/greetings/inbox
Get received greetings.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | "unread", "read", "all" (default: "all") |
| `limit` | int | Results limit (default: 20) |
| `cursor` | string | Pagination cursor |

**Response:**
```json
{
  "success": true,
  "data": {
    "greetings": [
      {
        "message_id": "msg-uuid-456",
        "crossing_id": "crossing-uuid-123",
        "from_user": {
          "user_id": "user-abc",
          "display_name": "SkyWatcher",
          "avatar_url": "...",
          "nationality": "US"
        },
        "message_type": "preset",
        "message_text": "👋 Hello from New York! Safe travels!",
        "language": "en",
        "sent_at": "2024-01-15T11:35:00Z",
        "status": "unread",
        "crossing_context": {
          "your_flight": "AA100",
          "their_flight": "UA200",
          "location": "US Midwest",
          "distance_miles": 12.5
        }
      }
    ],
    "unread_count": 3
  }
}
```

---

### PUT /api/v1/greetings/{message_id}/read
Mark a greeting as read.

**Auth:** Required

---

### GET /api/v1/greetings/presets
Get available greeting presets.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `language` | string | Language code (default: user's language) |
| `category` | string | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "preset_id": "WAVE_01",
        "category": "friendly",
        "emoji": "👋",
        "text": "Hello from {origin_city}! Safe travels!",
        "text_localized": "Hello from {origin_city}! Safe travels!"
      }
    ]
  }
}
```

---

## API-004.0 - Gaming & Quiz Endpoints

### GET /api/v1/games
Get available games.

**Auth:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "game_id": "geo_quiz",
        "name": "GeoQuiz",
        "description": "Test your geography knowledge!",
        "icon_url": "...",
        "min_level": 1,
        "categories": ["geography", "aviation"],
        "available_offline": true
      },
      {
        "game_id": "spot_the_plane",
        "name": "Spot the Plane",
        "description": "Identify aircraft around you",
        "icon_url": "...",
        "min_level": 1,
        "requires_flight_context": true
      }
    ]
  }
}
```

---

### POST /api/v1/games/{game_id}/sessions
Start a new game session.

**Auth:** Required (guests can play but scores not saved)

**Request Body:**
```json
{
  "difficulty": "medium",
  "category": "geography",
  "question_count": 10,
  "flight_context": {
    "flight_id": "AA100",
    "current_position": {"lat": 40.5, "lon": -98.0}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session-uuid-123",
    "game_id": "geo_quiz",
    "questions": [
      {
        "question_id": "q1",
        "question_type": "multiple_choice",
        "question_text": "What country are you flying over?",
        "options": [
          {"id": "a", "text": "United States"},
          {"id": "b", "text": "Canada"},
          {"id": "c", "text": "Mexico"},
          {"id": "d", "text": "Cuba"}
        ],
        "time_limit_seconds": 30,
        "points": 10,
        "hint_available": true
      }
    ],
    "total_questions": 10,
    "time_limit_total_seconds": 300
  }
}
```

---

### POST /api/v1/games/sessions/{session_id}/answers
Submit an answer.

**Auth:** Required

**Request Body:**
```json
{
  "question_id": "q1",
  "answer_id": "a",
  "time_taken_ms": 5200,
  "used_hint": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "correct_answer": "a",
    "explanation": "You're currently over Kansas, United States.",
    "points_earned": 10,
    "bonus_points": 5,
    "streak": 3,
    "session_score": 45
  }
}
```

---

### POST /api/v1/games/sessions/{session_id}/complete
Complete a game session and get final results.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session-uuid-123",
    "final_score": 85,
    "correct_answers": 8,
    "total_questions": 10,
    "accuracy_percent": 80,
    "time_taken_seconds": 180,
    "points_earned": 85,
    "achievements_unlocked": [
      {
        "achievement_id": "first_quiz",
        "name": "Quiz Starter",
        "description": "Complete your first quiz",
        "points": 50
      }
    ],
    "leaderboard_rank": 156,
    "personal_best": false
  }
}
```

---

### GET /api/v1/quiz/questions
Get quiz questions (for offline caching).

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Question category |
| `difficulty` | string | "easy", "medium", "hard" |
| `count` | int | Number of questions (default: 50, max: 200) |
| `exclude_ids` | string | Comma-separated IDs to exclude (already cached) |

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question_id": "geo_q_001",
        "category": "geography",
        "difficulty": "medium",
        "question_type": "multiple_choice",
        "question_text": "What is the capital of France?",
        "options": [
          {"id": "a", "text": "London"},
          {"id": "b", "text": "Paris"},
          {"id": "c", "text": "Berlin"},
          {"id": "d", "text": "Madrid"}
        ],
        "correct_answer": "b",
        "explanation": "Paris is the capital and largest city of France.",
        "points": 10,
        "tags": ["capitals", "europe"]
      }
    ],
    "version": "2024-01-15",
    "total_available": 500
  }
}
```

**Note:** This endpoint is designed for offline caching. Client should periodically fetch new questions and cache locally.

---

## API-005.0 - Gamification Endpoints

### GET /api/v1/users/me/stats
Get current user's gamification stats.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-abc",
    "display_name": "SkyWatcher",
    "level": 12,
    "total_points": 4520,
    "points_to_next_level": 480,
    "stats": {
      "flights_tracked": 45,
      "crossings_total": 128,
      "greetings_sent": 34,
      "greetings_received": 42,
      "airports_visited": 23,
      "countries_visited": 12,
      "distance_flown_km": 125000,
      "time_in_air_hours": 156
    },
    "streak": {
      "current_days": 7,
      "longest_days": 15
    },
    "rank": {
      "global": 1256,
      "percentile": 92
    }
  }
}
```

---

### GET /api/v1/users/me/achievements
Get user's achievements.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | "earned", "in_progress", "locked", "all" |
| `category` | string | Achievement category filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "achievement_id": "globe_trotter",
        "name": "Globe Trotter",
        "description": "Visit 10 different countries",
        "icon_url": "...",
        "category": "travel",
        "points_value": 100,
        "status": "earned",
        "earned_at": "2024-01-10T15:30:00Z",
        "progress": null
      },
      {
        "achievement_id": "social_butterfly",
        "name": "Social Butterfly",
        "description": "Send 50 greetings",
        "icon_url": "...",
        "category": "social",
        "points_value": 150,
        "status": "in_progress",
        "earned_at": null,
        "progress": {
          "current": 34,
          "target": 50,
          "percent": 68
        }
      }
    ],
    "summary": {
      "total_earned": 15,
      "total_available": 50,
      "total_points_earned": 1250
    }
  }
}
```

---

### GET /api/v1/leaderboards
Get leaderboard data.

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | "global", "weekly", "friends" (default: "global") |
| `limit` | int | Results limit (default: 50, max: 100) |
| `around_me` | bool | Return ranks around current user |

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard_type": "global",
    "updated_at": "2024-01-15T12:00:00Z",
    "entries": [
      {
        "rank": 1,
        "user_id": "user-xyz",
        "display_name": "AviationKing",
        "avatar_url": "...",
        "level": 45,
        "total_points": 125000,
        "is_current_user": false
      }
    ],
    "current_user": {
      "rank": 1256,
      "total_points": 4520,
      "entries_above": [...],
      "entries_below": [...]
    }
  }
}
```

---

## API-006.0 - Vlog Endpoints

### GET /api/v1/vlogs
Get published vlogs (for map discovery).

**Auth:** Optional

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `bounds` | string | Geographic bounding box |
| `country` | string | Filter by country code |
| `creator_id` | string | Filter by creator |
| `featured` | bool | Only featured vlogs |
| `sort` | string | "recent", "popular", "nearby" |
| `limit` | int | Results limit |
| `cursor` | string | Pagination cursor |

**Response:**
```json
{
  "success": true,
  "data": {
    "vlogs": [
      {
        "journey_id": "europe-summer-2024",
        "title": "Summer in Europe 2024",
        "description": "3 weeks across 5 countries...",
        "thumbnail_url": "...",
        "creator": {
          "user_id": "user-abc",
          "display_name": "TravelBlogger",
          "avatar_url": "..."
        },
        "stats": {
          "duration_days": 21,
          "countries": 5,
          "stopovers": 8,
          "media_count": 24,
          "views": 1250,
          "likes": 89
        },
        "preview_path": [
          {"lat": 51.5, "lon": -0.1},
          {"lat": 48.8, "lon": 2.3},
          {"lat": 41.9, "lon": 12.5}
        ],
        "published_at": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

### GET /api/v1/vlogs/{journey_id}
Get full vlog details with all stopovers and media.

**Auth:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "journey": {
      "journey_id": "europe-summer-2024",
      "title": "Summer in Europe 2024",
      "description": "An amazing 3-week adventure...",
      "cover_image_url": "...",
      "creator": { ... },
      "start_date": "2024-06-15",
      "end_date": "2024-07-06",
      "duration_days": 21,
      "countries_visited": ["GB", "FR", "IT", "CH", "DE"],
      "path_coordinates": [ ... ],
      "stopovers": [
        {
          "stopover_id": "stop-1",
          "order": 1,
          "location_name": "London, UK",
          "lat": 51.5074,
          "lon": -0.1278,
          "arrival_date": "2024-06-15",
          "departure_date": "2024-06-18",
          "duration_days": 3,
          "highlight": "Explored the historic city center",
          "transport_to_next": "train",
          "media": [
            {
              "media_id": "media-1",
              "platform": "youtube",
              "embed_url": "https://youtube.com/watch?v=xyz",
              "thumbnail_url": "...",
              "title": "Day 1 in London",
              "caption": "First day exploring!",
              "pin_lat": 51.5014,
              "pin_lon": -0.1419,
              "pin_label": "Big Ben"
            }
          ]
        }
      ],
      "stats": {
        "views": 1250,
        "likes": 89,
        "shares": 12
      }
    }
  }
}
```

---

### POST /api/v1/vlogs
Create a new vlog journey.

**Auth:** Required

---

### PUT /api/v1/vlogs/{journey_id}
Update a vlog journey.

**Auth:** Required (owner only)

---

### POST /api/v1/vlogs/{journey_id}/stopovers
Add a stopover to a journey.

**Auth:** Required (owner only)

---

### POST /api/v1/vlogs/{journey_id}/stopovers/{stopover_id}/media
Add pinned media to a stopover.

**Auth:** Required (owner only)

**Request Body:**
```json
{
  "platform": "youtube",
  "embed_url": "https://youtube.com/watch?v=xyz123",
  "caption": "Amazing view from the top!",
  "pin_lat": 48.8584,
  "pin_lon": 2.2945,
  "pin_label": "Eiffel Tower"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "media_id": "media-uuid-123",
    "oembed_valid": true,
    "oembed_title": "Paris Day 3 - Eiffel Tower Visit",
    "oembed_thumbnail_url": "...",
    "status": "active"
  }
}
```

---

## API-007.0 - User Profile Endpoints

### GET /api/v1/users/me
Get current user's profile.

**Auth:** Required

---

### PUT /api/v1/users/me
Update current user's profile.

**Auth:** Required

---

### GET /api/v1/users/{user_id}
Get public profile of another user.

**Auth:** Optional

---

### DELETE /api/v1/users/me
Request account deletion (GDPR).

**Auth:** Required

---

## API-008.0 - Wallet Endpoints

### GET /api/v1/wallet
Get wallet overview.

**Auth:** Required

---

### GET /api/v1/wallet/documents
Get travel documents.

**Auth:** Required

---

### POST /api/v1/wallet/documents
Add a travel document.

**Auth:** Required

---

### GET /api/v1/wallet/transactions
Get transaction history.

**Auth:** Required

---

## API-009.0 - Comprehensive Testing Endpoints

These endpoints return larger datasets for testing and development purposes.

### GET /api/v1/test/flights/dump
Get all flights in a region (for testing).

**Auth:** Required (admin only in production, open in test mode)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `region` | string | Region code or "global" |
| `include_trail` | bool | Include position history |
| `format` | string | "json" or "csv" |

**Note:** Rate limited. Only available in test environment or for admin users.

---

### GET /api/v1/test/airports/dump
Get all airports (for testing/caching).

**Auth:** Optional

**Response:** Full airport database (~50,000 airports) in optimized format for local caching.

---

### GET /api/v1/test/simulate/crossing
Simulate a crossing event (for testing).

**Auth:** Required (test mode only)

**Request Body:**
```json
{
  "user_flight": "AA100",
  "crossed_flight": "UA200",
  "distance_miles": 10,
  "location": {"lat": 40.0, "lon": -98.0}
}
```

---

## API-010.0 - Health & Metadata Endpoints

### GET /api/v1/health
Health check endpoint.

**Auth:** None

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

### GET /api/v1/metadata/aircraft-types
Get aircraft type reference data.

**Auth:** None

---

### GET /api/v1/metadata/airlines
Get airline reference data.

**Auth:** None

---

### GET /api/v1/metadata/regions
Get geographic region definitions.

**Auth:** None

---

## Rate Limiting

| Endpoint Category | Anonymous | Authenticated | Premium |
|-------------------|-----------|---------------|---------|
| Flight tracking | 60/min | 120/min | 300/min |
| Airport data | 60/min | 120/min | 300/min |
| Game sessions | N/A | 30/min | 60/min |
| Greetings | N/A | 20/min | 50/min |
| Vlogs | 30/min | 60/min | 120/min |
| Test endpoints | N/A | 10/min | 10/min |

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## Versioning

- API version in URL path: `/api/v1/...`
- Major version changes require new path
- Minor changes backward compatible
- Deprecation notice in response headers: `X-API-Deprecation: <message>`

