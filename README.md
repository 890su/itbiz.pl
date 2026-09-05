# ITBIZ.PL

Мультиязычный B2B-сайт услуг IT для компаний и организаций в Варшаве. Проект
развивается как отдельный продукт, Git-репозиторий и Cloudflare Workers
deployment.

## Ключевое позиционирование

> Obsługa IT wyłącznie dla firm i organizacji w Warszawie.

Сайт не рекламирует и не направляет пользователей на техническую поддержку
частных лиц. Владелец и оператор указываются прозрачно: Ihar Shestsiuk,
działalność nierejestrowana.

## Языки

- польский — основной, URL без префикса;
- русский — `/ru/`;
- английский — `/en/`;
- украинский — `/uk/`, подпись переключателя `UA`.

## Основные разделы

- `Usługi` — самостоятельные высококонверсионные посадочные для Google Ads;
- `Rozwiązania` — архитектурные схемы и best practices, связанные с услугами;
- `Realizacje` — только реальные выполненные проекты;
- `Instrukcje` — оригинальная база знаний ITBIZ.PL;
- `O nas`, `Kontakt`, privacy и cookies.

## Реализованный стек

- Astro, static output;
- TypeScript strict;
- статические Astro-компоненты и минимальный vanilla JavaScript;
- CSS layers, custom properties и централизованные design tokens;
- Astro content collections;
- Cloudflare Workers Static Assets + Worker API;
- Cloudflare Turnstile, Rate Limiting и D1 для защищённого приёма лидов;
- отдельные GA4/Google Ads conversion actions с Consent Mode v2.

Начальное окно согласия показывается как компактная карточка внизу по центру на
desktop и mobile. Оно не блокирует доступ к странице; подробные настройки
остаются в нативном модальном окне. Исходные значения Consent Mode и логика
измерения не изменены.

Точные версии зависимостей зафиксированы в `package-lock.json`.

## Команды

```text
npm run build             # индексируемая production-сборка
npm run build:preview     # noindex preview-сборка
npm run deploy:preview    # отдельный workers.dev preview
npm run deploy:production # itbiz.pl и www.itbiz.pl
```

## Документация

1. [Проектный план](docs/01-PROJECT-PLAN.md)
2. [Структура сайта](docs/02-INFORMATION-ARCHITECTURE.md)
3. [Техническое задание](docs/03-TECHNICAL-SPECIFICATION.md)
4. [SEO и контекстная реклама](docs/04-SEO-AND-ADS.md)
5. [UI/UX и дизайн-концепция](docs/05-UI-UX-DESIGN.md)
6. [Матрица контента](docs/06-CONTENT-MATRIX.md)
7. [Принципы, взятые из 890.by](docs/07-REFERENCE-890BY.md)
8. [Roadmap](ROADMAP.md)
9. [Зафиксированные архитектурные решения](docs/08-ARCHITECTURE-DECISIONS.md)
10. [Результаты аудита и план улучшений](docs/09-AUDIT-AND-IMPROVEMENTS.md)
11. [Cloudflare deployment](docs/10-CLOUDFLARE-DEPLOYMENT.md)

## Репозитории и размещение

- GitHub: `https://github.com/890su/itbiz.pl`
- production domain: `https://itbiz.pl`
- Cloudflare Worker: `itbiz-pl`
- production branch: `main`
- build output: `dist/`

Production разворачивается только из `main`. Preview всегда собирается с
`noindex`, а production — с индексированием. Все четыре локали имеют явные
`translationKey`, self-canonical и reciprocal hreflang.
