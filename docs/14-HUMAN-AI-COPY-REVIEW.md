# ITBIZ.PL: human-ai copy review

Date: 2026-10-16. Base revision: `3f8e9d6`.

## Scope and editorial settings

[LANG: pl / ru / en / uk]

[TONE: biz; landing for service introductions and calls to action]

[PIPELINE: cleanup → specificity → tone → rhythm → proofread]

The unit of editing is an individual introduction, paragraph or UI string,
normally under 100 words. Pre-flight probability scoring is skipped for these
short samples, as required by human-ai. Existing clear technical lists and
service boundaries are retained, not rewritten to meet an arbitrary score or
word-count target. No text was sent to an external AI detector.

Reviewed the shared site dictionaries, the network utility dictionary and all
48 service entries (12 services in four locales). Changed 42 service entries;
the remaining six introductions were already clear. Shared dictionary changes
also apply to their pages. This is an editorial pass, not a new SEO strategy,
service expansion or advertising-account change.

## The text

The edited text lives in `src/i18n/ui.ts`, `src/i18n/network-weather.ts` and
`src/content/services/`. Polish remains the source locale. Russian, English and
Ukrainian express the same offer without copying the Polish sentence structure.

Examples:

| Before                           | After                                               | Reason                                            |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Uzgadniamy do wykonania          | Co obejmuje usługa                                  | Say what the section contains.                    |
| От симптома к проблемному уровню | Как ищем причину аварии                             | Replace internal diagnostic jargon.               |
| We start the approved scope      | We start the agreed networks and test connectivity. | Name the actual operation.                        |
| Запросити проєкт Wi‑Fi           | Замовити проєкт Wi‑Fi                               | Use a natural Ukrainian service CTA.              |
| Wyślij zdjęcia i opis szafy      | Poproś o ocenę szafy rack                           | Do not imply that the form accepts photo uploads. |

## Changelog

- Replaced abstract introductions with actual tasks: cabling, camera power,
  recorder alerts, workstation labelling and reconnection tests.
- Removed defensive policy-like sales copy about not pretending to be a larger
  organisation and not creating district pages. Operator identity and the
  restrictions themselves remain visible and unchanged.
- Made contact copy state what to send and what happens next. No extra fields
  or submission steps were introduced.
- Kept the separation between an ongoing outage, planned diagnostics, new
  installation and recurring IT support. A Wi-Fi audit remains distinct from
  design and deployment; CCTV cabling remains distinct from outage diagnosis.
- Corrected literal translations and some Ukrainian CTA wording. Kept useful
  technical terms rather than replacing them with vague synonyms.
- The additional 320px browser checks found overflow from long Russian and
  Ukrainian CCTV headings. Applied the incumbent mobile heading wrap behavior
  to all headings; words and font sizes remain unchanged. This bounded
  responsive fix follows the impeccable adaptation checklist.

## Stage scores and issues

[QUALITY: 90/100, editorial self-assessment, not a detector result]

Cleanup: 100/100. Specificity: 100/100. Tone: 100/100. Rhythm: 80/100.
Proofread: 100/100. Overall follows the skill weighting: cleanup 20%, specificity
10%, tone 10%, rhythm 50%, proofreading 10%. Re-loop: no.

[ISSUES: technical lists intentionally retain parallel phrasing; response time,
pricing and results cannot be made more specific without verified business data.]

## Factual and SEO safeguards

- No new price, response-time guarantee, certification, customer, review or
  project result was introduced. This review does not establish conversion lift.
- All service H1s, SEO titles/descriptions, translation keys, service IDs,
  publication flags, B2B eligibility and internal-link bodies are unchanged.
- General about/contact/area/solutions headings were made clearer. Homepage
  H1s and keyword-focused service headings were preserved.
- Legal, cookie and consent dictionaries, company identity, contacts and
  measurement limitations were left untouched. The changes do not activate
  analytics, advertising tags or campaigns.
- Service update dates reflect the editorial changes on 2026-10-16.

## Verification

- Source comparison against the base revision checks protected service fields,
  internal-link bodies, legal/consent dictionaries and shared SEO metadata.
- Type checking, formatting, unit tests, build, internal-link checks, SEO checks
  and browser tests are required before release.
- Browser checks cover navigation, forms, service intent, consent and localized
  mobile layouts. Preview must remain noindex; production retains canonicals
  and reciprocal hreflang.

### Results

- `npm run check`: zero errors, warnings or hints.
- `npm test`: 29 passed. `npm run test:e2e`: 37 passed, including the four new
  localized 320px contact/CCTV/office-move cases.
- Formatting and production build passed. Link and SEO checks passed for all
  85 generated HTML files.
- Chromium screenshots confirm the mobile CCTV headings fit without horizontal
  scrolling and the desktop homepage retains its existing composition. Physical
  iPhones and Safari were not tested in this pass.
- Impeccable's mechanical scan reported two incumbent visual patterns (callout
  side border and background grid), unrelated to the text-wrap fix. They were
  deliberately not redesigned during a copy-editing task.
- Preview deployed to <https://itbiz-pl-preview.iharszasciuk.workers.dev>, version
  `526fbe63-c00b-41c5-b94d-cffbbb80824e`. Remote smoke checks passed for all four
  home locales and two priority service pages, with `noindex, follow` confirmed.
- Work remains on `codex/humanize-site-copy`. Production and the advertising
  account were not changed in this task.
