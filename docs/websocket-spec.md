# WebSocket Specification

This document defines the WebSocket protocol for real-time communication in Aerologue.

## Numbering Convention
All items in this document use the format: **WS-[NUMBER].[REVISION]**

Example: `WS-001.0` (WebSocket message type 1, initial version)

---

## Connection

### Endpoint
```
wss://api.aerologue.app/ws/v1/live
```

### Authentication
Connect with JWT token as query parameter:
```
wss://api.aerologue.app/ws/v1/live?token=<jwt_token>
```

Or send authentication message immediately after connection:
```json
{
  "type": "auth",
  "token": "<jwt_token>"
}
```

### Guest Connection
Guests can connect without token but have limited subscriptions:
- Can subscribe to flight positions
- Cannot receive crossing notifications
- Cannot send/receive greetings

---

## Message Format

All messages are JSON with this base structure:

### Client → Server
```json
{
  "type": "<message_type>",
  "id": "<optional_request_id>",
  "payload": { ... }
}
```

### Server → Client
```json
{
  "type": "<message_type>",
  "id": "<request_id_if_applicable>",
  "payload": { ... },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## WS-001.0 - Connection Lifecycle Messages

### Client: ping
Keep-alive ping (send every 30 seconds).

```json
{
  "type": "ping",
  "id": "ping-001"
}
```

### Server: pong
Response to ping.

```json
{
  "type": "pong",
  "id": "ping-001",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: welcome
Sent immediately after successful connection.

```json
{
  "type": "welcome",
  "payload": {
    "connection_id": "conn-uuid-123",
    "user_id": "user-abc",
    "is_guest": false,
    "server_time": "2024-01-15T12:00:00.000Z",
    "features": ["flights", "crossings", "greetings", "notifications"]
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: error
Error message.

```json
{
  "type": "error",
  "id": "req-123",
  "payload": {
    "code": "INVALID_SUBSCRIPTION",
    "message": "Cannot subscribe to crossings without authentication",
    "details": {}
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: reconnect
Server requests client to reconnect (e.g., for maintenance).

```json
{
  "type": "reconnect",
  "payload": {
    "reason": "server_maintenance",
    "delay_seconds": 5,
    "message": "Server will restart for maintenance"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## WS-002.0 - Subscription Management

### Client: subscribe
Subscribe to a data channel.

```json
{
  "type": "subscribe",
  "id": "sub-001",
  "payload": {
    "channel": "flights",
    "params": {
      "bounds": "39.0,-100.0,42.0,-95.0",
      "zoom": 8
    }
  }
}
```

**Available Channels:**

| Channel | Params | Auth Required | Description |
|---------|--------|---------------|-------------|
| `flights` | bounds, zoom | No | Flights in geographic area |
| `flight` | callsign | No | Single flight tracking |
| `crossings` | - | Yes | User's crossing events |
| `greetings` | - | Yes | Greeting messages |
| `notifications` | - | Yes | System notifications |
| `user_context` | - | Yes | User's flight context updates |

### Server: subscribed
Confirmation of subscription.

```json
{
  "type": "subscribed",
  "id": "sub-001",
  "payload": {
    "channel": "flights",
    "subscription_id": "sub-uuid-123",
    "params": {
      "bounds": "39.0,-100.0,42.0,-95.0",
      "zoom": 8
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Client: unsubscribe
Unsubscribe from a channel.

```json
{
  "type": "unsubscribe",
  "id": "unsub-001",
  "payload": {
    "subscription_id": "sub-uuid-123"
  }
}
```

### Server: unsubscribed
Confirmation of unsubscription.

```json
{
  "type": "unsubscribed",
  "id": "unsub-001",
  "payload": {
    "subscription_id": "sub-uuid-123"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Client: update_subscription
Update subscription parameters (e.g., when map pans).

```json
{
  "type": "update_subscription",
  "id": "update-001",
  "payload": {
    "subscription_id": "sub-uuid-123",
    "params": {
      "bounds": "40.0,-99.0,43.0,-94.0",
      "zoom": 9
    }
  }
}
```

---

## WS-003.0 - Flight Position Messages

### Server: flight_positions
Batch of flight position updates (sent every 10 seconds).

```json
{
  "type": "flight_positions",
  "payload": {
    "subscription_id": "sub-uuid-123",
    "flights": [
      {
        "id": "ABC123",
        "lat": 40.7128,
        "lon": -74.0060,
        "alt": 35000,
        "spd": 450,
        "hdg": 270,
        "vr": 0,
        "ts": 1705320600
      },
      {
        "id": "DEF456",
        "lat": 40.8,
        "lon": -74.2,
        "alt": 32000,
        "spd": 420,
        "hdg": 90,
        "vr": -500,
        "ts": 1705320600
      }
    ],
    "count": 2,
    "server_time": 1705320600
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Field Descriptions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Aircraft identifier (callsign or ICAO24) |
| `lat` | float | Latitude |
| `lon` | float | Longitude |
| `alt` | int | Altitude in feet |
| `spd` | int | Ground speed in knots |
| `hdg` | int | Heading in degrees (0-359) |
| `vr` | int | Vertical rate in ft/min (positive=climbing) |
| `ts` | int | Unix timestamp of position |

### Server: flight_update
Single flight detailed update (for single-flight subscription).

```json
{
  "type": "flight_update",
  "payload": {
    "subscription_id": "sub-uuid-456",
    "flight": {
      "callsign": "AA100",
      "aircraft_id": "A1B2C3",
      "position": {
        "lat": 40.7128,
        "lon": -74.0060,
        "alt": 35000,
        "spd": 450,
        "hdg": 270,
        "vr": 0,
        "on_ground": false
      },
      "route": {
        "origin": "JFK",
        "destination": "LAX"
      },
      "status": "IN_FLIGHT",
      "phase": "cruise",
      "progress_percent": 45,
      "eta_minutes": 135
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: flight_entered
A new flight entered the subscribed bounds.

```json
{
  "type": "flight_entered",
  "payload": {
    "subscription_id": "sub-uuid-123",
    "flight": {
      "id": "NEW789",
      "lat": 40.0,
      "lon": -95.0,
      "alt": 35000,
      "spd": 450,
      "hdg": 90,
      "vr": 0,
      "type": "B738",
      "airline": "UA",
      "origin": "SFO",
      "destination": "ORD"
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: flight_exited
A flight exited the subscribed bounds.

```json
{
  "type": "flight_exited",
  "payload": {
    "subscription_id": "sub-uuid-123",
    "flight_id": "OLD456",
    "reason": "left_bounds"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: flight_landed
A tracked flight has landed.

```json
{
  "type": "flight_landed",
  "payload": {
    "subscription_id": "sub-uuid-456",
    "flight": {
      "callsign": "AA100",
      "landed_at": "LAX",
      "landed_time": "2024-01-15T13:45:00Z",
      "flight_duration_minutes": 345
    }
  },
  "timestamp": "2024-01-15T13:45:00.000Z"
}
```

---

## WS-004.0 - Crossing Messages

### Server: crossing_detected
A new crossing has been detected.

```json
{
  "type": "crossing_detected",
  "payload": {
    "crossing_id": "cross-uuid-123",
    "detected_at": "2024-01-15T12:00:00Z",
    "your_flight": {
      "flight_number": "AA100",
      "position": {"lat": 40.5, "lon": -98.0, "alt": 35000}
    },
    "crossed_flight": {
      "flight_number": "UA200",
      "aircraft_type": "A320",
      "airline": "United Airlines",
      "origin": "ORD",
      "origin_city": "Chicago",
      "destination": "SFO",
      "destination_city": "San Francisco",
      "position": {"lat": 40.6, "lon": -97.8, "alt": 33000}
    },
    "crossing_details": {
      "distance_miles": 12.5,
      "altitude_diff_ft": 2000,
      "region": "US Midwest",
      "closing_speed_kts": 150
    },
    "greeting_eligible": true,
    "other_user": {
      "user_id": "user-xyz",
      "display_name": "TravelFan",
      "avatar_url": "...",
      "nationality": "GB",
      "language": "en"
    },
    "points_earned": 25,
    "achievement_unlocked": null
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Server: crossing_expired
A crossing opportunity has expired (no greeting sent).

```json
{
  "type": "crossing_expired",
  "payload": {
    "crossing_id": "cross-uuid-123",
    "expired_at": "2024-01-15T13:00:00Z",
    "greeting_was_sent": false
  },
  "timestamp": "2024-01-15T13:00:00.000Z"
}
```

---

## WS-005.0 - Greeting Messages

### Client: send_greeting
Send a greeting to another user via crossing.

```json
{
  "type": "send_greeting",
  "id": "greet-001",
  "payload": {
    "crossing_id": "cross-uuid-123",
    "message_type": "preset",
    "preset_id": "WAVE_01",
    "custom_text": null
  }
}
```

### Server: greeting_sent
Confirmation that greeting was sent.

```json
{
  "type": "greeting_sent",
  "id": "greet-001",
  "payload": {
    "message_id": "msg-uuid-456",
    "crossing_id": "cross-uuid-123",
    "sent_at": "2024-01-15T12:05:00Z",
    "points_earned": 25
  },
  "timestamp": "2024-01-15T12:05:00.000Z"
}
```

### Server: greeting_received
A greeting has been received from another user.

```json
{
  "type": "greeting_received",
  "payload": {
    "message_id": "msg-uuid-789",
    "crossing_id": "cross-uuid-123",
    "from_user": {
      "user_id": "user-xyz",
      "display_name": "TravelFan",
      "avatar_url": "...",
      "nationality": "GB"
    },
    "message_type": "preset",
    "message_text": "👋 Hello from Chicago! Safe travels!",
    "language": "en",
    "sent_at": "2024-01-15T12:06:00Z",
    "crossing_context": {
      "their_flight": "UA200",
      "their_origin": "Chicago",
      "their_destination": "San Francisco",
      "distance_miles": 12.5
    },
    "points_earned": 10
  },
  "timestamp": "2024-01-15T12:06:00.000Z"
}
```

### Client: mark_greeting_read
Mark a received greeting as read.

```json
{
  "type": "mark_greeting_read",
  "id": "read-001",
  "payload": {
    "message_id": "msg-uuid-789"
  }
}
```

---

## WS-006.0 - User Context Messages

### Client: update_context
Update user's flight context (when boarding/departing).

```json
{
  "type": "update_context",
  "id": "ctx-001",
  "payload": {
    "context_type": "on_plane",
    "flight_number": "AA100",
    "origin": "JFK",
    "destination": "LAX",
    "seat": "12A",
    "position": {
      "lat": 40.6413,
      "lon": -73.7781
    }
  }
}
```

### Server: context_updated
Confirmation of context update.

```json
{
  "type": "context_updated",
  "id": "ctx-001",
  "payload": {
    "context_type": "on_plane",
    "flight_matched": true,
    "flight_id": "AA100",
    "flight_phase": "boarding",
    "crossing_detection_active": false
  },
  "timestamp": "2024-01-15T09:30:00.000Z"
}
```

### Server: flight_phase_changed
User's flight phase has changed.

```json
{
  "type": "flight_phase_changed",
  "payload": {
    "flight_id": "AA100",
    "previous_phase": "boarding",
    "current_phase": "taxiing",
    "crossing_detection_active": false,
    "message": "Your flight is taxiing to the runway"
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

Phases: `boarding`, `taxiing`, `takeoff`, `climb`, `cruise`, `descent`, `approach`, `landed`, `arrived`

Crossing detection only active during: `cruise`

---

## WS-007.0 - Notification Messages

### Server: notification
General notification to user.

```json
{
  "type": "notification",
  "payload": {
    "notification_id": "notif-uuid-123",
    "notification_type": "achievement",
    "title": "Achievement Unlocked!",
    "message": "You've earned the Globe Trotter badge",
    "icon": "trophy",
    "action": {
      "type": "navigate",
      "target": "/achievements/globe_trotter"
    },
    "data": {
      "achievement_id": "globe_trotter",
      "points_earned": 100
    },
    "priority": "high",
    "persistent": true
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Notification Types:**
- `achievement` - Achievement unlocked
- `level_up` - User leveled up
- `streak` - Streak milestone
- `system` - System announcement
- `promo` - Promotional message

---

## WS-008.0 - Game Session Messages (Unity ↔ Flutter via WebSocket)

### Client: game_start
Notify server that a game session is starting.

```json
{
  "type": "game_start",
  "id": "game-001",
  "payload": {
    "game_id": "geo_quiz",
    "session_id": "session-uuid-123",
    "flight_context": {
      "flight_id": "AA100",
      "position": {"lat": 40.5, "lon": -98.0, "alt": 35000}
    }
  }
}
```

### Server: game_flight_data
Real-time flight data for game context.

```json
{
  "type": "game_flight_data",
  "payload": {
    "session_id": "session-uuid-123",
    "user_position": {"lat": 40.5, "lon": -98.0, "alt": 35000},
    "nearby_flights": [
      {"id": "UA200", "lat": 40.6, "lon": -97.8, "alt": 33000, "type": "A320"}
    ],
    "overflying": {
      "country": "United States",
      "state": "Kansas",
      "nearest_city": "Wichita",
      "nearest_airport": "ICT"
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Client: game_end
Notify server that game session ended.

```json
{
  "type": "game_end",
  "id": "game-002",
  "payload": {
    "session_id": "session-uuid-123",
    "score": 85,
    "correct_answers": 8,
    "total_questions": 10,
    "time_taken_seconds": 180
  }
}
```

### Server: game_result
Final game results with achievements.

```json
{
  "type": "game_result",
  "id": "game-002",
  "payload": {
    "session_id": "session-uuid-123",
    "points_earned": 85,
    "achievements_unlocked": [],
    "new_total_points": 4605,
    "leaderboard_position": 156
  },
  "timestamp": "2024-01-15T12:03:00.000Z"
}
```

---

## Connection Best Practices

### Reconnection Strategy

```
1. Connection lost
2. Wait 1 second
3. Attempt reconnect
4. If fail: Wait 2 seconds, retry
5. If fail: Wait 4 seconds, retry
6. Continue doubling (max 30 seconds)
7. After 5 minutes total: Show manual reconnect UI
8. On reconnect: Re-authenticate, re-subscribe to previous channels
```

### Heartbeat

- Client sends `ping` every 30 seconds
- If no `pong` received within 10 seconds, assume disconnected
- Trigger reconnection flow

### Subscription Management

- Track active subscriptions client-side
- On reconnect, re-subscribe to all previous subscriptions
- Update subscriptions when map viewport changes (debounce 500ms)

### Message Ordering

- Messages include `timestamp` for ordering
- Flight positions include `ts` (unix timestamp) for each position
- Client should handle out-of-order messages gracefully

### Bandwidth Optimization

- Use minimal field names in high-frequency messages
- Flight positions use abbreviated keys: `lat`, `lon`, `alt`, `spd`, `hdg`, `vr`, `ts`
- Batch messages where possible (flight_positions contains array)

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required for this subscription |
| `AUTH_INVALID` | Invalid or expired token |
| `SUBSCRIPTION_INVALID` | Invalid subscription parameters |
| `SUBSCRIPTION_LIMIT` | Too many active subscriptions |
| `RATE_LIMITED` | Too many messages, slow down |
| `INVALID_MESSAGE` | Malformed message |
| `INTERNAL_ERROR` | Server error, retry later |

---

## Rate Limits

| Message Type | Limit |
|--------------|-------|
| subscribe/unsubscribe | 10/minute |
| update_subscription | 30/minute |
| send_greeting | 20/minute |
| ping | 2/minute |
| game messages | 60/minute |

Exceeding limits results in `RATE_LIMITED` error and temporary throttling.

