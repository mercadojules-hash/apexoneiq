# ApexOneIQ Stripe Implementation

Status: Version 1.0 uses backend-created Stripe Checkout Sessions. ApexOneIQ never collects, receives, stores, logs, or forwards card numbers; customer payment data is entered only on Stripe Checkout's hosted payment page.

## Plans

| Internal Plan | Stripe Product | Price | Price Env | Purchase Model |
| --- | --- | ---: | --- | --- |
| `free` | None | $0 | None | No checkout |
| `diy` | Apex Command | $199/month | `STRIPE_PRICE_DIY` | Stripe Checkout subscription |
| `ai_automated` | Apex Concierge Essentials | $499/month | `STRIPE_PRICE_AI_AUTOMATED` | Stripe Checkout subscription |
| `concierge` | Apex Concierge Growth | $999/month | `STRIPE_PRICE_CONCIERGE` | Stripe Checkout subscription |
| `qa_full_access` | ApexOneIQ QA Full Access | $1/month | `STRIPE_PRICE_QA_FULL_ACCESS` | Hidden internal Stripe Test Mode subscription |
| `enterprise` | None | Request information | None | No checkout |

## Required Environment Variables

```bash
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_DIY=
STRIPE_PRICE_AI_AUTOMATED=
STRIPE_PRICE_CONCIERGE=
STRIPE_PRICE_QA_FULL_ACCESS=
STRIPE_MODE=test
```

Use `STRIPE_MODE=test` for Stripe Test Mode. Use `STRIPE_MODE=live` only in the final production environment with live Stripe credentials and live price IDs.

## Routes

- `POST /api/billing/checkout/diy`
- `POST /api/billing/checkout/ai_automated`
- `POST /api/billing/checkout/concierge`
- `POST /api/billing/checkout/qa_full_access`
- `POST /api/enterprise/inquiry`
- `POST /api/stripe/webhook`
- `POST /api/billing/webhook`
- `GET /api/billing/status`
- `POST /api/billing/portal`
- `POST /api/entitlements/check`

## Webhook Events

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Webhook handling verifies the Stripe signature, rejects invalid signatures, stores processed event IDs, and updates entitlements from centralized subscription configuration.
