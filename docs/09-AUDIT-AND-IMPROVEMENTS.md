# Аудит и план улучшений

## Результат аудита 2026-08-26

Документация задаёт сильную B2B-only границу, правдивый контент, корректную
локализацию и ясную связь service → solution → realization → instruction.
Главные риски находились в незакрытом launch scope, устаревающем выборе Pages,
несовпадении submit и qualified lead, пустых разделах навигации и недостаточно
конкретной модели обработки формы.

## Обязательные решения до production

- подтвердить scope, exclusions, цены и реальные сроки четырёх P1-услуг;
- подтвердить публичные данные оператора и допустимость текущего формата
  działalność nierejestrowana;
- определить правовые основания и сроки хранения lead data;
- выбрать Basic или Advanced Consent Mode;
- настроить доменную почту, SPF, DKIM и DMARC;
- проверить delivery, rate limiting, Turnstile и негативные сценарии формы;
- включить qualified/converted lead measurement только после privacy review;
- публиковать realizations и instructions только с проверенными фактами.

## Engineering backlog

- CI: format, Astro check, unit, build, links, SEO и critical-path tests;
- preview robots protection и production-only analytics configuration;
- privacy-safe request IDs, structured logs и delivery alerts;
- content review fields: `reviewedAt`, `reviewedBy`, `evidenceRefs`, `expiresAt`;
- dependency updates, secret scanning, rollback и synthetic form monitoring;
- native review перед публикацией каждой рекламируемой локализации.
