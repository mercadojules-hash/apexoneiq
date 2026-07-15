# ApexOneIQ Acceptance Test - Cloud Intelligence Tier 1

Date: 2026-07-15

## Fixed

- Replaced the post-scan Executive Score Trend placeholder with an executive baseline timeline: axes, grid, initial scan marker, projected progression, and "Historical data begins here" callout.
- Replaced GBP and Action Center playbook drawers with scan-driven recommendation content built from the current scan profile.
- Added evidence explanations for missing/weak GBP proof, review depth, business categories, FAQ schema, local signals, trust entities, and citations.
- Added drawer navigation for scan-driven playbooks: Back, Previous, Next, and position count.
- Replaced disabled "Future Execute" labels with disabled "Coming Soon" controls and clarified execution automation is deferred.
- Fixed existing-workspace routing for admins/customers by treating completed onboarding or an entitled/admin stored business website as `workspaceReady`.
- Fixed Google/OAuth destination logic to send existing workspaces to `dashboard.html` instead of restarting onboarding.
- Preserved admin entitlement bypass so Owner/Admin users do not see upgrade gates when they already have a workspace.
- Synced corrected static source files into the WordPress theme asset/template copies.

## Validation

- `npm run validate` passed.
- `node --check js/app.js` passed.
- `node --check wordpress-integration/themes/apexoneiq-executive-os/assets/js/app.js` passed.
- PHP CLI is not installed locally, so PHP lint could not be run in this shell.

## Screenshots

- `01-dashboard-baseline.png`
- `02-gbp-playbook-drawer.png`
- `03-playbook-next-navigation.png`
- `04-action-center-scan-playbook.png`
- `05-executive-scan-screen.png`
- `06-homepage-authenticated.png`
- `07-executive-scan-entry-unauthenticated.png`

## Deployment

- Packaged deployable theme: `apexoneiq-executive-os-0.2.2.zip`.
- Production deployment is blocked: stored ApexOneIQ WordPress admin password is stale, and SSH key auth to the known GoDaddy host is denied.

## Deferred

- Execution automation remains intentionally deferred and is now shown as disabled `Coming Soon`.
