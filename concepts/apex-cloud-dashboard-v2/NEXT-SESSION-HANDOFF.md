# ApexOneIQ Next Session Handoff

## Current Stable State

- ApexOneIQ is live at `https://apexoneiq.com` with the ApexOneIQ Executive OS WordPress theme active.
- SSL is valid and WordPress authentication is the primary login layer.
- Stripe Sandbox checkout session creation works for Cloud, Command, Concierge Essentials, and Concierge Growth.
- Stripe Sandbox webhook signature verification is configured in WordPress admin settings.
- Subscription lifecycle events synchronize into WordPress subscription tables and user meta.
- Capability-based entitlements protect Executive workspaces before dashboard content renders.
- Owner Console is available in WordPress admin for subscription, MRR/ARR, failed payment, and webhook health.
- Customer account foundation is available at `/account` and `/account.html`.

## Phase 28 Completed

- Configured webhook signing secret in WordPress settings without committing it.
- Added customer account/billing status surface.
- Verified unsigned, signed, live-mode, and replay webhook behavior.
- Created a non-admin subscriber and confirmed pre-subscription workspace lockout.
- Verified browser routing reaches Stripe-hosted Checkout from the subscription page.
- Created a real Stripe Sandbox customer and subscription tied to the WordPress user metadata.
- Verified Stripe-delivered subscription/invoice webhooks persist subscription state and unlock Cloud access.
- Verified renewal, payment failure/grace, and cancellation lifecycle transitions.
- Verified Owner Console reflects active, past-due, and canceled states.
- Verified live-key settings attempts are rejected.

## Remaining Limitation

- Headless browser automation could not complete the hosted Stripe card form because Stripe rendered payment-method accordion and hCaptcha-protected controls without exposing the card-entry fields to Playwright. A visible/manual hosted Checkout payment should be performed before treating the browser-card path as fully validated.

## Recommended Phase 29

1. Perform a visible/manual Stripe-hosted Checkout card purchase with a fresh subscriber.
2. Implement Stripe Customer Portal session creation for Manage Billing.
3. Add upgrade/downgrade subscription-change routes.
4. Add cancel-at-period-end customer flow instead of immediate cancellation only.
5. Add webhook event detail drilldown and retry visibility to Owner Console.
6. Add automated cleanup tooling for Sandbox test customers/subscriptions.
