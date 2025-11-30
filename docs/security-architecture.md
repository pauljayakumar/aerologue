# Security Architecture

**Document ID:** SEC-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## SEC-001.0 - Security Overview

### Security Principles

1. **Defense in Depth** - Multiple layers of security controls
2. **Least Privilege** - Minimum permissions required
3. **Zero Trust** - Verify everything, trust nothing
4. **Secure by Default** - Security enabled out of the box
5. **Encrypt Everything** - Data protected at rest and in transit

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        PERIMETER                                 │
│   WAF │ DDoS Protection │ Rate Limiting │ Geo Blocking          │
├─────────────────────────────────────────────────────────────────┤
│                        NETWORK                                   │
│   VPC │ Security Groups │ NACLs │ Private Subnets               │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION                               │
│   Authentication │ Authorization │ Input Validation             │
├─────────────────────────────────────────────────────────────────┤
│                        DATA                                      │
│   Encryption │ Access Control │ Audit Logging                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## SEC-002.0 - Authentication

### Authentication Flow

```
┌─────────┐         ┌───────────┐         ┌─────────┐
│ Client  │         │  Cognito  │         │   API   │
└────┬────┘         └─────┬─────┘         └────┬────┘
     │                    │                    │
     │  1. Login request  │                    │
     │ (email/password)   │                    │
     │───────────────────▶│                    │
     │                    │                    │
     │  2. Verify creds   │                    │
     │    + MFA check     │                    │
     │◀───────────────────│                    │
     │                    │                    │
     │  3. Return tokens  │                    │
     │  (access, refresh, │                    │
     │   id token)        │                    │
     │◀───────────────────│                    │
     │                    │                    │
     │  4. API request with access token       │
     │─────────────────────────────────────────▶
     │                    │                    │
     │                    │  5. Validate token │
     │                    │◀───────────────────│
     │                    │                    │
     │                    │  6. Return claims  │
     │                    │───────────────────▶│
     │                    │                    │
     │  7. API response                        │
     │◀────────────────────────────────────────│
```

### Token Configuration

| Token Type | Lifetime | Storage | Refresh |
|------------|----------|---------|---------|
| Access Token | 1 hour | Memory only | Via refresh token |
| Refresh Token | 30 days | Secure storage | Single use, rotation |
| ID Token | 1 hour | Memory only | Via refresh token |

### Password Policy

```
Minimum Requirements:
├── Length: 12+ characters
├── Uppercase: At least 1
├── Lowercase: At least 1
├── Numbers: At least 1
├── Special: At least 1 (!@#$%^&*...)
└── Not in breach database

Restrictions:
├── No common passwords
├── No personal info (email, name)
├── No sequential patterns (123, abc)
└── No repeated characters (aaa, 111)
```

### Multi-Factor Authentication (MFA)

| Method | Security Level | User Experience |
|--------|----------------|-----------------|
| TOTP App (required) | High | Medium |
| SMS (fallback) | Medium | Easy |
| Email OTP (fallback) | Medium | Easy |

### Social Login (OAuth 2.0)

Supported providers:
- Google
- Apple
- Facebook (optional)

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│ Provider │────▶│ Cognito │────▶│ Backend │
└─────────┘     └──────────┘     └─────────┘     └─────────┘
     │                │                │               │
     │ 1. Initiate    │                │               │
     │────────────────▶                │               │
     │                │                │               │
     │ 2. Redirect to │                │               │
     │    provider    │                │               │
     │◀───────────────│                │               │
     │                │                │               │
     │ 3. User login  │                │               │
     │───────────────▶│                │               │
     │                │                │               │
     │ 4. Auth code   │                │               │
     │◀───────────────│                │               │
     │                │                │               │
     │ 5. Exchange code for tokens     │               │
     │─────────────────────────────────▶               │
     │                                 │               │
     │ 6. Create/link user             │               │
     │                                 │──────────────▶│
     │                                 │               │
     │ 7. Return Cognito tokens        │               │
     │◀────────────────────────────────│               │
