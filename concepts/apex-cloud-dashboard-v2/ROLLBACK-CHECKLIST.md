# ApexOneIQ Version 1.0 Rollback Checklist

1. Stop the current application process.
2. Restore the previous deployment package or GoDaddy backup.
3. Restore the previous environment variable set.
4. Restart the restored application process.
5. Verify homepage, subscription page, Executive Brief, Mission Workspace, and Command Center.
6. Confirm Stripe webhook delivery is either paused or pointed at the restored endpoint.
7. Confirm no failed checkout sessions are retried against the rolled-back runtime.
8. Record the rollback reason and any Stripe event IDs involved.
