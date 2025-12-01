# Intellectual Property Strategy for Aerologue

**Document ID:** IP-001.0
**Date:** November 2025
**Classification:** Confidential

---

## Executive Summary

This document analyses Aerologue's technology portfolio and identifies opportunities for intellectual property protection. While software patents are challenging in the UK/EU, several innovative aspects of Aerologue may qualify for protection through patents, trade secrets, trademarks, and strategic measures.

---

## 1. IP Protection Options Overview

| Protection Type | What It Protects | Duration | Cost (UK) | Relevance to Aerologue |
|-----------------|------------------|----------|-----------|------------------------|
| **Patent** | Novel technical inventions | 20 years | £4,000-15,000+ | Medium - specific algorithms |
| **Trade Secret** | Confidential business info | Indefinite | Low (process cost) | High - algorithms, methods |
| **Trademark** | Brand names, logos | 10 years (renewable) | £170-500+ | High - branding |
| **Copyright** | Code, documentation | 70 years after death | Automatic | High - all code |
| **Design Right** | Visual appearance | 15-25 years | £0-£60 | Medium - UI elements |
| **Database Right** | Database structure | 15 years | Automatic | Medium - data compilations |

---

## 2. Patentable Innovations Analysis

### 2.1 Flight Crossing Detection System

**Description:**
Real-time algorithmic detection of proximity between aircraft carrying app users, using:
- GeoHash spatial indexing for efficient proximity queries
- Multi-dimensional filtering (horizontal ≤20 miles, vertical ≤5,000 feet)
- Flight phase awareness (only cruise phase)
- Sub-10-second detection latency at global scale

**Patentability Assessment:**

| Criterion | Assessment | Notes |
|-----------|------------|-------|
| Novelty | **Strong** | No known consumer app does this |
| Inventive Step | **Medium-Strong** | Combination of known techniques in novel application |
| Industrial Application | **Strong** | Clear commercial use case |
| Technical Effect | **Medium** | Solves technical problem but uses standard algorithms |

**Recommendation:** **Consider Patent Application**

This is the strongest candidate for patent protection. The novel combination of:
1. Real-time geospatial aircraft proximity detection
2. User-centric (not aircraft-centric) matching
3. Context-aware filtering (flight phase, altitude differential)
4. Integration with social messaging system

**Prior Art Risk:** Air traffic control systems detect proximity, but for safety (TCAS), not social features. Consumer flight apps track aircraft but don't detect user-to-user crossings.

**Estimated Cost (UK Patent):**
- Drafting & filing: £3,000-6,000
- Prosecution: £2,000-4,000
- Grant fees: £500-1,000
- **Total UK: £5,500-11,000**

**International Extension (PCT):**
- PCT filing: £3,000-5,000
- National phase (per country): £2,000-5,000 each
- Recommended countries: UK, EU (EPO), US
- **Total with UK + EU + US: £20,000-40,000**

---

### 2.2 Altitude-Aware Adaptive Map System

**Description:**
Multi-layer map rendering that automatically adapts to:
- Aircraft altitude (cruise vs ground)
- Connectivity quality (none/poor/good/excellent)
- Cached vs live tile availability
- Hysteresis logic to prevent rapid switching

**Patentability Assessment:**

| Criterion | Assessment | Notes |
|-----------|------------|-------|
| Novelty | **Medium** | Offline maps exist, but altitude-awareness is novel |
| Inventive Step | **Medium** | Clever combination, but each element is known |
| Technical Effect | **Strong** | Solves real technical problem (bandwidth at altitude) |

**Recommendation:** **Trade Secret (Preferred) + Consider Patent**

The specific thresholds, switching logic, and hysteresis parameters are valuable but harder to patent than the crossing detection. Better protected as trade secret, but could file defensive patent.

**Estimated Cost (if patenting):** £5,000-10,000 (UK only)

---

### 2.3 Client-Side Position Interpolation Algorithm

**Description:**
Smooth aircraft animation between 10-second server updates using:
- Dead reckoning based on heading and speed
- Delta-time-based frame-rate-independent movement
- Correction lerping when actual position received
- Different correction factors for moving vs stationary aircraft

**Patentability Assessment:**

| Criterion | Assessment | Notes |
|-----------|------------|-------|
| Novelty | **Low-Medium** | Interpolation is common in games/mapping |
| Inventive Step | **Low** | Standard game development technique |
| Technical Effect | **Strong** | Smooth UX, reduces bandwidth |

**Recommendation:** **Trade Secret Only**

This is standard game/animation engineering. Not patentable, but the specific parameters and tuning are valuable trade secrets.

**Cost:** £0 (document internally)

---

### 2.4 Context-Aware Data Filtering Protocol

**Description:**
Server-side per-user data filtering based on:
- User's current feature context (map, tracking, gaming, greetings)
- Geographic viewport (bounding box)
- Subscription-based channel model

