# ApexOneIQ Public Homepage, Registration, Subscription, Demo, and Intake Audit

Date: 2026-07-11
Local audit server: `http://127.0.0.1:4188`

## Screenshots

- Homepage desktop: `reports/apex-ui-audit-20260711/homepage-desktop.png`
- Homepage mobile: `reports/apex-ui-audit-20260711/homepage-mobile.png`
- Subscription hero desktop: `reports/apex-ui-audit-20260711/subscription-desktop.png`
- Subscription hero mobile: `reports/apex-ui-audit-20260711/subscription-mobile.png`
- Registration desktop: `reports/apex-ui-audit-20260711/register-desktop.png`
- Registration mobile: `reports/apex-ui-audit-20260711/register-mobile.png`
- MixtapePSD intake result: `reports/apex-ui-audit-20260711/mixtapepsd-free-dashboard.png`
- Machine audit JSON: `reports/apex-ui-audit-20260711/audit-report.json`

## Issues Found and Fixed

- Homepage `Start Free` routed to sign-in instead of registration. Fixed to `/register/`.
- Homepage hero score was visually disconnected. Replaced with large animated circular Executive Score, ring fill, glow, and score presentation.
- Homepage chart hierarchy was too weak. Strengthened bars, line movement, starting/projected states, and projection disclaimers.
- Ratings block was missing. Added composed Business Signals panel with mixed rings, bars, compact cards, staggered animation, and non-identical category treatment.
- Homepage capture form was cramped and the support sentence could hang awkwardly. Reworked field row, CTA row, spacing, hierarchy, and mobile stacking.
- Demo CTA hierarchy was weak. Centered hierarchy around Start Free, View Demo Dashboard, Sign In.
- Static registration page failed on `/register/` because assets were relative to `/register/`. Fixed root-absolute assets.
- Standalone registration handler treated empty `data-static-register` as false. Fixed dataset presence check.
- Registration desktop layout overlapped because auth pages inherited dashboard grid columns. Fixed auth shell layout.
- Subscription hero H1 was oversized and composition was compressed. Reduced H1 size, improved spacing, and rebalanced columns.
- Software billing selector looked like a small form. Rebuilt panel hierarchy, monthly/annual tiles, annual savings note, and billing copy.
- Subscription Enterprise CTA caused horizontal overflow. Fixed plan action sizing.
- Demo mode initially risked account/control exposure through nav and account areas. Added demo-mode banner, safe mock context, hidden Settings/Integrations/Billing nav controls, disabled authenticated actions, and demo workspace account replacement.
- Free/Cloud/Command/Essentials preview sidebars were inconsistent. Added route-aware preview navigation with included, demo, and upgrade-only states.
- Business contact routing was incomplete. Added official billing/support/sales links in billing/account, Essentials support, Enterprise/custom-plan sales, and preview nav support.

## Issues Deferred

- WordPress PHP lint could not run because `php` CLI is not installed in the local environment.
- OAuth is intentionally not active. Callback placeholders exist, and `OAUTH-SETUP.md` documents required credentials and safeguards.
- The static sandbox simulates registration and profile persistence with `localStorage`; production WordPress registration uses `wp_create_user`, user meta, auth cookies, and Free Dashboard redirect.
- Live intelligence generation for MixtapePSD is not connected. Dashboard values remain safe mock placeholders labeled as pending/static.
- Account route is WordPress-only; the standalone Node static server does not render `/account`.

## Pages Validated

- Homepage
- Registration
- Sign In
- Free Dashboard demo
- Cloud Dashboard demo
- Command Dashboard demo
- Concierge Essentials demo
- Concierge Growth Dashboard
- Enterprise Dashboard
- Subscription page
- Checkout Cloud
- Checkout Command
- Checkout Essentials
- Checkout Growth
- Checkout Success
- Checkout Cancel

## Demo Access Behavior

- Public demo URLs use `?demo=1`.
- Demo mode shows a visible Demo Workspace banner.
- Demo mode replaces account identity with safe demo context.
- Demo mode hides Settings, Integrations, Billing, and account-management navigation from preview nav.
- Demo mode disables authenticated actions such as checkout, completion actions, and enrollment submit controls.
- Demo content uses mock/safe data only.

## Workspace Preview Comparison

- Free preview: snapshot, business snapshot, top recommendations, upgrade path, Cloud demo, Command upgrade, Concierge upgrade.
- Cloud preview: executive dashboard, brief, action center, competitors, AI visibility, timeline, reports, alerts, forecast, website health; system controls hidden in demo.
- Command preview: communicates Cloud intelligence plus execution with Command Center, approvals, agent work, automation health, and upgrade-only managed service/enterprise items.
- Concierge Essentials preview: communicates managed monthly service with monthly priorities, approvals, completed work, upcoming work, reporting, support, included Cloud context, and upgrade-only execution/growth items.

## MixtapePSD Intake Test

Test URL: `https://mixtapepsd.com`

- Production MixtapePSD website was not modified.
- Homepage accepted the website URL and email.
- Registration route received URL/email parameters.
- Static registration created a local placeholder profile.
- Free Dashboard loaded after registration.
- Free Dashboard displayed the submitted website and an Intake Captured banner.
- Data classification: submitted URL is live input; business profile is local/WordPress profile data; dashboard metrics are safe mock placeholders; snapshot generation is pending/static.

## OAuth Architecture and Manual Setup

See `OAUTH-SETUP.md`.

Required production redirect URIs:

- Google: `https://apexoneiq.com/oauth/google/callback/`
- Apple: `https://apexoneiq.com/oauth/apple/callback/`

Required owner-created credentials:

- Google web OAuth client ID and client secret.
- Apple Services ID, Team ID, Key ID, and private key.

Required safeguards before activation:

- Server-side state generation and validation.
- Nonce validation for OIDC.
- Server-side code exchange.
- Issuer/audience/expiration/email verification.
- Existing-email collision protection.
- Account-linking safeguards.
- Same-origin redirect allowlist.

## Validation Results

- `npm run validate`: passed.
- Playwright route audit: 16 routes, zero reported issues.
- Required screenshots captured.
- MixtapePSD intake path passed.
- PHP lint: blocked because `php` command is unavailable.

## Remaining Blockers

- Production OAuth credentials and provider configuration do not exist yet.
- WordPress registration should be tested in a real WP runtime with email delivery, cookies, rewrite flush, and nonce lifecycle.
- Stripe remains sandbox-only; live mode intentionally not enabled.
- Live business snapshot generation pipeline still needs implementation.

## Recommended Next Phase

Connect the Free Dashboard to a real snapshot-generation service with explicit loading/error/persistence states, then test the WordPress registration flow in staging with real cookies, rewrite rules, user creation, and entitlement redirects.
