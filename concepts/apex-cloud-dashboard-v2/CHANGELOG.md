# Apex Cloud Dashboard v2 Changelog

## Phase 17B - Executive Decision System

- Created a new isolated concept at `concepts/apex-cloud-dashboard-v2/` by copying the preserved Version 1 concept and editing only the v2 copy.
- Reframed the main dashboard from reporting dashboard to Executive Intelligence Advisor.
- Added top-of-dashboard Business Health Summary with explained status, risk, momentum, AI visibility, biggest opportunity, estimated monthly impact, and forecast.
- Converted KPI cards into clickable intelligence modules with "why this score" explanations, causes, business impact, recommended improvements, time, difficulty, confidence, and expected gains.
- Added the Executive Action Center with only the highest-value actions ranked by business impact, confidence, time, difficulty, projected AVI lift, revenue opportunity, and urgency.
- Added improvement path visualization from Business Trust 68 through GBP, service-area proof, trusted listings, AI comparison content, and Top Three probability.
- Added "Why?" explanation controls for the primary chart and key market events.
- Expanded Ask Apex into a conversational analyst drawer with realistic advisor responses.
- Added Business Impact Layer translating market movement into leads, revenue opportunity, market share, search share, trust growth, customer discovery, and decision confidence.
- Added Opportunity Simulation showing forecast changes from current state to recommendation #1 and recommendations #1-3.
- Rebuilt the dedicated Action Center page with full opportunity detail drawers and consultant-style recommendation evidence.
- Removed copied upgrade-path links to higher tiers from v2 pages and replaced them with Cloud v2 review messaging.

## Isolation Confirmation

- Phase 17A remains preserved at `projects/apex-ranks/concepts/apex-cloud-dashboard-v1/`.
- No production, plugin, Phase 16, Phase 17A, Apex Command, or Apex Enterprise files were edited.
- Apex Command has not been started.
- Apex Enterprise has not been started.

## Phase 17B Refinement - AI Executive Advisor

- Converted recommendation detail drawers into Executive Playbooks with missing items, visual checklists, progress bars, estimated time, expected business result, confidence, and mark-complete controls.
- Added connected executive workflow from Morning Brief to Health Summary, Top Priority, Playbook, Mark Complete, Updated Forecast, Business Impact, and Tomorrow's Priority.
- Added Today's Progress tracking for completed actions, Business Trust, Customer Discovery, AI Recommendations, Market Position, and Revenue Improvement.
- Reframed KPI language from technical reporting toward owner-facing outcomes: Customer Discovery, Business Trust, AI Recommendations, Growth Forecast, Best Opportunity, Competitive Attention, and Action Window.
- Expanded Business Impact outcomes with estimated leads, calls, appointments, revenue, market share, customer growth, trust improvement, and AI discovery growth.
- Added proactive coaching across the dashboard and secondary pages.
- Refined Executive Brief, Action Center, Competitors, Growth Forecast, AI Recommendations, Reports, Alerts, Website Profile, Settings, and Market Timeline to answer what it means, what to do, and what happens if ignored.
- Preserved the existing visual system and layout direction.

## Phase 17C - Executive Intelligence Finalization

- Completed a typography and layout polish pass across the v2 concept with stronger button fit, pill padding, row-action widths, drawer spacing, drawer headers, mobile wrapping, and card alignment.
- Shortened cramped mobile subscription copy and replaced unfinished settings copy with finished executive product language.
- Strengthened the Executive Action Center so each recommendation explains why now, why it outranks alternatives, what constraint it removes, what it unlocks, opportunity cost, expected business result, and confidence.
- Expanded all opportunity playbooks with advisor-style reasoning, progress checklists, business impact callouts, ignored-risk explanations, and disabled future execute handoff points.
- Replaced owner-facing technical wording around citations with trusted-listing and proof language.
- Added an Executive Intelligence Chain connecting Business Trust, Customer Discovery, AI Recommendations, Market Position, Revenue Opportunity, and Next Priority.
- Added competitor decision intelligence for act-today vs wait, lead leakage, opportunity window, threat acceleration, probability shift, and risk timeline.
- Polished drawer hierarchy and information density so drawers feel like executive consultant briefings instead of detail popovers.
- Preserved the existing visual system and avoided any production, plugin, Apex Command, or Apex Enterprise work.

