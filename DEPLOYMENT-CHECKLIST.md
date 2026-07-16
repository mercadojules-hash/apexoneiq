# ApexOneIQ Version 1.0 Deployment Checklist

1. Confirm final manual Stripe Test Mode Checkout succeeds on Stripe's hosted payment page.
2. Confirm Stripe webhook endpoint is set to `/api/stripe/webhook`.
3. Set production environment variables:
   - `STRIPE_MODE=live`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_DIY`
   - `STRIPE_PRICE_AI_AUTOMATED`
   - `STRIPE_PRICE_CONCIERGE`
4. Do not set `STRIPE_PRICE_QA_FULL_ACCESS` in production.
5. Upload the release package to the approved GoDaddy target.
6. Restart the application process.
7. Verify homepage, free scan, subscription page, Executive Brief, Mission Workspace, Executive Dashboard, and Command Center.
8. Verify `/api/billing/config` reports configured paid plans.
9. Run one live checkout smoke test only after Stripe Live credentials are approved.
10. Monitor webhook responses and billing status after launch.
