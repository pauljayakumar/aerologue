# AWS Infrastructure Setup

**Document ID:** AWS-SETUP-001.0
**Last Updated:** 2025-11-27
**Status:** Active

This document records the AWS infrastructure provisioned for Aerologue.

---

## Account Information

| Item | Value |
|------|-------|
| AWS Region | `us-east-1` |
| Account ID | `379383214093` |

---

## Route53 - DNS

### Hosted Zones

| Domain | Zone ID | Purpose |
|--------|---------|---------|
| aerologue.com | `Z08926321NCBV44AMA9KL` | Corporate site, API, demo |
| aerologue.app | `Z030151534JSPWAFH5N0Q` | Production web app |

### DNS Records

**aerologue.com:**
| Record | Type | Value | Purpose |
|--------|------|-------|---------|
| demo.aerologue.com | A (Alias) | d1v46qp1q8umai.cloudfront.net | Staging/Demo app |
| api.aerologue.com | CNAME | mazzuw3qr6.execute-api.us-east-1.amazonaws.com | REST API |
| _af036b429e3ecca46dd1ee3517f4f70b | CNAME | ACM validation | SSL cert |

**aerologue.app:**
| Record | Type | Value | Purpose |
|--------|------|-------|---------|
| aerologue.app | A (Alias) | d3te8e43oj1mcf.cloudfront.net | Production app |
| _bd024de6c9e9086153662449ce5a00e6 | CNAME | ACM validation | SSL cert |

### Nameservers (Update at Domain Registrar)

**aerologue.com:**
```
ns-167.awsdns-20.com
ns-1486.awsdns-57.org
ns-844.awsdns-41.net
ns-1944.awsdns-51.co.uk
```

**aerologue.app:**
```
ns-608.awsdns-12.net
ns-178.awsdns-22.com
ns-1682.awsdns-18.co.uk
ns-1451.awsdns-53.org
```

---

## Cognito - Authentication

| Item | Value |
|------|-------|
| User Pool Name | `aerologue-users` |
| User Pool ID | `us-east-1_Y9cTSJeIm` |
| User Pool ARN | `arn:aws:cognito-idp:us-east-1:379383214093:userpool/us-east-1_Y9cTSJeIm` |
| App Client Name | `aerologue-web-app` |
| App Client ID | `4r4muf65b9298l0hn70v1082mu` |

### Configuration

- **Username:** Email-based
- **Auto-verify:** Email
- **Password Policy:** Min 8 chars, uppercase, lowercase, numbers
- **Recovery:** Email-based

### Callback URLs
- `http://localhost:3000/callback` (development)
- `https://aerologue.app/callback` (production)
- `https://demo.aerologue.com/callback` (staging)

### Logout URLs
- `http://localhost:3000`
- `https://aerologue.app`
- `https://demo.aerologue.com`

---

## DynamoDB - Database

All tables use **PAY_PER_REQUEST** billing mode (serverless, scales automatically).

| Table Name | Partition Key | Sort Key | Purpose |
|------------|---------------|----------|---------|
| `aerologue-user-profiles` | user_id (S) | - | User profile data |
| `aerologue-user-sessions` | user_id (S) | session_id (S) | Active sessions |
| `aerologue-flights` | flight_id (S) | timestamp (S) | Flight position data |
| `aerologue-tracked-flights` | user_id (S) | flight_id (S) | User's tracked flights |
| `aerologue-crossings` | crossing_id (S) | timestamp (S) | Flight crossing events |
| `aerologue-messages` | crossing_id (S) | message_id (S) | Crossing messages |
| `aerologue-wallet` | user_id (S) | item_id (S) | Wallet items |
| `aerologue-gamification` | user_id (S) | - | Points, achievements |

### Future Tables (Create When Needed)
- `aerologue-vlogs` - Vlog content
- `aerologue-ads` - Ad campaigns
- `aerologue-factoids` - Geo factoids
- `aerologue-quiz-questions` - Quiz content

---

## S3 - Storage

| Bucket | Purpose | Public | CORS |
|--------|---------|--------|------|
| `aerologue-media-prod` | User uploads, vlogs, avatars | No | Yes |
| `aerologue-web-app` | Static web app hosting | Yes | No |
| `aerologue-ads-media` | Ad creatives | No | No |

### aerologue-web-app Configuration
- **Static Website Hosting:** Enabled
- **Index Document:** index.html
- **Error Document:** index.html (for SPA routing)
- **Public Access:** Enabled (bucket policy)

