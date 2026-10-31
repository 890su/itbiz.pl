# ITBIZ measurement and shared operational journal

## Measurement

- Existing Analytics account: `382739898`.
- ITBIZ property: `561749346`, stream: `16241853872`, measurement ID:
  `G-W0H7D3FKJD`.
- Existing Ads tag and form action remain
  `AW-18394870871/WpLcCOaejeMcENforcNE`. There is no parallel GA4 form import.
- `generate_lead` is emitted only after HTTP 201 and a valid server request UUID.
  Preview, honeypot responses and failed submissions do not emit it.
- GA4 parameters: `request_id`, `service_id`, `form_id`, `site_brand`.
  Event-scoped custom dimensions are registered for the first three parameters.
- Contact intent events: `phone_click`, `email_click`, `whatsapp_click`,
  `telegram_click`, and `lead_form_start`. Messenger events apply only to links
  actually present on a page. A phone click does not prove a completed call.
- Analytics and Ads require their respective consent. No Google loader runs
  before either permission, or on preview hosts. Ad personalization remains off.
- Contact details and form descriptions never enter measurement events. Page
  metadata omits arbitrary URL parameters, fragments and referrer search paths.
  Advertising click IDs are included only with advertising consent.
- Source metadata on the current page can accompany an explicitly submitted
  enquiry. Cross-page session storage requires optional consent and expires after
  30 minutes of inactivity. Rejecting optional consent clears that storage.

## Journal delivery

`contact_leads` and `lead_journal` are written in one D1 batch for ITBIZ. NaSerwis
Pages writes verified enquiries into the same `lead_journal` through its
production-only `JOURNAL_DB` binding. Reviews are excluded. Telegram destinations
and existing form UX remain unchanged.

ITBIZ's existing five-minute scheduled task sends pending journal records to the
Google Apps Script receiver. It claims each record atomically and verifies an
acknowledgement containing both brand and request ID. Failed deliveries remain
pending; interrupted claims become retryable after five minutes. D1 copies expire
after 180 days. This does not automatically delete the operator's Google Sheet.

Required production worker secrets:

- `JOURNAL_WEBHOOK_URL`: the deployed Apps Script `/exec` URL.
- `JOURNAL_WEBHOOK_SECRET`: the HMAC key stored in the receiver's Script Properties.

The receiver requires an HMAC-SHA256 signature over `timestamp.payload`, rejects
expired messages and provides no read endpoint. Invalid requests return only
`accepted: false`. Logs must not contain payloads or credentials.

The Sheet receiver serializes writes using a script lock. It deduplicates by
brand and UUID, treats historical unlabelled records as NaSerwis, and never
overwrites an existing record's manual result, payments or notes. It preserves
the validation formula in column N and writes the brand into P. Capacity is rows
10–509; when full the receiver rejects delivery and the worker retains the queue.

Column A is server acceptance time in the Sheet's Warsaw timezone. Column E stays
empty until an actual GA4 match is verified. ITBIZ uses `request_id`; the existing
NaSerwis event uses `transaction_id`. Similar timestamps alone are not an exact
match, and a server journal entry can exist without an analytics event.

## Google authorization and deployment

`Code.gs` is installed in the owner's bound project **NaSerwis + ITBIZ — Lead
Journal**. The receiver opens only the fixed journal ID, although Google's Sheets
OAuth permission technically covers spreadsheets in the account. The owner must
review and approve that access; never bypass an authorization warning for them.

Run `initializeJournal` once after authorization. It creates the HMAC key in
Script Properties and temporarily places a copy in hidden `_SyncConfig!A1` for
secure transfer into Cloudflare's secret store. Clear that temporary cell after
transfer. Never commit, print or export the key. Do not rerun initialization to
rotate a live key accidentally.

Deploy the receiver as a web app running as the owner. Requests may reach its URL,
but only valid signed messages can write records. Copy the URL into the worker
secret. First verify a clearly labelled synthetic request and a duplicate retry;
do not replay real Telegram notifications or backfill historical leads silently.

## Verification

- Unit tests exercise consent, Google destination separation, deduplication,
  HMAC, retry claims, formula escaping, preservation of manual payments and
  server attribution validation.
- Browser tests cover accepted, preview, honeypot and failed submissions.
- Verify a page/contact event in the new GA4 property's Realtime report after
  deployment. Verify `generate_lead` on the next genuine or explicitly labelled
  test submission before claiming destination arrival.
- Check queue counts, not customer payloads, during routine diagnostics.

Technical references: [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent),
[GA4 generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead),
[Cloudflare Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).
