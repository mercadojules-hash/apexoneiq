# Apex Local SEO OAuth Resume QA - Apexdigital.design

Date: 2026-07-10
Environment: https://apexdigital.design

## Result

OAuth redirect mismatch is resolved, but full live OAuth validation is blocked at Google sign-in.

Google now accepts the registered callback URI and sends the authorization flow to the normal Google sign-in screen:

```text
https://apexdigital.design/wp-admin/admin-post.php?action=apls_google_callback
```

The clean QA browser does not have a Google account session or Google credentials, so consent could not be completed and Google did not return an authorization code to Apex Local SEO.

## Completed

- Opened Apex Local SEO Settings on `apexdigital.design`.
- Confirmed the plugin callback URI is the Apexdigital.design callback.
- Submitted the real plugin Google Connect form.
- Confirmed the previous `redirect_uri_mismatch` error no longer occurs.
- Confirmed Google redirects to the standard `Sign in with Google` page for `apexdigital.design`.
- Captured screenshot evidence in `screenshots/after-connect-submit.png`.

## Blocked

The following cannot be validated until Google sign-in and consent are completed:

- OAuth callback completion
- Access token storage
- Refresh token storage
- Token refresh behavior
- Connected Google account
- Google Business Profile retrieval
- Location import
- Reviews import
- Photos/media import
- Performance metrics import
- Full Business Profile synchronization
- Dashboard live-data population
- Re-sync/idempotency validation
- Schema output after live sync

## Required Next Step

Complete Google authentication with the Google account that owns or manages the appropriate Google Business Profile for Apexdigital.design, then resume validation from the callback/settings page.

## Current Assessment

Do not submit to WordPress.org yet. The previous blocker has moved from OAuth client configuration to missing interactive Google authentication. Once consent is completed, rerun token, sync, live-data, schema, REST, and screenshot validation.