## Phase 18 - Executive Intelligence Operating System

- Added the new `business-timeline.html` Executive Timeline page as a business story, not an activity log.
- Added `monitoring-center.html` as a visual business-monitoring architecture surface with Website, Google Business, Competitor, Review, Content, AI Visibility, Trust, Local Presence, Lead, and Revenue Opportunity monitoring modules.
- Rebuilt the sidebar into a calm Executive OS hierarchy using shared navigation rendering in `js/app.js`.
- Added dashboard Evidence Layer architecture showing the support chain behind recommendations: action, Business Trust, competitor average, missing proof, and expected outcome.
- Added Business Momentum story cards for discovery trend, trust growth, competitive pressure, lead opportunity, revenue opportunity, and next priority.
- Added Executive Memory concepts connecting previous recommendations, completed work, observed outcomes, and the next recommendation.
- Expanded Competitor Intelligence 2.0 with danger level, response timing, business at risk, recommended response, effort, and expected gain.
- Added Phase 18 CSS primitives for timeline cards, monitoring modules, evidence stacks, memory rows, competitor briefs, story graphs, grouped navigation, and sidebar overflow.
- Preserved visual architecture only: no backend logic, APIs, monitoring engines, Apex Command, Apex Enterprise, production, or plugin work.

## Phase 19 - Executive Identity Pass

- Reframed the rendered product identity from Apex Cloud v2 to ApexOneIQ Executive Intelligence OS through shared brand, title, sidebar, and system-card rendering.
- Refined Dashboard into Mission Control with a higher-signal opening, ApexOneIQ language, and a stronger morning-cockpit feel.
- Elevated the Executive Intelligence Chain into the ApexOneIQ Signal Flow signature visualization: Business Trust, Customer Discovery, AI Recommendations, Market Position, Revenue, and Next Executive Decision.
- Differentiated Executive Timeline into an Executive Journal with more narrative, memory, and business-evolution language.
- Differentiated Reports into Board Briefings with boardroom/consulting language and report rows framed around decisions.
- Differentiated Monitoring Center into Business Pulse with live-condition language and animated monitor status cues.
- Differentiated Forecast into Future Simulation with forward-model language and a stronger predictive atmosphere.
- Reduced remaining traditional optimization language in visible advisor copy and emphasized business trust, customer discovery, revenue, risk, and decisions.
- Added Phase 19 CSS identity treatments for Mission Control, signature flow, journal mode, board briefings, living monitoring, and predictive simulation.
- Preserved scope: no backend, APIs, monitoring engines, execution engines, plugins, production changes, Apex Command, or Enterprise work.

## Phase 20 - Executive Visualization Pass

- Added a dominant Mission Control executive visualization with a Business Health Wheel, KPI orbit nodes, forecast score tiles, action-window indicators, and a signal heat map.
- Added a Business Pulse hero visualization with a live trend/velocity graph, competitor-pressure line, condition stack, and status chips.
- Added a Board Briefings hero visualization with quarterly-style executive bars, briefing confidence scorecards, and board-packet signal framing.
- Added a Future Simulation hero visualization with predictive scenario curves, action-vs-wait confidence rings, and a clearer decision-point marker.
- Added an Executive Journal hero visualization with an Executive Memory Map, milestone nodes, and dense memory outcome scorecards.
- Added shared Phase 20 CSS primitives for enterprise-style visualization shells, orbit rings, area charts, score tiles, heat maps, board bars, mini rings, and memory maps.
- Reduced first-screen reliance on explanatory cards by putting visual intelligence before the existing text-heavy reasoning sections.
- Preserved foundation architecture, routing, navigation rendering, backend-free concept behavior, data models, modules, production files, plugin files, Apex Command, and Enterprise.

## Phase 20 Extension - Executive Visual Intelligence Systems

