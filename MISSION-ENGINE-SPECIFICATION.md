# ApexOneIQ Mission Engine Specification

Status: Phase 6 architecture only. No UI, provider integration, API, execution engine, or production behavior is implemented by this document.

Companion document: `MISSION-LIBRARY-SPECIFICATION.md` defines the reusable Mission Library, subscription capability matrix, responsibility matrices, and mission scheduling architecture that plug into this engine.

## Interface Freeze

The following surfaces are considered permanent foundation for the current product direction:

- Executive Brief
- Mission Workspace
- Executive Command Center
- Mission Lifecycle
- Executive Operations Log
- Evidence
- Verification
- Approval architecture

Phase 6 defines the reusable mission system underneath those surfaces. It does not redesign, extend, or replace them.

## Mission Engine Principle

ApexOneIQ should run one reusable mission workflow with many mission definitions.

It should not create separate bespoke workflows for each SEO, content, local, AI visibility, or reporting task.

Every mission uses the same lifecycle:

```text
Detect Opportunity
Research
Generate
Validate
Approval
Execute
Verify
Monitor
Report
```

The mission definition decides what happens inside each stage, whether approval is required, what evidence is expected, and what success means.

## Core Mission Object

```json
{
  "id": "google-business-profile-verification",
  "name": "Google Business Profile Verification",
  "category": "Local Trust",
  "objective": "Increase business trust and discovery confidence by completing the Google Business Profile proof layer.",
  "inputs_required": [
    "business_profile",
    "website_scan",
    "local_presence_scan",
    "customer_permission_state"
  ],
  "automated_tasks": {
    "detect_opportunity": [],
    "research": [],
    "generate": [],
    "validate": [],
    "approval": [],
    "execute": [],
    "verify": [],
    "monitor": [],
    "report": []
  },
  "approval_required": true,
  "expected_evidence": [],
  "success_criteria": [],
  "subscription_behavior": {
    "free": "score_and_recommendation_only",
    "diy_199": "implementation_steps_only",
    "automated_499": "prepared_for_approval_then_provider_placeholder",
    "concierge_999": "assigned_to_apex_team_after_approval",
    "enterprise_2500": "request_information_only"
  }
}
```

## Lifecycle Contract

### Detect Opportunity

Purpose: identify the highest-value business constraint.

Automated responsibilities:

- Scan current business state.
- Compare scores, gaps, competitors, rankings, AI visibility, and website health.
- Estimate impact, risk, urgency, and confidence.
- Rank candidate missions.

Human involvement:

- None by default.
- Human can define future business rules and excluded mission types.

### Research

Purpose: assemble the evidence needed before any recommendation or execution plan.

Automated responsibilities:

- Crawl website.
- Review Google Business Profile signals.
- Analyze competitors.
- Analyze AI visibility.
- Run technical SEO and website health checks.
- Identify dependencies and blockers.

Human involvement:

- Provide missing business information when required.
- Review complex edge cases when requested.

### Generate

Purpose: create the prepared work package.

Automated responsibilities:

- Generate FAQ.
- Generate schema.
- Generate JSON-LD.
- Generate metadata.
- Generate internal link recommendations.
- Generate comparison page drafts.
- Generate citation packages.
- Generate executive recommendations.

Human involvement:

- Approve strategic business changes.
- Provide brand, legal, pricing, service, or claim constraints.

### Validate

Purpose: prove the mission is ready before anything can affect production.

Automated responsibilities:

- Dependency checks.
- Schema validation.
- Content quality checks.
- Rollback preparation.
- Execution readiness assessment.
- Evidence package assembly.

Human involvement:

- Define future validation policy and risk tolerance.

### Approval

Purpose: separate AI preparation from live-business change authority.

Automated responsibilities:

- Determine whether approval is required.
- Prepare approval package.
- Explain expected lift, confidence, evidence, rollback, and risk.
- Track decision state.

Human involvement:

- Approve strategic changes.
- Request revisions.
- Hold missions.

### Execute

Purpose: apply approved work only in future implementation phases.

Phase 6 boundary:

- Provider adapter placeholder only.
- No production code.
- No live publishing.
- No API integration.
- No provider execution.

Subscription behavior:

- Free: no execution.
- DIY: customer executes manually.
- Automated: future provider adapter executes approved work.
- Concierge: Apex Team receives approved mission.
- Enterprise: sales-led request information.

### Verify

Purpose: confirm results after future execution.

Automated responsibilities:

