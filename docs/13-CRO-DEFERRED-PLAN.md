# ITBIZ.PL — deferred CRO plan

Status: broader CRO plan deferred. On 2026-09-05 the owner separately authorized
one shared visual change for both sites: the initial consent prompt is now a
compact bottom-centred card instead of a viewport-wide bar. Detailed settings,
denied-by-default consent, measurement and conversion behavior are unchanged.

## Findings and proposed order

1. Verify current Ads status and 28/90-day analytics; repository launch documents
   are not live account evidence. Existing success conversion must remain intact.
2. Add consent-aware CTA impressions/clicks, form start/validation/error/success
   diagnostics. Keep click actions secondary; qualify real B2B leads offline.
3. Add a mobile contact bar after the hero: phone plus service-specific enquiry.
   Suppress near forms/footer, keyboard, consent/settings and mobile navigation.
   Keep the desktop sidebar; no competing floating widget there.
4. Keep service intent: outage → report outage/call; planned LAN/Wi-Fi/RACK →
   request scope assessment. Preserve URLs, H1/title, canonicals and hreflang.
5. Improve inline validation (the current API requires a 20-character message),
   error focus and next-step copy. Review the discrepancy between optional company
   field and the older required-company specification without assuming that Google
   itself mandates a specific form field.
6. Publish only verified B2B evidence, real hours and approved pricing. Do not
   reuse consumer NaSerwis reviews, chat identities or messenger destinations.
7. Test a labelled CTA with one bounded sheen/halo sequence; no infinite motion,
   fake online indicator or response-time guarantee. Respect reduced motion.
8. Run one experiment at a time after obtaining enough traffic. Qualified-lead
   conversion and cost are primary; clicks are diagnostic, not proof of uplift.

## Release gates for a future authorization

- Confirm ownership, B2B delivery and current campaign/lead-delivery status.
- Feature branch and Cloudflare preview; all four locales and both themes.
- Format, types, unit, build, link, SEO and browser checks.
- Preserve Google Ads action IDs, consent defaults and success-only conversion.
- Owner approval before production deployment; tested rollback.

Sources: [Google landing pages](https://support.google.com/google-ads/answer/6238826?hl=en),
[B2B-only support exception](https://support.google.com/adspolicy/answer/13527027?hl=en),
[W3C motion](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).