- Pushed Mission Control further beyond card-based reporting with a Sankey-style signal pipeline, opportunity impact/effort matrix, forecast cone, relationship graph, and visual cause-and-effect recommendation map.
- Converted the dashboard Executive Memory module into a horizontal milestone rail with completed playbooks, decision points, AI recommendation signals, and projected future actions.
- Added Business Pulse visual monitoring systems: living conditions map, status rings, and an incoming-signal pipeline that converts monitoring events into executive decisions.
- Added Board Briefings visual systems: revenue waterfall chart and board decision matrix to make reports feel like executive packets instead of export tools.
- Added Future Simulation visual systems: confidence-band forecast and decision tree showing act, wait, and drift outcomes.
- Expanded Executive Journal with timeline-first memory, decision lanes, and compact supporting evidence so the memory module reads as business evolution rather than an activity log.
- Added subtle premium motion across the concept, including flowing signal paths, breathing map cells, animated rings, moving ribbons, and pulsing graph indicators.
- Fixed mobile Executive Journal timeline layout so evidence rows remain readable and do not collapse into narrow columns.
- Preserved concept-only scope: no backend, routing, plugins, production files, Apex Command, Apex Enterprise, APIs, or monitoring engines were modified.

## Phase 20 Final Polish - Executive Workflow Hierarchy

- Removed the dashboard's top chart cluster and visual-intelligence board to reduce interface weight and avoid another major redesign.
- Promoted Today's Executive Checklist into the primary action area directly after Business Status.
- Reordered Mission Control into the requested executive workflow: Business Status, Executive Checklist, Evidence Layer, Executive Memory, Future Simulation, and Ask Apex.
- Preserved the Evidence Layer, Future Simulation controls, drawer interactions, Ask Apex prompts, and recommendation playbooks.
- Reduced repeated explanations and duplicate metrics by removing the KPI grid, workflow repeat, progress repeat, momentum cards, explained market chart, improvement path repeat, and business impact repeat from the main dashboard.
- Cleaned the Executive Memory rail with aligned connecting line and milestone nodes across desktop and mobile.
- Balanced the Business Status panel by removing the duplicate forecast tile now represented in Future Simulation.
- Preserved concept-only scope: no new visualizations, backend functionality, routing, plugins, production files, Apex Command, or Enterprise work.

## Final QA Pass - Interaction and Navigation Audit

- Removed remaining placeholder `href="#"` controls and converted them into valid routes or Ask Apex actions.
- Standardized Action Center, AI Visibility, Alerts, Reports, Settings, Website Health, Executive Brief, Market Timeline, and Executive Memory controls so visible interactions perform a real behavior.
- Made Ask Apex universal across ApexOneIQ by injecting a shared assistant drawer on pages that did not already include one.
- Converted Ask Apex from a placeholder response into a chat-style executive assistant drawer with page-aware default prompts, contextual suggested questions, and a working mock input flow.
- Standardized "Explain" interactions to launch Ask Apex, "Open Playbook" and "Evidence" interactions to open drawers/routes, timeline milestones to open memory explanations, filters to filter visible rows, and charts to open contextual explanation drawers.
- Added meaningful fallback behavior for any remaining generic action control so a new subscriber receives an appropriate assistant response instead of a dead click.
- Added Ask Apex drawer styling and captured `reports/final-qa-ask-apex-dashboard.png`.
- Preserved concept-only scope: no redesign, backend functionality, routing architecture changes, plugins, production files, Apex Command, or Enterprise work.

## Phase 21 - Apex Command and Apex Enterprise Workspaces

- Created two new isolated workspace concept pages without overwriting, renaming, or replacing completed Cloud pages:
  - `command-dashboard.html`
  - `enterprise-dashboard.html`