### aerologue-media-prod CORS
```json
{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://aerologue.app",
    "https://demo.aerologue.com"
  ],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

---

## API Gateway

| Item | Value |
|------|-------|
| API Name | `aerologue-api` |
| API ID | `mazzuw3qr6` |
| Protocol | HTTP |
| Stage | `prod` |
| Base URL | `https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod` |

### Endpoints

| Method | Path | Lambda | Status |
|--------|------|--------|--------|
| GET | /health | aerologue-health | ✅ Active |

### CORS Configuration
```json
{
  "AllowOrigins": [
    "http://localhost:3000",
    "https://aerologue.app",
    "https://demo.aerologue.com"
  ],
  "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "AllowHeaders": ["Content-Type", "Authorization"],
  "MaxAge": 86400
}
```

---

## Lambda Functions

| Function Name | Runtime | Role | Purpose |
|---------------|---------|------|---------|
| `aerologue-health` | Node.js 18.x | aerologue-lambda-role | Health check endpoint |

### IAM Role: aerologue-lambda-role

**ARN:** `arn:aws:iam::379383214093:role/aerologue-lambda-role`

**Attached Policies:**
- `AWSLambdaBasicExecutionRole` (CloudWatch Logs)
- `aerologue-dynamodb-access` (DynamoDB CRUD on aerologue-* tables)
- `aerologue-s3-access` (S3 access to media buckets)

---

## CloudFront - CDN

| Distribution ID | Domain | Alias | Purpose |
|-----------------|--------|-------|---------|
| `E7Y5SUUCCM5DL` | d3te8e43oj1mcf.cloudfront.net | aerologue.app | Production app |
| `EA787TL18KRBU` | d1v46qp1q8umai.cloudfront.net | demo.aerologue.com | Staging app |

### Configuration
- **Origin:** S3 (aerologue-web-app)
- **Viewer Protocol:** Redirect HTTP to HTTPS
- **Price Class:** PriceClass_100 (US, Canada, Europe)
- **SSL:** ACM certificates (TLS 1.2)
- **Error Handling:** 404 → /index.html (SPA support)

---

## ACM - SSL Certificates

| Domain | Certificate ARN | Status |
|--------|-----------------|--------|
| aerologue.app, *.aerologue.app | `arn:aws:acm:us-east-1:379383214093:certificate/8dcc0ed5-9f87-422e-8124-4708a5edb971` | ✅ Issued |
| aerologue.com, *.aerologue.com | `arn:aws:acm:us-east-1:379383214093:certificate/ffe2fc48-dd04-4982-a40c-78d17e1c6fe0` | ✅ Issued |

---

## URLs Summary

| Purpose | URL |
|---------|-----|
| **Production App** | https://aerologue.app |
| **Demo/Staging** | https://demo.aerologue.com |
| **API (direct)** | https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod |
| **API (alias)** | https://api.aerologue.com/prod |
| **Health Check** | https://api.aerologue.com/prod/health |

---

## Environment Variables (for Web App)

```env
# AWS Region
VITE_AWS_REGION=us-east-1

# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_Y9cTSJeIm
VITE_COGNITO_CLIENT_ID=4r4muf65b9298l0hn70v1082mu

# API
VITE_API_BASE_URL=https://api.aerologue.com/prod

# S3
VITE_S3_MEDIA_BUCKET=aerologue-media-prod
```

---

## SSM Parameter Store - API Keys

| Parameter Name | Type | Purpose |
|----------------|------|---------|
| `aerologue-rapidapi-key` | SecureString | RapidAPI key for ADS-B Exchange & AeroDataBox |
| `aerologue-anthropic-api-key` | SecureString | Anthropic Claude API for quiz/factoid generation |

**Usage in Lambda:**
```javascript
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const ssm = new SSMClient({ region: 'us-east-1' });

const response = await ssm.send(new GetParameterCommand({
  Name: 'aerologue-rapidapi-key',
  WithDecryption: true
}));
const apiKey = response.Parameter.Value;
```

---

## Cost Estimate (MVP)

| Service | Estimated Monthly |
|---------|-------------------|
| Route53 | $1.00 (2 hosted zones) |
| Cognito | $0.00 (first 50K MAU free) |
| DynamoDB | $0-10 (pay per request) |
| S3 | $0-5 (minimal storage) |
| Lambda | $0.00 (first 1M requests free) |
| API Gateway | $0-5 (first 1M requests ~$1) |
| CloudFront | $0-10 (first 1TB free) |
| ACM | $0.00 (free with AWS services) |
| **Total** | **~$5-30/month** |

---

## Next Steps

1. [ ] Set up CI/CD pipeline for web app deployment
2. [ ] Create additional Lambda functions for API endpoints
3. [ ] Configure CloudWatch alarms
4. [ ] Set up API custom domain (api.aerologue.com with certificate)
5. [ ] Add WebSocket API Gateway for real-time features

---

## References

- [AWS Architecture](aws-architecture.md) - Full architecture design
- [API Specification](api-spec.md) - REST API endpoints
- [Data Dictionary](data-dictionary.md) - Database schemas
