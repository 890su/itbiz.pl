# ITBIZ.PL

Мультиязычный B2B-сайт услуг IT для компаний и организаций в Варшаве. Проект
готовится как отдельный продукт, Git-репозиторий и Cloudflare Pages deployment.

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

## Планируемый стек

- Astro, static output;
- TypeScript strict;
- Svelte только для интерактивных islands;
- Tailwind CSS и централизованные design tokens;
- Astro content collections;
- Cloudflare Pages + Pages Functions;
- Cloudflare Turnstile;
- отдельные GA4/Google Ads conversion actions с Consent Mode v2.

Точные версии зависимостей фиксируются lock-файлом при начале реализации.

## Документация

1. [Проектный план](docs/01-PROJECT-PLAN.md)
2. [Структура сайта](docs/02-INFORMATION-ARCHITECTURE.md)
3. [Техническое задание](docs/03-TECHNICAL-SPECIFICATION.md)
4. [SEO и контекстная реклама](docs/04-SEO-AND-ADS.md)
5. [UI/UX и дизайн-концепция](docs/05-UI-UX-DESIGN.md)
6. [Матрица контента](docs/06-CONTENT-MATRIX.md)
7. [Принципы, взятые из 890.by](docs/07-REFERENCE-890BY.md)
8. [Roadmap](ROADMAP.md)

## Репозитории и размещение

- GitHub: `https://github.com/890su/itbiz.pl`
- production domain: `https://itbiz.pl`
- Cloudflare Pages project: `itbiz-pl`
- production branch: `main`
- build output: `dist/`

Публикация production начинается только после регистрации домена, проверки
юридических страниц, Consent Mode, формы и B2B-only контента.