- Built Apex Command as an execution operating system with Command Center hero, Active Agent Queue, Command Pipeline, Automation Health, Today's Production, Execute Now actions, AI Workforce, Approval Center, Activity Feed, Performance, and live notifications.
- Built Apex Enterprise as an executive operations workspace with Enterprise Operations hero, Regional Overview, Organization Tree, Executive KPIs, Multi-location Ranking, AI Adoption, Brand Compliance, Team Performance, Executive Reports, Enterprise Alerts, Forecast, and Ask Apex Enterprise prompts.
- Added workspace switchers inside the new Command and Enterprise pages so Cloud, Command, and Enterprise coexist naturally without modifying existing Cloud page markup.
- Added scoped Command/Enterprise CSS primitives for execution tables, pipeline boards, AI workforce cards, regional maps, organization trees, enterprise KPI grids, compliance panels, and mobile layouts.
- Added Command and Enterprise document titles plus Ask Apex context prompts in shared concept JavaScript.
- Preserved Apex Cloud as the locked visual reference: no Cloud HTML pages were overwritten, renamed, or replaced.
- Preserved concept-only scope: no production code, plugin code, backend services, or external routing were modified.

## Apex Concierge Workspace

- Created `concierge-dashboard.html` as a separate premium done-for-you client workspace without modifying Cloud, Command, or Enterprise page markup.
- Added Daily Executive Progress Report, Live Work Queue, In Progress Tasks, Waiting for Client Approval, Completed Tasks Timeline, Upcoming Scheduled Work, Business Impact Dashboard, Executive Progress Timeline, Assigned Apex Team, Monthly Strategy Roadmap, Executive Reports, Task History, Client Messaging, Priority Support, Strategy Meeting Scheduler, ROI Dashboard, Estimated Revenue Growth, and Executive Memory integration.
- Added Concierge pricing concept: Concierge Essentials at `$499/month`, Concierge Growth at `$999/month` as recommended, and Concierge Elite starting at `$2,500/month`.
- Added Concierge-specific workspace navigation and Ask Apex prompts for progress, approvals, messaging, ROI, strategy, meetings, and tier comparison.
- Added scoped Concierge CSS for premium client panels, work queue rows, approvals, team roster, roadmap lanes, messaging, ROI cards, meeting options, and pricing cards.
- Preserved concept-only scope: no production code, plugin code, backend services, Cloud pages, Command pages, or Enterprise pages were modified.

## Phase 22 - Subscription Architecture and Concierge Enrollment

- Created `subscription.html` as the ApexOneIQ plan-comparison experience for Free, Cloud, Command, Concierge Growth, and Enterprise without overwriting existing workspace pages.
- Created `concierge-enrollment.html` as a selective seven-step front-end onboarding concept covering managed plan selection, business information, priorities, goals, connection readiness, strategy-call selection, review, and success state.
- Added software monthly/annual pricing toggle with two months free for Cloud and Command only; Concierge managed-service plans remain monthly scope-based concepts.
- Added Concierge tier comparison for Essentials `$499/month`, Growth `$999/month` recommended, and Elite starting at `$2,500/month`, with responsible scope language and working enrollment links.
- Improved the compact Concierge pricing section in `concierge-dashboard.html` with best fit, included service, cadence, support level, and CTAs while keeping the workspace focused on client progress.
- Added page-aware Ask Apex prompts for subscription and enrollment plan guidance.
- Added interaction support for billing toggles, tier comparison, plan selection, enrollment step navigation, validation states, meeting selection, connection readiness toggles, success state, and workspace preview links.
- Added shared Phase 22 CSS for premium subscription layout, plan progression, plan rows, managed-service comparison, enrollment progress, forms, choice grids, validation states, and responsive mobile behavior.
- Preserved concept-only scope: no production code, plugins, backend billing, Stripe, authentication, live onboarding, API connections, or external routing were modified.

## Phase 22.1 - Subscription Experience Refinement

