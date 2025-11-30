# CI/CD Pipeline Configuration

**Document ID:** CICD-001.0
**Last Updated:** 2025-11-26
**Status:** Draft

---

## CICD-001.0 Overview

This document defines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for Aerologue using GitHub Actions and AWS.

### What Gets Deployed

| Component | Repository | Deploy Target |
|-----------|------------|---------------|
| Web App (BaaS Testing) | `aerologue-web` | AWS S3 + CloudFront |
| Backend APIs | `aerologue-api` | AWS Lambda |
| Infrastructure | `aerologue-infra` | AWS (via Terraform) |
| Unity Games | `aerologue-games` | S3 (WebGL builds) |
| Flutter Apps | `aerologue-mobile` | App Store / Play Store / Microsoft Store |

---

## CICD-002.0 Environments

### Environment Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  LOCAL          Developer's machine                     │
│  (localhost)    No CI/CD - manual testing               │
└─────────────────────┬───────────────────────────────────┘
                      │ git push
                      ▼
┌─────────────────────────────────────────────────────────┐
│  DEVELOPMENT    Auto-deploy on push to 'develop'        │
│  (dev.aerologue.app)                                    │
│  - Unstable, latest features                            │
│  - Test data, can be wiped                              │
│  - Full logging/debugging enabled                       │
└─────────────────────┬───────────────────────────────────┘
                      │ PR merge to 'staging'
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STAGING        Auto-deploy on push to 'staging'        │
│  (staging.aerologue.app)                                │
│  - Stable, release candidates                           │
│  - Production-like data (anonymized)                    │
│  - UAT (User Acceptance Testing)                        │
└─────────────────────┬───────────────────────────────────┘
                      │ Manual approval + tag
                      ▼
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION     Deploy on version tag (v1.0.0)          │
│  (aerologue.app)                                        │
│  - Live users                                           │
│  - Real data                                            │
│  - Minimal logging, max performance                     │
└─────────────────────────────────────────────────────────┘
```

### Environment Configuration

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| API URL | `api-dev.aerologue.app` | `api-staging.aerologue.app` | `api.aerologue.app` |
| Debug Mode | ON | ON | OFF |
| Log Level | DEBUG | INFO | WARN |
| Analytics | OFF | ON (internal) | ON |
| Rate Limits | Relaxed | Normal | Normal |
| Data | Test/Mock | Anonymized copy | Real |

---

## CICD-003.0 Branch Strategy

### Git Flow (Simplified)

```
main (production)
  │
  ├── staging (release candidates)
  │     │
  │     └── develop (integration)
  │           │
  │           ├── feature/flight-tracking
  │           ├── feature/user-auth
  │           ├── bugfix/map-rendering
  │           └── hotfix/critical-fix (branches from main)
