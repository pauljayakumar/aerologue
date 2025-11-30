# GDPR Compliance

**Document ID:** GDPR-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## GDPR-001.0 - Overview

This document outlines Aerologue's compliance with the General Data Protection Regulation (GDPR) for EU users.

### Applicability

GDPR applies to Aerologue because:
- We offer services to EU residents
- We process personal data of EU residents
- We may use EU-based infrastructure in the future

### Key GDPR Principles

| Principle | How Aerologue Complies |
|-----------|------------------------|
| Lawfulness, fairness, transparency | Clear consent, privacy policy, data practices disclosure |
| Purpose limitation | Data only used for stated purposes |
| Data minimization | Only collect necessary data |
| Accuracy | Users can update their data |
| Storage limitation | Defined retention periods, auto-deletion |
| Integrity and confidentiality | Encryption, access controls, auditing |
| Accountability | Documentation, DPO, audits |

---

## GDPR-002.0 - Legal Basis for Processing

### Data Processing Justifications

| Data Category | Legal Basis | Justification |
|---------------|-------------|---------------|
| Account data (email, name) | Contract | Required to provide service |
| Flight tracking history | Contract | Core service feature |
| Location data (in-flight) | Consent | Optional feature, explicit consent |
| Communication preferences | Consent | Marketing emails |
| Usage analytics | Legitimate interest | Service improvement |
| Payment data | Contract | Subscription processing |
| Support conversations | Contract | Service delivery |
| Security logs | Legitimate interest | Fraud prevention, security |

### Consent Management

```
Consent Collection Points:
├── Registration
│   ├── Terms of Service (required)
│   ├── Privacy Policy (required)
│   ├── Marketing emails (optional)
│   └── Location tracking (optional)
│
├── In-App
│   ├── Push notifications (optional)
│   ├── Share flight status (optional)
│   └── Profile visibility (optional)
│
└── Settings
    └── Granular consent management
```

### Consent Record Format

```json
{
  "userId": "user_123",
  "consents": [
    {
      "type": "marketing_emails",
      "granted": true,
      "timestamp": "2025-11-26T10:30:45Z",
      "version": "1.0",
      "ipAddress": "203.0.113.45",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "type": "location_tracking",
      "granted": false,
      "timestamp": "2025-11-26T10:30:45Z",
      "version": "1.0"
    }
  ]
}
```

---

## GDPR-003.0 - Data Subject Rights

### Rights Implementation

| Right | Implementation | Response Time |
|-------|----------------|---------------|
| Access (Art. 15) | Data export feature | 30 days |
| Rectification (Art. 16) | Profile editing | Immediate |
| Erasure (Art. 17) | Account deletion | 30 days |
| Restriction (Art. 18) | Account freeze option | 72 hours |
| Portability (Art. 20) | JSON/CSV export | 30 days |
| Object (Art. 21) | Marketing opt-out, analytics opt-out | 72 hours |
| Automated decisions (Art. 22) | Not applicable (no automated decisions) | N/A |

### Data Access Request (SAR) Process

```
User Request → Verify Identity → Gather Data → Review → Deliver
      │              │               │            │         │
      │              │               │            │         └── Within 30 days
      │              │               │            │
      │              │               │            └── Remove third-party data
      │              │               │
      │              │               └── All databases + backups
      │              │
      │              └── Confirm email + security questions
      │
      └── Via app settings or support@aerologue.app
```

### Data Export Format

```json
{
  "exportDate": "2025-11-26T10:30:45Z",
  "userId": "user_123",
  "profile": {
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2025-01-15T08:00:00Z"
  },
  "flightHistory": [
    {
      "flightId": "AA123",
      "trackedAt": "2025-11-20T14:30:00Z",
      "origin": "JFK",
      "destination": "LAX"
    }
  ],
  "crossings": [...],
  "greetings": [...],
  "preferences": {...},
  "consentHistory": [...]
}
```

---

## GDPR-004.0 - Data Retention

### Retention Schedule

| Data Type | Active Retention | Post-Deletion | Rationale |
|-----------|------------------|---------------|-----------|
| Account profile | Until deletion | 30 days grace | User recovery |
| Flight tracking history | 2 years | Immediate | Storage limits |
| Crossing records | 1 year | Anonymized | Gamification |
| Greetings/messages | 90 days | Immediate | Privacy |
| Session logs | 30 days | Immediate | Security |
| Audit logs | 1 year | Immediate | Compliance |
| Analytics (aggregated) | Indefinite | N/A | Not personal data |
| Backups | 30 days | N/A | Disaster recovery |