- Refined `subscription.html` from a pricing-style comparison into a guided executive journey: Free, Cloud, Command, Concierge Essentials, Concierge Growth, and Enterprise.
- Moved Concierge Essentials into the primary subscription progression and preserved the lower Concierge section as detailed managed-service comparison.
- Added dual actions to every applicable plan: a primary choose/apply/contact CTA and a secondary workspace preview CTA.
- Created `free-dashboard.html` as a lightweight Executive Snapshot with Business Health Snapshot, Executive Summary, Top Three Opportunities, One Recommended Action, Executive Score, Recent Activity, and upgrade path to Cloud.
- Created `concierge-essentials-dashboard.html` as a simpler managed-service workspace for small-business monthly support, including Assigned Apex Specialist, Current Monthly Campaign, Monthly Progress, Completed Tasks, Pending Approvals, Upcoming Optimization, Monthly Report, Support Requests, and Growth upgrade path.
- Improved Enterprise positioning around organization-wide operations, multi-location management, executive governance, dedicated onboarding, and custom implementation.
- Elevated subscription copy toward business outcomes: executive clarity, strategy-to-execution, managed monthly support, Apex Growth Team, and organization-wide operations.
- Added route-aware Ask Apex titles and prompts for the Free Snapshot and Concierge Essentials workspaces.
- Added scoped Phase 22.1 CSS for six-step journey progression, dual plan actions, Free Snapshot modules, Concierge Essentials modules, and responsive collapse behavior.
- Preserved concept-only scope: no production code, completed dashboards, plugins, backend billing, Stripe, authentication, API integrations, or live onboarding were modified.

## Phase 22.2 - Subscription Routing and Purchase Flow Preparation

- Removed `Preview Workspace` actions from Apex Concierge Growth and Apex Enterprise because Growth is consultation-led managed service and Enterprise is custom implementation.
- Updated primary subscription CTAs to route to front-end placeholders for future purchase flow:
  - Free: `/sign-in/`
  - Cloud: `/checkout/cloud/`
  - Command: `/checkout/command/`
  - Concierge Essentials: `/checkout/essentials/`
  - Concierge Growth: `/checkout/growth/`
  - Enterprise remains contact-based.
- Created `sign-in.html` as the Executive Sign In/Create Account/Forgot Password/Continue with Google/Magic Link concept page with no backend authentication.
- Added `/sign-in/` route placeholder and checkout placeholder route pages for Cloud, Command, Essentials, and Growth so purchase CTAs resolve without dead routes.
- Added a shared topbar Sign In control through concept JavaScript so completed dashboard HTML files remain untouched.
- Documented future Stripe environment-variable expectations in validation notes:
  - `NEXT_PUBLIC_STRIPE_PRICE_CLOUD`
  - `NEXT_PUBLIC_STRIPE_PRICE_COMMAND`
  - `NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS`
  - `NEXT_PUBLIC_STRIPE_PRICE_GROWTH`
- Preserved concept-only scope: no Stripe integration, authentication logic, billing logic, backend implementation, production code, plugins, or existing dashboard markup were modified.

## Phase 23 - Production Foundation and Stripe Architecture

- Created `STRIPE-IMPLEMENTATION.md` documenting product pricing, placeholder environment variables, checkout route responsibilities, server-side Checkout Session responsibilities, webhook events, success/cancel routing, and Stripe security rules.
- Created `SUBSCRIPTION-ENTITLEMENTS.md` defining capability-based authorization for Free, Cloud, Command, Concierge Essentials, Concierge Growth, Enterprise, and Elite.
- Created `ASK-APEX-ARCHITECTURE.md` establishing Ask Apex as a backend-mediated Executive Advisor with browser -> Apex Backend -> Context Builder -> OpenAI -> Apex Backend -> browser response flow.
- Created `PURCHASE-FLOW.md` documenting the customer journey from landing to subscription, checkout, Stripe, authentication, workspace entitlement, executive onboarding, and dashboard.
- Created `AUTHENTICATION-FLOW.md` documenting Create Account, Sign In, Forgot Password, Email Verification, Magic Link, Organization Creation, Workspace Selection, First Login, and Executive Welcome.
- Created `PROJECT-ARCHITECTURE-REVIEW.md` reviewing duplicate pages, navigation inconsistencies, naming inconsistencies, future technical debt, UX inconsistencies, and production recommendations.
- Preserved architecture-only scope: no Stripe integration, payment processing, authentication implementation, backend functionality, production code, or plugin code was modified.

## Phase 24 - Stripe Checkout Integration Sandbox

