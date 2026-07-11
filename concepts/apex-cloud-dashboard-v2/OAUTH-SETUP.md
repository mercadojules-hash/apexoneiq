# ApexOneIQ Google and Apple OAuth Foundation

Status: foundation only. Do not activate until credentials, validation, and account-linking safeguards are complete.

## Redirect URIs

Production WordPress site:

- Google OAuth redirect URI: `https://apexoneiq.com/oauth/google/callback/`
- Apple Sign In redirect URI: `https://apexoneiq.com/oauth/apple/callback/`

Google OAuth start route:

- `https://apexoneiq.com/oauth/google/`

Local/staging should use the exact canonical host for that environment:

- Google: `https://staging.apexoneiq.com/oauth/google/callback/`
- Apple: `https://staging.apexoneiq.com/oauth/apple/callback/`

## Required Origins and Domains

Google OAuth:

- Authorized JavaScript origin: `https://apexoneiq.com`
- Authorized redirect URI: `https://apexoneiq.com/oauth/google/callback/`

Apple Sign In:

- Primary app/domain: `apexoneiq.com`
- Return URL: `https://apexoneiq.com/oauth/apple/callback/`
- Domain verification file must be hosted exactly as required by Apple Developer.

## Credentials the Owner Must Create

Google Cloud Console:

- OAuth client ID for Web application
- OAuth client secret
- Consent screen app name: ApexOneIQ
- Authorized domain: `apexoneiq.com`

Apple Developer:

- Services ID for Sign in with Apple
- Team ID
- Key ID
- Private key for client secret generation
- Return URL and verified domain

## Secure Storage

Store values in WordPress options or environment variables, never in committed code:

- `APEXONEIQ_GOOGLE_CLIENT_ID`
- `APEXONEIQ_GOOGLE_CLIENT_SECRET`
- `APEXONEIQ_APPLE_SERVICES_ID`
- `APEXONEIQ_APPLE_TEAM_ID`
- `APEXONEIQ_APPLE_KEY_ID`
- `APEXONEIQ_APPLE_PRIVATE_KEY`

Recommended WordPress option namespace:

- `apexoneiq_google_client_id`
- `apexoneiq_google_client_secret`
- `apexoneiq_apple_services_id`
- `apexoneiq_apple_team_id`
- `apexoneiq_apple_key_id`
- `apexoneiq_apple_private_key`

## Required Implementation Before Activation

- Generate a cryptographically secure `state` value per OAuth attempt.
- Store state server-side with expiration and intended redirect.
- Validate state on callback before exchanging codes.
- Use nonce validation for OIDC ID tokens.
- Exchange authorization code server-side only.
- Validate issuer, audience, expiration, nonce, and email verification.
- Never trust provider email unless the provider marks it verified.
- If the provider email matches an existing WordPress user, require signed-in account linking or a verified login recovery step before linking.
- If no account exists, create a WordPress user with the Free plan state and route to `/free-dashboard.html`.
- Store provider subject IDs in user meta.
- Prevent one provider identity from linking to multiple users.
- Keep logout as WordPress logout plus local app state cleanup.
- Redirect only to same-origin allowlisted paths.
- Show explicit errors for denied consent, expired state, email collision, and disabled provider.

Current callback routes intentionally return setup-required placeholders:

- `/oauth/apple/callback/`

## Phase 31 Google Sign-In Runtime

Google Sign-In is implemented server-side in the WordPress theme:

- Public start route: `/oauth/google/`
- Authorized callback route: `/oauth/google/callback/`
- New Google users are created as Free ApexOneIQ users.
- Existing WordPress users are linked by verified Google email and Google subject ID.
- Authenticated Free users are redirected to `/free-dashboard.html`.
- OAuth state and nonce are generated per attempt and stored temporarily server-side.
- Authorization codes are exchanged server-side only.
- Google ID tokens are validated through Google's tokeninfo endpoint before login.
- The Google client secret must remain in `wp-config.php`, an environment variable, or the protected ApexOneIQ admin option. It must never be committed or exposed to browser JavaScript.

Apple Sign In is still intentionally inactive.
