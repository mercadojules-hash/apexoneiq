# ApexOneIQ Mission Intelligence Specification

Status: Phase 7 logic only. No UI, provider adapters, APIs, WordPress integration, Shopify integration, Google Business Profile APIs, browser automation feature, schedulers, notifications, authentication changes, purchase-flow changes, deployment logic, or production execution.

Phase 7 teaches ApexOneIQ how to think before future execution exists. The Executive UI is frozen.

## Reusable Mission Intelligence Model

The reusable model is exported from `ApexMissionEngine.missionIntelligenceModel`.

Every mission intelligence object contains:

- `missionIdentity`: mission ID, name, category, description, subscription availability, estimated completion days, and Business Growth Score value.
- `inputs`: exact information AI requires before work begins.
- `aiAnalysis`: what AI analyzes, compares, calculates, validates, scores, and predicts.
- `deliverables`: what Apex prepares before any future execution.
- `humanResponsibilities`: approval or human-judgment items only.
- `aiResponsibilities`: automatic preparation, research, validation, scoring, scheduling, reporting, and evidence work.
- `dependencies`: required previous missions, blocked missions, optional missions, and parallel missions.
- `successConditions`: exact complete-state requirements.
- `failureConditions`: Blocked, Waiting, Needs approval, Needs revision, and Cancelled definitions.
- `businessGrowthLogic`: expected score increase, confidence, risk, visibility gain, trust gain, and estimated business impact.
- `futureExecutionPlaceholder`: possible future provider route only; no implementation.

The complete local catalog is exported from:

- `ApexMissionEngine.missionIntelligenceCatalog`
- `ApexMissionEngine.buildMissionIntelligenceCatalog()`
- `ApexMissionEngine.getMissionIntelligenceById(missionId)`

## Shared AI Analysis Contract

Every mission uses the same intelligence sections.

| Section | Definition |
| --- | --- |
| Analyzes | The business, website, trust, visibility, competitor, technical, content, or monitoring signals relevant to the mission. |
| Compares | Current state against baseline, competitors, category expectations, prior scans, or customer-approved truth. |
| Calculates | Business Growth Score value, confidence, risk, visibility gain, trust gain, estimated business impact, and dependency readiness. |
| Validates | Required inputs, evidence freshness, claims, business rules, schema rules, policy constraints, rollback readiness, and approval readiness. |
| Scores | Priority, confidence, risk, approval need, dependency state, and mission readiness. |
| Predicts | Score movement, visibility gain, trust gain, business impact, and the next best mission. |

## Deliverables Contract

Apex may prepare these artifacts, depending on mission type:

- Executive Summary
- Evidence package
- Approval package
- Rollback plan
- Validation report
- Forecast
- Comparison report
- Schema plan
- JSON-LD package
- Content package
- Citation package
- Monitoring report
- Executive Report

No deliverable is published or executed in Phase 7.

## Human Responsibility Contract

Human responsibility means judgment or approval only. The customer is not responsible for repetitive SEO work.

Approval examples:

- Publish page
- Approve content
- Approve pricing, offers, or service-area details
- Approve business information
- Upload or approve profile photos
- Approve navigation or internal link changes
- Approve citation submissions
- Approve customer-facing review language
- Request revision, hold, or cancel mission

## AI Responsibility Contract

Apex AI performs automatically before execution:

- Research
- Competitor analysis
- Content generation
- Schema generation
- FAQ generation
- Validation
- Internal-link preparation
- Forecasting
- Business Growth Score calculations
- Evidence preparation
- Rollback preparation
- Mission scheduling
- Dependency validation
- Executive reporting

## Mission Intelligence Catalog

Each row below is backed by a full mission intelligence object in `missionIntelligenceCatalog`.