- Before and after evidence.
- Schema validation result.
- Provider confirmation placeholder.
- Screenshot capture placeholder.
- Measurement against mission success criteria.
- Failure detection and rollback recommendation.

Human involvement:

- Review unresolved failures or strategic exceptions.

### Monitor

Purpose: continue measuring the business after the mission.

Automated responsibilities:

- Daily scans.
- Competitor monitoring.
- Ranking movement.
- AI visibility movement.
- Business Growth Score updates.
- Risk drift and regression detection.

Human involvement:

- Adjust business rules and priorities.

### Report

Purpose: translate mission activity into executive understanding.

Automated responsibilities:

- Daily Executive Brief.
- Mission outcome summary.
- Evidence attachment.
- Forecast update.
- Business Growth Score change.
- Recommendation for next mission.

Human involvement:

- Enterprise consulting.
- Customer support.
- Review of strategic roadmap.

## Mission Definition Template

Use this template for every new mission. Do not create a new workflow unless the reusable lifecycle cannot express the mission.

```md
### Mission Name

- Category:
- Objective:
- Inputs required:
- Automated tasks:
  - Detect Opportunity:
  - Research:
  - Generate:
  - Validate:
  - Approval:
  - Execute:
  - Verify:
  - Monitor:
  - Report:
- Customer approval required:
- Expected evidence:
- Success criteria:
- Reusable lifecycle stages:
  - Detect Opportunity
  - Research
  - Generate
  - Validate
  - Approval
  - Execute
  - Verify
  - Monitor
  - Report
```

## Reusable Mission Definitions

Each mission below uses the same lifecycle. "Execute" remains a provider adapter placeholder in this architecture phase.

### Google Business Profile Verification

- Category: Local Trust
- Objective: complete GBP proof so customers and AI systems can trust the business entity.
- Inputs required: business profile, website scan, GBP status, owner permission state.
- Automated tasks: detect incomplete GBP proof; research local trust gaps; generate completion checklist and owner packet; validate required fields and rollback irrelevance; prepare approval when live business info changes; execute placeholder; verify profile status; monitor trust score and local visibility; report score movement.
- Customer approval required: yes when business information changes or ownership action is needed.
- Expected evidence: GBP status snapshot, missing field list, before/after trust score, owner action log.
- Success criteria: profile verification state improves or next customer action is clearly isolated.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### FAQ Generation

- Category: Content Trust
- Objective: answer buyer objections and improve AI-readable business clarity.
- Inputs required: website scan, service list, customer questions, competitor content.
- Automated tasks: detect missing buyer answers; research intent and objections; generate FAQ blocks; validate claims, tone, schema fit, and duplicates; request approval when copy goes live; execute placeholder; verify rendered FAQ and schema eligibility; monitor AI visibility and engagement; report impact.
- Customer approval required: yes before publication.
- Expected evidence: FAQ draft, source rationale, validation log, before/after content snapshot.
- Success criteria: approved FAQ package is ready and measurable after future publish.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Schema Generation

- Category: Structured Data
- Objective: improve machine readability through valid structured data.
- Inputs required: business profile, page inventory, service data, existing schema scan.
- Automated tasks: detect missing schema; research entity and page types; generate schema plan; validate required properties and conflicts; require approval before production injection; execute placeholder; verify validator results; monitor rich-result eligibility; report evidence.
- Customer approval required: yes before publication.
- Expected evidence: schema plan, validation result, JSON-LD diff, rollback package.
- Success criteria: schema package validates and maps to the correct business/page entities.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### JSON-LD

- Category: Structured Data
- Objective: produce clean JSON-LD packages for approved schema missions.
- Inputs required: schema plan, entity facts, page URL map, validation policy.
- Automated tasks: detect JSON-LD need; research entity relationships; generate JSON-LD; validate syntax and structured-data rules; request approval before deployment; execute placeholder; verify parsed output; monitor eligibility; report result.
- Customer approval required: yes before deployment.
- Expected evidence: JSON-LD file, lint log, validator output, rollback archive.
- Success criteria: JSON-LD is valid, scoped to target pages, and ready for approved execution.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Internal Link Optimization

- Category: Site Architecture
- Objective: improve authority flow and discovery paths across high-value pages.
- Inputs required: crawl map, page inventory, priority pages, anchor policy.
- Automated tasks: detect weak link paths; research topical clusters; generate link map and anchors; validate relevance, duplicates, and risk; request approval for live content edits; execute placeholder; verify links; monitor crawl and ranking movement; report gains.
- Customer approval required: yes before live edits.
- Expected evidence: link map, anchor list, before/after crawl snapshot, validation log.
- Success criteria: approved link plan strengthens priority pages without irrelevant anchors.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Citation Package

