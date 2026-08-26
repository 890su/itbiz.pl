# Project rules for ITBIZ.PL

These rules apply to the entire repository.

## Product boundary

- ITBIZ.PL is exclusively for companies, organizations, offices and other B2B
  customers in Warsaw and nearby agreed areas.
- Do not add offers, navigation or calls to action for private/consumer
  technical support.
- Do not link service navigation or advertising landing pages to consumer
  repair offers on NaSerwis.pl.
- Keep the real operator identity visible. Never create a false separation of
  ownership or show different content to reviewers and visitors.

## Content

- Do not copy text, instructions, tools, news or service content from 890.by.
- Reuse only its approved design principles: technical restraint, right-side
  navigation, dark/light modes, compact cards and clear information hierarchy.
- Do not invent reviews, clients, certifications, response times, project
  results, prices or case studies.
- A realization may be published only from verified project facts and approved
  media. Anonymize a client when permission to name them is absent.
- Every claim must be demonstrably true. Avoid unconditional same-day, 24-hour
  or guaranteed-result promises.

## Languages and URLs

- Polish is the source locale and lives at `/`.
- Russian, English and Ukrainian live at `/ru/`, `/en/`, `/uk/`.
- UI may label Ukrainian as `UA`, but URLs and hreflang use the ISO code `uk`.
- Every indexable translation must have self-canonical, reciprocal hreflang and
  an explicit translation key. Do not publish incomplete machine-only pages.

## Advertising landing pages

- Only pages in `Usługi` are intended as Google Ads destinations at launch.
- Each advertised service must have one intent, one primary CTA, specific B2B
  eligibility wording, a matching form and localized ad-message continuity.
- Keep service pages navigable and transparent; do not create cloaked or
  orphaned variants for ad reviewers.
- Campaigns and imports remain paused until production verification is complete.

## Engineering

- Prefer static Astro components. Add client JavaScript only for functionality
  that cannot be delivered with HTML/CSS.
- Keep content in typed collections and UI strings in locale dictionaries.
- Never commit secrets, `.dev.vars`, `.env` files, personal identifiers beyond
  approved public business contact data, or exported customer data.
- Consent defaults for analytics and advertising must be denied before Google
  tags load.
- Run format/check/build/link/SEO tests before committing.
- Production deploys from `main`; feature work should use a branch and a
  Cloudflare preview before merge.
