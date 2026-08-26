# Cloudflare deployment

## Architecture

The Astro build is deployed as Workers Static Assets. `worker/index.ts` handles
`/api/contact`; other requests are served from `dist/` through the assets binding.

## Safe preview defaults

- `ENVIRONMENT=preview`;
- all pages are `noindex` unless `PUBLIC_SITE_INDEXABLE=true` is present at build time;
- generated `robots.txt` disallows crawling by default;
- a form without delivery configuration validates input but clearly reports that
  no request was delivered;
- draft service pages remain `noindex` independently of the site-wide flag.

Current preview: `https://itbiz-pl-preview.iharszasciuk.workers.dev`.

## Worker secrets

Set secrets interactively; never place values in Git, `.env`, CI logs or command
arguments:

```text
TURNSTILE_SECRET_KEY
CONTACT_WEBHOOK_URL
CONTACT_WEBHOOK_TOKEN
```

The matching public Turnstile key is a build variable:

```text
PUBLIC_TURNSTILE_SITE_KEY
```

## Production gate

Before enabling the custom domain or `PUBLIC_SITE_INDEXABLE=true`:

1. approve public phone/e-mail and legal operator data;
2. approve privacy and cookies text;
3. configure a tested delivery channel;
4. enable Turnstile and verify hostname/action checks;
5. verify rate limiting, request IDs and failure states;
6. approve service cards and change eligible content from draft/noindex;
7. run the complete CI suite against the production build;
8. attach `itbiz.pl` only to a deployment from `main`.