- Added `server.js` as a sandbox-only Apex backend concept server that serves the existing static workspace and creates Stripe Checkout Sessions through backend POST routes.
- Added `package.json` with `start` and `validate` scripts for the concept server and JavaScript syntax checks.
- Added `.env.sandbox.example` with the exact sandbox price IDs supplied for Cloud, Command, Concierge Essentials, and Concierge Growth. No secret keys were committed.
- Implemented backend checkout routes:
  - `POST /api/billing/checkout/cloud`
  - `POST /api/billing/checkout/command`
  - `POST /api/billing/checkout/essentials`
  - `POST /api/billing/checkout/growth`
- Updated `subscription.html` purchase buttons so software and managed-service purchases call the Apex backend instead of linking to static checkout placeholders.
- Updated `/checkout/cloud/`, `/checkout/command/`, `/checkout/essentials/`, and `/checkout/growth/` to start backend-created Stripe Sandbox Checkout Sessions.
- Added `checkout/success.html` and `checkout/cancel.html` return pages for sandbox Checkout success and cancellation routing.
- Added frontend checkout handling in `js/app.js` with disabled-button state, backend POST request, Stripe URL redirect, and a clear "Checkout Not Ready" drawer if sandbox environment variables are missing.
- Enforced sandbox-only billing behavior by rejecting non-`sk_test_` Stripe secret keys in the backend route.
- Preserved the capability architecture boundary: Cloud and Command remain software entitlements; Concierge Essentials and Concierge Growth remain managed-service products with separate entitlement metadata.
- Preserved scope: no Stripe products were created, no checkout URLs were hardcoded, no Live mode was implemented, no dashboards were redesigned, no production code was deployed, and Enterprise/Elite remain contact-sales only.

## Phase 25 - WordPress Integration Foundation

- Created a complete fresh-install backup of the live ApexOneIQ WordPress development site before theme installation.
- Created the `apexoneiq-executive-os` custom WordPress theme in `wordpress-integration/themes/apexoneiq-executive-os/`.
- Preserved the Executive Design System by moving the existing static ApexOneIQ workspace HTML, CSS, and JavaScript into the theme without redesigning layouts, typography, spacing, navigation, dashboards, or animations.
- Added WordPress theme structure:
  - `style.css`
  - `functions.php`
  - `front-page.php`
  - `index.php`
  - `inc/static-renderer.php`
  - `inc/billing-routes.php`
  - `template-parts/workspace-shell.php`
  - `assets/css/app.css`
  - `assets/js/app.js`
  - `templates/static/`
- Added WordPress rewrite routing for root dashboard, `.html` workspace pages, `/sign-in/`, checkout placeholder pages, and sandbox-safe checkout API routes.
- Added a WordPress static renderer that serves the saved Executive OS pages through the active WordPress theme while replacing concept-local asset and navigation URLs with WordPress-aware URLs.
- Added a sandbox-safe WordPress checkout route handler that preserves the existing Stripe architecture boundary, rejects live keys, and returns `stripe_not_configured` until a sandbox secret is configured.
- Installed and activated the custom theme on the live ApexOneIQ WordPress development site.
- Used temporary backup utility plugins only to create the fresh WordPress backup; both temporary plugins were removed from the live site after backup verification.
- Preserved scope: no production Stripe keys, live payment processing, Enterprise/Elite subscription logic changes, dashboard redesign, Twenty Twenty-Five edits, MixtapePSD changes, AICandlez changes, or production-site migrations were performed.

## Phase 26 - Stripe Sandbox End-to-End Validation

- Added `inc/admin-settings.php` to provide a WordPress admin settings page for sandbox Stripe credentials without hardcoding or committing keys.
- Updated `inc/billing-routes.php` so checkout routes can read sandbox keys from server environment values or WordPress options.
- Preserved the existing sandbox-only guard: checkout still rejects non-`sk_test_` secret keys before contacting Stripe.
- Configured the live WordPress development site with Stripe Sandbox credentials through trusted HTTPS after SSL validation passed.
- Validated real Stripe Sandbox Checkout Session creation for:
  - Apex Cloud
  - Apex Command
  - Apex Concierge Essentials
  - Apex Concierge Growth
