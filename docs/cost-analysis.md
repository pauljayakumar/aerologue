# Cost Analysis & Projections

**Document ID:** COST-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## COST-001.0 - Overview

This document provides cost estimates for Aerologue's AWS infrastructure at various scales. All costs are estimates in USD and may vary based on actual usage patterns.

---

## COST-002.0 - Cost Tiers

### Tier Summary

| Tier | Users (MAU) | Concurrent | Monthly Cost | Per User |
|------|-------------|------------|--------------|----------|
| MVP/Development | 100 | 20 | ~$190 | $1.90 |
| Early Stage | 1,000 | 200 | ~$350 | $0.35 |
| Growth | 10,000 | 2,000 | ~$1,200 | $0.12 |
| Scale | 100,000 | 20,000 | ~$5,500 | $0.055 |

---

## COST-003.0 - MVP/Development Costs (~$190/month)

### Target: 100 MAU, 20 concurrent users

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **Compute** | | |
| Lambda | 500K invocations, 256MB avg | $5 |
| | | |
| **Database** | | |
| Aurora Serverless v2 | 0.5-2 ACU, 5GB | $45 |
| DynamoDB | On-demand, 2GB | $10 |
| Timestream | 2GB storage, 100K writes | $15 |
| ElastiCache | t4g.micro (single node) | $12 |
| | | |
| **Storage** | | |
| S3 | 10GB, 100K requests | $3 |
| | | |
| **Networking** | | |
| API Gateway REST | 500K requests | $2 |
| API Gateway WebSocket | 100K connections, 1M messages | $5 |
| CloudFront | 50GB transfer | $5 |
| Data Transfer | 20GB out | $2 |
| | | |
| **Security** | | |
| Cognito | 100 MAU (free tier) | $0 |
| WAF | 1M requests | $6 |
| Secrets Manager | 5 secrets | $3 |
| | | |
| **Monitoring** | | |
| CloudWatch | Basic metrics + 5GB logs | $10 |
| X-Ray | 100K traces | $1 |
| | | |
| **Third Party** | | |
| ADS-B Exchange | Free tier / Basic | $0-50 |
| SendGrid | Free tier (100/day) | $0 |
| | | |
| **Other** | | |
| Route 53 | 1 hosted zone, 1M queries | $1 |
| ACM | Free | $0 |
| | | |
| **TOTAL** | | **~$175-225** |

### Free Tier Benefits (First 12 months)

| Service | Free Tier Allowance | Savings |
|---------|---------------------|---------|
| Lambda | 1M requests, 400K GB-sec | ~$5 |
| DynamoDB | 25GB, 25 RCU/WCU | ~$10 |
| S3 | 5GB storage | ~$1 |
| CloudFront | 1TB transfer | ~$5 |
| API Gateway | 1M REST calls | ~$2 |
| **Total Savings** | | **~$23** |

---

## COST-004.0 - Early Stage Costs (~$350/month)

### Target: 1,000 MAU, 200 concurrent users

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **Compute** | | |
| Lambda | 2M invocations, 512MB avg | $25 |
| | | |
| **Database** | | |
| Aurora Serverless v2 | 1-4 ACU, 20GB | $80 |
| DynamoDB | On-demand, 10GB | $30 |
| Timestream | 10GB storage, 500K writes | $30 |
| ElastiCache | t4g.small (single node) | $25 |
| | | |
| **Storage** | | |
| S3 | 50GB, 500K requests | $8 |
| | | |
| **Networking** | | |
| API Gateway REST | 2M requests | $7 |
| API Gateway WebSocket | 500K connections, 5M messages | $15 |
| CloudFront | 200GB transfer | $20 |
| Data Transfer | 100GB out | $9 |
| | | |
| **Security** | | |
| Cognito | 1,000 MAU | $5 |
| WAF | 5M requests | $10 |
| Secrets Manager | 10 secrets | $5 |
| | | |
| **Monitoring** | | |
| CloudWatch | Standard metrics + 20GB logs | $25 |
| X-Ray | 500K traces | $3 |
| | | |
| **Third Party** | | |
| ADS-B Exchange | Basic plan | $50 |
| SendGrid | Essentials (40K/month) | $20 |
| | | |
| **Other** | | |
| Route 53 | 1 hosted zone, 5M queries | $3 |
| | | |
| **TOTAL** | | **~$370** |

