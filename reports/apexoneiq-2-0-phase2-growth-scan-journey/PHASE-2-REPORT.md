# ApexOneIQ 2.0 Phase 2 - Executive Growth Scan & Customer Journey

## Theme Version

0.4.0

## Completed

- Reframed the scan entry as Executive Growth Scan(TM).
- Routed completed scans into the Free Executive Brief(TM).
- Rebuilt the Free Executive Brief around Business Growth Score(TM), Business Health, Executive Summary, Estimated Business Opportunity, Top Three Priorities, one Business Growth Progress chart, one recommendation, and one CTA.
- Replaced pricing-page framing with "Choose How You Want To Grow."
- Added the four approved growth choices: Executive Intelligence, Executive Autopilot, Executive Growth Partner, and Executive Enterprise.
- Kept authenticated workspace routing centered on Executive Brief(TM).
- Preserved existing supporting intelligence pages as secondary routes rather than deleting functionality.
- Packaged the WordPress theme for deployment.

## Review URL

Local preview: http://127.0.0.1:4191/sign-in.html

Recommended click path:

1. `/sign-in.html`
2. Enter a website such as `https://mixtapepsd.com`
3. Complete the Executive Growth Scan(TM)
4. Review `/free-dashboard.html`
5. Click "Choose How You Want To Grow"
6. Review `/subscription.html`

## Validation

- `npm run validate` passed.
- WordPress theme JS syntax check passed.
- Theme zip integrity check passed.
- PHP lint was not run because `php` is not installed locally.

## Remaining Before Executive Autopilot

- Connect scan outputs to live opportunity/revenue models.
- Finalize approval/work-log data contracts.
- Build real approval queues only after the journey is approved.
- Collapse remaining legacy detail pages behind Executive Brief drilldowns.