- Category: Local Trust
- Objective: improve third-party proof and business data consistency.
- Inputs required: business NAP data, target directories, existing citation scan.
- Automated tasks: detect missing or inconsistent citations; research directory opportunities; generate citation package; validate NAP consistency; approval required for submissions; execute placeholder; verify confirmation status; monitor trust score; report progress.
- Customer approval required: yes before submission or business data changes.
- Expected evidence: citation target list, NAP validation, submission confirmation placeholder, trust score snapshot.
- Success criteria: citation package is consistent and ready for future submission.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Local SEO Improvements

- Category: Local Growth
- Objective: improve location relevance and local search confidence.
- Inputs required: location data, service areas, local rankings, competitor map.
- Automated tasks: detect local gaps; research competitor local proof; generate local improvement plan; validate dependencies and claims; request approval for site/profile edits; execute placeholder; verify local proof updates; monitor rankings; report forecast.
- Customer approval required: yes for live changes.
- Expected evidence: local gap report, competitor comparison, prepared updates, ranking baseline.
- Success criteria: highest local trust blockers are prepared for approved execution.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### AI Visibility Optimization

- Category: AI Visibility
- Objective: increase the chance that AI answer systems understand and recommend the business.
- Inputs required: AI visibility score, entity facts, content inventory, trust evidence.
- Automated tasks: detect weak AI visibility; research answer-engine gaps; generate entity and content recommendations; validate evidence quality; request approval for publication; execute placeholder; verify AI-readable updates; monitor visibility score; report movement.
- Customer approval required: yes before live updates.
- Expected evidence: AI visibility baseline, entity gap list, prepared content, score forecast.
- Success criteria: mission creates evidence-backed improvements to AI-readable trust.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Content Refresh

- Category: Content Quality
- Objective: update stale or weak business content with clearer trust and conversion signals.
- Inputs required: content inventory, freshness scan, business facts, ranking/engagement signals.
- Automated tasks: detect stale content; research user intent and competitor freshness; generate refresh draft; validate claims, tone, and dependencies; request approval before publishing; execute placeholder; verify page changes; monitor performance; report lift.
- Customer approval required: yes before publication.
- Expected evidence: before/after content snapshot, change summary, validation log, forecast.
- Success criteria: refreshed content is ready for approval and later measurement.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Competitor Analysis

- Category: Competitive Intelligence
- Objective: identify competitor movement and the business response priority.
- Inputs required: competitor list, market scan, rankings, trust signals, content signals.
- Automated tasks: detect competitor change; research proof, positioning, visibility, and offers; generate response memo; validate confidence and business impact; approval usually not required unless producing live changes; execute placeholder only for downstream missions; verify updated intelligence; monitor changes; report recommendation.
- Customer approval required: no for analysis, yes for downstream live changes.
- Expected evidence: competitor snapshots, movement summary, risk score, recommended mission.
- Success criteria: Apex can explain whether to act, wait, or monitor.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Service Page Optimization

- Category: Revenue Pages
- Objective: strengthen high-intent service pages for trust, clarity, and conversion.
- Inputs required: service page inventory, service facts, keyword intent, competitor pages.
- Automated tasks: detect weak service page; research intent and proof gaps; generate page update plan; validate claims, schema, and links; request approval for publication; execute placeholder; verify rendered changes; monitor rankings and leads; report outcome.
- Customer approval required: yes before publication.
- Expected evidence: page baseline, update draft, validation checklist, before/after snapshot.
- Success criteria: approved optimization package is ready and tied to measurable outcomes.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Landing Page Generation

- Category: Growth Pages
- Objective: prepare focused landing pages for high-value campaigns or service areas.
- Inputs required: business offer, audience, service/location data, brand rules, proof assets.
- Automated tasks: detect page opportunity; research intent and competitors; generate page draft and metadata; validate claims, conversion path, schema, and links; require strategic approval; execute placeholder; verify page after future publish; monitor conversions; report lift.
- Customer approval required: yes.
- Expected evidence: landing page draft, CTA map, proof checklist, validation log.
- Success criteria: page is ready for owner approval and future deployment.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Review Strategy

