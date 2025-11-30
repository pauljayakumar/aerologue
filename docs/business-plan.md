# Aerologue Business Plan

**Version:** 1.0
**Date:** November 2025
**Classification:** Confidential - Investor Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem & Opportunity](#2-problem--opportunity)
3. [Solution](#3-solution)
4. [Market Analysis](#4-market-analysis)
5. [Business Model](#5-business-model)
6. [Product Roadmap](#6-product-roadmap)
7. [Technology & Development](#7-technology--development)
8. [Go-to-Market Strategy](#8-go-to-market-strategy)
9. [Team & Organisation](#9-team--organisation)
10. [Financial Plan](#10-financial-plan)
11. [Risk Analysis](#11-risk-analysis)
12. [Investment Proposition](#12-investment-proposition)

---

## 1. Executive Summary

### The Company

Aerologue is a UK-based aviation technology startup developing a next-generation travel companion platform that transforms the air travel experience through real-time flight tracking, unique social connectivity features, gamified entertainment, and comprehensive travel management tools.

### Why Now: The Connectivity Window Is Opening

A technology window is opening in aviation that creates a once-in-a-generation opportunity.

**The Shift:** In-flight connectivity is undergoing a fundamental transformation. Starlink Aviation is rolling out across major carriers, NEO (New Engine Option) aircraft come equipped with vastly improved connectivity systems, and airlines are investing heavily in passenger WiFi. Within 3-5 years, reliable in-flight internet will be the norm rather than the exception.

**The Opportunity:** This connectivity revolution enables entirely new categories of in-flight applications - particularly real-time social features that were previously impossible. No incumbent has built for this future because the infrastructure didn't justify the investment.

**Our Timing:** We are building now, with offline-first architecture as our bridge to the connected future. When the window fully opens, we will be the established player in a space that didn't exist before - with the product built, the users acquired, and the brand established.

This is not about solving today's connectivity problems. It's about being first through the window as it opens.

### The Opportunity

The global flight tracking app market is valued at over $1.5 billion, with 4.5 billion airline passengers annually. Yet no existing solution offers meaningful social connectivity between travellers - because until now, the infrastructure couldn't support it. That is changing rapidly.

### The Solution

Aerologue's multi-platform application delivers:
- **Real-time flight tracking** with industry-leading offline capability
- **"Greetings Between Planes"** - the world's first system enabling passengers on crossing flights to connect
- **Gamified geography entertainment** - AI-powered quizzes and factoids during flight
- **Comprehensive travel wallet** - tickets, boarding passes, bookings in one place

### The Ask

We are seeking **£500,000 - £1,000,000** in EIS-eligible investment to fund product development, market launch, and initial growth.

### Key Metrics (Projected)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Monthly Active Users | 5,000 | 50,000 | 250,000 |
| Revenue | £0 | £150,000 | £900,000 |
| Gross Margin | - | 70% | 75% |

---

## 2. Problem & Opportunity

### 2.1 The Problems We Solve

#### Problem 1: Disconnected Air Travel Experience

Air travel is isolating. Passengers sit in metal tubes for hours with limited entertainment options and no meaningful way to connect with fellow travellers. The journey itself has become something to endure rather than enjoy.

**Current State:**
- 4.5 billion passengers fly annually
- Average flight duration: 3-4 hours
- Limited in-flight entertainment on many carriers
- No social connectivity between aircraft

#### Problem 2: Poor In-Flight Connectivity for Apps

Existing flight tracking apps assume constant internet connectivity. In reality:
- In-flight WiFi is expensive (£10-25 per flight)
- Bandwidth is severely limited at altitude
- Many passengers fly without connectivity
- Apps fail or show stale data

#### Problem 3: Fragmented Travel Management

Travellers juggle multiple apps and documents:
- Flight tracking (FlightRadar24, FlightAware)
- Boarding passes (airline apps)
- Hotel bookings (booking.com, hotels.com)
- Travel documents (email, photos)

No single solution unifies the travel experience.

### 2.2 Market Opportunity

#### Total Addressable Market (TAM)

| Segment | Size | Description |
|---------|------|-------------|
| Global air passengers | 4.5B annually | All commercial aviation passengers |
| Flight tracking users | 100M+ | Active users of flight tracking apps |
| Aviation enthusiasts | 50M+ | Hobbyist plane spotters and enthusiasts |

#### Serviceable Addressable Market (SAM)

| Segment | Size | Description |
|---------|------|-------------|
| English-speaking markets | 1.5B passengers | UK, US, Australia, Canada |
| Smartphone users during travel | 80% | Digitally engaged travellers |
| Premium travellers | 300M | Willing to pay for enhanced experience |

#### Serviceable Obtainable Market (SOM)

| Timeline | Target Users | Market Share |
|----------|--------------|--------------|
| Year 1 | 50,000 | 0.003% |
| Year 3 | 500,000 | 0.03% |
| Year 5 | 2,000,000 | 0.1% |

### 2.3 Competitive Landscape

| Competitor | Strengths | Weaknesses | Aerologue Advantage |
|------------|-----------|------------|---------------------|
| FlightRadar24 | Market leader, comprehensive data | No social features, poor offline | Social connectivity, offline-first |
| FlightAware | Strong B2B, accurate data | Consumer app dated | Modern UX, gamification |
| Flighty | Beautiful design, Apple-focused | iOS only, no social | Cross-platform, social features |
| Airline Apps | Official source, boarding passes | Fragmented, single airline | Unified multi-airline experience |

**Aerologue's Unique Position:** No competitor offers social connectivity between passengers, gamified entertainment, or true offline-first architecture.

---

## 3. Solution

### 3.1 Product Overview

Aerologue is a comprehensive travel companion platform available on:
- **Web** (Progressive Web App)
- **iOS** (App Store)
- **Android** (Google Play)
- **Windows** (Microsoft Store / Airline IFE systems)

### 3.2 Core Features

#### Feature 1: Real-Time Flight Tracking

Track any commercial flight worldwide with:
- Live position updates every 10 seconds
- Smooth aircraft animation via client-side interpolation
- Full flight details (origin, destination, aircraft type, altitude, speed)
- Historical flight path trails
- Airport arrival/departure boards

**Differentiator:** Works seamlessly offline with pre-cached route data.

#### Feature 2: Greetings Between Planes (Unique to Aerologue)

The world's first system enabling passengers on crossing flights to connect:

```
┌─────────────────────────────────────────────────────────┐
│  ✈️ Flight Crossing Detected!                           │
│                                                         │
│  You're crossing paths with flight BA456                │
│  London → New York                                      │
│                                                         │
│  3 Aerologue users on board                            │
│                                                         │
│  [Send Greeting]  [Wave 👋]  [Skip]                    │
└─────────────────────────────────────────────────────────┘
```

**How it works:**
1. Our algorithm detects when two aircraft are within 20 miles horizontally and 5,000 feet vertically
2. Users on both flights receive a notification
3. They can exchange greetings, emojis, or short messages
4. Creates memorable "moment in the sky" experiences

#### Feature 3: Gamified Geography Entertainment

AI-powered quizzes and factoids based on real-time flight position:

**Geo Factoids:**
- "You're flying over Lake Tahoe - did you know it's so clear you can see 70 feet down?"
- Points for discovering new locations
- Achievement badges for milestones

**Geoquiz:**
- Location-aware questions generated by Claude AI
- Multiple difficulty levels
- Leaderboards and competitions
- Works fully offline with pre-downloaded question banks

#### Feature 4: Vlog Map

Interactive map featuring travel content tied to locations:
- Embedded YouTube, Instagram, TikTok content
- Discover destinations through creator content
- User submissions with moderation
- Influencer partnership opportunities

#### Feature 5: Travel Wallet

Unified storage for all travel documents:
- Flight tickets and boarding passes
- Hotel booking confirmations
- E-visas and travel documents
- Saved promotional offers

### 3.3 User Experience Principles

| Principle | Implementation |
|-----------|----------------|
| Offline-first | Full functionality without connectivity |
| Battery efficient | Optimised for mobile device constraints |
| Altitude-aware | Adapts UI and data usage to flight context |
| Privacy-respecting | Minimal data collection, GDPR compliant |

---

## 4. Market Analysis

### 4.1 Industry Trends

#### Trend 1: Mobile-First Travel

- 85% of travellers use smartphones for trip planning
- 70% book travel on mobile devices
- Mobile travel app downloads growing 15% annually

#### Trend 2: Experience Economy

- Travellers increasingly value experiences over possessions
- Social sharing of travel moments is mainstream
- Demand for unique, memorable experiences

#### Trend 3: Aviation Enthusiasm Growth

- Plane tracking has become mainstream entertainment
- FlightRadar24: 50M+ downloads
- Aviation content thrives on social media

#### Trend 4: The In-Flight Connectivity Revolution (Critical Market Catalyst)

The aviation industry is undergoing a connectivity transformation that fundamentally changes what's possible for passenger applications:

**Starlink Aviation:**
- SpaceX's Starlink Aviation launched 2022, now deploying across carriers
- Offers 350+ Mbps to aircraft (vs 10-50 Mbps for legacy systems)
- JSX, Hawaiian Airlines, and others already flying with Starlink
- Major carriers (Delta, United) evaluating or committed

**NEO Aircraft Fleet Renewal:**
- Airbus A320neo and A321neo families entering service in volume
- Boeing 737 MAX fleet growing
- New aircraft come with modern connectivity systems pre-installed
- Airlines replacing older fleet = connectivity upgrade by default

**Market Data:**
- Global in-flight WiFi market: $5.5B by 2027 (12% CAGR)
- In-flight connectivity satisfaction increasing from 45% (2019) to projected 75%+ (2027)
- Passenger willingness to pay for connectivity declining as airlines offer free/cheap options

**What This Means:**
- Within 3-5 years, the majority of flights will have usable connectivity
- Real-time social features become viable at scale
- The in-flight app market transforms from offline-centric to connected
- **First movers who build now will own this emerging market**

**Why Incumbents Haven't Built This:**
- FlightRadar24, FlightAware, Flighty were built for ground-based tracking
- Social features weren't viable when connectivity was unreliable
- No incentive to invest in features that wouldn't work
- **We are building for where the market is going, not where it's been**

### 4.2 Target Customer Segments

#### Segment 1: Frequent Flyers (Primary)

| Attribute | Description |
|-----------|-------------|
| Demographics | 25-55, professional, high income |
| Behaviour | 10+ flights per year |
| Pain points | Boredom, fragmented travel apps |
| Willingness to pay | High (£5-10/month) |
| Size | ~100M globally |

#### Segment 2: Aviation Enthusiasts

| Attribute | Description |
|-----------|-------------|
| Demographics | 18-45, predominantly male |
| Behaviour | Track flights as hobby, airport spotting |
| Pain points | Limited social features in existing apps |
| Willingness to pay | Medium (£3-5/month) |
| Size | ~50M globally |

#### Segment 3: Families with Travellers

| Attribute | Description |
|-----------|-------------|
| Demographics | Parents tracking children/elderly |
| Behaviour | Track loved ones' flights |
| Pain points | Anxiety about travel, want updates |
| Willingness to pay | Medium (one-time or low subscription) |
| Size | ~200M globally |

#### Segment 4: Travel Content Creators

| Attribute | Description |
|-----------|-------------|
| Demographics | 18-35, social media active |
| Behaviour | Create travel content, large followings |
| Pain points | Discovery, monetisation |
| Willingness to pay | Low (value partnership instead) |
| Size | ~5M globally |

### 4.3 Market Entry Strategy

**Phase 1: UK Market Focus**
- 150M+ passengers through UK airports annually
- English-speaking, tech-savvy population
- Strong aviation enthusiasm culture
- Regulatory familiarity (CAA, GDPR)

**Phase 2: US/Europe Expansion**
- Largest aviation markets globally
- Similar user demographics
- Scalable marketing channels

**Phase 3: Global Rollout**
- Asia-Pacific (growing aviation market)
- Middle East (hub airports)
- Latin America

---

## 5. Business Model

### 5.1 Revenue Streams

#### Stream 1: Freemium Subscriptions (Primary)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | £0 | Basic tracking (3 flights), limited games, ads |
| **Premium** | £4.99/month | Unlimited tracking, no ads, full games, premium features |
| **Family** | £9.99/month | Up to 5 accounts, shared tracking, family features |
| **Annual Premium** | £39.99/year | 33% discount on monthly |

**Projected conversion rate:** 8-12% free to premium

#### Stream 2: In-App Purchases

| Item | Price | Description |
|------|-------|-------------|
| Greeting packs | £0.99-2.99 | Premium greeting animations |
| Avatar cosmetics | £0.99-4.99 | Custom profile items |
| Quiz hints | £0.99 | Help with geography quizzes |
| Ad-free week | £1.99 | Temporary ad removal |

#### Stream 3: B2B Licensing (Year 2+)

| Product | Price Model | Target |
|---------|-------------|--------|
| Airline SDK | Per-passenger fee | Airlines for IFE systems |
| White-label solution | License + revenue share | Travel companies |
| API access | Usage-based | Travel tech developers |

**Projected B2B revenue:** £50-100 per airline partnership monthly

#### Stream 4: Advertising (Year 2+)

| Format | CPM | Targeting |
|--------|-----|-----------|
| Destination ads | £15-25 | Route-based |
| Travel services | £10-20 | Context-based |
| Sponsored content | Negotiated | Vlog map features |

**Ad strategy:** Tasteful, relevant, non-intrusive. Premium users see no ads.

### 5.2 Pricing Strategy

**Principles:**
1. Low barrier to entry (generous free tier)
2. Clear value proposition for premium
3. Price parity across platforms
4. Regional pricing for emerging markets

**Competitive positioning:**
- FlightRadar24 Premium: £3.49/month
- Flighty Pro: £3.99/month
- Aerologue Premium: £4.99/month (more features justifies premium)

### 5.3 Unit Economics

#### Customer Acquisition Cost (CAC)

| Channel | CAC | LTV:CAC |
|---------|-----|---------|
| Organic (App Store) | £0.50 | 80:1 |
| Social media | £2.00 | 20:1 |
| Paid search | £5.00 | 8:1 |
| Influencer | £3.00 | 13:1 |
| **Blended** | **£2.50** | **16:1** |

#### Customer Lifetime Value (LTV)

| Segment | Monthly ARPU | Avg Lifetime | LTV |
|---------|--------------|--------------|-----|
| Free user | £0.20 (ads) | 6 months | £1.20 |
| Premium | £4.99 | 18 months | £89.82 |
| **Blended (10% premium)** | £0.68 | 12 months | **£40** |

#### Gross Margin

| Cost Component | % of Revenue |
|----------------|--------------|
| Infrastructure (AWS) | 15% |
| Third-party APIs | 5% |
| Payment processing | 3% |
| **Gross Margin** | **77%** |

---

## 6. Product Roadmap

### 6.1 Development Phases

```
2025 Q4          2026 Q1          2026 Q2          2026 Q3          2026 Q4
    │                │                │                │                │
    ▼                ▼                ▼                ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Phase 1 │───▶│ Phase 2 │───▶│ Phase 3 │───▶│ Phase 4 │───▶│ Phase 5 │
│   MVP   │    │ Mobile  │    │ Gaming  │    │  Scale  │    │   B2B   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### 6.2 Phase 1: MVP Web Application (Months 1-4)

**Objective:** Validate core technology and user experience

**Deliverables:**
- Progressive Web App (React/Next.js)
- Core flight tracking functionality
- Basic greetings feature (simplified)
- User authentication (Cognito)
- Serverless backend (AWS Lambda)

**Success Criteria:**
- 500 beta users
- <3 second page load
- 99% uptime
- User feedback incorporated

**Budget:** £80,000

### 6.3 Phase 2: Mobile Applications (Months 5-8)

**Objective:** Launch on iOS and Android app stores

**Deliverables:**
- Flutter-based cross-platform apps
- Full feature parity with web
- Offline-first architecture
- Push notifications
- App Store and Google Play listings

**Success Criteria:**
- App Store approval (both platforms)
- 4.0+ star rating
- 5,000 downloads first month
- <2% crash rate

**Budget:** £100,000

### 6.4 Phase 3: Gaming & Entertainment (Months 9-12)

**Objective:** Differentiate with unique entertainment features

**Deliverables:**
- Unity-based 3D globe integration
- Geoquiz game with AI questions
- Geo Factoids system
- Gamification (points, achievements, leaderboards)
- Full greetings feature with animations

**Success Criteria:**
- 5 minutes average session length
- 30% DAU play games
- 20% improvement in retention

**Budget:** £80,000

### 6.5 Phase 4: Scale & Monetisation (Months 13-18)

**Objective:** Drive revenue and growth

**Deliverables:**
- Premium subscription tier
- In-app purchase store
- Advertising integration
- Vlog Map with creator tools
- Performance optimisation

**Success Criteria:**
- 50,000 MAU
- 8% premium conversion
- £10,000+ MRR

**Budget:** £60,000

### 6.6 Phase 5: B2B & International (Months 19-24)

**Objective:** Expand revenue streams and markets

**Deliverables:**
- Airline SDK for IFE integration
- Multi-language support (5 languages)
- Regional pricing
- Enterprise admin console
- API marketplace

**Success Criteria:**
- 2 airline partnerships
- 3 new market launches
- £50,000+ MRR

**Budget:** £80,000

### 6.7 Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Flight tracking | High | Medium | P0 | 1 |
| User auth | High | Low | P0 | 1 |
| Offline maps | High | High | P0 | 1 |
| Greetings (basic) | High | Medium | P1 | 1 |
| Mobile apps | High | High | P0 | 2 |
| Push notifications | Medium | Low | P1 | 2 |
| Unity games | Medium | High | P1 | 3 |
| Geoquiz | Medium | Medium | P1 | 3 |
| Subscriptions | High | Medium | P0 | 4 |
| Ads | Medium | Low | P2 | 4 |
| Airline SDK | High | High | P1 | 5 |

---

## 7. Technology & Development

### 7.1 Technology Architecture

#### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐    │
│  │   Web   │  │ Android │  │   iOS   │  │     Windows     │    │
│  │  (PWA)  │  │(Flutter)│  │(Flutter)│  │    (Flutter)    │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘    │
└───────┼────────────┼────────────┼────────────────┼──────────────┘
        │            │            │                │
        └────────────┴────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CLOUD INFRASTRUCTURE                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CloudFront (CDN) ──▶ API Gateway ──▶ Lambda Functions  │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Aurora PostgreSQL │ DynamoDB │ Timestream │ ElastiCache│    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Cognito (Auth) │ S3 (Storage) │ SQS/SNS (Messaging)   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Web Frontend** | Next.js, React, MapLibre GL | Modern, performant, map support |
| **Mobile/Desktop** | Flutter | Single codebase, native performance |
| **Games** | Unity | Industry-standard 3D engine |
| **Backend** | Node.js on AWS Lambda | Serverless, auto-scaling, cost-efficient |
| **Real-time** | WebSocket (API Gateway) | Low-latency updates |
| **Database** | Aurora PostgreSQL | Relational data, PostGIS |
| **NoSQL** | DynamoDB | Sessions, messages, high-scale |
| **Time-series** | Timestream | Flight position history |
| **Cache** | ElastiCache (Redis) | Performance, leaderboards |
| **Auth** | AWS Cognito | Managed auth, social login |
| **AI/ML** | Claude API | Content generation |

### 7.2 Development Approach

#### Offshore Development Model

Aerologue will utilise an **offshore development model** to maximise development efficiency while maintaining UK-based management, strategy, and intellectual property.

**Rationale for Offshore Development:**
1. **Cost efficiency** - 50-70% cost savings vs UK-based development
2. **Talent availability** - Access to large pool of skilled developers
3. **Speed** - Larger team possible within budget
4. **24/7 development** - Time zone differences enable continuous progress

#### Team Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     UK-BASED (Strategy & IP)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Founder/   │  │   Product    │  │   Business Dev /     │   │
│  │     CEO      │  │   Manager    │  │   Marketing          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Daily standups, sprint planning
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 OFFSHORE DEVELOPMENT TEAM                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Technical Lead (1)                                       │   │
│  │  - Architecture decisions                                 │   │
│  │  - Code review                                           │   │
│  │  - Technical documentation                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Frontend    │  │   Backend    │  │      Mobile          │   │
│  │  Developer   │  │  Developers  │  │    Developers        │   │
│  │    (1-2)     │  │    (2-3)     │  │      (2-3)           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │    Unity     │  │      QA      │                             │
│  │  Developer   │  │   Engineer   │                             │
│  │     (1)      │  │     (1)      │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Offshore Location Selection Criteria

| Criterion | Weight | Preferred Regions |
|-----------|--------|-------------------|
| Technical talent pool | 30% | India, Eastern Europe, Vietnam |
| English proficiency | 20% | Philippines, India, Eastern Europe |
| Time zone overlap with UK | 20% | Eastern Europe, India |
| Cost effectiveness | 15% | India, Vietnam, Philippines |
| Cultural compatibility | 10% | Eastern Europe, India |
| IP protection laws | 5% | All reputable locations |

**Recommended Approach:** Partner with established offshore development agency or build dedicated team through platforms like Toptal, Turing, or regional agencies.

#### Cost Comparison: UK vs Offshore

| Role | UK Monthly Cost | Offshore Monthly Cost | Savings |
|------|-----------------|----------------------|---------|
| Senior Developer | £6,000-8,000 | £2,000-3,500 | 55-65% |
| Mid-level Developer | £4,500-6,000 | £1,500-2,500 | 58-67% |
| Junior Developer | £3,000-4,000 | £800-1,500 | 63-73% |
| QA Engineer | £3,500-5,000 | £1,000-2,000 | 60-71% |
| UI/UX Designer | £4,000-6,000 | £1,500-2,500 | 58-63% |
| Technical Lead | £7,000-9,000 | £3,000-4,500 | 50-57% |

**Example Team Budget (Monthly):**

| Role | Headcount | Offshore Rate | Monthly Cost |
|------|-----------|---------------|--------------|
| Technical Lead | 1 | £3,500 | £3,500 |
| Senior Backend Dev | 2 | £2,500 | £5,000 |
| Senior Frontend Dev | 1 | £2,500 | £2,500 |
| Mobile Developers | 2 | £2,500 | £5,000 |
| Unity Developer | 1 | £2,500 | £2,500 |
| QA Engineer | 1 | £1,500 | £1,500 |
| **Total** | **8** | | **£20,000/month** |

Equivalent UK team would cost £45,000-55,000/month.

#### Offshore Development Management

**Communication & Collaboration:**
- Daily standup calls (30 mins, video)
- Weekly sprint planning (1-2 hours)
- Bi-weekly retrospectives
- Slack/Teams for async communication
- Shared project management (Jira/Linear)
- Git-based code collaboration (GitHub)

**Quality Assurance:**
- Mandatory code reviews (all PRs)
- Automated testing requirements (80%+ coverage)
- CI/CD pipeline with quality gates
- Regular security audits
- UK-based architecture oversight

**IP Protection:**
- Robust contractor agreements
- IP assignment clauses
- NDA requirements
- Code ownership clearly with UK entity
- Regular IP audits

**Risk Mitigation:**
- Multiple developers for bus factor
- Comprehensive documentation requirements
- Knowledge transfer sessions
- Phased onboarding of new team members

### 7.3 Development Methodology

**Agile/Scrum Framework:**
- 2-week sprints
- Story point estimation
- Velocity tracking
- Continuous integration/deployment

**Definition of Done:**
- Code reviewed and approved
- Unit tests passing (80%+ coverage)
- Integration tests passing
- Documentation updated
- Deployed to staging
- Product owner acceptance

### 7.4 Technical Differentiators

| Capability | How We Achieve It |
|------------|-------------------|
| Offline-first | Local SQLite, pre-caching, sync queues |
| Real-time at scale | WebSocket + Redis pub/sub |
| Global coverage | Multi-provider ADS-B data aggregation |
| Low latency | CloudFront edge caching, optimised payloads |
| Battery efficient | Intelligent polling, efficient rendering |

### 7.5 Infrastructure Costs

| Stage | MAU | Monthly AWS Cost | Per-User Cost |
|-------|-----|------------------|---------------|
| MVP | 500 | £150 | £0.30 |
| Launch | 5,000 | £280 | £0.06 |
| Growth | 50,000 | £1,000 | £0.02 |
| Scale | 250,000 | £4,000 | £0.016 |

Infrastructure costs decrease per-user as we scale due to fixed-cost components and caching efficiency.

---

## 8. Go-to-Market Strategy

### 8.1 Launch Strategy

#### Pre-Launch (Months 1-4)

| Activity | Channel | Goal |
|----------|---------|------|
| Beta waitlist | Landing page, social | 2,000 signups |
| Aviation community engagement | Reddit, forums | Brand awareness |
| Influencer seeding | Travel YouTubers | 5 partnerships |
| Press outreach | Tech/travel media | 3 articles |

#### Launch (Month 5)

| Activity | Budget | Expected Result |
|----------|--------|-----------------|
| Product Hunt launch | £0 | 500+ upvotes, top 5 |
| Press release | £500 | Coverage in travel tech |
| Influencer posts | £2,000 | 50,000 reach |
| Social ads (test) | £1,000 | 1,000 downloads |

#### Growth (Months 6-12)

| Channel | Monthly Budget | Expected CAC | Monthly Users |
|---------|----------------|--------------|---------------|
| App Store Optimisation | £500 | £0.50 | 1,000 |
| Content marketing | £1,000 | £2.00 | 500 |
| Social media ads | £3,000 | £3.00 | 1,000 |
| Influencer partnerships | £2,000 | £2.50 | 800 |
| **Total** | **£6,500** | **£1.97** | **3,300** |

### 8.2 Marketing Channels

#### Channel 1: App Store Optimisation (ASO)

- Keyword optimisation for "flight tracker", "travel app"
- A/B testing screenshots and descriptions
- Review solicitation and response
- Localisation for key markets

**Target:** 40% of organic downloads

#### Channel 2: Content Marketing

- Blog: Travel tips, aviation content
- YouTube: App tutorials, travel vlogs
- Social: Twitter/X (aviation community), Instagram (travel), TikTok
- SEO: Long-tail travel and aviation keywords

**Target:** 25% of organic downloads

#### Channel 3: Influencer Partnerships

- Travel YouTubers (100K-1M subscribers)
- Aviation enthusiast accounts
- Pilot and flight attendant creators
- Family travel bloggers

**Approach:** Free premium access + affiliate commission

#### Channel 4: Paid Acquisition

- Apple Search Ads (high intent)
- Google App campaigns
- Meta (Instagram/Facebook) - travel interest targeting
- Twitter/X - aviation community

**Target CPA:** <£3.00

#### Channel 5: PR & Media

- Tech media (TechCrunch, The Verge)
- Travel media (Lonely Planet, Travel + Leisure)
- Aviation media (Simple Flying, One Mile at a Time)
- UK media (BBC Tech, Guardian Travel)

### 8.3 Partnerships Strategy

#### Airline Partnerships (B2B)

**Value Proposition:**
- Enhanced passenger engagement
- Differentiated in-flight experience
- Data insights on passenger behaviour
- Revenue share opportunity

**Target Airlines:**
- Low-cost carriers (differentiation opportunity)
- Premium airlines (passenger experience focus)
- Regional airlines (technology uplift)

**Approach:**
- Phase 1: Prove consumer traction
- Phase 2: Pilot with 1-2 airlines
- Phase 3: Scale partnerships

#### Airport Partnerships

- WiFi landing page integration
- Airport app cross-promotion
- Lounge access partnerships

#### Travel Brand Partnerships

- Hotels: Booking integration, offers
- Car rental: Destination services
- Tours: Activity recommendations

### 8.4 Retention Strategy

| Mechanic | Implementation | Impact |
|----------|----------------|--------|
| Gamification | Points, badges, streaks | +30% retention |
| Push notifications | Flight updates, crossings | +20% DAU |
| Personalisation | Favourite routes, airlines | +15% engagement |
| Social features | Friend tracking, sharing | +25% virality |
| Content freshness | New quizzes, factoids | +10% session length |

### 8.5 Viral Mechanics

- **Share flight status** - Social media one-tap sharing
- **Crossing celebrations** - Shareable crossing certificates
- **Achievement badges** - Bragworthy milestones
- **Leaderboards** - Competitive sharing
- **Referral programme** - Premium week for referrals

---

## 9. Team & Organisation

### 9.1 Current Team

#### Founder / CEO
**[Name]**
- Background: [Relevant experience]
- Role: Strategy, fundraising, business development, product vision
- Location: United Kingdom
- Commitment: Full-time

### 9.2 Key Hires (With Investment)

| Role | Priority | Timing | Location | Salary Range |
|------|----------|--------|----------|--------------|
| Product Manager | P1 | Month 1-2 | UK (remote) | £50-65K |
| Technical Lead | P1 | Month 1 | Offshore | £30-40K |
| Backend Developers (2) | P1 | Month 1-2 | Offshore | £25-35K each |
| Frontend Developer | P1 | Month 2 | Offshore | £25-35K |
| Mobile Developers (2) | P2 | Month 4-5 | Offshore | £25-35K each |
| Unity Developer | P2 | Month 8 | Offshore | £25-35K |
| QA Engineer | P2 | Month 3 | Offshore | £15-25K |
| Marketing Manager | P3 | Month 6 | UK (remote) | £40-55K |

### 9.3 Advisors (Target)

| Expertise | Value |
|-----------|-------|
| Aviation industry | Airline partnerships, industry knowledge |
| Mobile gaming | Monetisation, engagement |
| Consumer apps | Growth, product-market fit |
| Travel tech | Market insights, connections |

### 9.4 Organisation Structure (Year 1)

```
                    ┌─────────────────┐
                    │   Founder/CEO   │
                    │       (UK)      │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Product    │ │  Technical   │ │  Marketing   │
    │   Manager    │ │    Lead      │ │   Manager    │
    │    (UK)      │ │  (Offshore)  │ │    (UK)      │
    └──────────────┘ └──────┬───────┘ └──────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Frontend │ │ Backend  │ │  Mobile  │
        │   Dev    │ │  Devs    │ │   Devs   │
        │(Offshore)│ │(Offshore)│ │(Offshore)│
        └──────────┘ └──────────┘ └──────────┘
```

### 9.5 Culture & Values

| Value | Meaning |
|-------|---------|
| **User-first** | Every decision starts with user benefit |
| **Quality** | Ship fast, but ship well |
| **Transparency** | Open communication, honest feedback |
| **Innovation** | Challenge assumptions, try new things |
| **Ownership** | Take responsibility, see things through |

---

## 10. Financial Plan

### 10.1 Funding Requirements

| Round | Amount | Timing | Use of Funds |
|-------|--------|--------|--------------|
| **Seed (Current)** | £500K - £1M | Now | MVP to product-market fit |
| Series A (Future) | £2-5M | Year 2 | Scale and expansion |

### 10.2 Use of Funds (Seed Round)

#### £500,000 Allocation

| Category | Amount | % | Description |
|----------|--------|---|-------------|
| Development (Offshore) | £280,000 | 56% | Engineering team for 18 months |
| Infrastructure | £45,000 | 9% | AWS, APIs, tools |
| Marketing | £60,000 | 12% | Launch and growth marketing |
| UK Team | £70,000 | 14% | Product manager, marketing (part) |
| Legal & Admin | £25,000 | 5% | IP, compliance, accounting |
| Contingency | £20,000 | 4% | Buffer for unexpected costs |

#### £1,000,000 Allocation

| Category | Amount | % | Description |
|----------|--------|---|-------------|
| Development (Offshore) | £480,000 | 48% | Larger team, 24 months runway |
| Infrastructure | £80,000 | 8% | AWS, APIs, tools at scale |
| Marketing | £180,000 | 18% | Aggressive growth marketing |
| UK Team | £150,000 | 15% | Full UK leadership team |
| Legal & Admin | £50,000 | 5% | IP, compliance, expansion |
| Contingency | £60,000 | 6% | Buffer |

### 10.3 Financial Projections

#### Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Monthly Active Users (end) | 10,000 | 75,000 | 300,000 |
| Premium Conversion | 0% | 8% | 10% |
| Premium Subscribers | 0 | 6,000 | 30,000 |
| MRR (Subscriptions) | £0 | £30,000 | £150,000 |
| IAP Revenue | £0 | £5,000 | £20,000 |
| Ad Revenue | £0 | £3,000 | £15,000 |
| B2B Revenue | £0 | £0 | £25,000 |
| **Total MRR** | **£0** | **£38,000** | **£210,000** |
| **Annual Revenue** | **£0** | **£250,000** | **£1,800,000** |

#### Cost Projections

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Development (Offshore) | £240,000 | £300,000 | £400,000 |
| UK Team | £70,000 | £150,000 | £250,000 |
| Infrastructure | £25,000 | £60,000 | £150,000 |
| Marketing | £40,000 | £100,000 | £250,000 |
| Third-party APIs | £10,000 | £30,000 | £80,000 |
| Legal & Admin | £20,000 | £30,000 | £50,000 |
| **Total Costs** | **£405,000** | **£670,000** | **£1,180,000** |

#### Profit & Loss Summary

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | £0 | £250,000 | £1,800,000 |
| Costs | £405,000 | £670,000 | £1,180,000 |
| **Net Profit/(Loss)** | **(£405,000)** | **(£420,000)** | **£620,000** |
| Cumulative P&L | (£405,000) | (£825,000) | (£205,000) |

#### Cash Flow & Runway

**With £500,000 investment:**
- Runway: ~15 months
- Will require Series A or bridge before profitability

**With £1,000,000 investment:**
- Runway: ~24 months
- Path to profitability or strong position for Series A

### 10.4 Key Financial Metrics

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| CAC | <£3.00 | £2-5 for consumer apps |
| LTV | >£40 | £30-50 for subscription apps |
| LTV:CAC | >10:1 | 3:1 minimum viable |
| Gross Margin | >75% | 70-80% for SaaS |
| Monthly Burn | <£35,000 | - |
| Premium Conversion | >8% | 5-10% typical |

### 10.5 Break-Even Analysis

**Break-even MAU (subscriptions only):**
- Monthly costs: £35,000
- Premium ARPU: £4.99
- Conversion rate: 8%
- Revenue per MAU: £0.40
- Break-even MAU: 87,500 users

**Path to profitability:**
- Year 2: Strong growth, losses narrowing
- Year 3: Profitable with 300K MAU
- Year 4: Scaling profit, potential Series A for acceleration

---

## 11. Risk Analysis

### 11.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Technical delivery delays | Medium | High | Agile methodology, buffer time |
| User adoption slower than projected | Medium | High | Iterate on feedback, pivot if needed |
| Competitor response | Medium | Medium | Focus on unique features, speed |
| API provider changes/costs | Low | High | Multi-provider strategy |
| Offshore team issues | Medium | Medium | Robust processes, documentation |
| App store rejection | Low | Medium | Compliance focus, appeal process |
| Funding gap | Medium | High | Conservative burn, early Series A prep |
| Key person dependency | Medium | Medium | Documentation, team building |

### 11.2 Technical Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Scalability | System can't handle user growth | Cloud-native architecture, load testing |
| Data provider reliability | ADS-B APIs have outages | Multi-provider, caching, graceful degradation |
| Offline complexity | Sync conflicts, data loss | Robust conflict resolution, extensive testing |
| Unity integration | Mobile performance issues | Phased integration, performance budgets |
| Security breach | User data compromised | Security-first design, audits, encryption |

### 11.3 Commercial Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Market timing | Users not ready for social flight features | Education, marketing, influencer proof |
| Monetisation | Users unwilling to pay | Freemium testing, value demonstration |
| Competition | Incumbents copy features | Speed to market, brand building |
| Regulatory | Aviation data restrictions | Legal review, compliance monitoring |
| Economic | Travel downturn reduces flights | Diversify to enthusiast market |

### 11.4 Offshore Development Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Communication barriers | Misunderstandings, delays | Daily standups, detailed specs, video calls |
| Quality issues | Code doesn't meet standards | Rigorous code review, automated testing |
| Time zone challenges | Limited overlap hours | Structured handoffs, async documentation |
| Turnover | Key developers leave | Knowledge transfer, documentation, overlap |
| IP leakage | Code/ideas shared | NDAs, IP agreements, trusted partners |

### 11.5 Contingency Plans

**Scenario: User growth slower than expected**
- Extend runway by reducing marketing spend
- Focus on retention over acquisition
- Pivot features based on user feedback
- Explore B2B revenue earlier

**Scenario: Technical delays**
- Reduce scope for initial launch
- Prioritise core features only
- Extend timeline, adjust milestones
- Add additional developers if budget allows

**Scenario: Offshore team issues**
- Have backup agency/team identified
- Maintain comprehensive documentation
- UK-based technical oversight for continuity
- Consider hybrid model if needed

---

## 12. Investment Proposition

### 12.1 Why Invest in Aerologue

#### 1. Perfect Market Timing - The Technology Window
- In-flight connectivity is transforming (Starlink, NEO aircraft, airline investment)
- A new category of in-flight social applications is becoming possible
- Incumbents built for yesterday's constraints; we're building for tomorrow's reality
- First-mover advantage in an emerging market worth capturing now
- **This window won't stay open forever - once connectivity is ubiquitous, others will build**

#### 2. Large Market Opportunity
- 4.5 billion airline passengers annually
- £1.5 billion flight tracking app market
- Growing travel and aviation enthusiasm
- Connectivity improvements expand the addressable market for premium features

#### 3. Unique Product Differentiation
- First-ever social connectivity between aircraft
- Offline-first architecture as a bridge to the connected future
- Gamified entertainment for travel
- No direct competitor with full feature set
- **Built for where the market is going, not where it's been**

#### 4. Experienced Leadership
- [Founder background and relevant experience]
- Clear vision and execution plan
- Domain expertise in technology/travel

#### 5. Capital-Efficient Model
- Offshore development maximises runway
- Serverless infrastructure scales with usage
- Freemium model validates before scaling spend

#### 6. Multiple Exit Paths
- Trade sale to travel technology company
- Acquisition by airline group (connectivity makes in-flight apps strategic)
- Acquisition by tech giant (Google, Apple, Meta)
- Growth equity / Series A pathway

### 12.2 Investment Terms

| Term | Detail |
|------|--------|
| Instrument | Ordinary Shares (EIS-eligible) |
| Amount | £500,000 - £1,000,000 |
| Pre-money valuation | [To be discussed] |
| Use of funds | Development, launch, growth |
| Board seat | Investor director (optional) |
| Reporting | Monthly updates, quarterly board meetings |

### 12.3 EIS Benefits for Investors

| Benefit | Detail |
|--------|--------|
| Income Tax Relief | 30% of investment against income tax |
| Capital Gains Tax Free | No CGT on gains if held 3+ years |
| Loss Relief | Offset losses against income tax |
| Inheritance Tax Relief | 100% IHT relief after 2 years |
| CGT Deferral | Defer existing gains into EIS investment |

**Example: £100,000 Investment**
- Income tax relief: £30,000
- Net cost to investor: £70,000
- If investment doubles: £200,000 return (tax-free)
- Effective return: 186% on net cost

### 12.4 Milestones & Tranching (Optional)

Investment can be structured with milestone-based tranches:

| Tranche | Amount | Milestone | Timing |
|---------|--------|-----------|--------|
| 1 | 40% | Signing | Immediate |
| 2 | 30% | MVP launch with 1,000 users | Month 5 |
| 3 | 30% | Mobile launch with 10,000 MAU | Month 10 |

### 12.5 Investor Updates & Governance

**Reporting Cadence:**
- Weekly: Development progress (during active build)
- Monthly: KPIs, financials, highlights
- Quarterly: Board meeting, strategic review

**Key Metrics Tracked:**
- MAU / DAU
- User acquisition (by channel)
- Retention (D1, D7, D30)
- Premium conversion rate
- MRR / Revenue
- Burn rate / Runway
- NPS score

---

## Appendices

### Appendix A: Detailed Technical Architecture
*See separate document: aws-architecture.md*

### Appendix B: Feature Specifications
*See separate document: features.md*

### Appendix C: Data Dictionary
*See separate document: data-dictionary.md*

### Appendix D: GDPR Compliance
*See separate document: gdpr-compliance.md*

### Appendix E: Security Architecture
*See separate document: security-architecture.md*

### Appendix F: EIS Case for HMRC
*See separate document: eis-case-hmrc.md*

---

## Contact

**Aerologue Ltd**

[Founder Name]
Founder & CEO

Email: [email]
Phone: [phone]
LinkedIn: [profile]

---

*This document is confidential and intended solely for potential investors. The projections contained herein are based on current assumptions and are subject to change. Past performance is not indicative of future results.*
