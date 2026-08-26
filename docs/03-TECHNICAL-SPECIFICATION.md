# Техническое задание

## 1. Архитектура

Сайт — статически генерируемое приложение Astro. Небольшая интерактивность
реализуется прогрессивно улучшенным vanilla JavaScript только для:

- mobile navigation;
- переключателя языка и темы;
- формы и её состояний;
- CMP/privacy settings;
- фильтров реализаций и инструкций;
- необязательных интерактивных схем решений.

SSR для контентных страниц не требуется. Формы обслуживаются Worker endpoint.

## 2. Планируемый стек

- Astro, актуальная стабильная версия на момент scaffold;
- TypeScript `strict`;
- CSS layers + CSS custom properties для design tokens;
- Astro content collections с Zod-схемами;
- sitemap integration;
- ESLint/Prettier или эквивалентный единый formatter;
- Vitest для чистых функций;
- Playwright для критических пользовательских путей;
- Cloudflare Workers Static Assets, Worker API и Turnstile.

Версии фиксируются `package-lock.json`. Node фиксируется поддерживаемой Cloudflare
LTS-версией в `.nvmrc`/`.node-version` после проверки окружения.

## 3. Предлагаемая структура кода

```text
itbiz.pl/
├── public/
│   ├── _headers
│   ├── _redirects
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
├── worker/
│   └── index.ts
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── forms/
│   │   ├── consent/
│   │   ├── services/
│   │   ├── solutions/
│   │   ├── realizations/
│   │   └── seo/
│   ├── content/
│   │   ├── services/
│   │   ├── solutions/
│   │   ├── realizations/
│   │   └── instructions/
│   ├── data/
│   │   ├── navigation.ts
│   │   ├── company.ts
│   │   └── service-links.ts
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── routes.ts
│   │   └── dictionaries/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── lib/
├── tests/
├── docs/
├── astro.config.mjs
├── wrangler.jsonc
├── package.json
└── tsconfig.json
```

## 4. Контентные модели

Общие обязательные поля:

```text
translationKey
locale
title
seoTitle
description
slug/path
status: draft | published
updatedAt
noindex
```

Услуга дополнительно:

```text
serviceId
adEligible
b2bOnly
primaryIntent
problems[]
scope[]
deliverables[]
exclusions[]
solutionIds[]
realizationIds[]
formOption
```

Решение:

```text
solutionId
serviceIds[]
companyProfiles[]
diagram
variants[]
bestPractices[]
```

Реализация:

```text
realizationId
serviceIds[]
solutionIds[]
clientDisclosure: named | anonymized
verifiedFacts[]
publishedAt
images[]
```

## 5. Маршрутизация и локализация

- один реестр locale routes, без ручного вычисления URL в компонентах;
- язык определяется URL, не IP и не browser redirect;
- допустим ненавязчивый language suggestion без автоматического redirect;
- переключение языка ведёт на эквивалентный `translationKey`;
- при отсутствии перевода переключатель ведёт на locale home и явно сообщает,
  что материал ещё не переведён;
- весь UI, form errors, consent и legal text локализуются;
- форматирование дат/чисел выполняется `Intl`.

## 6. Lead form

Поля MVP:

- `companyName` — обязательно;
- `contactName` — обязательно;
- `phone` — необязательно, но хотя бы один из `phone`/`email` обязателен;
- `email` — необязательно, но хотя бы один из `phone`/`email` обязателен;
- `serviceId` — обязательное hidden/select значение;
- `message` — обязательно;
- `actingForBusiness` — обязательное подтверждение обращения от организации;
- `locale`, `pagePath` — технические поля;
- honeypot и Turnstile token.

Форма должна иметь idle, submitting, success, validation error, server error и
rate-limited состояния. Ошибка объясняет действие пользователя, не очищает
введённые данные и не сообщает внутренние детали.

Endpoint:

- валидирует origin, payload, длины и Turnstile;
- применяет rate limit;
- не доверяет hidden-полям;
- сохраняет подтверждённый production-лид в закрытой D1-базе;
- опционально передаёт копию в отдельный B2B webhook;
- не записывает лид в публичные логи;
- возвращает единый request ID без персональных данных;
- отправляет conversion event только после подтверждённого success.

## 7. Consent и RODO

- Consent Mode v2 инициализируется до любых Google tags;
- `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` — denied
  до выбора;
- отдельные категории: necessary, analytics, advertising, optional chat;
- равноценные accept/reject/customise действия;
- настройки доступны из footer постоянно;
- формы содержат короткий layered notice со ссылкой на privacy;
- privacy/cookies доступны во всех локалях и используют дизайн сайта;
- адрес, оператор и контакты берутся из одного typed source;
- PESEL и другие непубличные идентификаторы не попадают в репозиторий.

## 8. SEO implementation

- self-canonical для каждой indexable страницы;
- reciprocal hreflang `pl-PL`, `ru-PL`, `en-PL`, `uk-PL`, `x-default`;
- sitemap только для published/indexable URLs;
- Open Graph/Twitter cards;
- JSON-LD: `WebSite`, `ProfessionalService`, `Service`, `BreadcrumbList`,
  `Article`, `HowTo` только при соответствии видимому контенту;
- корректная 404 и redirects после изменения slug;
- privacy/cookies можно оставить `noindex, follow`;
- draft и incomplete translation никогда не индексируются.

## 9. Производительность

Целевые бюджеты для production mobile на типовой landing page:

- LCP ≤ 2.5 s на 75-м перцентиле;
- CLS ≤ 0.1;
- INP ≤ 200 ms;
- initial client JS ≤ 100 KB gzip, цель существенно ниже;
- без критических сторонних скриптов до consent;
- изображения AVIF/WebP с размерами, `srcset` и lazy loading ниже fold;
- шрифты self-hosted WOFF2, preload только реально критичных начертаний;
- SVG-схемы вместо тяжёлых декоративных изображений.

## 10. Доступность

- WCAG 2.2 AA как целевой уровень;
- полная клавиатурная навигация;
- skip link, landmarks, один H1;
- видимый focus;
- контраст текста/контролов;
- form label, error association и live regions;
- drawer с focus management;
- reduced motion;
- touch target не менее 44×44 px для основных мобильных контролов.

## 11. Cloudflare Workers

Параметры:

```text
Worker name: itbiz-pl
Production branch: main
Build command: npm run build
Assets directory: dist
Domain: itbiz.pl
```

Preview deployment создаётся для feature branches. Секреты задаются только в
Cloudflare:

```text
TURNSTILE_SECRET_KEY
CONTACT_RECIPIENT
MAIL_PROVIDER_TOKEN/SMTP_*
TELEGRAM_BOT_TOKEN (если используется)
TELEGRAM_CHAT_ID (если используется)
```

`GA_MEASUREMENT_ID` и `GOOGLE_ADS_ID` являются публичными environment-specific
идентификаторами конфигурации, а не секретами.

Production использует Turnstile secret; preview не сохраняет лиды и не требует
секретного ключа. `.dev.vars` находится в `.gitignore`.

## 12. Security headers

Минимум:

- `Content-Security-Policy`, сначала report-only при настройке;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` без ненужных camera/microphone/geolocation;
- `X-Frame-Options: SAMEORIGIN` либо эквивалент `frame-ancestors`;
- HSTS после стабильного production HTTPS.

## 13. Проверки перед merge

```text
npm run format:check
npm run check
npm run test
npm run build
npm run test:links
npm run test:seo
npm run test:e2e
```

CI проверяет также отсутствие secrets, битых локальных assets, missing
translations, indexable drafts и service pages без `b2bOnly: true`.
