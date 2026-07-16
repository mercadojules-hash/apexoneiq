# ApexOneIQ Mission Library Specification

Status: Phase 6 architecture and local simulation only.

This document defines the reusable Mission Library and Subscription Intelligence layer that plugs into the existing Unified Mission State. It does not add UI, dashboards, provider integrations, APIs, production execution, schedulers, or live publishing.

Companion document: `MISSION-INTELLIGENCE-SPECIFICATION.md` defines the Phase 7 intelligence object that tells Apex how each library mission thinks before any future execution exists.

## Frozen Interface Boundary

Do not redesign or expand these surfaces for this phase:

- Executive Brief
- Mission Workspace layout
- Executive Command Center
- Execution Center
- Mission Lifecycle
- Approval, Evidence, Verification, and Operations Log UI

The Mission Library powers those surfaces from underneath. Every mission exists once in the Unified Mission Engine and every screen reads that same state.

## Unified Lifecycle

Every mission uses the same lifecycle:

1. Opportunity Detected
2. Research
3. Generate
4. Validate
5. Approval, if required
6. Execute, placeholder only
7. Verify
8. Monitor
9. Executive Report

No mission creates a custom workflow. A mission definition only changes inputs, automated tasks, approval rules, evidence, verification, dependencies, and completion criteria.

## Mission Definition Template

```json
{
  "missionId": "service-page-optimization",
  "missionName": "Service Page Optimization",
  "category": "Growth",
  "priority": 88,
  "businessObjective": "Strengthen high-intent service pages for trust, clarity, and conversion.",
  "requiredInputs": ["Service pages", "intent data", "competitor pages"],
  "automatedTasks": {
    "Opportunity Detected": [],
    "Research": [],
    "Generate": [],
    "Validate": [],
    "Approval": [],
    "Execute": ["Provider adapter placeholder only"],
    "Verify": [],
    "Monitor": [],
    "Executive Report": []
  },
  "approvalRequired": true,
  "evidenceProduced": ["page baseline", "update draft", "validation checklist"],
  "verificationRequirements": ["Optimization package ready", "outcome tied to score"],
  "businessGrowthScoreImpact": 5,
  "estimatedAiTime": "16 min",
  "estimatedHumanTime": "8 min",
  "dependencies": ["business-information-validation"],
  "completionCriteria": ["Service page plan ready", "approval package prepared"]
}
```

## Initial Mission Library

The canonical local simulation is exported from `ApexMissionEngine.missionLibraryCatalog`.

### Foundation

| Mission | Objective | Approval | Dependencies |
| --- | --- | --- | --- |
| Website Scan | Establish the website health baseline and first score inputs. | No | None |
| Technical SEO Audit | Find crawl, indexability, speed, metadata, and structural blockers. | No | Website Scan |
| Google Business Profile Audit | Measure local trust proof and profile completeness. | No | Website Scan |
| AI Visibility Scan | Measure whether AI systems understand and recommend the business. | No | Website Scan |
| Competitor Scan | Identify competitor proof, visibility, review, and content movement. | No | Website Scan |

### Optimization

| Mission | Objective | Approval | Dependencies |
| --- | --- | --- | --- |
| FAQ Generation | Prepare buyer-answer content for trust and AI clarity. | Yes | AI Visibility Scan |
| Schema Generation | Prepare valid structured-data plans for priority pages. | Yes | Website Scan, Business Information Validation |
| JSON-LD Package | Generate clean JSON-LD from approved schema plans. | Yes | Schema Generation |
| Metadata Optimization | Improve titles and descriptions for relevance and conversion. | Yes | Technical SEO Audit |
| Internal Link Optimization | Improve authority flow and customer discovery paths. | Yes | Service Page Optimization |

### Authority

| Mission | Objective | Approval | Dependencies |
| --- | --- | --- | --- |
| Citation Package | Prepare consistent third-party business proof. | Yes | Business Information Validation |
| Business Information Validation | Confirm core facts across website, profiles, and public sources. | Yes | Website Scan |
| Review Strategy | Improve review depth, recency, and response quality ethically. | Yes | Google Business Profile Audit |
| Knowledge Graph Preparation | Strengthen entity relationships across business proof. | Yes | Schema Generation, Business Information Validation |
| Comparison Content | Prepare evidence-based comparison content. | Yes | Competitor Scan, Service Page Optimization |

### Growth

| Mission | Objective | Approval | Dependencies |
| --- | --- | --- | --- |
| Content Refresh | Refresh stale or weak content with clearer proof and outcomes. | Yes | Website Scan |
| Service Page Optimization | Strengthen high-intent service pages for trust, clarity, and conversion. | Yes | Business Information Validation |
| Local Landing Pages | Prepare focused local pages for high-value services or service areas. | Yes | Service Page Optimization |
| Forecast Update | Refresh projected outcomes from mission state and blockers. | No | None |
| Executive Weekly Report | Turn mission outcomes into weekly executive operating context. | No | Forecast Update |