**Patentability Assessment:**

| Criterion | Assessment | Notes |
|-----------|------------|-------|
| Novelty | **Low** | Subscription/filtering is common in WebSocket apps |
| Inventive Step | **Low** | Standard distributed systems pattern |

**Recommendation:** **Trade Secret Only**

The specific filter logic and context categories are trade secrets, not patentable.

---

### 2.5 Multi-Provider ETL Data Normalisation Pipeline

**Description:**
Pipeline that:
- Aggregates data from multiple ADS-B providers
- Normalises different field names to unified schema
- Deduplicates by ICAO24 + timestamp
- Routes to appropriate database (Timestream, Aurora, DynamoDB)

**Patentability Assessment:**

| Criterion | Assessment | Notes |
|-----------|------------|-------|
| Novelty | **Low** | ETL is a mature field |
| Inventive Step | **Low** | Standard data engineering |

**Recommendation:** **Trade Secret Only**

The specific field mappings and provider configurations are trade secrets.

---

## 3. Trade Secret Protection

### 3.1 Candidates for Trade Secret Protection

| Asset | Value | Risk of Reverse Engineering | Recommendation |
|-------|-------|----------------------------|----------------|
| Crossing detection algorithm parameters | High | Medium (could be inferred) | Trade secret + patent |
| Altitude thresholds for map switching | Medium | Low | Trade secret |
| Interpolation correction factors | Medium | Medium | Trade secret |
| GeoHash cell size optimisation | Medium | Low | Trade secret |
| API provider configurations | High | Very Low | Trade secret |
| Quiz/factoid generation prompts | Medium | Low | Trade secret |
| Scoring/gamification formulas | Medium | Medium | Trade secret |

### 3.2 Trade Secret Protection Measures

**Required Actions:**

1. **Documentation** (Cost: Internal time)
   - Identify and catalog all trade secrets
   - Mark documents as "CONFIDENTIAL - TRADE SECRET"
   - Maintain register of trade secrets

2. **Access Controls** (Cost: ~£0-500)
   - Need-to-know access to algorithm details
   - Separate repositories for sensitive code
   - Code review policies for algorithm changes

3. **Contractual Protection** (Cost: £500-2,000 legal fees)
   - NDA template for all contractors
   - Employment contract IP clauses
   - Offshore team contractor agreements with:
     - IP assignment
     - Confidentiality obligations
     - Non-compete (where enforceable)

4. **Technical Measures** (Cost: ~£0-500)
   - Obfuscation of key algorithms in client code
   - Server-side execution of sensitive logic
   - API rate limiting to prevent scraping

**Total Trade Secret Protection Cost: £1,000-3,000**

---

## 4. Trademark Protection

### 4.1 Recommended Trademarks

| Mark | Type | Priority | Class | Cost (UK) |
|------|------|----------|-------|-----------|
| **AEROLOGUE** | Word | High | 9, 42 | £170 (1 class) + £50 per additional |
| **Aerologue Logo** | Device | High | 9, 42 | £170 + £50 |
| **Greetings Between Planes** | Word | Medium | 9 | £170 |
| **[App Icon]** | Device | Medium | 9 | £170 |

**Classes:**
- Class 9: Software, mobile applications, downloadable software
- Class 42: Software as a service, cloud computing services

### 4.2 Trademark Costs

**UK Registration:**
- 1 mark, 1 class: £170
- Each additional class: £50
- **Recommended package (2 marks, 2 classes): £490**

**EU Registration (EUIPO):**
- 1 mark, 1 class: €850
- Each additional class: €50
- **Recommended package (2 marks, 2 classes): €1,950 (~£1,700)**

**US Registration (USPTO):**
- 1 mark, 1 class: $250-350
- Each additional class: $250-350
- **Recommended package (2 marks, 2 classes): $1,500-2,100 (~£1,200-1,700)**

**Total Trademark Budget (UK + EU + US):** £3,400-3,900

---

## 5. Copyright Protection

### 5.1 Automatic Protection

Copyright automatically protects:
- All source code (web, mobile, backend)
- Documentation
- UI designs and graphics
- Database schemas
- API specifications

**No registration required in UK.** US registration ($45-65 per work) provides additional enforcement benefits.

### 5.2 Copyright Notices

Add to all source files:
```
© 2025 Aerologue Ltd. All rights reserved.
```

**Cost:** £0 (internal process)

---

## 6. Design Rights

### 6.1 Candidates for Design Protection

| Design Element | Type | Recommendation |
|----------------|------|----------------|
| App icon | Registered | Consider if distinctive |
| UI layout | Unregistered | Automatic (UK) |
| Aircraft icon set | Unregistered | Automatic (UK) |
| Map styling | Unregistered | Automatic (UK) |

### 6.2 Registered Design Costs (UK)

- Single design: £60
- Up to 10 designs: £60 total
- **Recommended: Register app icon and key UI elements: £60**

