# Client experience pilot

Date: 2026-10-16. Scope approved: restrained evolution of the existing technical
style, starting with the homepage and CCTV emergency service in PL/RU/EN/UK.
Production and Google Ads remain unchanged. The earlier human-ai edits are
preserved in the working tree and included in the preview.

## Direction and implementation

- Keep the right sidebar, blue/navy palette, theme switch, full-width alternating
  section bands, operator identity and B2B boundary.
- Lead with a short explanation and enquiry plus visible phone action. The
  existing single primary action remains visually dominant; no sticky contact
  overlay or fixed mobile header is introduced.
- Homepage service choices are grouped by situation: outage, office change,
  checks/support. Seven direct links retain the narrow LAN outlet repair offer
  as well as network/CCTV outages and office relocation. Other services remain
  accessible through the full catalogue.
- Reduce background noise outside the hero. Keep the network diagram, remove
  unnecessary WAN/EDGE/CORE/VLAN labels and enlarge the useful labels.
- Add a visibly labelled example documentation structure, not a fictional
  project, customer testimonial or claim of completed work.
- Move the network/weather tool below the core service and work-process content.
- Isolate the CCTV pilot in `CctvServicePage.astro`. The remaining eleven services
  use `StandardServicePage.astro`, with routing through `ServicePage.astro`.
- CCTV shows diagnostic scope as power, connection, camera and recording. This
  is explicitly not a live system status. Contact comes before long reference
  details; original scope, symptoms, outcomes, deliverables, exclusions, process
  and internal-link content remain available.
- Shared service navigation now points to the current page's `#enquiry`, keeping
  the preselected service. General pages still link to the contact page.
- Catalogue cards use short localized UI names, contextual H2 headings and
  wrapping filters with 44px minimum height. Service H1s, SEO titles/descriptions,
  URL routes, translation keys and service IDs are not changed.

## Form behavior

The existing minimal fields remain: contact person, optional company/org/NIP,
one phone-or-email field, service and message. No upload, callback promise or
extra mandatory business field was introduced.

Client validation matches the server's contact format/minimum digit and message
length checks. Invalid submission does not call the endpoint. Each invalid field
has an associated message and aria-invalid; a focusable error summary links back
to the fields. Correction hides the resolved errors. Network failures preserve
the input. Existing server validation, rate limiting, Turnstile, consent and
success-only Google Ads conversion behavior remain intact.

CCTV instructions say which details are optional if known, explain that an
initial description is sufficient, and provide a mailto link for photos.

## Evidence and checks

- Astro check: zero errors/warnings/hints.
- Unit tests: 33 passed. Browser tests: 45 passed, including localized bad-contact
  and short-message recovery, preselected services, consent and conversion tests.
- The manual Impeccable scan of the changed markup returned `[]`; visual review
  was still performed independently of that result.
- One batched visual pass and one confirmation pass: desktop 1440px, mobile
  390px and Ukrainian at 320px; light/dark themes, first-visit consent card and
  error summary. Evidence is in `reports/client-experience-2026-10-16/`.
- At the measured 390x844 viewport, the CCTV phone is visible near 494px and
  the form starts near 1965px instead of the earlier approximately 4998px.
  These are layout measurements, not conversion or response-time claims.
- The native browser opening timed out; visual captures used isolated Chromium
  through Playwright. No physical iPhone, Safari or screen reader was tested.
- Actual production delivery of enquiries remains outside this preview test;
  test requests use the non-storing preview handler or mocked responses.

## Next stage

Review the pilot before applying task-specific layouts to the other eleven
services. The office move still uses the established service layout; a tailored
move diagram is deliberately not part of this pilot. Approved real project media
can replace or complement the labelled documentation example later.

The previous critique is retained as a baseline, not closed as an all-site
completion: its recommendations extend beyond this limited pilot.

## Preview deployment

Published to https://itbiz-pl-preview.iharszasciuk.workers.dev on 2026-10-16.
Cloudflare version: `e3e2f2e7-63f5-4ee2-a4a9-d602fc91075a`.

Remote smoke checks returned HTTP 200 for the four homepages, four CCTV service
translations and the Polish office-move page. All retain preview noindex and the
approved phone link. The actual main elements confirm the new homepage/CCTV
layouts and the unchanged standard office-move layout. No live enquiry was sent.

## Production release approval

The user approved publishing this preview on 2026-10-16. Release validation was
repeated: formatting, Astro check, 33 unit tests, 45 browser tests, production
build and link/SEO checks for 85 HTML files passed. The release includes the
previous human-ai copy edits shown in the approved preview. Google Ads remains
outside this release and unchanged.