---

## COST-005.0 - Growth Stage Costs (~$1,200/month)

### Target: 10,000 MAU, 2,000 concurrent users

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **Compute** | | |
| Lambda | 15M invocations, 512MB avg | $120 |
| | | |
| **Database** | | |
| Aurora Serverless v2 | 2-8 ACU, 100GB | $200 |
| DynamoDB | On-demand, 50GB | $100 |
| Timestream | 50GB storage, 2M writes | $80 |
| ElastiCache | r6g.large (2 nodes) | $150 |
| | | |
| **Storage** | | |
| S3 | 200GB, 2M requests | $20 |
| | | |
| **Networking** | | |
| API Gateway REST | 15M requests | $50 |
| API Gateway WebSocket | 2M connections, 30M messages | $60 |
| CloudFront | 1TB transfer | $85 |
| Data Transfer | 500GB out | $45 |
| | | |
| **Security** | | |
| Cognito | 10,000 MAU | $50 |
| WAF | 20M requests | $25 |
| Secrets Manager | 15 secrets | $7 |
| | | |
| **Monitoring** | | |
| CloudWatch | Enhanced + 100GB logs | $60 |
| X-Ray | 2M traces | $10 |
| | | |
| **Third Party** | | |
| ADS-B Exchange | Professional | $100 |
| SendGrid | Pro (100K/month) | $90 |
| | | |
| **Other** | | |
| Route 53 | 1 zone, 20M queries | $10 |
| | | |
| **TOTAL** | | **~$1,262** |

---

## COST-006.0 - Scale Stage Costs (~$5,500/month)

### Target: 100,000 MAU, 20,000 concurrent users

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **Compute** | | |
| Lambda | 100M invocations, 1GB avg | $600 |
| | | |
| **Database** | | |
| Aurora Serverless v2 | 8-32 ACU, 500GB | $800 |
| DynamoDB | Provisioned, 200GB | $400 |
| Timestream | 200GB storage, 10M writes | $300 |
| ElastiCache | r6g.xlarge (cluster mode) | $500 |
| | | |
| **Storage** | | |
| S3 | 1TB, 10M requests | $80 |
| | | |
| **Networking** | | |
| API Gateway REST | 100M requests | $350 |
| API Gateway WebSocket | 20M connections, 200M msg | $400 |
| CloudFront | 5TB transfer | $400 |
| Data Transfer | 2TB out | $180 |
| | | |
| **Security** | | |
| Cognito | 100,000 MAU | $500 |
| WAF | 100M requests | $100 |
| Secrets Manager | 25 secrets | $12 |
| Shield Advanced | Optional | $3,000* |
| | | |
| **Monitoring** | | |
| CloudWatch | Full suite + 500GB logs | $200 |
| X-Ray | 10M traces | $50 |
| | | |
| **Third Party** | | |
| ADS-B Exchange | Enterprise | $300 |
| SendGrid | Premier | $200 |
| | | |
| **Other** | | |
| Route 53 | Multiple zones, 100M queries | $50 |
| | | |
| **TOTAL** | | **~$5,422** |
| **With Shield Advanced** | | **~$8,422** |

*Shield Advanced is optional but recommended at scale for DDoS protection.

---

## COST-007.0 - Cost Optimization Strategies

### Immediate Savings

| Strategy | Potential Savings | Effort |
|----------|-------------------|--------|
| Reserved Capacity (Aurora) | 30-40% | Low |
| Savings Plans (Lambda) | 17% | Low |
| S3 Intelligent Tiering | 20-30% on storage | Low |
| CloudFront caching | 40-60% on origin requests | Medium |
| DynamoDB reserved capacity | 50-75% | Low |