```

---

## SEC-003.0 - Authorization

### Role-Based Access Control (RBAC)

| Role | Description | Permissions |
|------|-------------|-------------|
| `guest` | Unauthenticated user | View public flights, play games |
| `user` | Registered user | Track flights, send greetings, participate in crossings |
| `premium` | Paid subscriber | All user features + premium content |
| `admin` | System administrator | Full access + admin console |
| `moderator` | Content moderator | Review vlogs, manage reports |

### Permission Matrix

| Resource | Guest | User | Premium | Admin |
|----------|-------|------|---------|-------|
| View public flights | ✓ | ✓ | ✓ | ✓ |
| Track flights | ✓ (3 max) | ✓ (10 max) | ✓ (unlimited) | ✓ |
| View own profile | - | ✓ | ✓ | ✓ |
| Edit own profile | - | ✓ | ✓ | ✓ |
| Send greetings | - | ✓ | ✓ | ✓ |
| Create vlogs | - | ✓ | ✓ | ✓ |
| Premium features | - | - | ✓ | ✓ |
| View all users | - | - | - | ✓ |
| Manage content | - | - | - | ✓ |
| System configuration | - | - | - | ✓ |

### Attribute-Based Access Control (ABAC)

For fine-grained control beyond roles:

```javascript
// Example: Can user view this vlog?
function canViewVlog(user, vlog) {
  // Public vlogs - anyone
  if (vlog.visibility === 'public') return true;

  // Own vlogs - always
  if (vlog.creatorId === user.id) return true;

  // Followers only
  if (vlog.visibility === 'followers') {
    return user.following.includes(vlog.creatorId);
  }

  // Private - only creator
  return false;
}

// Example: Can user send greeting to this user?
function canSendGreeting(sender, recipient, crossing) {
  // Must be part of same crossing
  if (!crossing.participants.includes(sender.id)) return false;
  if (!crossing.participants.includes(recipient.id)) return false;

  // Check blocking
  if (recipient.blockedUsers.includes(sender.id)) return false;

  // Check rate limits
  if (sender.greetingsSentToday >= sender.dailyLimit) return false;

  return true;
}
```

---

## SEC-004.0 - Data Protection

### Encryption at Rest

| Data Store | Encryption | Key Management |
|------------|------------|----------------|
| Aurora PostgreSQL | AES-256 | AWS KMS |
| DynamoDB | AES-256 | AWS KMS |
| S3 | AES-256 (SSE-S3) | AWS managed |
| ElastiCache | AES-256 | AWS KMS |
| Timestream | AES-256 | AWS managed |

### Encryption in Transit

```
All connections use TLS 1.3 (minimum TLS 1.2)

Client ←──TLS──▶ CloudFront ←──TLS──▶ API Gateway ←──TLS──▶ Lambda
                                                              │
                                              ┌───────────────┼───────────────┐
                                              │               │               │
                                              ▼               ▼               ▼
                                          Aurora          DynamoDB      ElastiCache
                                         (TLS)            (TLS)          (TLS)
```

### Sensitive Data Handling

| Data Type | Classification | Protection |
|-----------|----------------|------------|
| Passwords | Critical | Never stored (hashed with Argon2) |
| Auth tokens | Critical | Short-lived, secure storage |
| Email addresses | PII | Encrypted, access logged |
| Phone numbers | PII | Encrypted, access logged |
| Location history | PII | Encrypted, user-controlled retention |
| Payment data | PCI | Not stored (Stripe handles) |
| Messages | Private | Encrypted at rest |

### Data Masking

```javascript
// API responses mask sensitive data
{
  "user": {
    "id": "user_123",
    "email": "j***@example.com",      // Masked
    "phone": "+1 ***-***-4567",       // Masked
    "fullName": "John D.",            // Abbreviated
    "createdAt": "2025-01-15"
  }
}

// Admin API shows full data (with audit logging)
{
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "phone": "+1 555-123-4567",
    "fullName": "John Doe",
    "createdAt": "2025-01-15T10:30:45Z"
  }
}
```

---

## SEC-005.0 - API Security

### Rate Limiting

| Endpoint Category | Limit | Window | Action on Exceed |
|-------------------|-------|--------|------------------|
| Authentication | 5 requests | 1 minute | Block 15 minutes |
| Password reset | 3 requests | 1 hour | Block 1 hour |
| General API (guest) | 60 requests | 1 minute | 429 response |
| General API (user) | 300 requests | 1 minute | 429 response |
| WebSocket messages | 60 messages | 1 minute | Disconnect |
| File uploads | 10 uploads | 1 hour | 429 response |

### Input Validation

```javascript
// All input validated at API Gateway + Lambda

// Flight ID validation
const flightIdSchema = Joi.string()
  .pattern(/^[A-Z]{2,3}\d{1,4}[A-Z]?$/)
  .required();

