# Apex Local SEO Live QA - GBP Sync Debug

Date: 2026-07-10
Site: https://apexdigital.design
Report folder: reports/apex-local-seo-gbp-sync-debug-20260710-135009

## Live status

OAuth is connected. `/wp-json/apls/v1/gbp/status` returned HTTP 200 with:

- configured: true
- connected: true
- connected email: mercadojules@gmail.com
- scopes include `https://www.googleapis.com/auth/business.manage`
- refresh token availability is reported as Stored in diagnostics

## Sync result

`POST /wp-json/apls/v1/gbp/sync` returned HTTP 429 before any business accounts or locations could be imported.

Exact failing stage: Google Business Profile Account Management API request.

Request URL:

`https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=20`

Raw Google error:

```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com' for consumer 'project_number:764170205438'.",
    "status": "RESOURCE_EXHAUSTED",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "RATE_LIMIT_EXCEEDED",
        "domain": "googleapis.com",
        "metadata": {
          "service": "mybusinessaccountmanagement.googleapis.com",
          "quota_metric": "mybusinessaccountmanagement.googleapis.com/default_requests",
          "quota_limit": "DefaultRequestsPerMinutePerProject",
          "quota_location": "global",
          "quota_limit_value": "0",
          "quota_unit": "1/min/{project}",
          "consumer": "projects/764170205438"
        }
      }
    ]
  }
}
```

## Import status after sync attempt

Because Google returned zero project quota at the account-list stage:

- Business Profile: not imported
- Locations: 0
- Reviews: 0
- Photos/media: 0
- Performance metrics: 0
- Dashboard KPIs: empty because no default location record exists

This is not an OAuth callback defect. The plugin has a valid connected Google account, but Google's GBP Account Management API is blocked by quota value `0` for project `764170205438`.

## Local fixes applied

- Replaced the large PNG WordPress admin menu icon with `dashicons-location-alt` in `includes/Admin/class-apls-admin-admin.php`.
- Removed the image-specific admin-menu CSS from `assets/css/apex-local-seo.css`.
- Added sync issue data to Google health status in `includes/Services/Google/class-apls-services-google-googlebusinessprofileclient.php`.
- Added raw failed API response capture, truncated to 4000 characters, into the sync trace.
- Updated the shell connection badge so a connected Google account without imported business data says the import is pending/paused instead of pretending it is connected to a business.
- Added a dashboard import status panel for connected-but-not-imported state, with progress steps and Sync/Diagnostics actions.
- Added diagnostics trace rendering for error message and raw response body.

## Validation

- PHP lint: pass across all plugin PHP files.
- Focused WPCS on touched PHP files: 0 errors, 9 auto-fixable alignment warnings remain.
- Corrected ZIP built: `/tmp/apex-local-seo-live-qa-fix.zip`.

## Deployment note

WordPress browser upload initially reached the normal "Replace current with uploaded" screen. Subsequent attempts were blocked by the host verification interstitial: "Please wait while your request is being verified...". I stopped live upload attempts to avoid escalating the host challenge. The patched ZIP is ready for upload once the host/WAF allows plugin replacement again.
