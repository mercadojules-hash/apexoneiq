# Apex Local SEO 1.0.0 RC1 Freeze

Date: 2026-07-10

## Status

Apex Local SEO is frozen at Release Candidate 1 pending Google Business Profile API access approval for project `764170205438`.

## Included in RC1

- WordPress.org compliance cleanup.
- Trialware, license, upgrade, and locked-feature messaging removed from the WordPress.org version.
- Accurate Version 1.0 readme and external services documentation.
- Google OAuth callback diagnostics completed.
- Live OAuth connection validated on `apexdigital.design`.
- WordPress admin navigation icon normalized to a standard Dashicon.
- Post-OAuth empty dashboard state replaced with a connected/import-pending workflow.
- Google Business Profile sync failures now preserve the raw Google API error in diagnostics.
- RC1 package: `projects/apex-local-seo/release/apex-local-seo-1.0.0-rc1.zip`.

## Known Blocker

Google Business Profile synchronization is blocked by Google API access, not by plugin OAuth or callback handling.

The Account Management API returns HTTP 429 with quota limit value `0` for:

`mybusinessaccountmanagement.googleapis.com`

The plugin should not continue Business Profile API debugging until Google approves access.

## Resume Criteria

When Google approves Business Profile API access:

1. Upload/install the RC1 build.
2. Run one complete live Google Business Profile synchronization.
3. Verify business information, locations, reviews, photos/media, and performance metrics.
4. Capture final synchronized screenshots.
5. Prepare the WordPress.org submission package.

## Development Focus

Development effort shifts back to ApexOneIQ until Google API access approval is available.