// Coordinates validation
const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

// Message validation (prevent injection)
const messageSchema = Joi.string()
  .max(500)
  .pattern(/^[\p{L}\p{N}\p{P}\p{S}\p{Z}]+$/u)  // Unicode safe
  .required();
```

### OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| A01 - Broken Access Control | RBAC, ABAC, resource-level checks |
| A02 - Cryptographic Failures | TLS 1.3, KMS encryption, no weak algorithms |
| A03 - Injection | Parameterized queries, input validation |
| A04 - Insecure Design | Threat modeling, security reviews |
| A05 - Security Misconfiguration | IaC, automated security scanning |
| A06 - Vulnerable Components | Dependency scanning, auto-updates |
| A07 - Auth Failures | MFA, secure sessions, rate limiting |
| A08 - Data Integrity Failures | Code signing, integrity checks |
| A09 - Logging Failures | Comprehensive audit logging |
| A10 - SSRF | Input validation, allowlists |

### Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.aerologue.app;
  style-src 'self' 'unsafe-inline' https://cdn.aerologue.app;
  img-src 'self' https://cdn.aerologue.app https://*.tile.openstreetmap.org data:;
  font-src 'self' https://cdn.aerologue.app;
  connect-src 'self' https://api.aerologue.app wss://ws.aerologue.app;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
```

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

---

## SEC-006.0 - Infrastructure Security

### VPC Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PUBLIC SUBNET                           │  │
│  │   NAT Gateway │ ALB (if needed) │ Bastion (if needed)     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PRIVATE SUBNET                          │  │
│  │   Lambda │ API Gateway VPC Link                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ISOLATED SUBNET                         │  │
│  │   Aurora │ ElastiCache │ No internet access               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Security Groups

| Security Group | Inbound | Outbound |
|----------------|---------|----------|
| `sg-lambda` | None | All (databases, external APIs) |
| `sg-aurora` | 5432 from sg-lambda | None |
| `sg-redis` | 6379 from sg-lambda | None |
| `sg-bastion` | 22 from admin IPs only | All |

### WAF Rules

```
Rule Priority Order:
1. AWS Managed - Known Bad Inputs
2. AWS Managed - Anonymous IP List
3. AWS Managed - Common Rule Set
4. Custom - Rate Limiting (IP-based)
5. Custom - Geo Blocking (if needed)
6. Custom - SQL Injection Patterns
7. Custom - XSS Patterns
```

### DDoS Protection

- AWS Shield Standard (included)
- CloudFront with caching
- API Gateway throttling
- Lambda concurrency limits
- Auto-scaling policies

---

## SEC-007.0 - Secrets Management

### AWS Secrets Manager

| Secret | Rotation | Access |
|--------|----------|--------|
| Database credentials | 30 days (auto) | Lambda execution role |
| API keys (external) | 90 days (manual) | Lambda execution role |
| JWT signing keys | 90 days (manual) | Cognito, Lambda |
| Encryption keys | Never (KMS managed) | Specific roles |

### Environment Variables

```
NEVER store in environment variables:
✗ Database passwords
✗ API keys
✗ JWT secrets
✗ Encryption keys

OK to store:
✓ Database hostnames
✓ API endpoints
✓ Feature flags
✓ Log levels
```

### Secret Access Pattern

```javascript
// Lambda function accessing secrets
const { SecretsManager } = require('@aws-sdk/client-secrets-manager');

let cachedSecret = null;

async function getDbCredentials() {
  if (cachedSecret) return cachedSecret;

  const client = new SecretsManager();
  const response = await client.getSecretValue({
    SecretId: 'aerologue/db/credentials'
  });

  cachedSecret = JSON.parse(response.SecretString);
  return cachedSecret;
}
```

---

## SEC-008.0 - Audit Logging

### What We Log

| Event Category | Examples | Retention |
|----------------|----------|-----------|
| Authentication | Login, logout, MFA, password change | 1 year |
| Authorization | Permission denials, role changes | 1 year |
| Data Access | PII reads, exports | 1 year |
| Data Modification | Create, update, delete | 90 days |
| Admin Actions | Config changes, user management | 1 year |
| Security Events | Failed logins, suspicious activity | 1 year |

### Audit Log Format