| Mission | Category | Inputs | Apex prepares | Approval | Dependencies | Complete when | BGS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Website Scan | Foundation | Website URL, crawl permission | Website crawl snapshot, health score, issue clusters, baseline score, next mission recommendation | No | None | Baseline exists and next mission is recommended | +4 |
| Technical SEO Audit | Foundation | Website crawl, sitemap, performance signals | Technical issue list, severity map, affected URLs, fix package | No | Website Scan | Audit complete and critical blockers isolated | +5 |
| Google Business Profile Audit | Foundation | Business profile, GBP status, business facts | GBP status snapshot, missing field list, trust baseline | No | Website Scan | GBP gaps ranked and verification path clear | +6 |
| AI Visibility Scan | Foundation | Website crawl, entity facts, service list | AI visibility baseline, citation gap list, answer coverage | No | Website Scan | AI baseline exists and next AI mission is queued | +5 |
| Competitor Scan | Foundation | Competitor set, market query set, trust signals | Competitor snapshots, movement summary, risk score | No | Website Scan | Competitor risk scored and response mission queued | +4 |
| FAQ Generation | Optimization | Website scan, service list, customer questions | FAQ draft, source rationale, validation log, approval package | Yes | AI Visibility Scan | FAQ prepared and schema fit validated | +3 |
| Schema Generation | Optimization | Business facts, page inventory, existing schema scan | Schema plan, validation result, rollback package | Yes | Website Scan, Business Information Validation | Schema package validates and approval packet is ready | +4 |
| JSON-LD Package | Optimization | Schema plan, entity facts, URL map | JSON-LD file, lint log, validator output, rollback package | Yes | Schema Generation | JSON-LD valid and rollback package prepared | +4 |
| Metadata Optimization | Optimization | Page inventory, intent data, brand rules | Metadata diff, duplicate check, validation log | Yes | Technical SEO Audit | Metadata package ready and approval decision clear | +3 |
| Internal Link Optimization | Optimization | Crawl map, priority pages, anchor policy | Link map, anchor list, crawl snapshot | Yes | Service Page Optimization | Internal link plan ready and risk checked | +3 |
| Citation Package | Authority | NAP data, directory targets, citation scan | Citation targets, NAP validation, submission plan | Yes | Business Information Validation | Citation package prepared and source data validated | +4 |
| Business Information Validation | Authority | Business profile, website crawl, citation data | Source comparison, discrepancy list, truth record | Yes | Website Scan | Truth record prepared and owner conflicts isolated | +5 |
| Review Strategy | Authority | Review profile, customer touchpoints, policy constraints | Review baseline, message drafts, policy validation | Yes | Google Business Profile Audit | Review plan prepared and policy risk checked | +3 |
| Knowledge Graph Preparation | Authority | Entity inventory, schema scan, citation data | Entity map, missing proof list, schema recommendations | Yes | Schema Generation, Business Information Validation | Entity map prepared and proof gaps ranked | +5 |
| Comparison Content | Authority | Competitors, differentiators, proof assets | Comparison draft, claim evidence, risk review | Yes | Competitor Scan, Service Page Optimization | Comparison package prepared and claim risk reviewed | +4 |
| Content Refresh | Growth | Content inventory, freshness scan, business facts | Before content snapshot, refresh draft, validation log | Yes | Website Scan | Refresh package prepared and expected lift modeled | +3 |
| Service Page Optimization | Growth | Service pages, intent data, competitor pages | Page baseline, update draft, validation checklist | Yes | Business Information Validation | Service page plan ready and approval package prepared | +5 |
| Local Landing Pages | Growth | Offer, audience, service-area data, brand rules | Landing page draft, CTA map, proof checklist | Yes | Service Page Optimization | Landing page package ready and proof path validated | +4 |
| Forecast Update | Growth | Current metrics, mission queue, competitor movement | Forecast baseline, assumption changes, confidence score | No | None | Forecast updated and next mission confidence recalculated | +2 |
| Executive Weekly Report | Growth | Mission history, evidence, forecast, score movement | Weekly summary, metric deltas, recommendation | No | Forecast Update | Weekly report prepared and decision path clear | +2 |
| Ranking Monitor | Monitoring | Rankings, priority keywords, location set | Ranking delta, volatility note, impact score | No | Website Scan | Ranking monitor refreshed and mission trigger evaluated | +2 |
| Competitor Change Detection | Monitoring | Competitor set, market signals, proof signals | Change event, competitor snapshot, response recommendation | No | Competitor Scan | Competitor deltas logged and response mission queued if needed | +2 |
| AI Visibility Refresh | Monitoring | AI visibility baseline, entity facts, mission history | AI score delta, citation coverage, answer gaps | No | AI Visibility Scan | AI visibility refreshed and next AI gap ranked | +2 |
| Website Health Monitoring | Monitoring | Website crawl, performance baseline, technical audit | Health delta, regression list, risk note | No | Technical SEO Audit | Health monitor refreshed and regressions queued | +2 |

## Failure State Definitions

| State | Meaning |
| --- | --- |
| Blocked | A required previous mission is incomplete, a required input is missing, or dependency validation failed. |
| Waiting | Customer information is needed, approval queue is occupied, or mission is queued behind higher-priority work. |
| Needs approval | The mission requires a customer decision before any live-business change can happen. |
| Needs revision | AI confidence is below threshold, a claim cannot be validated, or the customer rejects the approval package. |
| Cancelled | Customer cancels the mission, business rules exclude it, or future provider permission is revoked. |

## Business Growth Logic

Each mission defines:

- Expected score increase from `businessGrowthScoreImpact`.
- Confidence from priority, dependencies, and approval risk.
- Risk from approval need, dependency count, and category.
- Visibility gain from mission impact and category.
- Trust gain from mission impact and trust relevance.
- Estimated business impact as modeled monthly opportunity.

This is intelligence modeling only. It does not prove actual revenue, execute changes, or call providers.

## Future Execution Placeholder

Every mission may identify future execution routes:

- WordPress
- Shopify
- Google Business Profile
- Future API
- Future Browser Automation
- Future Human Team

Phase 7 only names possible future routes. It does not implement them.

## Validation Boundary

Phase 7 must preserve:

- Existing Executive UI unchanged.
- Mission Workspace unchanged.
- Executive Brief unchanged.
- Command Center unchanged.
- No new dashboards.
- No production execution.
- No provider integrations.
- No APIs.