### Architecture Optimizations

| Optimization | Impact | Implementation |
|--------------|--------|----------------|
| Aggressive caching (Redis) | Reduce DB calls 70% | Medium |
| WebSocket connection pooling | Reduce connection costs | Medium |
| Event batching | Fewer Lambda invocations | Medium |
| Data lifecycle policies | Reduce storage costs | Low |
| Log sampling | Reduce CloudWatch costs | Low |

### Cost Monitoring

```
Budget Alerts:
├── 50% of budget → Email notification
├── 80% of budget → Slack + Email
├── 100% of budget → Slack + Email + SMS
└── 120% of budget → Auto-scaling review trigger

Daily Cost Anomaly Detection:
├── >20% increase → Alert
└── Review top 5 cost contributors daily
```

---

## COST-008.0 - Revenue vs Cost Projections

### Break-Even Analysis

| Model | Revenue/User/Month | Break-Even Users |
|-------|-------------------|------------------|
| Freemium (10% convert) | $0.50 effective | ~400 MAU |
| Subscription ($4.99/mo) | $4.99 | ~70 subscribers |
| In-App Purchases | Variable | Variable |

### Projected Unit Economics (Growth Stage)

```
Monthly Active Users: 10,000
├── Free users: 9,000 (90%)
├── Premium subscribers: 1,000 (10%)
│
├── Revenue
│   ├── Subscriptions: $4,990 (1,000 × $4.99)
│   ├── In-app purchases: $500 (estimated)
│   └── Total Revenue: $5,490
│
├── Costs
│   ├── Infrastructure: $1,200
│   ├── Third-party APIs: $190
│   └── Total Costs: $1,390
│
└── Gross Margin: $4,100 (75%)
```

---

## COST-009.0 - Development Costs (One-Time)

### Initial Development Estimate

| Phase | Duration | Cost Range |
|-------|----------|------------|
| Planning & Design | 2-4 weeks | Internal |
| Web App MVP | 8-12 weeks | $20-40K |
| Backend/BaaS | 6-10 weeks | $15-30K |
| Flutter Apps | 10-14 weeks | $25-50K |
| Unity Games | 8-12 weeks | $20-40K |
| Testing & QA | Ongoing | 20% of dev cost |
| **Total** | 6-9 months | **$80-160K** |

### Ongoing Development

| Item | Monthly Cost |
|------|--------------|
| Bug fixes & maintenance | $2-5K |
| New features | $5-15K |
| Security updates | $1-2K |
| Performance optimization | $2-4K |

---

## COST-010.0 - Multi-Region Expansion Costs

### Adding EU Region (eu-west-1)

| Service | Additional Monthly Cost |
|---------|------------------------|
| Aurora Global (reader) | +$150 |
| DynamoDB Global Tables | +30% |
| ElastiCache (replica) | +$150 |
| S3 replication | +$50 |
| CloudFront (no change) | $0 |
| API Gateway | +$100 |
| Data Transfer (cross-region) | +$200 |
| **Total Additional** | **~$700-900** |

### Full Global Deployment (3 regions)

Estimated additional cost: $1,500-2,500/month at growth stage.

---

## COST-011.0 - Cost Summary Table

| Stage | MAU | Monthly AWS | Third Party | Total |
|-------|-----|-------------|-------------|-------|
| MVP | 100 | $125 | $50 | $175 |
| Early | 1,000 | $280 | $70 | $350 |
| Growth | 10,000 | $1,010 | $190 | $1,200 |
| Scale | 100,000 | $4,920 | $500 | $5,420 |

---

## References

- [ARC-011.0](aws-architecture.md#arc-0110---cost-optimization) - Cost Optimization
- AWS Pricing Calculator: https://calculator.aws/