```json
{
  "timestamp": "2025-11-26T10:30:45.123Z",
  "eventType": "AUTH_LOGIN_SUCCESS",
  "actor": {
    "userId": "user_123",
    "ip": "203.0.113.45",
    "userAgent": "Mozilla/5.0...",
    "geoLocation": "Sydney, AU"
  },
  "resource": {
    "type": "user_session",
    "id": "session_abc123"
  },
  "action": "create",
  "result": "success",
  "metadata": {
    "mfaUsed": true,
    "loginMethod": "password"
  }
}
```

### CloudTrail Configuration

```
Enabled for:
├── Management events (all)
├── Data events
│   ├── S3 (object-level)
│   ├── Lambda (invocations)
│   └── DynamoDB (item-level)
├── Insights (anomaly detection)
└── Log file validation (integrity)

Destination: S3 bucket with versioning + MFA delete
Encryption: KMS
```

---

## SEC-009.0 - Incident Response

### Security Incident Categories

| Category | Examples | Response Time |
|----------|----------|---------------|
| Critical | Data breach, system compromise | Immediate |
| High | Suspicious admin access, mass auth failures | 1 hour |
| Medium | Individual account compromise | 4 hours |
| Low | Policy violation, minor vulnerability | 24 hours |

### Incident Response Playbook

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DETECT                                                       │
│     - GuardDuty alert                                           │
│     - CloudWatch anomaly                                        │
│     - User report                                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. CONTAIN                                                      │
│     - Isolate affected resources                                │
│     - Revoke compromised credentials                            │
│     - Block malicious IPs                                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. INVESTIGATE                                                  │
│     - Collect logs (CloudTrail, CloudWatch)                     │
│     - Analyze attack vector                                     │
│     - Determine scope of breach                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. ERADICATE                                                    │
│     - Remove malicious access                                   │
│     - Patch vulnerabilities                                     │
│     - Reset affected credentials                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. RECOVER                                                      │
│     - Restore from clean backups                                │
│     - Monitor for recurrence                                    │
│     - Communicate with affected users                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. LEARN                                                        │
│     - Conduct postmortem                                        │
│     - Update security controls                                  │
│     - Document lessons learned                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Breach Response

If user data is compromised:

1. **Immediate** (< 1 hour)
   - Contain the breach
   - Notify security team
   - Preserve evidence

2. **Short-term** (< 24 hours)
   - Assess scope and impact
   - Notify legal/compliance
   - Prepare communication

3. **Within 72 hours** (GDPR requirement)
   - Notify supervisory authority
   - Notify affected users
   - Document everything

---

## SEC-010.0 - Vulnerability Management

### Security Scanning

| Scan Type | Tool | Frequency |
|-----------|------|-----------|
| Dependency vulnerabilities | Snyk, npm audit | Every CI build |
| Container scanning | AWS ECR scanning | Every push |
| Infrastructure scanning | AWS Inspector | Weekly |
| Web app scanning | OWASP ZAP | Weekly |
| Penetration testing | External firm | Annually |

### Vulnerability Response SLAs

| Severity | CVSS Score | Response Time | Fix Time |
|----------|------------|---------------|----------|
| Critical | 9.0 - 10.0 | 4 hours | 24 hours |
| High | 7.0 - 8.9 | 24 hours | 7 days |
| Medium | 4.0 - 6.9 | 7 days | 30 days |
| Low | 0.1 - 3.9 | 30 days | 90 days |

### Dependency Update Policy

```
Automated (Dependabot):
├── Security patches: Auto-merge if tests pass
├── Minor versions: Review + merge weekly
└── Major versions: Review + test thoroughly

Manual review required:
├── Breaking changes
├── Critical dependencies (auth, crypto)
└── Unfamiliar maintainers
```

---

## SEC-011.0 - Compliance

### Compliance Requirements

| Framework | Status | Notes |
|-----------|--------|-------|
| GDPR | Required | EU users |
| CCPA | Required | California users |
| SOC 2 | Future | When B2B features added |
| PCI DSS | N/A | Stripe handles payments |

### Security Controls Mapping

See [GDPR Compliance](gdpr-compliance.md) for detailed controls.

---

## References

- [ARC-008.0](aws-architecture.md#arc-0080---security) - AWS Security Configuration
- [MON-010.0](monitoring-alerting.md#mon-0100---security-monitoring) - Security Monitoring
- [ERR-001.0](error-handling.md) - Error Handling (security considerations)
- AWS Well-Architected: Security Pillar
- OWASP Application Security Verification Standard (ASVS)