- Category: Reputation
- Objective: improve review depth, recency, and response quality without fake or manipulative activity.
- Inputs required: review profile, customer touchpoints, policy constraints, competitor review baseline.
- Automated tasks: detect review weakness; research review gaps; generate ethical request and response strategy; validate policy and tone; approval required for customer-facing copy; execute placeholder; verify review workflow readiness; monitor review velocity; report trust impact.
- Customer approval required: yes for customer-facing messages.
- Expected evidence: review baseline, strategy memo, message drafts, policy validation.
- Success criteria: strategy is compliant, practical, and tied to trust score improvement.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Business Information Validation

- Category: Business Data
- Objective: confirm that core business facts are consistent across Apex, website, and public profiles.
- Inputs required: business profile, website crawl, GBP/citation data, owner-provided truth.
- Automated tasks: detect data inconsistencies; research source conflicts; generate correction list; validate source of truth; approval required for edits; execute placeholder; verify consistency; monitor drift; report confidence.
- Customer approval required: yes when changing public business facts.
- Expected evidence: source comparison, discrepancy list, approved truth record, validation log.
- Success criteria: business facts are confirmed or unresolved conflicts are isolated.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Knowledge Graph Improvements

- Category: Entity Authority
- Objective: strengthen entity relationships across business, services, people, locations, and proof.
- Inputs required: entity inventory, schema scan, citation data, profile data, content inventory.
- Automated tasks: detect weak entity graph; research relationships and missing proof; generate entity improvement plan; validate facts and schema fit; approval required for public changes; execute placeholder; verify entity signals; monitor AI visibility; report authority movement.
- Customer approval required: yes before public updates.
- Expected evidence: entity map, missing proof list, schema recommendations, validation log.
- Success criteria: entity relationships are clear, evidence-backed, and ready for future execution.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Forecast Update

- Category: Forecasting
- Objective: refresh expected business outcomes based on completed, pending, and blocked missions.
- Inputs required: current metrics, mission queue, completed work, competitor movement, confidence model.
- Automated tasks: detect forecast drift; research changed assumptions; generate updated forecast; validate confidence and dependencies; approval not required; execute means update internal forecast only in future backend; verify model consistency; monitor future drift; report executive summary.
- Customer approval required: no.
- Expected evidence: forecast baseline, assumption changes, confidence score, risk notes.
- Success criteria: forecast reflects current mission state and clearly explains uncertainty.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Technical SEO Scan

- Category: Technical Health
- Objective: identify technical blockers that reduce crawlability, performance, or search confidence.
- Inputs required: crawl, page speed metrics, metadata scan, indexability checks.
- Automated tasks: detect technical issues; research severity and dependencies; generate technical recommendations; validate priority and rollback needs; approval required for production changes; execute placeholder; verify fixes after future execution; monitor recurrence; report risk.
- Customer approval required: no for scan, yes for fixes.
- Expected evidence: issue list, severity score, affected URLs, validation plan.
- Success criteria: high-impact technical blockers are ranked and prepared for action.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Website Health Scan

- Category: Website Health
- Objective: summarize site health into owner-readable risk and priority signals.
- Inputs required: website crawl, performance data, broken link data, metadata data, schema data.
- Automated tasks: detect health state; research issue patterns; generate health summary; validate signal quality; approval not required; execute placeholder only for downstream fixes; verify scan completeness; monitor trend; report score.
- Customer approval required: no.
- Expected evidence: health score, issue clusters, scan timestamp, trend delta.
- Success criteria: owner receives clear health status and next recommended mission.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Metadata Optimization

- Category: Search Presentation
- Objective: improve page titles and descriptions for clarity, relevance, and conversion.
- Inputs required: page inventory, keyword intent, current metadata, brand rules.
- Automated tasks: detect weak metadata; research intent and SERP patterns; generate metadata set; validate length, duplicates, and claims; approval required before live edits; execute placeholder; verify rendered metadata; monitor CTR/ranking movement; report impact.
- Customer approval required: yes before live edits.
- Expected evidence: metadata diff, duplicate check, validation log, before/after snapshot.
- Success criteria: metadata package is complete, non-duplicative, and approval-ready.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Broken Link Detection

- Category: Technical Health
- Objective: find broken paths that damage customer experience and crawl confidence.
- Inputs required: crawl results, sitemap, navigation links, prior scan history.
- Automated tasks: detect broken links; research severity and source pages; generate fix list; validate redirects and dependency risk; approval required for production changes; execute placeholder; verify link status; monitor recurrence; report cleanup.
- Customer approval required: no for detection, yes for production fixes.
- Expected evidence: broken URL list, source page map, fix plan, verification plan.
- Success criteria: broken links are ranked and ready for approved remediation.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Authority Improvement

