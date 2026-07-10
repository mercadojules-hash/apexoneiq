=== Apex Local SEO ===
Contributors: apexdigitaldesign
Tags: local seo, google business profile, maps, reviews, schema
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 8.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Executive local search analytics for Google Business Profile, reviews, schema, citations, diagnostics, and business decision support.

== Description ==

Apex Local SEO helps business owners and site administrators understand local search performance from inside WordPress.

The plugin includes an executive SEO dashboard, Google Business Profile connection tools, review intelligence, schema readiness, citation intelligence, diagnostics, onboarding guidance, and prioritized local search recommendations. All Version 1.0.0 features are available after activation.

= Included Features =

* Executive local search dashboard
* Google Business Profile OAuth connection
* Google Business Profile business location import
* Google Business Profile Performance API metrics import
* Reviews dashboard and response status summaries
* Schema Manager with local business JSON-LD preview
* Citation Intelligence for business data consistency review
* Executive Advisor with rule-based local search recommendations
* Diagnostics for connection, sync, and data-source status
* Settings for Google OAuth credentials, data retention, and module readiness
* Demo data mode before a Google account is connected

= What This Plugin Does Not Include =

Version 1.0.0 does not connect to external model providers. Recommendation text and scores are rule-based, locally rendered, or imported from connected Google Business Profile data.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/apex-local-seo/`, or install the plugin through the WordPress Plugins screen.
2. Activate Apex Local SEO through the Plugins screen.
3. Open Apex Local SEO in the WordPress admin menu.
4. Review the dashboard using demo data or connect Google Business Profile.
5. Add Google OAuth credentials in Settings.
6. Connect your Google account and run a Business Profile sync.

== Frequently Asked Questions ==

= Are any Version 1.0.0 features restricted? =

No. All included Version 1.0.0 features are available after activation.

= Does Apex Local SEO include live model-generated functionality? =

No. Version 1.0.0 does not call external model providers. The Executive Advisor uses rule-based decision support copy and local search signals.

= Why does the plugin ask for Google OAuth credentials? =

Google OAuth is required so the site administrator can authorize access to their Google Business Profile data. The plugin uses that authorization to import business locations, reviews, photos, and performance metrics for display inside WordPress.

= Can I use the plugin without connecting Google? =

Yes. The plugin includes demo data so administrators can review the dashboard layout and available modules before connecting a Google account.

== External Services ==

Apex Local SEO connects to Google services when an administrator adds Google OAuth credentials, clicks Connect Google Account, completes the Google consent flow, or runs a Google Business Profile sync. The plugin does not send Google data during normal public-site visits.

= Google OAuth =

Service used: Google OAuth 2.0 authorization endpoints.

Why it is required: Google OAuth lets the site administrator authorize Apex Local SEO to access the Google Business Profile account selected during the consent flow.

Information transmitted: The browser is redirected to Google with the configured OAuth client ID, authorized redirect URI, requested scopes, response type, access type, prompt value, and a temporary state value. During callback processing, the authorization code is sent from WordPress to Google in exchange for access and refresh tokens.

When it is transmitted: When an administrator clicks Connect Google Account and when Google redirects back to WordPress after consent.

Google Privacy Policy: https://policies.google.com/privacy

Google Terms of Service: https://policies.google.com/terms

= Google Business Profile APIs =

Services used: Google Business Profile Account Management API, Google Business Profile Business Information API, and legacy Google Business Profile endpoints for reviews and media.

Why they are required: These APIs let Apex Local SEO identify accessible Business Profile accounts, import business location details, import Google reviews, and import Google Business Profile media for dashboard and diagnostics pages.

Information transmitted: WordPress sends HTTPS requests to Google with the administrator-authorized OAuth access token. Requests may include the connected Google account resource name, Business Profile account name, Business Profile location name, and read masks describing the business fields being requested. Google returns account records, business location records, review records, and media records available to the authorized Google account.

When it is transmitted: When an administrator runs a Business Profile sync or when a valid access token needs to be refreshed for a sync request.

Google Privacy Policy: https://policies.google.com/privacy

Google Terms of Service: https://policies.google.com/terms

= Google Business Profile Performance API =

Service used: Google Business Profile Performance API.

Why it is required: The Performance API provides recent business performance metrics such as calls, website clicks, direction requests, search impressions, Maps impressions, and photo views.

Information transmitted: WordPress sends HTTPS requests to Google with the administrator-authorized OAuth access token, the Business Profile location name, requested daily metrics, and the requested date range.

When it is transmitted: When an administrator runs a Business Profile sync.

Google Privacy Policy: https://policies.google.com/privacy

Google Terms of Service: https://policies.google.com/terms

= Google UserInfo API =

Service used: Google UserInfo API.

Why it is required: The UserInfo API confirms the email address of the Google account that completed the OAuth consent flow so the administrator can see which Google account is connected.

Information transmitted: WordPress sends an HTTPS request to Google with the administrator-authorized OAuth access token. Google returns account identity fields available through the granted scopes, including the email address.

When it is transmitted: Immediately after Google OAuth callback processing completes and the plugin validates the connected account identity.

Google Privacy Policy: https://policies.google.com/privacy

Google Terms of Service: https://policies.google.com/terms

== Screenshots ==

1. Executive local search dashboard.
2. Google Business Profile connection settings.
3. Reviews Intelligence dashboard.
4. Schema Manager.
5. Citation Intelligence.
6. Executive Advisor.
7. Diagnostics.
8. Onboarding.

== Changelog ==

= 1.0.0 =
Initial public release with dashboard, Google Business Profile connection, reviews, schema, citation intelligence, diagnostics, onboarding, demo data, and rule-based executive recommendations.