### Monitoring

| Mission | Objective | Approval | Dependencies |
| --- | --- | --- | --- |
| Ranking Monitor | Monitor ranking movement and meaningful business changes. | No | Website Scan |
| Competitor Change Detection | Detect competitor movement that changes mission priority. | No | Competitor Scan |
| AI Visibility Refresh | Refresh answer-engine visibility and citation coverage. | No | AI Visibility Scan |
| Website Health Monitoring | Watch website health for regressions and drift. | No | Technical SEO Audit |

## Subscription Capability Matrix

The reusable matrix is exported from `ApexMissionEngine.subscriptionCapabilityMatrix()`.

| Plan | Mission Access | Apex Responsibility | Execution Boundary |
| --- | --- | --- | --- |
| FREE | Website Scan, Business Growth Score, AI Visibility Score, Limited Executive Brief | Score and explain the first condition | No execution |
| $199 DIY | Full reports, checklists, recommendations, mission instructions | Educate and guide | Customer performs every action |
| $499 AI Automated | Research, generate, validate, prepare execution, verify, monitor, Daily Executive Brief | AI performs preparation and monitoring | Execution placeholder only until provider adapters exist |
| $999 Concierge | Same Mission Engine as Automated | AI prepares; approved missions become Assigned to Apex Team | Team assignment after approval, no automatic production execution in this phase |
| $2,500 Enterprise | Defined included services only | Request Information and custom scope | No purchase flow, no implementation |

## AI Responsibility Matrix

| Area | AI-owned responsibilities |
| --- | --- |
| Research | Website crawl, competitor analysis, AI visibility review, technical SEO review, GBP audit |
| Generation | FAQ, schema, JSON-LD, metadata, internal links, comparison content, citations |
| Validation | Dependency checks, schema validation, business-rule checks, rollback readiness, execution readiness |
| Forecasting | Business Growth Score impact, projected revenue lift, confidence updates, blocked-work modeling |
| Monitoring | Ranking movement, competitor changes, AI visibility refresh, website health drift |
| Reporting | Executive Brief, weekly report, timeline update, next mission recommendation |
| Evidence | Before/after snapshots, validation logs, provider confirmation placeholder, score movement |
| Scheduling | Opportunity detection, priority ranking, dependency respect, conflict blocking, queue updates |

## Human Responsibility Matrix

| Area | Human-owned responsibilities |
| --- | --- |
| Business decisions | Approve strategic changes, hold missions, request revisions |
| Enterprise consulting | Custom business rules, multi-location governance, contracted advisory scope |
| High-impact approvals | Pricing changes, brand changes, business information changes, customer-facing publication |
| Customer support | Resolve account issues, clarify business inputs, handle exceptions |
| New mission creation | Define new mission templates, set risk policy, approve reusable business rules |
| Future integrations | Grant provider permissions, review integration risk, approve production adapters |

## Mission Scheduling Architecture

Scheduling is not calendar-day based. Apex should schedule by business state.

Rules:

- Detect opportunities continuously from score, visibility, website, trust, competitor, and mission history signals.
- Prioritize by business impact, confidence, dependency status, approval requirement, risk, and customer effort.
- Respect dependencies before execution-stage work appears as ready.
- Block conflicting work when another approval-gated mission is already active.
- Queue the next highest-impact mission only after dependency and approval conflicts are clear.
- Keep locked missions visible to subscription intelligence but unavailable to lower tiers.

Example queue:

1. Google Business Profile Audit
2. Business Information Validation
3. Schema Generation
4. JSON-LD Package
5. Internal Link Optimization
6. Waiting for Customer Approval
7. Next Scheduled Mission

The local simulation is exported from `ApexMissionEngine.buildMissionSchedulingArchitecture(input)`. It reads `missionState`, subscription level, dependencies, active missions, locked missions, and the Unified Mission State readiness result.

## Recommended Implementation Priority

1. Mission Library registry and schema validation.
2. Subscription capability checks against the registry.
3. Mission scheduling simulation using Unified Mission State.
4. Dependency and conflict explanations for blocked missions.
5. Evidence and verification requirements per mission.
6. Weekly and daily reporting generators that consume mission history.
7. Provider adapter contracts, still placeholder only.
8. Production execution, deferred to a future approved phase.

## Phase 6 Validation Contract

Confirmed boundaries for this phase:

- Existing Executive UI unchanged.
- Executive Brief not modified.
- Mission Workspace layout not modified.
- Executive Command Center not redesigned.
- Unified Mission Engine reused.
- No provider integrations.
- No APIs.
- No production execution.
- No new dashboards.
- No live scheduler.
