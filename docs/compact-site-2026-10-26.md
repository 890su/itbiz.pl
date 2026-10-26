# Compact ITBIZ service site

Date: 2026-10-26. User request: preserve the design, forms, page inventory and
language routes; remove dispensable copy, including entire sections. Aim for
one to three screens rather than long sales pages. This task updates preview
only, not production, advertising or indexation settings.

## What changed

- Home: retain the offer and existing progressive enquiry, plus the seven
  situation-based service links. Remove the documentation example, work-process
  section, utility promotion and repeated eligibility panels.
- Services: retain all twelve entries and the functional filters. Replace
  repeated descriptions, card numbers, tags and scope links with one clear
  linked service title.
- All 48 translated service entries receive an explicit, typed five-field
  brief: problem, scope, result, important limits, and enquiry information.
  One shared short template replaces the lengthy standard and CCTV layouts.
  Remove the separate outcomes, symptom, documentation and process sections,
  and duplicated Markdown body text. Real service examples inside the form
  remain unchanged and interactive.
- Solutions: retain three scenarios, link them to the corresponding services,
  and offer the existing enquiry dialog directly.
- About: retain the real operator and short audience/terms explanation,
  including the requested “Małe zespoły i biura / Zakres firmowy” headings.
- Area/contact: remove repeated explanations. Preserve direct contacts and
  the existing forms/dialogs.
- Connection/weather tool: retain live readings, tests, forecast, provider
  attribution and measurement limitations. Remove the explanatory essay
  sections and redundant decorative labels.
- Remove the documented PrivateSupport discrepancy from the page templates.
  ITBIZ does not send its service-page visitors to consumer support.

No layout is clipped to a fixed height, no text is hidden for search engines,
and no long-page font reduction is used to simulate a shorter site. Spacing and
heading scale are tightened within the incumbent palette, typography and
right-side navigation. Full-width bands and footer remain.

Form fields, validation, Turnstile, consent, conversions and Worker intake are not
modified. Following the user's additional request, inline forms lose their
redundant heading, use the sidebar's panel and primary-button colors, and show
one short privacy sentence plus a localized Details link. Modal titles remain
for clear dialog naming. The legal pages remain complete. All service titles, SEO titles,
descriptions, canonical/hreflang relationships, publication flags, IDs and
translation keys are preserved.

## Editing method

Copy-editing and Impeccable distill guide the cuts; CRO and UI/UX guidance are
used to keep the existing path to contact usable. No additional skill was
installed. The 890.by reference informs brevity only; no source copy, tools or
service content is reused.

The copy was checked from the editor, prospective office client and conversion
perspectives: clear task, factual scope, no invented promises, one enquiry
action and visible conditions. Conversion improvement is a hypothesis, not a
measured result.

## Measured layout

Chromium, default inline-form state, including header/footer and the mobile
contact-bar allowance. Measurement is device-specific, not a promise about
every browser, zoom level or expanded optional field.

| Page / viewport              |       Before |        After |
| ---------------------------- | -----------: | -----------: |
| Home, 1440x900               | 3.49 screens | 1.20 screens |
| Home, 390x844                | 5.68 screens | 2.16 screens |
| CCTV, 390x844                | 4.85 screens | 2.04 screens |
| Russian office move, 320x740 | 8.53 screens | 2.60 screens |
| Catalogue, 390x844           | 5.82 screens | 1.98 screens |
| Solutions, 390x844           | 1.64 screens | 1.22 screens |

About, area and contact measured approximately 1.1, 1.1 and 1.4 mobile screens.
The functional tool measured 2.7-2.9 screens as data loaded. Captures and JSON measurements are
under the ignored `reports/compact-site-2026-10-26/` directory.

## Verification

- 46 unit tests and 101 browser tests passed on the final version.
- Additional compact-page tests cover every service in each locale, all main
  secondary pages, three-screen height before and after entering a message,
  early form placement, language links, business boundaries and dialog entry.
  They also verify no visible inline form heading, short localized privacy copy,
  and matching form/sidebar panel and primary-button colors in both themes.
- Source comparison confirmed all 48 service entries retain protected metadata
  and have complete briefs; each brief field is at most 40 words.
- One batched built-page visual review and the final confirmation after the user's form refinement covered desktop/mobile, light/dark,
  narrow Cyrillic copy, catalogue and secondary pages. No horizontal overflow
  appeared in those captures. Physical iPhone/Safari was not tested.
- Impeccable's scoped scans returned `[]`, including the subsequent form-only refinement.
- Repository-wide formatting also inspects unrelated work-in-progress documents.
  Its first run reported `ROADMAP.md`; that pre-existing user document was
  deliberately not reformatted as part of this task.
- One intermediate browser run was interrupted by the local Wrangler proxy
  exiting. The suite passed completely after Playwright started its own fresh
  server. No application scroll or form logic was changed to hide that failure.

There were unrelated documentation moves/edits in the working tree before and
during this task. They are preserved and excluded from the implementation scope.

## Preview release

Published to <https://itbiz-pl-preview.iharszasciuk.workers.dev/> as Cloudflare
version `97bc52a0-80f3-4ecf-8079-f3d20c4627f9`.

Production build, internal-link checks and SEO checks passed for all 85 HTML
files. After deployment, all 84 navigable index routes returned HTTP 200 with
matching layout/canonical tags, preview noindex and approved phone/email.
There are 76 compact non-legal routes; the eight privacy/cookie routes retain
their full documents. Remote homepage checks confirmed the removed form heading,
removed documentation/process sections and short privacy notice.

Production and advertising were not changed. No real customer enquiry was sent.