---

## 7. Database Rights

Aerologue may generate protectable databases:
- Curated airport data (if enhanced beyond source)
- AI-generated quiz/factoid database
- User-generated crossing history (aggregated)

**Protection:** Automatic in UK/EU if substantial investment in compilation.

**Recommendation:** Document investment in database creation for evidence.

---

## 8. Summary & Recommendations

### 8.1 Priority IP Actions

| Priority | Action | Cost | Timeline |
|----------|--------|------|----------|
| **P0** | Trademark "AEROLOGUE" (UK) | £220 | Week 1 |
| **P0** | NDA/IP contracts for offshore team | £1,500 | Week 1 |
| **P0** | Trade secret register & policies | £500 | Week 2 |
| **P1** | Trademark "AEROLOGUE" (EU + US) | £2,900 | Month 1-2 |
| **P1** | Patent search: Crossing Detection | £1,500 | Month 1 |
| **P2** | Patent application: Crossing Detection (UK) | £6,000 | Month 2-3 |
| **P2** | Register app icon design | £60 | Month 2 |
| **P3** | Patent application: Crossing Detection (EU/US) | £20,000+ | Month 6+ |

### 8.2 Total IP Protection Budget

| Phase | Actions | Cost |
|-------|---------|------|
| **Immediate (Month 1)** | UK trademark, contracts, trade secrets | £2,200-3,200 |
| **Short-term (Months 2-3)** | EU/US trademarks, UK patent, design | £9,000-12,000 |
| **Medium-term (Months 6-12)** | International patents (if viable) | £20,000-40,000 |

**Recommended Minimum Budget: £11,000-15,000**
**Full Protection Budget: £30,000-55,000**

### 8.3 What Makes Aerologue Defensible

Even without patents, Aerologue has defensible advantages:

1. **First-Mover Advantage**
   - Building as the connectivity window opens
   - Brand recognition before competitors enter

2. **Trade Secrets**
   - Algorithm parameters tuned through experimentation
   - Not visible to competitors

3. **Network Effects**
   - Value increases with users (more crossings)
   - Hard to replicate with a smaller user base

4. **Data Moat**
   - Historical crossing data
   - Quiz/factoid content library
   - User-generated vlog content

5. **Brand & Trust**
   - Trademarks protect brand identity
   - First to market = top search results

---

## 9. IP Strategy for EIS

For EIS purposes, the IP approach demonstrates:

1. **Risk Awareness** - We understand IP is critical
2. **Defensibility** - Multiple layers of protection
3. **Investment Use** - Funds allocated to IP (qualifying expenditure)
4. **Growth Orientation** - IP enables licensing/B2B revenue

**Recommended addition to EIS documentation:**
- Reference this IP strategy in business plan
- Include IP costs in "Use of Funds"

---

## Appendix A: Patent Claim Draft (Crossing Detection)

**Title:** System and Method for Detecting and Facilitating Social Interactions Between Users on Proximate Aircraft

**Abstract:**
A computer-implemented system for detecting when users of a mobile application are travelling on aircraft that are in proximity to each other, and enabling real-time social interactions between those users. The system utilises geospatial indexing, multi-dimensional proximity filtering, and flight phase detection to identify crossing events, and provides a real-time communication channel for users to exchange messages during the crossing window.

**Key Claims (Draft):**

1. A computer-implemented method for detecting aircraft proximity events between application users, comprising:
   - receiving position data for a plurality of aircraft;
   - identifying aircraft with active application users;
   - computing geospatial indexes for user aircraft positions;
   - determining proximity based on horizontal distance threshold and vertical distance threshold;
   - filtering by flight phase to include only aircraft in cruise phase;
   - generating a crossing event when thresholds are satisfied;
   - notifying users on both aircraft of the crossing event in real-time.

2. The method of claim 1, wherein the geospatial indexing uses GeoHash partitioning to reduce computational complexity.

3. The method of claim 1, further comprising enabling users to exchange messages scoped to the crossing event.

---

## Appendix B: Action Checklist

**Immediate (Week 1-2):**
- [ ] File UK trademark for AEROLOGUE
- [ ] Update all contractor agreements with IP assignment clauses
- [ ] Create trade secret register
- [ ] Add copyright notices to all code files
- [ ] Brief offshore team on confidentiality obligations

**Month 1:**
- [ ] File EU trademark application
- [ ] File US trademark application (via Madrid Protocol or direct)
- [ ] Commission patent search for crossing detection
- [ ] Document trade secrets formally

**Month 2-3:**
- [ ] Review patent search results
- [ ] Decision on UK patent filing
- [ ] Register app icon design (UK)

**Month 6+:**
- [ ] If UK patent progresses, consider PCT for international protection
- [ ] Monitor for infringement
- [ ] Update IP register quarterly

---

*This document should be reviewed by a qualified IP attorney before taking action.*
