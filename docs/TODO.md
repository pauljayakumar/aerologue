# Aerologue - Future Tasks & Polish Items

Items to revisit when time permits.

---

## Design & Branding

- [ ] **Dark mode logo variant** - Create `Aerologue_Logo_Dark.png` with white text for proper dark mode display. Currently using CSS filter (`brightness-0 invert`) as workaround - loses the blue gradient on the plane icon.

---

## UI/UX

- [ ] Review all pages with new design system colors
- [ ] Mobile responsive testing
- [ ] Accessibility audit (color contrast, focus states)

---

## Technical Debt

- [ ] (Add items as they come up)

---

## MVP Decisions - Periodic Review

### Airport Data Storage
**Status:** 🟡 MVP - Static JSON
**Added:** December 1, 2025
**Review:** When need full 50K airport database or PostGIS queries

**Current MVP Approach:**
- Static JSON file with ~500-1000 major airports
- Bundled with web app, loaded on page load
- Used for search and map markers

**Full Implementation (Future):**
- Aurora PostgreSQL with PostGIS extension
- ~50,000 airports with full metadata
- Geospatial queries for nearby airports
- Decision criteria:
  - [ ] Need airport proximity search
  - [ ] Need full airport metadata (terminals, runways, etc.)
  - [ ] Need real-time airport schedule integration

---

### Flight Trail Storage
**Status:** 🟡 MVP - S3 Hybrid
**Added:** December 1, 2025
**Review:** When need real-time analytics or faster trail queries

**Current MVP Approach:**
- S3 storage for position data (~$9/month)
- 30-second position update intervals
- DynamoDB index for fast lookups
- Trail retrieval: ~200-500ms latency

**Full Implementation (Future):**
- Amazon Timestream for time-series data (~$615/month)
- 5-second position updates for smoother trails
- Real-time analytics and queries
- Decision criteria:
  - [ ] Need sub-100ms trail queries
  - [ ] Need real-time crossing detection analytics
  - [ ] Need historical flight analytics

---

### API Update Frequency
**Status:** 🟡 MVP - 30 seconds
**Added:** December 1, 2025
**Review:** When need smoother real-time tracking

**Current MVP Approach:**
- Flight position updates every 30 seconds
- Cost-effective, lower storage volume
- ~4-7 mile gap between trail points at cruise

**Full Implementation (Future):**
- 5-second updates for smooth tracking
- Higher storage costs but better UX
- Decision criteria:
  - [ ] User feedback indicates trails look "choppy"
  - [ ] Need precise crossing detection timing
  - [ ] Revenue supports increased costs

---

## AWS - Periodic Review Items

### SES Sandbox Mode Review
**Status:** 🟡 In Sandbox Mode
**Added:** December 1, 2025
**Review:** Before public launch or when need to send emails to unverified addresses

**Current Limitations:**
- Can only forward emails to verified addresses
- 200 emails/day sending limit
- 1 email/second rate limit

**Decision Criteria for Production Access:**
- [ ] Need to send transactional emails to users (password reset, notifications)
- [ ] Need to forward contact emails without verifying each recipient
- [ ] Launching publicly and expect external email communication

**How to Exit Sandbox:**
1. AWS Console → SES → Account Dashboard → "Request production access"
2. Describe use case: "Transactional emails for user registration, password reset, and contact form responses"
3. Wait 24-48 hours for approval

**Note:** For now, ensure samsonsamuel@live.co.uk is verified to receive forwarded emails.

---

*Last updated: December 1, 2025*

---

## References

- [MVP Architecture](mvp-architecture.md) - Detailed MVP decisions and cost analysis
