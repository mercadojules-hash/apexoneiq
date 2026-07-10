# Apex Local SEO OAuth Callback Diagnostic

Date: 2026-07-10
Environment: https://apexdigital.design

## Result

No plugin code change was applied.

The controlled callback probe shows the callback route and state validation work when the Google callback returns in the same authenticated WordPress admin session.

The observed production failure state is:

```json
{
  "connected": false,
  "status": "not_connected"
}
```

The reproducible failure mode that matches this is completing Google consent outside an authenticated WordPress admin session. In that case the callback reaches WordPress as an unauthenticated or non-admin request and cannot store tokens.

## Exact Callback Flow Tested

1. Logged into WordPress admin successfully.
2. Opened Apex Local SEO Settings.
3. Submitted the real `apls_google_connect` form.
4. Confirmed Google authorization URL was generated.
5. Confirmed OAuth `state` was present.
6. Called the callback in the same WordPress admin session with a fake authorization code.
7. Callback did not reject permission.
8. Callback did not reject state.
9. Callback reached Google token exchange.
10. Google returned the expected fake-code error: `Malformed auth code.`

This proves:

- Google redirects can target `admin-post.php?action=apls_google_callback`.
- `code` and `state` parameters reach the callback.
- State validation passes in the same authenticated WordPress admin session.
- The callback proceeds to token exchange.

## Exact File / Function / Line

Primary callback gate:

- File: `includes/Admin/class-apls-admin-admin.php`
- Function: `APLS_Admin_Admin::google_callback()`
- Line: 181
- Behavior: rejects the callback unless `current_user_can( APLS_Core_Capabilities::manage() )` is true.

State validation:

- File: `includes/Services/Google/class-apls-services-google-googleoauthservice.php`
- Function: `APLS_Services_Google_GoogleOAuthService::handle_callback()`
- Lines: 122-128
- Behavior: loads `apls_google_oauth_state_{state}`, deletes it, and rejects the callback if the stored `user_id` does not match `get_current_user_id()`.

Token exchange:

- File: `includes/Services/Google/class-apls-services-google-googleoauthservice.php`
- Function: `APLS_Services_Google_GoogleOAuthService::handle_callback()`
- Lines: 131-145
- Behavior: starts the authorization-code token exchange after state validation passes.

Token storage:

- File: `includes/Services/Google/class-apls-services-google-googleoauthservice.php`
- Function: `APLS_Services_Google_GoogleOAuthService::handle_callback()`
- Lines: 165-174
- Behavior: saves encrypted access/refresh tokens and connected email after token exchange and userinfo succeed.

Database storage:

- File: `includes/Data/Repositories/class-apls-data-repositories-gbprepository.php`
- Function: `APLS_Data_Repositories_GbpRepository::save_connected_account()`
- Lines: 83-108
- Behavior: inserts/updates the connected Google account row in `apls_gbp_accounts`.

Status read:

- File: `includes/Services/Google/class-apls-services-google-googleoauthservice.php`
- Function: `APLS_Services_Google_GoogleOAuthService::status()`
- Lines: 62-72
- Behavior: returns `connected: true` only when `connected_account()` finds a row with `status = connected`.

## Exact Reason The Callback Failed

The plugin has no connected account row because the real Google authorization did not complete back into `APLS_Admin_Admin::google_callback()` as an authenticated WordPress admin request.

The controlled same-session callback reached token exchange, so the callback route and state validation are not defective in an authenticated admin session.

The required operational condition is:

1. Start Google Connect from Apex Local SEO Settings.
2. Complete Google sign-in and consent in the same browser/session that is still logged into WordPress admin.
3. Let Google return to:

```text
https://apexdigital.design/wp-admin/admin-post.php?action=apls_google_callback
```

If OAuth is completed from a different browser, expired session, incognito window, or a browser not logged into WordPress admin, the callback cannot pass the WordPress permission/state gates and tokens are not stored.

## Exact Fix Applied

No code fix was applied.

Reason: the controlled diagnostic did not expose a plugin code defect. It exposed an incomplete/invalid callback session condition.

## Evidence

Evidence file:

```text
reports/apex-local-seo-oauth-callback-diagnostics-20260710-130019/callback-probe-lite.json
```

Key observed result:

```json
{
  "step": "same_session_fake_code_callback",
  "stateRejected": false,
  "permissionRejected": false,
  "tokenRejected": true,
  "url": "https://apexdigital.design/wp-admin/admin.php?page=apls-settings&apls_error=Malformed+auth+code."
}
```

## Next Validation Step

Repeat OAuth from the same authenticated WordPress admin browser session. After callback, verify:

```text
/wp-json/apls/v1/gbp/status
```

returns:

```json
{
  "connected": true,
  "status": "connected"
}
```

Then run `/gbp/sync`.