- Category: Authority
- Objective: increase proof, citations, internal authority, and external trust signals.
- Inputs required: backlink/citation data, content inventory, trust score, competitor authority.
- Automated tasks: detect authority gap; research competitor proof; generate authority improvement plan; validate risk and dependencies; approval required for public outreach/assets; execute placeholder; verify proof acquisition; monitor authority movement; report impact.
- Customer approval required: yes for public-facing actions.
- Expected evidence: authority baseline, competitor comparison, opportunity list, forecast.
- Success criteria: authority opportunities are prioritized by business impact and confidence.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Comparison Pages

- Category: Decision Content
- Objective: prepare evidence-based comparison pages that help buyers evaluate the business.
- Inputs required: competitors, differentiators, proof assets, brand/legal rules.
- Automated tasks: detect comparison opportunity; research competitors and buyer objections; generate comparison draft; validate claims, fairness, evidence, and risk; approval required; execute placeholder; verify page after future publish; monitor AI visibility and leads; report performance.
- Customer approval required: yes.
- Expected evidence: comparison draft, claim evidence, risk review, validation log.
- Success criteria: approved comparison package is factual, defensible, and conversion-oriented.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Monitoring Mission

- Category: Monitoring
- Objective: watch important business signals and trigger future missions when conditions change.
- Inputs required: score history, competitor changes, rankings, technical health, AI visibility.
- Automated tasks: detect monitored changes; research cause; generate alert and recommended mission; validate signal confidence; approval not required for monitoring; execute means queue next mission only in future backend; verify signal persistence; monitor continuously; report daily/weekly.
- Customer approval required: no.
- Expected evidence: signal delta, confidence score, timestamp, recommended action.
- Success criteria: Apex detects meaningful changes without overwhelming the owner.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

### Executive Reporting

- Category: Reporting
- Objective: convert mission data into concise executive briefings.
- Inputs required: mission history, evidence, metrics, forecast, risks, approvals.
- Automated tasks: detect reporting cadence; research changed signals; generate brief; validate evidence and claims; approval not required for internal report; execute means publish report internally in future backend; verify completeness; monitor report engagement; report next decision.
- Customer approval required: no.
- Expected evidence: brief sections, metric deltas, evidence references, recommendation.
- Success criteria: CEO understands current state, next decision, risk, and expected upside quickly.
- Reusable lifecycle stages: Detect Opportunity, Research, Generate, Validate, Approval, Execute, Verify, Monitor, Report.

## Subscription Capability Matrix

| Capability | Free | $199 DIY | $499 AI Automated | $999 Concierge AI | $2,500 Enterprise |
| --- | --- | --- | --- | --- | --- |
| Website Scan | Yes | Yes | Yes | Yes | Request information |
| Business Growth Score | Yes | Yes | Yes | Yes | Request information |
| AI Visibility Score | Yes | Yes | Yes | Yes | Request information |
| Executive Brief | Very limited | Reports and recommendations | Daily Executive Brief | Daily Executive Brief plus team context | Defined by contract |
| Mission Definitions | Visible as recommendations only | Full recommendation and checklist | Full mission preparation | Full mission preparation | Defined only |
| Research | Limited scan | AI research summary | Automated | Automated plus team review | Defined only |
| Generate | No | Reports, recommendations, steps, checklists | AI generates mission package | AI generates mission package | Defined only |
| Validate | No | Checklist validation guidance | AI validates dependencies and readiness | AI validates and team reviews edge cases | Defined only |
| Approval | Upgrade CTA only | Customer self-approval outside Apex | Required before live-business changes | Required before team assignment/live-business changes | Sales-led |
| Execute | No | Customer performs every action | Future provider adapter placeholder | Assigned to Apex Team after approval | Do not build |
| Verify | No | Customer checklist | AI verification architecture | AI verification plus team oversight | Defined only |
| Monitor | Limited score animation | Manual/report cadence | Daily monitoring | Daily monitoring plus service context | Defined only |
| Report | Limited Executive Brief | Downloadable/onscreen reports | Daily Executive Brief | Daily Executive Brief plus concierge notes | Request information |
| Purchase Flow | Free account/upgrade CTA | Standard subscription | Standard subscription | Standard subscription | No purchase flow |

## Subscription Behavior

### Free

Free exposes only:

