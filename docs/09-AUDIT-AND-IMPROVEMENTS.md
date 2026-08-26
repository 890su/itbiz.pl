# Аудит и план улучшений

## Результат аудита 2026-08-26

Документация задаёт сильную B2B-only границу, правдивый контент, корректную
локализацию и ясную связь service → solution → realization → instruction.
Главные риски находились в незакрытом launch scope, устаревающем выборе Pages,
несовпадении submit и qualified lead, пустых разделах навигации и недостаточно
конкретной модели обработки формы.

## Закрыто в production foundation

- четыре полные локали с эквивалентными маршрутами и SEO alternates;
- индексируемая production-сборка и отдельная закрытая preview-сборка;
- Turnstile, origin validation, honeypot, rate limiting и D1 intake;
- 180-дневный срок хранения с автоматической очисткой;
- локализованные формы, ошибки, consent и legal pages;
- CI для format, types, unit, build, links, SEO, Wrangler и Playwright.

## Оставшиеся продуктовые решения

- подтвердить scope, exclusions, цены и реальные сроки четырёх P1-услуг;
- подтвердить публичные данные оператора и допустимость текущего формата
  działalność nierejestrowana;
- провести независимый юридический review опубликованной privacy-информации;
- выбрать Basic или Advanced Consent Mode;
- настроить доменную почту, SPF, DKIM и DMARC;
- настроить уведомление о новых D1-лидах (email/webhook), не меняя критерий
  успешной записи;
- включить qualified/converted lead measurement только после privacy review;
- публиковать realizations и instructions только с проверенными фактами.

## Engineering backlog

- CI: format, Astro check, unit, build, links, SEO и critical-path tests;
- preview robots protection и production-only analytics configuration;
- privacy-safe request IDs, structured logs и delivery alerts;
- content review fields: `reviewedAt`, `reviewedBy`, `evidenceRefs`, `expiresAt`;
- dependency updates, secret scanning, rollback и synthetic form monitoring;
- native review перед использованием каждой локализации в рекламе;
- synthetic monitoring production-формы без сохранения персональных данных.
