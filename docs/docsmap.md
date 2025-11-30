# Documentation Map

This document serves as the central index for all project documentation, describing the purpose of each file and the numbering system used for cross-referencing.

---

## Document Registry

| File | Prefix | Purpose |
|------|--------|---------|
| **Core Documentation** | | |
| `features.md` | FEA | Contains the broad features of the project - what the system will do |
| `project-plan.md` | PLN | Outlines how the features will be achieved - implementation strategy and milestones |
| `components.md` | CMP | Lists reusable components that will be used across different parts of the project |
| `data-dictionary.md` | DAT | API field mappings, database schemas, and transformation rules |
| **Technical Specifications** | | |
| `api-spec.md` | API | REST API endpoint specifications, request/response formats, rate limiting |
| `websocket-spec.md` | WS | WebSocket message formats, connection lifecycle, real-time communication protocols |
| `aws-architecture.md` | ARC | AWS infrastructure specification, deployment architecture, scaling provisions |
| **DevOps & Operations** | | |
| `cicd-pipeline.md` | CICD | CI/CD pipeline configuration, GitHub Actions workflows, deployment strategy |
| `monitoring-alerting.md` | MON | Monitoring dashboards, alerting rules, incident response |
| `operations.md` | OPS | API versioning, database migrations, backup/recovery, performance benchmarks |
| `testing-strategy.md` | TEST | Unit, integration, E2E testing approaches and coverage requirements |
| `aws-setup.md` | - | Live AWS infrastructure details, credentials, resource IDs |
| **Security & Compliance** | | |
| `security-architecture.md` | SEC | Security controls, authentication, authorization, data protection |
| `gdpr-compliance.md` | GDPR | GDPR compliance, data subject rights, retention policies |
| `privacy-policy.md` | - | User-facing privacy policy template |
| **UX & Design** | | |
| `user-flows.md` | UX | User flow diagrams for key features |
| `platform-design-guidelines.md` | DES | Unified design system for all 5 platforms |
| **Development** | | |
| `developer-handbook.md` | DEV | Analytics, feature flags, code style, PR process, SLAs |
| **Business** | | |
| `cost-analysis.md` | COST | AWS cost projections at various scales |
| `error-handling.md` | ERR | Error codes, response formats, retry patterns |
| **Meta** | | |
| `docsmap.md` | - | This file - central index and numbering system reference |
| `ToBeContinued.md` | - | Tracking document for pending work items |
| `../.env.example` | - | Environment configuration template for API providers and services |

---

## Document Map

```
docs/
├── docsmap.md          # You are here - Central index & numbering reference
├── features.md         # WHAT - Broad project features
│   └── [FEA-XXX.X]     # Feature definitions
├── project-plan.md     # HOW - Implementation strategy
│   └── [PLN-XXX.X]     # Plan items (reference features)
├── components.md       # WITH WHAT - Reusable building blocks
│   └── [CMP-XXX.X]     # Component definitions (used by plan items)
├── data-dictionary.md  # DATA - Schemas and transformations
│   └── [DAT-XXX.X]     # Database schemas, field mappings
├── api-spec.md         # INTERFACE - REST API contracts
│   └── [API-XXX.X]     # Endpoint specifications
├── websocket-spec.md   # REALTIME - WebSocket protocols
│   └── [WS-XXX.X]      # Message format definitions
└── aws-architecture.md # INFRA - Cloud deployment architecture
    └── [ARC-XXX.X]     # Infrastructure components
```

### Document Flow
```
features.md  ──────►  project-plan.md  ──────►  components.md
   (WHAT)                 (HOW)                 (WITH WHAT)
                            │
                            ▼
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       data-dictionary   api-spec    websocket-spec
          (DATA)        (INTERFACE)    (REALTIME)
                            │
                            ▼
                    aws-architecture
                       (INFRA)
```

Features define what the system does → Plan items describe how to implement them → Components list the reusable pieces needed → Technical specs (data, API, WebSocket) define the contracts → Infrastructure describes where it runs.

---

## Numbering System

### Format
**[PREFIX]-[NUMBER].[REVISION]**

### Examples
- `FEA-001.0` - Feature 1, initial version
- `PLN-003.2` - Plan item 3, second revision
- `CMP-012.1` - Component 12, first revision

### Prefixes
- **FEA** - Features
- **PLN** - Plan items
- **CMP** - Components
- **DAT** - Data dictionary items (schemas, mappings)
- **API** - API endpoint specifications
- **WS** - WebSocket message formats
- **ARC** - AWS architecture components
- **CICD** - CI/CD pipeline items
- **MON** - Monitoring and alerting
- **OPS** - Operations (versioning, migrations, etc.)
- **TEST** - Testing strategy items
- **SEC** - Security architecture
- **GDPR** - GDPR compliance items
- **UX** - User experience flows
- **COST** - Cost analysis items
- **ERR** - Error handling patterns
- **DES** - Design system guidelines
- **DEV** - Developer handbook items

---

## Rationale for Numbering System

### 1. Cross-Document Traceability
The prefix system allows any document to reference items from other documents unambiguously. For example, a plan item can reference `FEA-005.0` to indicate which feature it implements, and a component can note that it's used by `PLN-002.1`.

### 2. Revision Support Without Renumbering
The `.REVISION` suffix allows items to evolve without changing their core identifier:
- Original item: `FEA-001.0`
- After first revision: `FEA-001.1`
- After second revision: `FEA-001.2`

This preserves all existing references while clearly indicating which version is current.

### 3. Stable References
Numbers are never reused. If `FEA-003` is deprecated, that number remains retired. This prevents confusion in historical references or external documentation that may point to specific items.

### 4. Sequential Clarity
Three-digit numbers (001, 002, etc.) provide:
- Room for up to 999 items per category
- Consistent formatting for sorting and display
- Clear visual distinction from revision numbers

### 5. Easy Searchability
The consistent format makes it simple to search across all documentation for related items using the identifier pattern.

---

## Usage Guidelines

1. **Adding new items**: Use the next available number with `.0` revision
2. **Revising items**: Increment the revision number, keep the main number
3. **Cross-referencing**: Always use the full identifier (e.g., `FEA-001.0`)
4. **Deprecating items**: Mark as deprecated but do not delete or reuse the number