- Verified all created sessions use the existing sandbox Price IDs and no new Stripe products were created.
- Verified each checkout route returns a Stripe-hosted Checkout URL.
- Verified checkout success and cancel pages return HTTP 200.
- Added `inc/subscription-state.php` as the WordPress user subscription-state foundation for the future entitlement phase.
- Updated the static renderer and theme JavaScript so dashboard Sign In routes through WordPress authentication while preserving the current Executive Dashboard UI.
- Updated direct sign-in routes so `/sign-in.html` and `/sign-in/` hand off to WordPress login instead of the previous placeholder sign-in concept.
- Preserved scope: no live Stripe credentials, pricing changes, new products, dashboard redesign, Enterprise/Elite checkout conversion, or entitlement enforcement were added.

## Phase 27 - Stripe Subscription Lifecycle

- Added a signed Stripe Sandbox webhook endpoint at `/api/stripe/webhook`.
- Added webhook signature verification using the Stripe `Stripe-Signature` header and `whsec_` signing secret.
- Added live-mode rejection so signed events with `livemode: true` are rejected in the sandbox WordPress environment.
- Added support for required Stripe lifecycle events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- Added subscription persistence tables through WordPress `dbDelta`:
  - `wp_apexoneiq_subscriptions`
  - `wp_apexoneiq_webhook_events`
- Added a centralized subscription-state service that answers authentication, active status, plan, capabilities, renewal date, grace period, trial status, cancellation, and expiration.
- Added capability-based entitlement mapping so plans enable capabilities instead of hardcoded application checks.
- Updated checkout creation so Stripe Checkout Sessions require a logged-in WordPress user and carry `wordpress_user_id` and `apex_plan` metadata into both the Checkout Session and Stripe Subscription.
- Added workspace protection before static dashboard rendering:
  - unauthenticated protected workspace requests redirect to WordPress login
  - authenticated users without the required capability see an upgrade experience
  - administrators retain owner access
- Added the owner-facing WordPress admin console at `ApexOneIQ Owner` with customer/subscription status, MRR/ARR estimates, failed payment count, recent subscriptions, and webhook health.
- Created a Stripe Sandbox webhook endpoint for the live development site and saved its signing secret in WordPress settings over trusted HTTPS without committing secrets.
- Preserved scope: no dashboard redesign, no live Stripe keys, no committed secrets, no new Stripe products, and no Enterprise/Elite checkout conversion.

## Phase 28 - Stripe Sandbox Customer Lifecycle

- Installed the Stripe Sandbox webhook signing secret into WordPress admin settings without hardcoding or committing the secret.
- Added a protected `/account` and `/account.html` customer account surface inside the ApexOneIQ theme using the centralized subscription state service.
- Added account-level billing architecture placeholders for current plan, billing status, renewal date, entitlement count, manage billing, upgrade/downgrade, and cancellation routing without changing Executive Dashboard UI.
- Verified webhook security behavior over HTTPS: unsigned events fail, signed Sandbox events process, signed live-mode events are rejected, and duplicate event IDs return idempotent duplicate responses.
- Created a new non-admin WordPress subscriber for lifecycle testing and verified protected Cloud workspace access is blocked before entitlement.
- Verified browser checkout routing reaches Stripe-hosted Checkout for the subscriber, but Stripe's hosted payment form did not expose card-entry fields in headless automation because the page rendered payment-method accordion/hCaptcha-protected controls.
- Created a real Stripe Sandbox customer and active Cloud subscription through the Stripe API using the subscriber's WordPress user ID and plan metadata, allowing Stripe to deliver real subscription and invoice webhooks to WordPress.
- Verified Stripe-delivered `customer.subscription.created` and `invoice.paid` events persisted the subscription, linked the WordPress user to the Stripe customer/subscription, granted Cloud entitlements, updated Owner Console metrics, and unlocked the Cloud dashboard.
- Verified signed renewal, past-due, replay, and cancellation lifecycle paths: renewal processed, past-due granted grace access and updated failed-payment metrics, cancellation removed workspace access and updated Owner Console status.
- Verified invalid live-key settings submission is rejected and existing Sandbox checkout configuration remains usable afterward.
- Preserved scope: no dashboard redesign, no Live Stripe keys, no production Stripe mode, no Enterprise/Elite logic changes, and no committed secrets.