- Website Scan
- Business Growth Score
- AI Visibility Score
- Very limited Executive Brief
- Animated score
- Upgrade CTA

Free has no execution, no mission preparation beyond visible recommendations, no approvals, no provider access, and no production modification.

### $199 DIY

DIY generates:

- Reports
- Recommendations
- Implementation steps
- Checklists

The customer performs every action. Apex never modifies production.

### $499 AI Automated

Automated missions use the full lifecycle:

```text
Research -> Generate -> Validate -> Approval -> Execute -> Verify -> Monitor -> Daily Executive Brief
```

The AI performs the majority of work. Customer approval is required before any live-business change. Execute remains a provider adapter placeholder in this architecture phase.

### $999 Concierge AI

Concierge uses the same mission engine.

The difference is routing after approval:

```text
Approved Mission -> Assigned to Apex Team
```

instead of:

```text
Approved Mission -> Executed Automatically
```

AI still performs preparation, validation, monitoring, reporting, forecasting, and evidence generation. The concierge team reviews edge cases, service context, and customer-specific complexity.

### $2,500 Enterprise

Enterprise is not built in this phase.

Status:

- Request Information
- No purchase flow
- No implementation
- Contract-defined capabilities

## AI Responsibility Matrix

| Stage | AI responsibility | Phase 6 implementation status |
| --- | --- | --- |
| Detect Opportunity | Score gaps, detect drift, rank missions, estimate ROI/confidence | Architecture only |
| Research | Crawl website, analyze competitors, audit GBP, inspect AI visibility, inspect technical SEO | Architecture only |
| Generate | FAQ, schema, JSON-LD, metadata, internal links, comparison pages, citations, reports | Architecture only |
| Validate | Dependency checks, schema validation, rollback preparation, execution readiness | Architecture only |
| Approval | Prepare approval package and explain risk/lift/evidence | Architecture only |
| Execute | Provider adapter placeholder only | Not implemented |
| Verify | Evidence, before/after, measurement, success validation | Architecture only |
| Monitor | Daily scans, competitors, rankings, Business Growth Score updates | Architecture only |
| Report | Executive Brief, forecast, next recommendation, evidence summary | Architecture only |

## Human Responsibility Matrix

| Role | Responsibility |
| --- | --- |
| Business owner | Approve strategic changes, supply missing business facts, review high-impact changes, decide when to hold or revise missions |
| Apex team | Review edge cases for Concierge AI, provide customer support, handle future service workflows, perform enterprise consulting |
| Product/engineering | Create new mission templates, define business rules, implement future provider integrations, maintain validation policy, protect approval boundaries |
| Enterprise stakeholders | Define contract scope, governance rules, regional policies, compliance requirements, and consulting expectations |

The business owner should not perform repetitive SEO work. The AI prepares the work; the owner only makes decisions that require human judgment.

## Recommended Implementation Order

Highest ROI first:

1. Mission Registry and Mission Definition Schema
2. Mission Queue Ranking Model
3. Website Health Scan
4. Business Growth Score and AI Visibility Score refresh contract
5. Executive Reporting mission
6. FAQ Generation
7. Schema Generation and JSON-LD
8. Google Business Profile Verification
9. Technical SEO Scan
10. Metadata Optimization
11. Internal Link Optimization
12. Content Refresh
13. Competitor Analysis
14. Local SEO Improvements
15. Citation Package
16. Business Information Validation
17. Review Strategy
18. Service Page Optimization
19. AI Visibility Optimization
20. Comparison Pages
21. Broken Link Detection
22. Knowledge Graph Improvements
23. Authority Improvement
24. Landing Page Generation
25. Monitoring Mission
26. Forecast Update

Reasoning:

- Start with registry, queue, scoring, scan, and reporting because they power every subscription.
- Then implement high-repeat, low-ambiguity generation missions: FAQ, schema, JSON-LD, metadata.
- Delay provider execution, landing pages, authority work, and enterprise-specific workflows until approval, evidence, and validation contracts are proven.

## Validation Checklist

Phase 6 must remain architecture only:

- No UI regressions.
- No additional pages.
- No provider execution.
- No API integrations.
- No production modifications.
- Mission Workspace remains unchanged.
- Executive Command Center remains unchanged.
- Executive Brief remains unchanged.

## Explicit Deferrals

Do not build in Phase 6:

- Live publishing
- Provider integrations
- Execution APIs
- Approval execution
- Email delivery
- Production website modification
- Enterprise purchase flow
- New dashboards
- New executive UI
