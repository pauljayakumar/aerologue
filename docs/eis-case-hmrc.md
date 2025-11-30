# Enterprise Investment Scheme (EIS) Case for Aerologue

**Prepared for:** HM Revenue & Customs (HMRC)
**Company:** Aerologue Ltd
**Date:** November 2025
**Document Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Company Overview](#2-company-overview)
3. [Qualifying Trade Requirements](#3-qualifying-trade-requirements)
4. [Innovation & Technology](#4-innovation--technology)
5. [Risk to Capital](#5-risk-to-capital)
6. [Use of Investment Funds](#6-use-of-investment-funds)
7. [Growth Objectives](#7-growth-objectives)
8. [Compliance Checklist](#8-compliance-checklist)

---

## 1. Executive Summary

### Company Description

Aerologue is a pioneering aviation technology startup developing a multi-platform application that transforms the air travel experience through real-time flight tracking, unique social features enabling communication between passengers on crossing flights, gamified geography-based entertainment, and travel management tools.

### Why Now: The Technology Window

Aerologue is positioned to capitalise on a fundamental transformation in aviation connectivity. The rollout of Starlink Aviation, deployment of NEO (New Engine Option) aircraft with modern connectivity systems, and airline investment in passenger WiFi are creating a technology window - a moment when new categories of in-flight applications become possible for the first time.

No incumbent has built for this connected future because the infrastructure didn't previously justify the investment. Aerologue is building now, with offline-first architecture as a bridge, to become the established player when this window fully opens.

### Investment Sought

Aerologue is seeking equity investment under the Enterprise Investment Scheme to fund the development of its innovative technology platform. This investment carries genuine commercial risk as we are building for an emerging market enabled by rapidly evolving aviation connectivity infrastructure.

### Key EIS Qualifying Factors

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Qualifying Trade | ✓ Eligible | Software development and SaaS services |
| Gross Assets < £15m | ✓ Compliant | Pre-revenue startup |
| Employees < 250 | ✓ Compliant | Early-stage team |
| Company Age < 7 years | ✓ Compliant | Newly incorporated |
| Permanent Establishment in UK | ✓ Compliant | UK-registered company |
| Risk-to-Capital Condition | ✓ Satisfied | Novel technology with genuine commercial risk |

---

## 2. Company Overview

### 2.1 Business Description

Aerologue is developing a comprehensive aviation and travel technology platform comprising:

**Core Products:**
1. **Web Application** - Progressive Web App (PWA) for browser-based access
2. **Mobile Applications** - Native iOS and Android apps via Flutter
3. **Desktop Application** - Windows DLL for Microsoft Games ecosystem and airline in-flight entertainment systems
4. **Backend-as-a-Service (BaaS)** - Serverless cloud infrastructure on AWS

**Target Markets:**
- Air travellers seeking enhanced flight experiences
- Aviation enthusiasts and plane tracking hobbyists
- Travel vloggers and content creators
- Families and friends tracking travellers
- Airlines seeking passenger engagement solutions

### 2.2 Legal Structure

| Detail | Information |
|--------|-------------|
| Company Name | Aerologue Ltd |
| Company Type | Private Limited Company |
| Registered in | England and Wales |
| Trading Status | Pre-revenue / Development Stage |

### 2.3 Intellectual Property

Aerologue is developing proprietary technology including:
- Flight crossing detection algorithms
- Real-time greeting exchange protocols
- Altitude-aware map rendering systems
- Offline-first data synchronisation architecture
- Custom ETL (Extract-Transform-Load) pipeline for aviation data normalisation

---

## 3. Qualifying Trade Requirements

### 3.1 Nature of Trade

Aerologue's business constitutes a **qualifying trade** under EIS legislation as it involves:

1. **Software Development** - Creating original software applications for multiple platforms
2. **Software-as-a-Service (SaaS)** - Providing cloud-based services to end users
3. **Technology Licensing** - Future licensing of technology to airlines and travel companies

### 3.2 Excluded Activities Assessment

Aerologue's activities do **NOT** include any excluded trades:

| Excluded Activity | Aerologue Status |
|-------------------|------------------|
| Dealing in land or commodities | ✗ Not applicable |
| Dealing in shares or securities | ✗ Not applicable |
| Banking, insurance, money-lending | ✗ Not applicable |
| Leasing or receiving royalties | ✗ Not applicable |
| Legal or accountancy services | ✗ Not applicable |
| Property development | ✗ Not applicable |
| Hotels, nursing homes | ✗ Not applicable |
| Farming, forestry | ✗ Not applicable |
| Shipbuilding | ✗ Not applicable |
| Coal, steel production | ✗ Not applicable |
| Energy generation with Feed-in Tariffs | ✗ Not applicable |

### 3.3 Trading Activity Breakdown

The company's activities are wholly focused on technology development and digital services:

| Activity | % of Business | Description |
|----------|---------------|-------------|
| Software Development | 60% | Building applications and backend systems |
| Cloud Services | 25% | Operating serverless infrastructure |
| Data Processing | 10% | Real-time flight data integration |
| R&D | 5% | Innovating new features and algorithms |

---

## 4. Innovation & Technology

### 4.1 Market Timing & The Connectivity Revolution

Aerologue's development is timed to capitalise on a fundamental shift in aviation infrastructure:

#### The Technology Window

**What's Changing:**
- **Starlink Aviation** - SpaceX's satellite internet now deploying across airlines, offering 350+ Mbps (vs 10-50 Mbps for legacy systems)
- **NEO Aircraft Fleet Renewal** - Airbus A320neo/A321neo and Boeing 737 MAX families entering service with modern connectivity pre-installed
- **Airline Investment** - Major carriers investing heavily in passenger WiFi as a competitive differentiator
- **Cost Reduction** - In-flight connectivity becoming cheaper for airlines and passengers

**Market Implications:**
- Within 3-5 years, reliable in-flight connectivity will be the norm
- This enables entirely new categories of real-time in-flight applications
- Social features, live gaming, and rich media experiences become viable at scale

**Why Incumbents Haven't Built This:**
- Existing flight tracking apps (FlightRadar24, FlightAware, Flighty) were designed for ground-based use
- Investment in social/real-time features wasn't justified when connectivity was unreliable
- These companies optimised for yesterday's constraints, not tomorrow's opportunities

**Aerologue's Strategic Position:**
- Building now with offline-first architecture as a bridge to the connected future
- When the window fully opens, we will be the established player with product, users, and brand
- First-mover advantage in a category that is just becoming possible

### 4.2 Technical Innovation

Aerologue is developing several genuinely innovative technical solutions that do not currently exist in the market:

#### 4.2.1 Flight Crossing Detection System

**Innovation:** Real-time algorithmic detection of when two aircraft with Aerologue users are in proximity during flight.

**Technical Approach:**
- Spatial indexing using GeoHash partitioning for efficient proximity queries
- Multi-dimensional filtering (horizontal distance ≤20 miles, vertical distance ≤5,000 feet)
- Flight phase awareness to only detect crossings during cruise phase
- Sub-10-second detection latency at global scale

**Why It's Novel:** No consumer application currently enables real-time social connections between passengers on different aircraft. This requires solving complex technical challenges around:
- Processing high-volume ADS-B flight data (thousands of aircraft globally)
- Efficient geospatial queries at scale
- Real-time WebSocket communication to notify users instantly

#### 4.2.2 Altitude-Aware Map Rendering

**Innovation:** A multi-layer map system that adapts to in-flight connectivity constraints.

**Technical Approach:**
- Bundled offline vector tiles (Natural Earth, ~10MB) for immediate display
- Altitude-optimised tile sets reducing bandwidth by 80% at cruise altitude
- Intelligent layer switching based on connectivity quality
- Client-side position interpolation for smooth visualisation

**Why It's Novel:** Existing flight tracking apps assume reliable connectivity. Aerologue is specifically engineered for the challenging connectivity environment of aircraft, using a combination of:
- Pre-cached route tiles downloaded before flight
- Minimal-bandwidth cruise altitude tiles
- Automatic fallback to offline maps
- Progressive enhancement when connectivity allows

#### 4.2.3 Offline-First Architecture

**Innovation:** Full application functionality without internet connectivity.

**Technical Features:**
- Local SQLite/Hive database for quiz and factoid content
- GPS-based position tracking (works offline)
- Queue-based synchronisation when connectivity resumes
- Automatic conflict resolution for offline changes

#### 4.2.4 Real-Time Greeting Exchange Protocol

**Innovation:** Secure, real-time message exchange between users on crossing aircraft.

**Technical Approach:**
- WebSocket-based bidirectional communication
- End-to-end encryption for message content
- Crossing-scoped message permissions
- Automatic TTL-based message expiration (privacy by design)

### 4.3 Technology Stack

Aerologue utilises modern, scalable cloud technologies:

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend (Web) | React/Vue.js, MapLibre GL JS | Web application |
| Frontend (Mobile) | Flutter, Unity | Cross-platform native apps |
| Backend Compute | AWS Lambda (Serverless) | API handlers, data processing |
| Real-Time | AWS API Gateway WebSocket | Live flight updates, messaging |
| Databases | Aurora PostgreSQL, DynamoDB, Timestream | Multi-model data persistence |
| Caching | ElastiCache (Redis) | Session, leaderboard caching |
| CDN | CloudFront | Global content delivery |
| Authentication | AWS Cognito | User authentication with social login |
| AI/ML | Claude API | AI-generated geography content |

### 4.4 Development Phases

| Phase | Timeline | Deliverable | Investment Use |
|-------|----------|-------------|----------------|
| Phase 1 (MVP) | Months 1-6 | Web app + BaaS validation | Core development |
| Phase 2 | Months 7-12 | Flutter mobile apps | Platform expansion |
| Phase 3 | Months 13-18 | Unity games integration | Feature completion |
| Phase 4 | Months 19-24 | Scale and internationalisation | Growth |

---

## 5. Risk to Capital

### 5.1 Genuine Commercial Risk Statement

Aerologue satisfies the EIS "Risk-to-Capital" condition introduced in Finance Act 2018. The company is developing new technology products with genuine uncertainty about commercial success.

### 5.2 Risk Factors

#### 5.2.1 Technical Risks (High)

| Risk | Description | Mitigation |
|------|-------------|------------|
| Real-time scalability | Processing thousands of concurrent flights globally | Serverless architecture with auto-scaling |
| Data provider dependency | Reliance on third-party ADS-B data APIs | Multi-provider strategy with failover |
| Cross-platform complexity | Single codebase for multiple platforms | Flutter unified development |
| Unity integration | Embedding 3D game engine in mobile apps | Phased integration approach |
| Offline synchronisation | Complex state management across connectivity states | Robust conflict resolution design |

#### 5.2.2 Commercial Risks (High)

| Risk | Description | Impact |
|------|-------------|--------|
| Market timing | Connectivity improvements may be slower than projected | Delayed market opportunity |
| Market adoption | Consumer willingness to pay for aviation apps | Revenue uncertainty |
| Competition | Established players (FlightRadar24, FlightAware) | Market share challenge |
| Connectivity window closes | If we don't establish position before connectivity becomes ubiquitous, others may enter | First-mover advantage lost |
| User acquisition cost | High CAC in mobile app market | Marketing budget requirements |
| Airline partnerships | Long sales cycles, complex negotiations | B2B revenue timing |
| Regulatory changes | Aviation data regulations vary by jurisdiction | Compliance costs |

#### 5.2.3 Financial Risks (High)

| Risk | Description | Probability |
|------|-------------|-------------|
| Extended development timeline | Software projects frequently exceed estimates | Medium-High |
| API cost escalation | Third-party aviation data pricing changes | Medium |
| Infrastructure costs at scale | AWS costs grow with user base | Medium |
| Runway extension needs | May require additional funding rounds | Medium |

### 5.3 Why This Is Not Capital Preservation

This investment is **NOT** structured to preserve capital or generate low-risk returns:

1. **No guaranteed returns** - All returns depend on successful product development and market adoption
2. **No asset backing** - Primary assets are intellectual property and code, not tangible assets
3. **No predictable income** - Pre-revenue company with uncertain monetisation timeline
4. **Genuine loss potential** - Technical or commercial failure could result in total loss of investment
5. **Long-term horizon** - Returns expected only after successful scale-up (5+ years)

### 5.4 Comparison to Established Businesses

Unlike investing in established businesses:
- **No existing customer base** - Must build from zero
- **No proven business model** - Monetisation strategy untested
- **No track record** - New company without operational history
- **No immediate revenue** - Development phase before any income

---

## 6. Use of Investment Funds

### 6.1 Investment Allocation

EIS funds will be used exclusively for qualifying business activities:

| Category | Allocation | Description |
|----------|------------|-------------|
| Software Development | 50% | Engineering salaries, contractors |
| Cloud Infrastructure | 15% | AWS hosting, third-party APIs |
| Design & UX | 10% | UI/UX design, user research |
| Quality Assurance | 10% | Testing, security audits |
| Legal & Compliance | 5% | IP protection, GDPR compliance |
| Operations | 10% | Office, equipment, administration |

### 6.2 Monthly Cost Projections

Based on detailed infrastructure planning:

| Stage | Monthly Active Users | Monthly Cloud Cost | Total Monthly Burn |
|-------|---------------------|-------------------|-------------------|
| MVP/Development | 100 | ~£150 | ~£15,000 |
| Early Stage | 1,000 | ~£280 | ~£25,000 |
| Growth | 10,000 | ~£1,000 | ~£40,000 |
| Scale | 100,000 | ~£4,500 | ~£80,000 |

### 6.3 Development Cost Estimates

| Component | Duration | Cost Range |
|-----------|----------|------------|
| Web App MVP | 8-12 weeks | £16,000 - £32,000 |
| Backend/BaaS | 6-10 weeks | £12,000 - £24,000 |
| Flutter Mobile Apps | 10-14 weeks | £20,000 - £40,000 |
| Unity Games | 8-12 weeks | £16,000 - £32,000 |
| Testing & QA | Ongoing | 20% of development |
| **Total MVP** | **6-9 months** | **£65,000 - £130,000** |

### 6.4 No Capital Preservation Investments

Funds will **NOT** be used for:
- ✗ Purchase of investment securities
- ✗ Property or land acquisition
- ✗ Lending to third parties
- ✗ Distribution to shareholders
- ✗ Repayment of existing debts
- ✗ Acquisition of existing businesses

---

## 7. Growth Objectives

### 7.1 Business Growth Plan

Aerologue has a clear trajectory for growth and value creation:

**Year 1: Product Development**
- Launch web application MVP
- Validate BaaS architecture
- Begin mobile app development
- Target: 1,000 beta users

**Year 2: Market Entry**
- Launch iOS and Android apps
- Implement monetisation (freemium + subscription)
- Target: 10,000 MAU, initial revenue

**Year 3: Scale**
- Unity games integration
- B2B airline partnerships
- International expansion
- Target: 100,000 MAU, profitability pathway

**Year 4-5: Expansion**
- Multi-region infrastructure
- Premium enterprise features
- Strategic partnerships
- Target: 500,000+ MAU, sustainable growth

### 7.2 Revenue Model

| Revenue Stream | Timeline | Description |
|----------------|----------|-------------|
| Freemium subscriptions | Year 2 | £4.99/month premium tier |
| In-app purchases | Year 2 | Virtual currency, cosmetic items |
| B2B licensing | Year 3 | Airline in-flight entertainment |
| Advertising | Year 3 | Contextual travel ads |

### 7.3 Unit Economics Projections

At 10,000 MAU (Growth Stage):
- **Revenue:** ~£4,500/month (10% premium conversion @ £4.99)
- **Infrastructure cost:** ~£1,000/month
- **Gross margin:** ~75%
- **Path to profitability:** Achievable at scale

### 7.4 Exit Scenarios

Potential liquidity events for investors:

1. **Trade sale** - Acquisition by travel technology company, airline group, or tech giant
2. **Secondary sale** - Sale of shares to later-stage investors
3. **IPO** - Public listing (longer-term, requires significant scale)

---

## 8. Compliance Checklist

### 8.1 EIS Qualifying Conditions

| Condition | Requirement | Aerologue Status |
|-----------|-------------|------------------|
| **Gross assets** | < £15 million before investment | ✓ < £250,000 |
| **Gross assets** | < £16 million after investment | ✓ Will comply |
| **Employees** | < 250 full-time equivalent | ✓ < 10 |
| **Company age** | < 7 years from first commercial sale | ✓ Pre-revenue |
| **Investment limit** | < £5 million in any 12-month period | ✓ Seeking < £1 million |
| **Lifetime limit** | < £12 million total EIS/VCT investment | ✓ First raise |
| **Permanent establishment** | Must have PE in UK | ✓ UK-based |
| **Trading requirement** | 80%+ qualifying trade | ✓ 100% software/SaaS |
| **Purpose** | Growth and development | ✓ Product development |
| **Risk-to-capital** | Genuine risk, not preservation | ✓ High-risk venture |

### 8.2 Excluded Activities Confirmation

We confirm Aerologue does **NOT** engage in:
- [ ] Dealing in land, commodities, or shares
- [ ] Banking, insurance, or money-lending
- [ ] Leasing (receiving royalties/license fees as main business)
- [ ] Legal or accountancy services
- [ ] Property development
- [ ] Farming, market gardening, or forestry
- [ ] Operating hotels, nursing homes, or residential care
- [ ] Generating electricity with Feed-in Tariffs
- [ ] Coal or steel production
- [ ] Shipbuilding

### 8.3 Control & Independence

| Requirement | Status |
|-------------|--------|
| Not controlled by another company | ✓ Independent |
| Not a subsidiary | ✓ Standalone |
| No arrangements for acquisition | ✓ None |
| Shares not listed on exchange | ✓ Private |

### 8.4 Use of Funds Attestation

The company confirms that EIS investment will be used:
- ✓ For the purpose of the qualifying trade
- ✓ To grow and develop the business
- ✓ Not to acquire shares in another company
- ✓ Not to repay debts not incurred for trade purposes
- ✓ Not for capital preservation

---

## Supporting Documentation Available Upon Request

1. Certificate of Incorporation
2. Memorandum and Articles of Association
3. Business Plan (detailed)
4. Technical Architecture Documentation
5. Financial Projections (3-year model)
6. Cap Table and Shareholder Information
7. Director CVs and Backgrounds

---

## Declaration

We confirm that the information provided in this document is accurate and complete to the best of our knowledge. Aerologue Ltd intends to apply for Advance Assurance under the Enterprise Investment Scheme and believes it meets all qualifying conditions.

**Signed:** ______________________
**Name:** ______________________
**Position:** Director
**Date:** ______________________

---

## Contact Information

**For HMRC Enquiries:**

Aerologue Ltd
[Registered Address]
[City, Postcode]

Email: [contact email]
Phone: [contact number]

---

*This document has been prepared for submission to HMRC as part of an EIS Advance Assurance application. It should be read in conjunction with the full business plan and technical documentation.*