```

### Branch Rules

| Branch | Protected | Requires PR | Requires Reviews | Auto-Deploy To |
|--------|-----------|-------------|------------------|----------------|
| `main` | Yes | Yes | 1 approval | Production (on tag) |
| `staging` | Yes | Yes | 1 approval | Staging |
| `develop` | Yes | Yes | No | Development |
| `feature/*` | No | - | - | - |
| `bugfix/*` | No | - | - | - |
| `hotfix/*` | No | Yes (to main) | 1 approval | - |

---

## CICD-004.0 Web App Pipeline

### Workflow: `.github/workflows/web-app.yml`

```yaml
name: Web App CI/CD

on:
  push:
    branches: [develop, staging]
    paths:
      - 'src/**'
      - 'package.json'
  pull_request:
    branches: [develop, staging, main]
  release:
    types: [published]

env:
  NODE_VERSION: '20'
  AWS_REGION: 'us-east-1'

jobs:
  # ============================================
  # CI: Build and Test
  # ============================================
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ vars.API_URL }}
          VITE_WS_URL: ${{ vars.WS_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
          retention-days: 7

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # ============================================
  # Security: Dependency Audit
  # ============================================
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # ============================================
  # CD: Deploy to Development
  # ============================================
  deploy-dev:
    needs: [build, security]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CLOUDFRONT_DIST_ID }} \
            --paths "/*"

  # ============================================
  # CD: Deploy to Staging
  # ============================================
  deploy-staging:
    needs: [build, security]
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CLOUDFRONT_DIST_ID }} \
            --paths "/*"

  # ============================================
  # CD: Deploy to Production (on release)
  # ============================================
  deploy-production:
    needs: [build, security]
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CLOUDFRONT_DIST_ID }} \
            --paths "/*"

      - name: Notify deployment
        run: echo "::notice::Production deployment complete for ${{ github.ref_name }}"
```

---

## CICD-005.0 Backend API Pipeline

### Workflow: `.github/workflows/api.yml`

```yaml
name: Backend API CI/CD

on:
  push:
    branches: [develop, staging]
    paths:
      - 'lambda/**'
      - 'serverless.yml'
  pull_request:
    branches: [develop, staging, main]
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Package Lambda functions
        run: npm run package

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: lambda-packages
          path: .serverless/

  deploy-dev:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: lambda-packages
          path: .serverless/

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to AWS
        run: npx serverless deploy --stage dev

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: lambda-packages
          path: .serverless/

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to AWS
        run: npx serverless deploy --stage staging

  deploy-production:
    needs: build
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: lambda-packages
          path: .serverless/

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to AWS
        run: npx serverless deploy --stage prod
```

---

## CICD-006.0 Infrastructure Pipeline

### Workflow: `.github/workflows/infrastructure.yml`

```yaml
name: Infrastructure CI/CD

on:
  push:
    branches: [develop, staging, main]
    paths:
      - 'terraform/**'
  pull_request:
    branches: [main]
    paths:
      - 'terraform/**'

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/

      - name: Terraform Validate
        run: terraform validate
        working-directory: terraform/

      - name: Terraform Plan
        run: terraform plan -out=tfplan
        working-directory: terraform/

      - name: Upload plan
        uses: actions/upload-artifact@v4
        with:
          name: terraform-plan
          path: terraform/tfplan

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Download plan
        uses: actions/download-artifact@v4
        with:
          name: terraform-plan
          path: terraform/

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/

      - name: Terraform Apply
        run: terraform apply -auto-approve tfplan
        working-directory: terraform/
```

---

## CICD-007.0 Flutter Mobile Pipeline

### Workflow: `.github/workflows/mobile.yml`

```yaml
name: Flutter Mobile CI/CD

on:
  push:
    branches: [develop, staging]
    paths:
      - 'lib/**'
      - 'pubspec.yaml'
  release:
    types: [published]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Analyze code
        run: flutter analyze

      - name: Run tests
        run: flutter test --coverage

      - name: Build APK
        run: flutter build apk --release

      - name: Build App Bundle
        run: flutter build appbundle --release

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: build/app/outputs/flutter-apk/app-release.apk

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: build/app/outputs/bundle/release/app-release.aab

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Build iOS
        run: flutter build ios --release --no-codesign

      # iOS signing and upload to TestFlight requires additional setup
      # with certificates and provisioning profiles

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Build Windows
        run: flutter build windows --release

      - name: Upload Windows build
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: build/windows/x64/runner/Release/

  deploy-android:
    needs: build-android
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: android-aab

      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
          packageName: app.aerologue
          releaseFiles: app-release.aab
          track: internal  # internal -> alpha -> beta -> production
```

---

## CICD-008.0 Required Secrets and Variables

### GitHub Secrets (per environment)

| Secret | Description | Environments |
|--------|-------------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | All |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret | All |
| `SNYK_TOKEN` | Snyk security scanning | All |
| `PLAY_STORE_SERVICE_ACCOUNT` | Google Play upload | Production |
| `APPLE_CERTIFICATES` | iOS signing (base64) | Production |

### GitHub Variables (per environment)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_URL` | `https://api-dev.aerologue.app` | `https://api-staging.aerologue.app` | `https://api.aerologue.app` |
| `WS_URL` | `wss://ws-dev.aerologue.app` | `wss://ws-staging.aerologue.app` | `wss://ws.aerologue.app` |
| `S3_BUCKET` | `aerologue-web-dev` | `aerologue-web-staging` | `aerologue-web-prod` |
| `CLOUDFRONT_DIST_ID` | `E1234DEV` | `E1234STAGING` | `E1234PROD` |

---

## CICD-009.0 Pipeline Triggers Summary

| Event | Branch/Tag | Pipeline | Deploys To |
|-------|------------|----------|------------|
| Push | `develop` | Build + Test + Deploy | Development |
| Push | `staging` | Build + Test + Deploy | Staging |
| PR | Any → `main` | Build + Test only | - |
| Release | `v*.*.*` tag | Build + Test + Deploy | Production |

---

## CICD-010.0 Rollback Procedure

### Automatic Rollback
If health checks fail post-deployment:
1. CloudWatch alarm triggers
2. Lambda@Edge or API Gateway returns 5xx
3. Automatic revert to previous version

### Manual Rollback

```bash
# Web App - restore previous S3 version
aws s3 sync s3://aerologue-web-prod-backup/ s3://aerologue-web-prod/

# Lambda - revert to previous version
aws lambda update-alias \
  --function-name aerologue-api \
  --name prod \
  --function-version PREVIOUS_VERSION

# Full infrastructure rollback
cd terraform/
terraform apply -target=module.web -var="version=1.2.3"
```

---

## CICD-011.0 Status Badges

Add to repository README:

```markdown
![Web App](https://github.com/aerologue/aerologue-web/actions/workflows/web-app.yml/badge.svg)
![API](https://github.com/aerologue/aerologue-api/actions/workflows/api.yml/badge.svg)
![Infrastructure](https://github.com/aerologue/aerologue-infra/actions/workflows/infrastructure.yml/badge.svg)
```

---

---

## CICD-012.0 Deployment Strategy

### Blue-Green Deployment (Web App)

We use blue-green deployment for zero-downtime releases:

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   Distribution  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Origin Switch  │
                    └────────┬────────┘
               ┌─────────────┴─────────────┐
               │                           │
        ┌──────▼──────┐             ┌──────▼──────┐
        │   S3 Blue   │             │  S3 Green   │
        │  (Current)  │             │   (New)     │
        └─────────────┘             └─────────────┘
```

**Process:**
1. Deploy new version to inactive environment (Green)
2. Run smoke tests against Green
3. Switch CloudFront origin to Green
4. Blue becomes the rollback target
5. Next deployment goes to Blue

### Canary Deployment (Lambda APIs)

For backend APIs, we use canary releases:

```
┌─────────────────────────────────────────────┐
│              API Gateway                     │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          │ Lambda Alias    │
          │ "prod"          │
          └────────┬────────┘
                   │
     ┌─────────────┴─────────────┐
     │ 95%                  5%   │
     ▼                           ▼
┌─────────┐                ┌─────────┐
│ v1.2.3  │                │ v1.2.4  │
│ Stable  │                │ Canary  │
└─────────┘                └─────────┘
```

**Process:**
1. Deploy new Lambda version
2. Route 5% traffic to new version
3. Monitor errors and latency
4. If healthy: increase to 25% → 50% → 100%
5. If errors: automatic rollback to stable

### Deployment Windows

| Environment | Deployment Window | Freeze Periods |
|-------------|-------------------|----------------|
| Development | Anytime | None |
| Staging | Business hours (9am-6pm) | None |
| Production | Tue-Thu, 10am-4pm | Weekends, holidays, major events |

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security scan clean
- [ ] Database migrations tested
- [ ] Rollback procedure verified
- [ ] On-call engineer notified
- [ ] Monitoring dashboards open

### Post-Deployment Verification

```
Automated checks (first 5 minutes):
├── Health endpoint returns 200
├── Key API endpoints respond < 500ms
├── WebSocket connections establish
├── No 5xx errors in logs
└── Database connections healthy

Manual verification (first 30 minutes):
├── Login/logout flow works
├── Flight tracking displays correctly
├── Real-time updates flowing
└── No user-reported issues
```

---

## CICD-013.0 Feature Flags

For gradual rollouts and A/B testing:

### Flag Types

| Type | Purpose | Example |
|------|---------|---------|
| Release | Hide incomplete features | `flight_crossing_v2` |
| Experiment | A/B testing | `new_map_ui` |
| Ops | Operational toggles | `maintenance_mode` |
| Permission | User-based access | `beta_tester` |

### Implementation

```javascript
// Feature flag check in code
if (featureFlags.isEnabled('flight_crossing_v2', userId)) {
  return renderNewCrossingUI();
} else {
  return renderLegacyCrossingUI();
}
```

### Recommended Service

AWS AppConfig or LaunchDarkly for feature flag management.

---

## References

- [ARC-001.0](aws-architecture.md) - AWS Infrastructure
- [API-001.0](api-spec.md) - API Specifications
- GitHub Actions Documentation: https://docs.github.com/en/actions