### Deletion Cascade Rules

See [DAT-006.0](data-dictionary.md#dat-0060---gdpr-enhancement) for detailed cascade rules.

```
User Deletion Request:
├── user_profiles → Hard delete
├── user_preferences → Hard delete
├── flight_tracking_sessions → Hard delete
├── crossing_participants → Anonymize (preserve for others)
├── crossing_messages → Anonymize sender
├── vlog_journeys → Hard delete (or transfer option)
├── gamification_scores → Anonymize
└── audit_logs → Retain with anonymized user reference
```

### Automated Deletion

```javascript
// Daily job for data retention enforcement
async function enforceRetention() {
  // Delete expired flight history (> 2 years)
  await db.query(`
    DELETE FROM flight_tracking_sessions
    WHERE created_at < NOW() - INTERVAL '2 years'
  `);

  // Delete expired messages (> 90 days)
  await db.query(`
    DELETE FROM crossing_messages
    WHERE created_at < NOW() - INTERVAL '90 days'
  `);

  // Complete pending account deletions (30 days grace)
  const pendingDeletions = await db.query(`
    SELECT user_id FROM deletion_requests
    WHERE requested_at < NOW() - INTERVAL '30 days'
    AND status = 'pending'
  `);

  for (const user of pendingDeletions) {
    await hardDeleteUser(user.user_id);
  }
}
```

---

## GDPR-005.0 - Data Processing Agreements

### Sub-Processors

| Sub-Processor | Purpose | Data Shared | DPA Status |
|---------------|---------|-------------|------------|
| AWS | Cloud infrastructure | All | Standard clauses |
| Stripe | Payment processing | Payment data | Stripe DPA |
| SendGrid | Email delivery | Email addresses | SendGrid DPA |
| ADS-B Exchange | Flight data | None (we consume) | N/A |
| Mapbox | Map tiles | Anonymized coords | Mapbox DPA |

### Data Transfer Safeguards

For transfers outside EEA:
- Standard Contractual Clauses (SCCs) with all processors
- AWS EU-US Data Privacy Framework certification
- Technical measures (encryption, pseudonymization)

---

## GDPR-006.0 - Privacy by Design

### Data Minimization Examples

| Feature | Data NOT Collected | Alternative |
|---------|-------------------|-------------|
| Flight tracking | Device location | Flight position from ADS-B |
| User profile | Address, DOB, gender | Only email + display name |
| Analytics | Individual behavior | Aggregated patterns |
| Crossings | Exact user positions | Flight proximity only |

### Pseudonymization

```
Public-Facing Data:
├── Display name (user-chosen, can be pseudonym)
├── User ID (opaque identifier)
└── Nationality (optional)

Internal Only:
├── Email address
├── Full name (optional)
└── Phone number (optional)
```

### Default Privacy Settings

```javascript
const defaultSettings = {
  profile: {
    visibility: 'private',        // Not 'public'
    showNationality: false,
    showAirlinePreference: false
  },
  communications: {
    marketingEmails: false,       // Opt-in required
    pushNotifications: true,      // Service-related only
    greetingsFromStrangers: false // Connections only
  },
  data: {
    shareFlightHistory: false,
    includeInLeaderboards: true,  // Anonymized
    analyticsOptIn: false         // Opt-in for detailed
  }
};
```

---

## GDPR-007.0 - Breach Notification

### Breach Classification

| Severity | Definition | Examples |
|----------|------------|----------|
| High | PII exposed, many users affected | Database leak, credential stuffing |
| Medium | Limited PII, few users | Single account compromise |
| Low | No PII, operational data only | Logs exposed (no user data) |

### Notification Timeline

```
Breach Detected
      │
      ├──▶ Immediate: Contain breach
      │
      ├──▶ 24 hours: Internal assessment complete
      │         └── Severity determined
      │         └── Scope identified
      │
      ├──▶ 72 hours: Authority notification (if required)
      │         └── Supervisory authority in lead country
      │         └── Only if "risk to rights and freedoms"
      │
      └──▶ Without undue delay: User notification (if required)
                └── If "high risk to rights and freedoms"
                └── Clear, plain language
                └── Describe nature of breach
                └── Provide contact point
                └── Describe likely consequences
                └── Describe measures taken
```

### Breach Notification Template

```
Subject: Important Security Notice from Aerologue

Dear [User],

We are writing to inform you of a security incident that may have
affected your Aerologue account.

What happened:
[Description of the breach]

What information was involved:
[List of affected data types]

What we are doing:
[Actions taken to address the breach]

What you can do:
[Recommended user actions]

For more information:
Contact our Data Protection Officer at dpo@aerologue.app

We sincerely apologize for any inconvenience this may cause.

The Aerologue Team
```

---

## GDPR-008.0 - Data Protection Officer

### DPO Contact

```
Data Protection Officer
Email: dpo@aerologue.app
Response time: 72 hours (business days)
```

### DPO Responsibilities

- Monitor GDPR compliance
- Advise on data protection obligations
- Cooperate with supervisory authorities
- Handle data subject requests
- Conduct privacy impact assessments

---

## GDPR-009.0 - Privacy Impact Assessment (PIA)

### When PIA Required

- New features involving personal data
- Changes to data processing purposes
- New third-party integrations
- Changes to data retention
- New profiling or automated decisions

### PIA Template

```markdown
## Privacy Impact Assessment

**Feature:** [Feature name]
**Date:** [Date]
**Assessor:** [Name]

### 1. Description
[What does this feature do?]

### 2. Personal Data Involved
| Data Element | Necessity | Sensitivity |
|--------------|-----------|-------------|
| ... | ... | ... |

### 3. Processing Purpose
[Why is this processing necessary?]

### 4. Legal Basis
[Contract / Consent / Legitimate Interest]

### 5. Risks Identified
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ... | ... | ... | ... |

### 6. Data Minimization
[How is data collection minimized?]

### 7. User Rights
[How are user rights addressed?]

### 8. Recommendation
[ ] Approve
[ ] Approve with conditions
[ ] Reject

### 9. Sign-off
DPO: _____________ Date: _______
```

---

## GDPR-010.0 - Cookie Policy

### Cookie Categories

| Category | Purpose | Consent Required |
|----------|---------|------------------|
| Essential | Authentication, security | No |
| Functional | User preferences | No |
| Analytics | Usage patterns | Yes |
| Marketing | Targeted ads | Yes (if applicable) |

### Cookies Used

| Cookie Name | Category | Purpose | Duration |
|-------------|----------|---------|----------|
| `session_id` | Essential | Session management | Session |
| `auth_token` | Essential | Authentication | 1 hour |
| `refresh_token` | Essential | Token refresh | 30 days |
| `theme` | Functional | Dark/light mode | 1 year |
| `language` | Functional | UI language | 1 year |
| `_ga` | Analytics | Google Analytics | 2 years |

### Cookie Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  We use cookies to improve your experience.                     │
│                                                                  │
│  Essential cookies are required for the site to function.       │
│  Optional cookies help us understand how you use Aerologue.     │
│                                                                  │
│  [Accept All]  [Essential Only]  [Customize]                    │
│                                                                  │
│  Learn more in our Privacy Policy                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## GDPR-011.0 - Third-Party Data Sharing

### Data Sharing Summary

| Recipient | Data Shared | Purpose | Legal Basis |
|-----------|-------------|---------|-------------|
| Stripe | Payment info | Payments | Contract |
| SendGrid | Email | Notifications | Contract |
| Google Analytics | Anonymized usage | Analytics | Consent |
| Mapbox | Anonymized locations | Maps | Contract |

### No Data Selling

Aerologue does NOT:
- Sell personal data to third parties
- Share data for advertising purposes
- Provide data to data brokers
- Use data for profiling beyond service delivery

---

## GDPR-012.0 - Technical Measures

### Security Controls for GDPR

| Requirement | Implementation |
|-------------|----------------|
| Encryption at rest | AES-256 via AWS KMS |
| Encryption in transit | TLS 1.3 |
| Access control | RBAC, least privilege |
| Audit logging | All PII access logged |
| Pseudonymization | User IDs instead of emails |
| Data isolation | Multi-tenant security |
| Backup encryption | Encrypted snapshots |

### Access to Personal Data

```
PII Access Requirements:
├── Authentication: MFA required
├── Authorization: Role-based + resource-level
├── Audit: All access logged
├── Justification: Business need documented
└── Review: Quarterly access reviews
```

---

## References

- [SEC-001.0](security-architecture.md) - Security Architecture
- [DAT-006.0](data-dictionary.md#dat-0060) - Data Retention Rules
- GDPR Full Text: https://gdpr-info.eu/
- ICO Guidance: https://ico.org.uk/for-organisations/
