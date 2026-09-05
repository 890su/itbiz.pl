# Cloudflare deployment

## Latest verified release — 2026-09-05

Commit `c13ffb3307b3432ce878ade102d408a65bb20233` changes only the initial
consent banner layout to a compact bottom-centred card. The public noindex
preview was verified in all four locales as Worker version
`52388402-db70-4919-86b9-4bbf120d4b90`. Production was then published as Worker
version `006f183c-eb32-4d62-b304-ec94bb65ed19` and verified on `itbiz.pl` in all
four locales, including canonical URLs and the `www` redirect. Consent defaults,
the detailed settings dialog, forms, measurement and SEO content are unchanged.

## Architecture

Astro builds static assets. `worker/index.ts` serves `/api/contact`, redirects
`www` GET/HEAD requests to the apex domain and delegates other requests to the
assets binding.

Two explicit environments share one configuration:

- top level: `itbiz-pl-preview`, workers.dev, noindex build, no lead storage;
- `production`: `itbiz-pl`, custom domains `itbiz.pl` and `www.itbiz.pl`, D1,
  rate limiting and retention cron.

## Build and deploy

```text
npm run deploy:preview
npm run deploy:production
```

`build:preview` sets `PUBLIC_SITE_INDEXABLE=false`. The production build sets it
to `true`; `robots.txt` then allows crawling and points to
`https://itbiz.pl/sitemap-index.xml`.

## Contact intake

Production submissions pass origin checks, payload validation, required organisation
identity, honeypot, rate limiting and Cloudflare Turnstile. A successful request is stored
in the `itbiz-pl-leads` D1 database. An optional webhook may deliver a second
copy, but its absence does not make storage fail.

The D1 schema is managed by `migrations/`. Rows contain a random request ID and
`purge_after`; the Worker cron removes expired rows after 180 days. Do not export
or commit lead data.

Before deploying a Worker that writes new columns, check and apply production
migrations first:

```text
npx wrangler d1 migrations list itbiz-pl-leads --remote --env production
npx wrangler d1 migrations apply itbiz-pl-leads --remote --env production
```

To inspect recent requests from an authorised workstation, use a narrow query
and avoid copying the output into project files:

```text
npx wrangler d1 execute itbiz-pl-leads --remote --command "SELECT request_id, submitted_at, company_name, contact_name, email, phone, service_id, locale, status FROM contact_leads ORDER BY submitted_at DESC LIMIT 20"
```

## Secrets

`TURNSTILE_SECRET_KEY` is stored as a Worker secret. It must never be placed in
Git, `.env`, command output or documentation. `PUBLIC_TURNSTILE_SITE_KEY` is a
public widget identifier and may be present in generated HTML.

Optional future delivery secrets:

```text
CONTACT_WEBHOOK_URL
CONTACT_WEBHOOK_TOKEN
```

## Release gate

1. Run format, Astro check, unit, build, links, SEO, Wrangler dry-run and E2E.
2. Deploy preview and verify all locales, form states and `noindex`.
3. Merge a green PR into `main`.
4. Apply pending production D1 migrations before a Worker that depends on them.
5. Deploy `--env production` from `main` only.
6. Verify DNS, HTTPS, redirect, security headers, robots, sitemap and D1.
7. Keep Google Ads paused until commercial facts and conversions are reviewed.
